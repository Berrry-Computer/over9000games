import { PNG } from "pngjs";
import { ConsoleRenderer } from "../shared/console-renderer.js";

const SCREEN_WIDTH = 128;
const SCREEN_HEIGHT = 128;

/**
 * Encode 128x128 RGBA console pixels as PNG, optionally enlarged with square pixels
 * @param {Uint8ClampedArray} pixels
 * @param {number} scale
 * @returns {Buffer}
 */
export function encodePng(pixels, scale = 1) {
  const png = new PNG({ width: SCREEN_WIDTH * scale, height: SCREEN_HEIGHT * scale });
  if (scale === 1) {
    png.data.set(pixels);
  } else {
    const out = new Uint32Array(png.data.buffer, png.data.byteOffset, png.data.length / 4);
    const src = new Uint32Array(pixels.buffer, pixels.byteOffset, pixels.length / 4);
    for (let y = 0; y < SCREEN_HEIGHT * scale; y++) {
      const row = Math.floor(y / scale) * SCREEN_WIDTH;
      for (let x = 0; x < SCREEN_WIDTH * scale; x++) out[y * SCREEN_WIDTH * scale + x] = src[row + Math.floor(x / scale)];
    }
  }
  return PNG.sync.write(png);
}

/**
 * Server-side screenshot renderer: draws the console state with the same
 * renderer as the client and encodes it as PNG.
 */
export class ScreenshotRenderer {
  constructor() {
    this.renderer = new ConsoleRenderer();
  }

  /**
   * Render game state to PNG data URI
   * @param {Object} gameState - Output from HeadlessGameRunner.runGame()
   * @returns {string} - PNG as data URI (data:image/png;base64,...)
   */
  render({ resources, state }) {
    this.renderer.loadResources(resources.sprites, state.palette);
    const buffer = encodePng(this.renderer.render(state));

    return `data:image/png;base64,${buffer.toString("base64")}`;
  }
}

/**
 * Convenience function to generate screenshot from game code
 * @param {string} gameCode - The game JavaScript code
 * @param {number} frames - Number of frames to simulate
 * @returns {Promise<string>} - PNG as data URI
 */
export async function generateScreenshot(gameCode, frames = 60) {
  const { HeadlessGameRunner } = await import("./headless-game-runner.js");

  const runner = new HeadlessGameRunner();
  const renderer = new ScreenshotRenderer();

  try {
    const gameState = await runner.runGame(gameCode, frames);
    return renderer.render(gameState);
  } finally {
    runner.dispose();
  }
}
