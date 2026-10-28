#!/usr/bin/env node
/**
 * Checks for the console layers (tilemap, text) and the music sequencer.
 *   node scripts/test-console.js
 */
import assert from 'assert/strict';
import { ConsoleState, checkTilemap, checkConsoleResources, checkCommands } from '../src/shared/console-state.js';
import { ConsoleRenderer } from '../src/shared/console-renderer.js';
import { readFileSync } from 'fs';
import { MusicPlayer, parseSong, checkVoice, DRUMS } from '../src/shared/music.js';
import { HeadlessGameRunner } from '../src/server/headless-game-runner.js';
import { QuickJSGameExecutor, readMemoryLayout, MEMORY_MAGIC, MEMORY_VERSION } from '../src/shared/game-runner-common.js';

const SOLID = (digit) => Array(8).fill(digit.repeat(8));
const sprites = [SOLID('0'), SOLID('1'), SOLID('2'), SOLID('3')];
const palette = [0x000000, 0xFFFFFF, 0xFF0000, 0x00FF00];
const WHITE = 0xFFFFFFFF, RED = 0xFF0000FF, GREEN = 0xFF00FF00, BLACK = 0xFF000000;

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log(`ok - ${name}`);
}

function render(resources, ...frames) {
  const state = new ConsoleState({ sprites, palette, ...resources });
  const renderer = new ConsoleRenderer();
  renderer.loadResources(sprites, palette);
  frames.forEach(f => state.apply(f));
  renderer.render(state);
  return { state, px: (x, y) => renderer.frame[y * 128 + x] };
}

test('tilemap draws and edits persist', () => {
  const { px } = render(
    { tilemap: { rows: ['0102', '0000'] } },
    { bg: [{ x: 0, y: 1, tileId: 3 }] },
    {} // edit stays after a frame without bg
  );
  assert.equal(px(0, 0), WHITE);
  assert.equal(px(8, 0), RED);
  assert.equal(px(0, 8), GREEN);
  assert.equal(px(16, 0), BLACK); // outside a non-wrapping map
});

test('tilemap follows scroll until bgScroll is sent', () => {
  const rows = ['01' + '00'.repeat(31)];
  const followed = render({ tilemap: { rows } }, { scroll: { x: 8, y: 0 } });
  assert.equal(followed.px(0, 0), BLACK);
  const pinned = render({ tilemap: { rows } }, { scroll: { x: 8, y: 0 }, bgScroll: { x: 0, y: 0 } });
  assert.equal(pinned.px(0, 0), WHITE);
});

test('wrapping tilemap repeats in both directions', () => {
  const { px } = render({ tilemap: { rows: ['0102'], wrap: true } }, { scroll: { x: -8, y: 8 } });
  assert.equal(px(0, 0), RED);   // tile x=-1 wraps to x=1, row wraps too
  assert.equal(px(8, 0), WHITE);
  assert.equal(px(16, 0), RED);
});

test('text layer ignores scroll, clears each frame, supports backing', () => {
  const shown = render({}, { scroll: { x: 50, y: 50 }, text: [{ x: 0, y: 0, text: 'a' }], textBg: 2 });
  assert.equal(shown.state.text[0], 0x141); // lowercase drawn as uppercase
  assert.equal(shown.px(0, 0), RED); // backing behind glyph
  assert.equal(shown.px(3, 0), WHITE); // top of the 'A' glyph
  const cleared = render({}, { text: [{ x: 0, y: 0, text: 'A' }] }, {});
  assert.equal(cleared.state.text[0], -1);
});

test('text is drawn above sprites, tilemap below sprites', () => {
  const { px } = render(
    { tilemap: { rows: ['01'] } },
    { sprites: [{ spriteId: 2, x: 0, y: 0 }], text: [{ x: 1, y: 0, tileId: 3 }] }
  );
  assert.equal(px(0, 0), RED);
  const over = render({}, { sprites: [{ spriteId: 2, x: 8, y: 0 }], text: [{ x: 1, y: 0, tileId: 3 }] });
  assert.equal(over.px(8, 0), GREEN);
});

test('games without new fields keep old state', () => {
  const { state } = render({}, { sprites: [], tiles: [{ x: 1, y: 1, tileId: 2 }] });
  assert.equal(state.tilemap, null);
  assert.equal(state.textBg, null);
  assert.equal(state.tiles[1 * 128 + 1], 2);
});

test('resource and command checks', () => {
  assert.equal(checkTilemap({ rows: ['0g'] }).includes('hex'), true);
  assert.equal(checkTilemap({ rows: ['010'] }).includes('2 hex'), true);
  assert.equal(checkTilemap({ rows: ['0102'], width: 999 }).includes('width'), true);
  assert.equal(checkTilemap({ rows: ['0102'] }), null);
  assert.match(checkConsoleResources({ music: { main: { tracks: [{ channel: 'pulse1', notes: 'H4' }] } } }), /music\.main.*bad note "H4"/);
  assert.equal(checkConsoleResources({ music: { main: { tracks: [{ channel: 'pulse1', notes: 'C4 Bb3:0.5 -:2' }] } } }), null);
  assert.match(checkCommands({ text: 'SCORE' }), /text that is not an array/);
});

test('music sequencer timing, looping and switching', () => {
  const { song } = parseSong({ bpm: 120, tracks: [{ channel: 'pulse1', notes: 'C4 -:1 E4:2' }] });
  assert.equal(song.tracks[0].notes.length, 3);

  const player = new MusicPlayer({ main: { bpm: 120, tracks: [{ channel: 'pulse1', notes: 'C4 -:1 E4:2' }] } });
  assert.equal(player.play('main'), true);
  assert.equal(player.play('main'), false); // same name keeps playing

  const started = [];
  for (let frame = 0; frame < 230; frame++) { // ~3.8s at 0.5s per beat: 2 loops of 4 beats
    for (const note of player.advance(1 / 60)) started.push({ frame, note: note.note });
  }
  assert.deepEqual(started.map(n => n.note), ['C4', 'E4', 'C4', 'E4']);
  // Within a frame of the beat boundary (float rounding of 1/60 steps)
  assert.ok(Math.abs(started[1].frame - 59) <= 1, `E4 at frame ${started[1].frame}`); // after 2 beats (1s)
  assert.ok(Math.abs(started[2].frame - 119) <= 1, `loop at frame ${started[2].frame}`); // after 4 beats (2s)

  player.play(null);
  assert.deepEqual(player.advance(1), []);

  const once = new MusicPlayer({ jingle: { loop: false, tracks: [{ channel: 'noise', notes: 'C4' }] } });
  once.play('jingle');
  assert.equal(once.advance(0.01).length, 1);
  assert.equal(once.advance(5).length, 0);
});

test('voice options are validated for sounds and tracks', () => {
  assert.equal(checkVoice({ duty: 0.25, period: 12, arp: [0, 4, 7], vol: [1, 0.5], vibrato: { rate: 6, depth: 0.2 }, sweep: { target: 100, curve: 'exp' } }), null);
  assert.equal(checkVoice({ frequency: 440, mode: 'periodic' }), null); // old games: no new options
  assert.match(checkVoice({ duty: 0.3 }), /duty/);
  assert.match(checkVoice({ period: 16 }), /period/);
  assert.match(checkVoice({ arp: '0 4 7' }), /arp/);
  assert.match(checkVoice({ vol: [2] }), /vol/);
  assert.match(checkVoice({ sweep: { curve: 'log' } }), /curve/);
  assert.match(checkCommands({ sounds: [{ soundId: 'zap', duty: 1 }] }), /sound "zap": duty/);
  assert.match(checkConsoleResources({ music: { main: { tracks: [{ channel: 'noise', period: -1, notes: 'C4' }] } } }), /track 0 period/);
});

test('song tracks pass voice options to their notes', () => {
  const player = new MusicPlayer({ main: { tracks: [
    { channel: 'pulse1', duty: 0.125, vibrato: { rate: 5 }, notes: 'C4' },
    { channel: 'noise', period: 12, notes: 'C4' }
  ] } });
  player.play('main');
  const [lead, drum] = player.advance(0.01);
  assert.equal(lead.duty, 0.125);
  assert.deepEqual(lead.vibrato, { rate: 5 });
  assert.equal(drum.period, 12);
  assert.equal(drum.duty, undefined);
});

test('song repeats and drum kit', () => {
  const { song } = parseSong({ tracks: [{ channel: 'pulse1', notes: '[C4 [E4:0.5]x2]x3 G4' }] });
  assert.deepEqual(song.tracks[0].notes.map(n => n.note).join(' '), 'C4 E4 E4 C4 E4 E4 C4 E4 E4 G4');
  assert.match(parseSong({ tracks: [{ channel: 'pulse1', notes: '[C4 E4' }] }).error, /unbalanced/);
  assert.match(parseSong({ tracks: [{ channel: 'pulse1', notes: '[C4]x0' }] }).error, /repeat count/);
  assert.match(parseSong({ tracks: [{ channel: 'pulse1', notes: '[[[[C4]x64]x64]x64]x64' }] }).error, /more than/);
  assert.match(parseSong({ tracks: [{ channel: 'pulse1', notes: 'K' }] }).error, /bad note "K"/);

  const player = new MusicPlayer({ main: { bpm: 120, tracks: [{ channel: 'noise', volume: 0.5, notes: 'K:0.5 S:0.5 H' }] } });
  player.play('main');
  const [kick] = player.advance(0.01);
  assert.equal(kick.period, DRUMS.K.period);
  assert.deepEqual(kick.vol, DRUMS.K.vol);
  assert.equal(kick.volume, Math.min(1, 0.5 * DRUMS.K.volume));
  const [snare] = player.advance(0.25);
  assert.equal(snare.period, DRUMS.S.period);
});

test('sample game songs keep looping tracks in step', () => {
  const code = readFileSync(new URL('../src/shared/test-games/platformer.js', import.meta.url), 'utf8');
  const songs = new Function(`${code}; return SONGS;`)();
  for (const [name, def] of Object.entries(songs)) {
    const { song, error } = parseSong(def);
    assert.equal(error, undefined, `${name}: ${error}`);
    const lengths = song.tracks.map(t => t.notes.reduce((sum, n) => sum + n.beats, 0));
    assert.ok(lengths.every(l => l === lengths[0]), `${name} track lengths ${lengths}`);
  }
});

const runner = new HeadlessGameRunner();
await runner.initialize();

// Load a game in a fresh context and run `frames` updates through the console
function runGame(code, frames = 1) {
  const vm = runner.QuickJS.newContext();
  const executor = new QuickJSGameExecutor(vm, runner.QuickJS);
  const { resources, updateHandle } = executor.loadGameCode(code);
  const state = new ConsoleState({ sprites, palette, ...resources });
  const renderer = new ConsoleRenderer();
  renderer.loadResources(sprites, palette);
  let commands;
  for (let i = 0; i < frames; i++) state.apply(commands = executor.callUpdate(updateHandle, 1 / 60, {}));
  renderer.render(state);
  return { state, commands, px: (x, y) => renderer.frame[y * 128 + x] };
}

const MEMORY_GAME = `
let frame = 0;
function metadata() { return { title: 'mem', memory: 1 }; }
function resources() { return { tilemap: { rows: ['0000', '0000'] } }; }
function update(dt) {
  frame++;
  REGS[REG_BG_COLOR] = 3;
  if (frame === 1) {
    OAM[0] = 1; OAM[1] = 10.9; OAM[2] = 4; OAM[3] = OAM_FLIP_H; // 10.9 is stored as 10
    TEXT[16] = 0x100 + 65;                                      // 'A' at text cell (0, 1)
    BG[0] = 1; BG[1] = 0; BG[2] = 2; REGS[REG_BG_COUNT] = 1;   // tile 2 at map (1, 0)
  }
  return { score: frame };
}`;

test('memory games draw from console memory', () => {
  const { state, commands, px } = runGame(MEMORY_GAME);
  assert.equal(commands.score, 1);
  assert.equal(state.sprites.length, 1);
  assert.deepEqual({ ...state.sprites[0] }, { spriteId: 1, x: 10, y: 4, flipH: true, flipV: false });
  assert.equal(px(10, 4), WHITE);
  assert.equal(px(0, 0), GREEN);  // background color register
  assert.equal(px(8, 0), RED);    // tilemap edit
  assert.equal(state.text[16], 0x141);
});

test('memory: sprites, text and edits clear each frame, registers and the map stay', () => {
  const { state, px } = runGame(MEMORY_GAME, 2);
  assert.equal(state.sprites.length, 0);
  assert.equal(state.text[16], -1);
  assert.equal(state.background, 3);
  assert.equal(px(8, 0), RED);
});

test('memory: old games may use the same names and keep the JSON path', () => {
  const { commands, px } = runGame(`
    const OAM = 'mine'; let REGS = 0; function TEXT() {}
    function metadata() { return { title: 'old' }; }
    function resources() { return {}; }
    function update() { return { sprites: [{ spriteId: 1, x: 2.4, y: 0 }], background: 2 }; }`);
  assert.equal(commands.memory, undefined);
  assert.equal(px(2, 0), WHITE);
  assert.equal(px(20, 20), RED);
  assert.throws(() => runGame(MEMORY_GAME.replace('memory: 1', 'memory: 7')), /memory must be 1/);
});

test('memory layout is found through the region table', () => {
  const words = new Int16Array(64);
  const regions = [[9, 20, 4], [1, 24, 16], [2, 0, 0], [3, 0, 0], [4, 0, 0]]; // 9: unknown, skipped
  words.set([MEMORY_MAGIC, MEMORY_VERSION, regions.length, ...regions.flat()]);
  assert.match(readMemoryLayout(words), /region OAM is too small/);
  const big = new Int16Array(4096);
  big.set([MEMORY_MAGIC, MEMORY_VERSION, 5, 9, 16, 4, 1, 20, 16, 2, 36, 300, 3, 336, 256, 4, 592, 768]);
  assert.deepEqual(readMemoryLayout(big), { REGS: 20, OAM: 36, TEXT: 336, BG: 592 }); // longer OAM is fine
  big[1] = MEMORY_VERSION + 1;
  assert.match(readMemoryLayout(big), /version/);
});

console.log(`\n${passed} passed`);
