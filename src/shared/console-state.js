/**
 * Console video state shared by the client, the headless runner and the screenshot renderer.
 *
 * Layers, back to front:
 *   background color -> tilemap -> tiles[] -> sprites -> text
 *
 * - tilemap: declared in resources().tilemap, kept by the console between frames,
 *   edited with update() `bg: [{x, y, tileId}]`, scrolled by `bgScroll` (or `scroll` if bgScroll was never sent)
 * - tiles[]: legacy 128x16 grid, cleared every frame, scrolled by `scroll`
 * - sprites: up to 64 per frame in world pixels, scrolled by `scroll`
 * - text: 16x16 screen grid, cleared every frame, scrolled only by `textScroll`
 *
 * Games that never declare a tilemap or send bg/text get exactly the old tiles[] + sprites behavior.
 */
import { MAX_SPRITES, MAX_TILES_X, MAX_TILES_Y, getDefaultPalette } from "./game-runner-common.js";
import { BITMAP_FONT, FONT_TILE_BASE } from "./bitmap-font.js";
import { checkMusic, checkVoice } from "./music.js";

export const TEXT_COLS = 16;
export const TEXT_ROWS = 16;
export const TILEMAP_MAX_SIZE = 256;

const EMPTY = -1;
const FONT_CHARS = new Set(Object.keys(BITMAP_FONT));

function isIndex(value, size) {
  return Number.isInteger(value) && value >= 0 && value < size;
}

function readScroll(scroll, fallback) {
  if (!scroll || typeof scroll !== 'object') return fallback;
  return { x: Number(scroll.x) || 0, y: Number(scroll.y) || 0 };
}

/**
 * Parse resources().tilemap into a flat cell array
 * rows are strings with 2 hex chars per cell ("00" = empty) or arrays of numbers
 * @returns {{width, height, wrap, cells: Uint8Array}|null}
 */
export function buildTilemap(spec) {
  if (!spec || typeof spec !== 'object') return null;
  const rows = Array.isArray(spec.rows) ? spec.rows : [];
  const widestRow = rows.reduce((max, row) =>
    Math.max(max, typeof row === 'string' ? Math.ceil(row.length / 2) : Array.isArray(row) ? row.length : 0), 0);

  const clampSize = (n) => Math.max(1, Math.min(TILEMAP_MAX_SIZE, Math.floor(n) || 1));
  const width = clampSize(spec.width ?? widestRow);
  const height = clampSize(spec.height ?? rows.length);
  const cells = new Uint8Array(width * height);

  for (let y = 0; y < Math.min(height, rows.length); y++) {
    const row = rows[y];
    for (let x = 0; x < width; x++) {
      let value = 0;
      if (typeof row === 'string') {
        value = parseInt(row.substr(x * 2, 2), 16);
      } else if (Array.isArray(row)) {
        value = row[x];
      }
      cells[y * width + x] = isIndex(value, 256) ? value : 0;
    }
  }

  return { width, height, wrap: spec.wrap === true, cells };
}

/**
 * Validate resources().tilemap so the smoke test can report mistakes to the model
 * @returns {string|null}
 */
export function checkTilemap(spec) {
  if (spec === undefined) return null;
  if (!spec || typeof spec !== 'object') return 'tilemap must be an object';
  if (!Array.isArray(spec.rows)) return 'tilemap.rows must be an array of strings (2 hex chars per tile)';
  for (const key of ['width', 'height']) {
    if (spec[key] !== undefined && !(Number.isInteger(spec[key]) && spec[key] >= 1 && spec[key] <= TILEMAP_MAX_SIZE)) {
      return `tilemap.${key} must be an integer from 1 to ${TILEMAP_MAX_SIZE}`;
    }
  }
  if (spec.rows.length > TILEMAP_MAX_SIZE) return `tilemap has ${spec.rows.length} rows, max is ${TILEMAP_MAX_SIZE}`;
  for (let y = 0; y < spec.rows.length; y++) {
    const row = spec.rows[y];
    if (typeof row === 'string') {
      if (row.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(row)) {
        return `tilemap row ${y} must be 2 hex chars per tile, got ${JSON.stringify(row.slice(0, 40))}`;
      }
      if (row.length / 2 > TILEMAP_MAX_SIZE) return `tilemap row ${y} has ${row.length / 2} tiles, max is ${TILEMAP_MAX_SIZE}`;
    } else if (Array.isArray(row)) {
      if (row.length > TILEMAP_MAX_SIZE) return `tilemap row ${y} has ${row.length} tiles, max is ${TILEMAP_MAX_SIZE}`;
      if (!row.every(v => isIndex(v, 256))) return `tilemap row ${y} must contain tile ids 0-255`;
    } else {
      return `tilemap row ${y} must be a string of hex pairs`;
    }
  }
  return null;
}

/**
 * Validate the new resource sections (tilemap, music)
 * @returns {string|null}
 */
export function checkConsoleResources(resources) {
  return checkTilemap(resources?.tilemap) || checkMusic(resources?.music);
}

/**
 * Validate the shape of one update() result
 * @returns {string|null}
 */
export function checkCommands(commands) {
  for (const key of ['sprites', 'tiles', 'bg', 'text', 'sounds']) {
    if (commands[key] !== undefined && commands[key] !== null && !Array.isArray(commands[key])) {
      return `update() returned ${key} that is not an array`;
    }
  }
  for (const sound of commands.sounds || []) {
    const error = sound && checkVoice(sound);
    if (error) return `sound ${JSON.stringify(sound.soundId ?? sound.slotId)}: ${error}`;
  }
  return null;
}

export class ConsoleState {
  /**
   * @param {Object} resources - Result of the game's resources()
   */
  constructor(resources = {}) {
    this.resources = resources || {};
    this.palette = Array.isArray(this.resources.palette) ? this.resources.palette : getDefaultPalette();
    this.reset();
  }

  reset() {
    this.sprites = [];
    this.tiles = new Array(MAX_TILES_X * MAX_TILES_Y).fill(EMPTY);
    this.background = 0;
    this.scroll = { x: 0, y: 0 };

    this.tilemap = buildTilemap(this.resources.tilemap);
    this.bgScroll = null; // follows scroll until the game sends bgScroll

    this.text = new Array(TEXT_COLS * TEXT_ROWS).fill(EMPTY);
    this.textBg = null;
    this.textScroll = { x: 0, y: 0 };

    this.warnedTilesWithTilemap = false;
  }

  /**
   * Apply one frame of update() output
   * @param {Object} commands
   */
  apply(commands) {
    if (!commands || typeof commands !== 'object') return;

    // Sprites, legacy tiles and text are cleared every frame
    this.sprites = [];
    this.tiles.fill(EMPTY);
    this.text.fill(EMPTY);

    if (Array.isArray(commands.sprites)) {
      const count = Math.min(commands.sprites.length, MAX_SPRITES);
      for (let i = 0; i < count; i++) {
        const sprite = commands.sprites[i];
        if (!sprite || typeof sprite !== 'object') continue;
        this.sprites.push({
          spriteId: sprite.spriteId,
          x: sprite.x,
          y: sprite.y,
          flipH: sprite.flipH || false,
          flipV: sprite.flipV || false
        });
      }
    }

    if (Array.isArray(commands.tiles)) {
      if (this.tilemap && commands.tiles.length > 0 && !this.warnedTilesWithTilemap) {
        this.warnedTilesWithTilemap = true;
        console.warn('Game sends tiles[] and has a tilemap; tiles[] draws on top of the tilemap. Use bg edits instead.');
      }
      for (const tile of commands.tiles) {
        if (!tile) continue;
        const x = Number(tile.x);
        const y = Number(tile.y);
        if (isIndex(x, MAX_TILES_X) && isIndex(y, MAX_TILES_Y)) {
          this.tiles[y * MAX_TILES_X + x] = tile.tileId;
        }
      }
    }

    if (commands.background !== undefined) {
      this.background = commands.background;
    }

    if (commands.scroll !== undefined) {
      this.scroll = readScroll(commands.scroll, this.scroll);
    }

    // Tilemap edits persist until changed again
    if (this.tilemap && Array.isArray(commands.bg)) {
      const { width, height, wrap, cells } = this.tilemap;
      for (const edit of commands.bg) {
        if (!edit) continue;
        let x = Math.floor(Number(edit.x));
        let y = Math.floor(Number(edit.y));
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
        if (wrap) {
          x = ((x % width) + width) % width;
          y = ((y % height) + height) % height;
        }
        const tileId = Number(edit.tileId);
        if (isIndex(x, width) && isIndex(y, height) && isIndex(tileId, 256)) {
          cells[y * width + x] = tileId;
        }
      }
    }

    if (commands.bgScroll !== undefined) {
      this.bgScroll = readScroll(commands.bgScroll, this.bgScroll);
    }

    if (Array.isArray(commands.text)) {
      for (const entry of commands.text) {
        if (!entry) continue;
        const x = Math.floor(Number(entry.x));
        const y = Math.floor(Number(entry.y));
        if (!isIndex(y, TEXT_ROWS)) continue;
        if (typeof entry.text === 'string' || typeof entry.text === 'number') {
          const str = String(entry.text).toUpperCase();
          for (let i = 0; i < str.length; i++) {
            if (isIndex(x + i, TEXT_COLS)) {
              const char = FONT_CHARS.has(str[i]) ? str[i] : ' ';
              this.text[y * TEXT_COLS + x + i] = FONT_TILE_BASE + char.charCodeAt(0);
            }
          }
        } else if (isIndex(x, TEXT_COLS) && entry.tileId !== undefined) {
          this.text[y * TEXT_COLS + x] = entry.tileId;
        }
      }
    }

    // Backing color behind text cells for this frame only (null = transparent)
    this.textBg = commands.textBg ?? null;

    if (commands.textScroll !== undefined) {
      this.textScroll = readScroll(commands.textScroll, this.textScroll);
    }
  }

  /**
   * Camera used for the tilemap layer
   */
  getTilemapScroll() {
    return this.bgScroll || this.scroll;
  }

  /**
   * Counts for the debug panel
   */
  getStats() {
    return {
      spriteCount: this.sprites.filter(s => s.spriteId >= 0).length,
      tileCount: this.tiles.filter(t => t >= 0).length,
      textCount: this.text.filter(t => t >= 0).length
    };
  }
}
