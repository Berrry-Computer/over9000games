import { newQuickJSWASMModuleFromVariant } from "quickjs-emscripten-core";
import releaseVariant from "@jitl/quickjs-singlefile-cjs-release-sync";
import {
  QuickJSGameExecutor,
  getSpritePosition,
  getDefaultPalette
} from "../shared/game-runner-common.js";

const SMOKE_LOAD_BUDGET_MS = 2000;
const SMOKE_RUN_BUDGET_MS = 5000;
const SMOKE_IDLE_FRAMES = 60;

// ~4s of scripted play: idle, press start, run right, jump, run left, up/down, fire
const SMOKE_SCRIPT = [
  ...Array(SMOKE_IDLE_FRAMES).fill({}),
  ...Array(5).fill({ a: true }), ...Array(5).fill({}),
  ...Array(40).fill({ right: true }),
  ...Array(10).fill({ right: true, a: true }),
  ...Array(40).fill({ left: true }),
  ...Array(20).fill({ up: true }),
  ...Array(20).fill({ down: true }),
  ...Array(20).fill({ b: true }),
  ...Array(20).fill({}),
];

function checkResources(resources) {
  if (!resources || typeof resources !== 'object') {
    return 'must return an object';
  }
  if (resources.sprites !== undefined) {
    if (!Array.isArray(resources.sprites)) return 'sprites must be an array';
    for (let i = 0; i < resources.sprites.length; i++) {
      const sprite = resources.sprites[i];
      if (!Array.isArray(sprite) || sprite.length !== 8) {
        return `sprite ${i} must be an array of 8 hex strings`;
      }
      const badRow = sprite.findIndex(row => typeof row !== 'string' || !/^[0-9a-fA-F]{8}$/.test(row));
      if (badRow !== -1) {
        return `sprite ${i} row ${badRow} must be an 8-character hex string, got ${JSON.stringify(sprite[badRow])}`;
      }
    }
  }
  if (resources.palette !== undefined) {
    if (!Array.isArray(resources.palette)) return 'palette must be an array';
    if (resources.palette.length > 16) return `palette has ${resources.palette.length} colors, max is 16`;
  }
  return null;
}

/**
 * Headless game runner for server-side screenshot generation.
 * Runs game code in QuickJS and captures render state.
 * Uses sync variant to avoid WASM file loading issues in Devvit.
 */
export class HeadlessGameRunner {
  constructor() {
    this.vm = null;
    this.QuickJS = null;
    this.runtime = null;
    this.executor = null;
  }

  async initialize() {
    if (this.QuickJS) return;

    // Use sync variant which embeds WASM - works in Devvit's server environment
    this.QuickJS = await newQuickJSWASMModuleFromVariant(releaseVariant);
    this.runtime = this.QuickJS.newRuntime();
    this.runtime.setModuleLoader(() => "");
    this.vm = this.runtime.newContext();
    this.executor = new QuickJSGameExecutor(this.vm, this.QuickJS);
  }

  /**
   * Run game code and capture render state after N frames
   * @param {string} gameCode - The game JavaScript code
   * @param {number} frames - Number of frames to simulate (default 60)
   * @returns {Object} - { sprites, palette, tiles, background, spriteSlots, scroll }
   */
  async runGame(gameCode, frames = 60) {
    await this.initialize();

    // Reset VM for clean state
    if (this.vm) {
      this.vm.dispose();
    }
    this.vm = this.runtime.newContext();
    this.executor = new QuickJSGameExecutor(this.vm, this.QuickJS);

    try {
      // Load and evaluate game code using shared executor
      const { metadata, resources, updateHandle } = this.executor.loadGameCode(gameCode);

      // Run update() for specified frames to let game initialize
      const deltaTime = 1 / 60; // seconds, same unit as the client game loop
      let lastState = null;

      const input = QuickJSGameExecutor.createInputState({}, {});

      for (let i = 0; i < frames; i++) {
        const state = this.executor.callUpdate(updateHandle, deltaTime, input);
        if (state) {
          lastState = state;
        }
      }

      // Cleanup
      updateHandle.dispose();

      return {
        metadata: metadata || {},
        sprites: resources.sprites || [],
        palette: resources.palette || getDefaultPalette(),
        tiles: lastState?.tiles || [],
        background: lastState?.background ?? 0,
        spriteSlots: lastState?.sprites || [],
        scroll: lastState?.scroll || { x: 0, y: 0 }
      };
    } catch (error) {
      console.error("HeadlessGameRunner error:", error);
      throw error;
    }
  }

  /**
   * Check that a generated game starts and survives a few seconds of play.
   * Runs scripted input under a CPU deadline so infinite loops can't hang the server.
   * @param {string} gameCode - The game JavaScript code
   * @returns {{ok: boolean, error?: string, frame?: number}}
   */
  async smokeTest(gameCode) {
    await this.initialize();

    if (this.vm) {
      this.vm.dispose();
    }
    this.vm = this.runtime.newContext();
    this.executor = new QuickJSGameExecutor(this.vm, this.QuickJS);

    let frame = -1;
    let updateHandle = null;
    let deadline = 0;
    this.runtime.setInterruptHandler(() => Date.now() > deadline);

    try {
      deadline = Date.now() + SMOKE_LOAD_BUDGET_MS;
      const loaded = this.executor.loadGameCode(gameCode);
      updateHandle = loaded.updateHandle;

      const resourceError = checkResources(loaded.resources);
      if (resourceError) {
        return { ok: false, error: `resources(): ${resourceError}` };
      }

      const deltaTime = 1 / 60; // seconds, same unit as the client game loop
      let prevButtons = {};
      deadline = Date.now() + SMOKE_RUN_BUDGET_MS;

      for (frame = 0; frame < SMOKE_SCRIPT.length; frame++) {
        const buttons = SMOKE_SCRIPT[frame];
        const input = QuickJSGameExecutor.createInputState(buttons, prevButtons);
        prevButtons = buttons;

        const state = this.executor.callUpdate(updateHandle, deltaTime, input);
        if (!state || typeof state !== 'object' || Array.isArray(state)) {
          return { ok: false, frame, error: `update() must return an object, got ${JSON.stringify(state)}` };
        }
        if (state.sprites !== undefined && !Array.isArray(state.sprites)) {
          return { ok: false, frame, error: 'update() returned sprites that is not an array' };
        }
        if (state.tiles !== undefined && !Array.isArray(state.tiles)) {
          return { ok: false, frame, error: 'update() returned tiles that is not an array' };
        }
        if (state.gameOver === true && frame < SMOKE_IDLE_FRAMES) {
          return { ok: false, frame, error: `game reported gameOver after ${frame + 1} frames with no input; the game must wait for the player` };
        }
        if (state.gameOver === true) {
          // Losing during scripted input is fine - the game started and ran
          break;
        }
      }

      return { ok: true };
    } catch (error) {
      const message = Date.now() > deadline
        ? `timed out (possible infinite loop) ${frame < 0 ? 'while loading' : `at frame ${frame}`}`
        : error.message;
      return { ok: false, frame: frame < 0 ? undefined : frame, error: message };
    } finally {
      this.runtime.removeInterruptHandler();
      if (updateHandle) updateHandle.dispose();
    }
  }

  /**
   * Extract metadata from game code without running frames
   * @param {string} gameCode - The game JavaScript code
   * @returns {Object} - { title, description, controls }
   */
  async extractMetadata(gameCode) {
    await this.initialize();

    // Reset VM for clean state
    if (this.vm) {
      this.vm.dispose();
    }
    this.vm = this.runtime.newContext();
    this.executor = new QuickJSGameExecutor(this.vm, this.QuickJS);

    try {
      const { metadata, updateHandle } = this.executor.loadGameCode(gameCode);
      updateHandle.dispose();
      return metadata || {};
    } catch (error) {
      console.error("HeadlessGameRunner extractMetadata error:", error);
      throw error;
    }
  }

  dispose() {
    if (this.vm) {
      this.vm.dispose();
      this.vm = null;
    }
    if (this.runtime) {
      this.runtime.dispose();
      this.runtime = null;
    }
  }
}
