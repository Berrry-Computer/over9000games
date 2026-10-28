/**
 * Pixel renderer for ConsoleState. Same code draws the client canvas, server screenshots
 * and golden-frame tests, so they can't drift apart.
 */
import { getSpritePosition, SCREEN_WIDTH, SCREEN_HEIGHT, MAX_TILES_X, MAX_TILES_Y } from "./game-runner-common.js";
import { generateFontTileSprites } from "./bitmap-font.js";
import { TEXT_COLS, TEXT_ROWS } from "./console-state.js";

const SHEET_WIDTH = 128;
const SHEET_HEIGHT = 256;
const SHEET_SLOTS = (SHEET_WIDTH / 8) * (SHEET_HEIGHT / 8); // 512 ids
const TRANSPARENT = 0;
const OPAQUE_BLACK = 16; // sheet value for unused slots and bad hex digits

// Pixels are packed as little-endian RGBA bytes, i.e. 0xAABBGGRR
function packColor(color) {
  const r = (color >> 16) & 0xFF;
  const g = (color >> 8) & 0xFF;
  const b = color & 0xFF;
  return (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;
}

// PAL entries are RGB555 (r << 10 | g << 5 | b); 5 bits widen to 8 so 31 becomes 255
function packRgb555(value) {
  const widen = (c) => (c << 3) | (c >> 2);
  return packColor((widen((value >> 10) & 31) << 16) | (widen((value >> 5) & 31) << 8) | widen(value & 31));
}

export class ConsoleRenderer {
  constructor() {
    // The sheet keeps palette indices, so palette changes apply without rebuilding it
    this.sheet = new Uint8Array(SHEET_WIDTH * SHEET_HEIGHT);
    this.frame = new Uint32Array(SCREEN_WIDTH * SCREEN_HEIGHT);
    this.pixels = new Uint8ClampedArray(this.frame.buffer);
    this.palette = [];
    this.colors = new Uint32Array(OPAQUE_BLACK + 1); // packed color per sheet value, this frame
    this.baseColors = new Uint32Array(OPAQUE_BLACK + 1);
  }

  /**
   * Build the sprite sheet: game sprites at 0+, font at 0x100+ (drawn in palette color 1).
   * Unused slots are opaque black, like the original canvas sheet.
   */
  loadResources(sprites, palette) {
    this.palette = palette;
    for (let i = 0; i < OPAQUE_BLACK; i++) this.baseColors[i] = packColor(this.palette[i] || 0);
    this.baseColors[OPAQUE_BLACK] = packColor(0);
    this.colors.set(this.baseColors);
    this.sheet.fill(OPAQUE_BLACK);

    if (Array.isArray(sprites)) {
      sprites.forEach((sprite, index) => this.writeSprite(sprite, index));
    }
    for (const { tileId, sprite } of generateFontTileSprites(1)) {
      this.writeSprite(sprite, tileId);
    }
  }

  writeSprite(sprite, index) {
    if (!Array.isArray(sprite) || index >= SHEET_SLOTS) return;
    const pos = getSpritePosition(index);
    for (let y = 0; y < 8; y++) {
      const row = sprite[y];
      for (let x = 0; x < 8; x++) {
        const colorIndex = parseInt(row == null ? undefined : row[x], 16);
        this.sheet[(pos.y + y) * SHEET_WIDTH + pos.x + x] = colorIndex >= 0 && colorIndex < OPAQUE_BLACK
          ? colorIndex
          : OPAQUE_BLACK;
      }
    }
  }

  paletteColor(index) {
    return Number.isInteger(index) && index >= 0 && index < OPAQUE_BLACK
      ? this.colors[index]
      : packColor(this.palette[index] || 0);
  }

  /**
   * This frame's colors: the game's palette with console memory PAL overrides (-1 = keep)
   */
  updateColors(overrides) {
    this.colors.set(this.baseColors);
    if (!overrides) return;
    for (let i = 0; i < OPAQUE_BLACK; i++) {
      if (overrides[i] >= 0) this.colors[i] = packRgb555(overrides[i]);
    }
  }

  /**
   * Draw one 8x8 sheet entry at a screen position
   */
  drawTile(id, screenX, screenY, flipH = false, flipV = false) {
    if (!(id >= 0) || !Number.isFinite(screenX) || !Number.isFinite(screenY)) return;
    if (screenX <= -8 || screenX >= SCREEN_WIDTH || screenY <= -8 || screenY >= SCREEN_HEIGHT) return;
    const pos = getSpritePosition(id);
    if (pos.y >= SHEET_HEIGHT) return;

    for (let sy = 0; sy < 8; sy++) {
      const destY = screenY + sy;
      if (destY < 0 || destY >= SCREEN_HEIGHT) continue;
      const srcRow = (pos.y + (flipV ? 7 - sy : sy)) * SHEET_WIDTH + pos.x;
      for (let sx = 0; sx < 8; sx++) {
        const destX = screenX + sx;
        if (destX < 0 || destX >= SCREEN_WIDTH) continue;
        const pixel = this.sheet[srcRow + (flipH ? 7 - sx : sx)];
        if (pixel !== TRANSPARENT) {
          this.frame[destY * SCREEN_WIDTH + destX] = this.colors[pixel];
        }
      }
    }
  }

  fillRect(screenX, screenY, width, height, pixel) {
    for (let y = Math.max(0, screenY); y < Math.min(SCREEN_HEIGHT, screenY + height); y++) {
      for (let x = Math.max(0, screenX); x < Math.min(SCREEN_WIDTH, screenX + width); x++) {
        this.frame[y * SCREEN_WIDTH + x] = pixel;
      }
    }
  }

  /**
   * Render a frame
   * @param {ConsoleState} state
   * @returns {Uint8ClampedArray} - 128x128 RGBA pixels (view over an internal buffer)
   */
  render(state) {
    this.updateColors(state.paletteOverrides);
    this.frame.fill(this.paletteColor(state.background));
    if (state.lineScroll) this.renderTilemapLines(state, state.lineScroll);
    else this.renderTilemap(state);
    this.renderTiles(state);
    this.renderSprites(state);
    this.renderText(state);
    return this.pixels;
  }

  renderTilemap(state) {
    const map = state.tilemap;
    if (!map) return;
    const scroll = state.getTilemapScroll();
    const scrollX = Math.round(scroll.x);
    const scrollY = Math.round(scroll.y);
    const firstX = Math.floor(scrollX / 8);
    const firstY = Math.floor(scrollY / 8);

    for (let ty = firstY; ty <= firstY + SCREEN_HEIGHT / 8; ty++) {
      for (let tx = firstX; tx <= firstX + SCREEN_WIDTH / 8; tx++) {
        let mapX = tx;
        let mapY = ty;
        if (map.wrap) {
          mapX = ((mapX % map.width) + map.width) % map.width;
          mapY = ((mapY % map.height) + map.height) % map.height;
        } else if (mapX < 0 || mapX >= map.width || mapY < 0 || mapY >= map.height) {
          continue;
        }
        const id = map.cells[mapY * map.width + mapX];
        if (id !== 0) {
          this.drawTile(id, tx * 8 - scrollX, ty * 8 - scrollY);
        }
      }
    }
  }

  /**
   * Tilemap drawn one scanline at a time, each line offset by its LINE_SCROLL [dx, dy]
   * (parallax bands, split screens, wavy water). Same pixels as renderTilemap when all are 0.
   */
  renderTilemapLines(state, lines) {
    const map = state.tilemap;
    if (!map) return;
    const scroll = state.getTilemapScroll();
    const scrollX = Math.round(scroll.x);
    const scrollY = Math.round(scroll.y);

    for (let y = 0; y < SCREEN_HEIGHT; y++) {
      const lineX = scrollX + lines[y * 2];
      const lineY = scrollY + lines[y * 2 + 1] + y;
      let mapY = Math.floor(lineY / 8);
      const row = lineY - mapY * 8;
      if (map.wrap) mapY = ((mapY % map.height) + map.height) % map.height;
      else if (mapY < 0 || mapY >= map.height) continue;
      const firstX = Math.floor(lineX / 8);

      for (let tx = firstX; tx <= firstX + SCREEN_WIDTH / 8; tx++) {
        let mapX = tx;
        if (map.wrap) mapX = ((mapX % map.width) + map.width) % map.width;
        else if (mapX < 0 || mapX >= map.width) continue;
        const id = map.cells[mapY * map.width + mapX];
        if (id === 0) continue;
        const pos = getSpritePosition(id);
        if (pos.y >= SHEET_HEIGHT) continue;
        const srcRow = (pos.y + row) * SHEET_WIDTH + pos.x;
        const screenX = tx * 8 - lineX;
        for (let sx = 0; sx < 8; sx++) {
          const destX = screenX + sx;
          if (destX < 0 || destX >= SCREEN_WIDTH) continue;
          const pixel = this.sheet[srcRow + sx];
          if (pixel !== TRANSPARENT) this.frame[y * SCREEN_WIDTH + destX] = this.colors[pixel];
        }
      }
    }
  }

  renderTiles(state) {
    const scrollX = state.scroll.x;
    const scrollY = state.scroll.y;
    for (let y = 0; y < MAX_TILES_Y; y++) {
      for (let x = 0; x < MAX_TILES_X; x++) {
        const id = state.tiles[y * MAX_TILES_X + x];
        if (id >= 0) {
          this.drawTile(id, Math.round(x * 8 - scrollX), Math.round(y * 8 - scrollY));
        }
      }
    }
  }

  renderSprites(state) {
    for (const sprite of state.sprites) {
      this.drawTile(
        sprite.spriteId,
        Math.round(sprite.x - state.scroll.x),
        Math.round(sprite.y - state.scroll.y),
        sprite.flipH,
        sprite.flipV
      );
    }
  }

  renderText(state) {
    const offsetX = Math.round(state.textScroll.x);
    const offsetY = Math.round(state.textScroll.y);
    const backing = state.textBg != null ? this.paletteColor(state.textBg) : null;

    for (let y = 0; y < TEXT_ROWS; y++) {
      for (let x = 0; x < TEXT_COLS; x++) {
        const id = state.text[y * TEXT_COLS + x];
        if (!(id >= 0)) continue;
        const screenX = x * 8 - offsetX;
        const screenY = y * 8 - offsetY;
        if (backing !== null) this.fillRect(screenX, screenY, 8, 8, backing);
        this.drawTile(id, screenX, screenY);
      }
    }
  }
}
