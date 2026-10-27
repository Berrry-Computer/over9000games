import { PNG } from "pngjs";
import { ConsoleRenderer } from "../shared/console-renderer.js";

const SCREEN_WIDTH = 128;
const SCREEN_HEIGHT = 128;

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
    const pixels = this.renderer.render(state);

    const png = new PNG({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
    png.data.set(pixels);
    const buffer = PNG.sync.write(png);

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
