#!/usr/bin/env node
/**
 * Golden-frame regression test for the console renderer.
 *
 * Runs each game with scripted input and renders every frame twice:
 *   1. the legacy reference below (a port of the original client processCommands/render code)
 *   2. the shared ConsoleState + ConsoleRenderer used by the client and server today
 * and fails if any pixel differs. Games that use the newer layers (tilemap, text, bg edits)
 * can't be drawn by the legacy console, so they are marked NEW and only checked by digest:
 * --record/--check compare a digest of all frames per game against a JSON file.
 *
 *   node scripts/golden-frames.js src/shared/test-games/*.js
 *   node scripts/golden-frames.js --record scripts/goldens.json src/shared/test-games/pong.js
 *   node scripts/golden-frames.js --check scripts/goldens.json src/shared/test-games/pong.js
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { newQuickJSWASMModuleFromVariant } from 'quickjs-emscripten-core';
import releaseVariant from '@jitl/quickjs-singlefile-cjs-release-sync';
import { QuickJSGameExecutor, getSpritePosition, getDefaultPalette } from '../src/shared/game-runner-common.js';
import { generateFontTileSprites } from '../src/shared/bitmap-font.js';
import { ConsoleState } from '../src/shared/console-state.js';
import { ConsoleRenderer } from '../src/shared/console-renderer.js';

const FRAME_BUDGET_MS = 10000;
const NEW_COMMAND_KEYS = ['bg', 'bgScroll', 'text', 'textBg', 'textScroll'];

// Deterministic Math.random and Date.now so digests are stable between runs
const PRELUDE = `
(function () {
  let seed = 12345;
  Math.random = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x80000000; };
  let now = 1700000000000;
  Date.now = function () { return Math.floor(now); };
  globalThis.__tick = function () { now += 1000 / 60; };
})();
`;

const SCRIPT = [
  ...Array(60).fill({}),
  ...Array(5).fill({ a: true }), ...Array(5).fill({}),
  ...Array(60).fill({ right: true }),
  ...Array(20).fill({ right: true, a: true }),
  ...Array(60).fill({ left: true }),
  ...Array(20).fill({ up: true }),
  ...Array(20).fill({ down: true }),
  ...Array(20).fill({ b: true }),
  ...Array(10).fill({ a: true }),
  ...Array(30).fill({}),
];

// ---------------------------------------------------------------------------
// Legacy reference: original client behavior, kept verbatim in spirit
// ---------------------------------------------------------------------------
class LegacyConsole {
  constructor(resources) {
    this.palette = resources.palette || getDefaultPalette();
    this.sprites = Array(64).fill(null).map(() => ({ spriteId: -1, x: 0, y: 0, flipH: false, flipV: false }));
    this.tiles = Array(16).fill(null).map(() => Array(128).fill(-1));
    this.backgroundColor = 0;
    this.scroll = { x: 0, y: 0 };

    // Sprite sheet canvas: filled opaque black, then sprites and font written with putImageData
    this.sheet = new Uint8ClampedArray(128 * 256 * 4);
    for (let i = 0; i < this.sheet.length; i += 4) this.sheet[i + 3] = 255;
    (resources.sprites || []).forEach((sprite, index) => this.renderSpriteToSheet(sprite, index));
    generateFontTileSprites(1).forEach(({ tileId, sprite }) => this.renderSpriteToSheet(sprite, tileId));
  }

  renderSpriteToSheet(sprite, index) {
    if (!Array.isArray(sprite)) return;
    const position = getSpritePosition(index);
    if (position.y >= 256) return;
    for (let y = 0; y < 8; y++) {
      const row = sprite[y];
      for (let x = 0; x < 8; x++) {
        const colorIndex = parseInt(row == null ? undefined : row[x], 16);
        const color = this.palette[colorIndex] || 0x000000;
        const i = ((position.y + y) * 128 + position.x + x) * 4;
        this.sheet[i] = (color >> 16) & 0xFF;
        this.sheet[i + 1] = (color >> 8) & 0xFF;
        this.sheet[i + 2] = color & 0xFF;
        this.sheet[i + 3] = colorIndex === 0 ? 0 : 255;
      }
    }
  }

  processCommands(commands) {
    if (!commands) return;
    for (let i = 0; i < 64; i++) this.sprites[i] = { spriteId: -1, x: 0, y: 0, flipH: false, flipV: false };
    for (let y = 0; y < 16; y++) for (let x = 0; x < 128; x++) this.tiles[y][x] = -1;

    if (commands.sprites && Array.isArray(commands.sprites)) {
      commands.sprites.forEach((sprite, index) => {
        if (index < 64 && sprite) {
          this.sprites[index] = { spriteId: sprite.spriteId, x: sprite.x, y: sprite.y, flipH: sprite.flipH || false, flipV: sprite.flipV || false };
        }
      });
    }
    if (commands.tiles && Array.isArray(commands.tiles)) {
      commands.tiles.forEach(tile => {
        if (tile && tile.x >= 0 && tile.x < 128 && tile.y >= 0 && tile.y < 16 && this.tiles[tile.y]) {
          this.tiles[tile.y][tile.x] = tile.tileId;
        }
      });
    }
    if (commands.background !== undefined) this.backgroundColor = commands.background;
    if (commands.scroll !== undefined && commands.scroll) {
      this.scroll = { x: commands.scroll.x || 0, y: commands.scroll.y || 0 };
    }
  }

  render() {
    const out = new Uint8ClampedArray(128 * 128 * 4);
    const bg = this.palette[this.backgroundColor] || 0x000000;
    for (let i = 0; i < out.length; i += 4) {
      out[i] = (bg >> 16) & 0xFF; out[i + 1] = (bg >> 8) & 0xFF; out[i + 2] = bg & 0xFF; out[i + 3] = 255;
    }

    const draw = (id, screenX, screenY, flipH, flipV) => {
      const position = getSpritePosition(id);
      for (let sy = 0; sy < 8; sy++) {
        for (let sx = 0; sx < 8; sx++) {
          const dx = screenX + sx, dy = screenY + sy;
          if (dx < 0 || dx >= 128 || dy < 0 || dy >= 128) continue;
          const srcX = position.x + (flipH ? 7 - sx : sx), srcY = position.y + (flipV ? 7 - sy : sy);
          if (srcY >= 256) continue;
          const s = (srcY * 128 + srcX) * 4;
          if (this.sheet[s + 3] === 0) continue;
          const d = (dy * 128 + dx) * 4;
          out[d] = this.sheet[s]; out[d + 1] = this.sheet[s + 1]; out[d + 2] = this.sheet[s + 2]; out[d + 3] = 255;
        }
      }
    };

    // renderTiles: canvas drawImage at a fractional position snaps to the nearest pixel
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 128; x++) {
        const tileId = this.tiles[y][x];
        if (tileId >= 0) {
          const screenX = x * 8 - this.scroll.x;
          const screenY = y * 8 - this.scroll.y;
          if (screenX < -8 || screenX >= 128 || screenY < -8 || screenY >= 128) continue;
          draw(tileId, Math.round(screenX), Math.round(screenY), false, false);
        }
      }
    }

    // renderSprites
    for (let i = 0; i < 64; i++) {
      const sprite = this.sprites[i];
      if (sprite.spriteId >= 0) {
        const screenX = Math.round(sprite.x - this.scroll.x);
        const screenY = Math.round(sprite.y - this.scroll.y);
        if (screenX < -8 || screenX >= 128 || screenY < -8 || screenY >= 128) continue;
        draw(sprite.spriteId, screenX, screenY, sprite.flipH, sprite.flipV);
      }
    }
    return out;
  }
}

// ---------------------------------------------------------------------------

async function runGame(runtime, QuickJS, file) {
  const vm = runtime.newContext();
  const executor = new QuickJSGameExecutor(vm, QuickJS);
  let deadline = Date.now() + FRAME_BUDGET_MS;
  runtime.setInterruptHandler(() => Date.now() > deadline);

  const result = { file, frames: 0, mismatches: [], error: null, digest: null, usesNewLayers: false };
  let updateHandle = null;

  try {
    vm.unwrapResult(vm.evalCode(PRELUDE)).dispose();
    const loaded = executor.loadGameCode(fs.readFileSync(file, 'utf8'));
    updateHandle = loaded.updateHandle;
    result.usesNewLayers = loaded.resources.tilemap !== undefined;

    const legacy = new LegacyConsole(loaded.resources);
    const state = new ConsoleState(loaded.resources);
    const renderer = new ConsoleRenderer();
    renderer.loadResources(loaded.resources.sprites, state.palette);
    const hash = crypto.createHash('sha1');

    let prev = {};
    for (let frame = 0; frame < SCRIPT.length; frame++) {
      vm.unwrapResult(vm.evalCode('__tick()')).dispose();
      const buttons = SCRIPT[frame];
      const commands = executor.callUpdate(updateHandle, 1 / 60, QuickJSGameExecutor.createInputState(buttons, prev));
      prev = buttons;
      if (commands && NEW_COMMAND_KEYS.some(key => commands[key] !== undefined)) result.usesNewLayers = true;

      legacy.processCommands(commands);
      state.apply(commands);
      const expected = legacy.render();
      const actual = renderer.render(state);
      hash.update(actual);
      result.frames++;

      if (Buffer.compare(Buffer.from(expected.buffer), Buffer.from(actual.buffer, actual.byteOffset, actual.byteLength)) !== 0) {
        let diff = 0;
        for (let i = 0; i < expected.length; i += 4) {
          if (expected[i] !== actual[i] || expected[i + 1] !== actual[i + 1] || expected[i + 2] !== actual[i + 2]) diff++;
        }
        result.mismatches.push({ frame, pixels: diff });
      }
      if (commands?.gameOver === true) break;
    }
    result.digest = hash.digest('hex');
  } catch (error) {
    result.error = error.message.split('\n')[0].slice(0, 160);
  } finally {
    runtime.removeInterruptHandler();
    if (updateHandle) updateHandle.dispose();
    // A crashed game can leak handles, so the context and runtime are left for process exit
    if (!result.error) vm.dispose();
  }
  return result;
}

async function main() {
  const args = process.argv.slice(2);
  let recordPath = null;
  let checkPath = null;
  const files = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--record') recordPath = args[++i];
    else if (args[i] === '--check') checkPath = args[++i];
    else if (fs.statSync(args[i]).isDirectory()) {
      files.push(...fs.readdirSync(args[i]).filter(f => f.endsWith('.js')).map(f => path.join(args[i], f)));
    } else files.push(args[i]);
  }

  const QuickJS = await newQuickJSWASMModuleFromVariant(releaseVariant);
  const runtime = QuickJS.newRuntime();
  const goldens = checkPath ? JSON.parse(fs.readFileSync(checkPath, 'utf8')) : {};
  const recorded = {};
  let failed = 0;

  for (const file of files) {
    const r = await runGame(runtime, QuickJS, file);
    const name = path.basename(file);
    let status = r.usesNewLayers ? 'NEW' : r.mismatches.length === 0 ? 'SAME' : 'DIFF';
    if (checkPath && goldens[name] && goldens[name] !== r.digest) status = 'CHANGED';
    if (status === 'DIFF' || status === 'CHANGED') failed++;

    const detail = r.mismatches.length && !r.usesNewLayers
      ? ` | ${r.mismatches.length} frames differ, first at ${r.mismatches[0].frame} (${r.mismatches[0].pixels}px)`
      : '';
    console.log(`${status} ${String(r.frames).padStart(3)} frames ${name.slice(0, 70)}${detail}${r.error ? ` | stopped: ${r.error}` : ''}`);
    if (r.digest) recorded[name] = r.digest;
  }

  if (recordPath) {
    fs.writeFileSync(recordPath, JSON.stringify(recorded, null, 2) + '\n');
    console.log(`Recorded ${Object.keys(recorded).length} digests to ${recordPath}`);
  }
  console.log(`\n${files.length - failed}/${files.length} games pass`);
  process.exit(failed ? 1 : 0);
}

main();
