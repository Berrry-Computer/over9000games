/**
 * Shared game runner utilities for both client and headless execution.
 * Contains common QuickJS management, error handling, and helper functions.
 */

/**
 * Get sprite position in sprite sheet from sprite ID
 * @param {number} spriteId - The sprite ID (0-511)
 * @returns {{x: number, y: number, width: number, height: number}}
 */
export function getSpritePosition(spriteId) {
  const x = ((spriteId | 0) % 16) * 8;  // 16 sprites per row (128px ÷ 8px)
  const y = Math.floor((spriteId | 0) / 16) * 8;
  return { x, y, width: 8, height: 8 };
}

/**
 * Get default NES-style color palette
 * @returns {number[]} Array of 16 color values
 */
export function getDefaultPalette() {
  return [
    0x000000, 0x666666, 0x888888, 0xAAAAAA, 0xCCCCCC, 0xFFFFFF,
    0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF,
    0x800000, 0x008000, 0x000080, 0x808080
  ];
}

/**
 * Console memory: games that declare metadata().memory = 1 draw by writing Int16 arrays
 * instead of returning sprites/text/bg/scroll. The buffer starts with a header listing each
 * region's id, offset and length (in Int16 words), so regions can be added later and readers
 * find them by id. Records never get wider: new per-sprite fields would go in a new region.
 *
 *   header: magic, version, region count, then [id, offset, length] per region
 */
export const MEMORY_MAGIC = 0x0900;
export const MEMORY_VERSION = 1;
export const MEMORY_HEADER_LENGTH = 16;
export const MEMORY_BG_EDITS = 256;
export const MEMORY_REGIONS = [
  { id: 1, name: 'REGS', length: 16 },        // registers, indexed by REG_* below
  { id: 2, name: 'OAM', length: 64 * 4 },     // [spriteId, x, y, flags] per sprite, spriteId -1 = hidden
  { id: 3, name: 'TEXT', length: 16 * 16 },   // tile id per text cell (font: 0x100 + char code), -1 = empty
  { id: 4, name: 'BG', length: MEMORY_BG_EDITS * 3 }      // [x, y, tileId] tilemap edits, REGS[REG_BG_COUNT] of them
];
export const REG = {
  CAM_X: 0, CAM_Y: 1,                  // scroll for sprites and the tilemap
  BG_COLOR: 2,                         // palette index behind everything
  TEXT_BG: 3,                          // palette index behind text cells, -1 = none
  TEXT_SCROLL_X: 4, TEXT_SCROLL_Y: 5,
  MAP_SCROLL: 6, MAP_X: 7, MAP_Y: 8,   // MAP_SCROLL 1 = scroll the tilemap by MAP_X/Y instead of CAM
  BG_COUNT: 9                          // tilemap edits in BG this frame
};
export const OAM_FLIP_H = 1;
export const OAM_FLIP_V = 2;

/**
 * Code run in the VM before the game: defines REGS, OAM, TEXT, BG and the REG_* / OAM_* constants
 * as global properties, so a game declaring its own variable with the same name still loads.
 * __clearFrame runs before every update(): sprites, text and edits are redrawn each frame,
 * registers keep their values.
 */
export function memoryPrelude() {
  let offset = MEMORY_HEADER_LENGTH;
  const header = [MEMORY_MAGIC, MEMORY_VERSION, MEMORY_REGIONS.length];
  const views = MEMORY_REGIONS.map(region => {
    header.push(region.id, offset, region.length);
    const view = `globalThis.${region.name} = new Int16Array(mem, ${offset * 2}, ${region.length});`;
    offset += region.length;
    return view;
  });
  const constants = [
    ...Object.entries(REG).map(([name, index]) => `globalThis.REG_${name} = ${index};`),
    `globalThis.OAM_FLIP_H = ${OAM_FLIP_H};`, `globalThis.OAM_FLIP_V = ${OAM_FLIP_V};`
  ];
  return `(function () {
  var mem = new ArrayBuffer(${offset * 2});
  new Int16Array(mem, 0, ${header.length}).set([${header.join(', ')}]);
  ${views.join('\n  ')}
  ${constants.join('\n  ')}
  REGS[${REG.TEXT_BG}] = -1;
  var oam = OAM, text = TEXT, regs = REGS;
  globalThis.__memory = mem;
  globalThis.__clearFrame = function () { oam.fill(-1); text.fill(-1); regs[${REG.BG_COUNT}] = 0; };
})();`;
}

/**
 * Read the region table from a copy of console memory
 * @param {Int16Array} words
 * @returns {Object<string, number>|string} offset of each region by name, or an error
 */
export function readMemoryLayout(words) {
  if (words[0] !== MEMORY_MAGIC) return 'console memory has a bad header';
  if (words[1] !== MEMORY_VERSION) return `console memory version ${words[1]} is not supported`;
  const offsets = {};
  for (let i = 0; i < words[2]; i++) {
    const id = words[3 + i * 3], offset = words[4 + i * 3], length = words[5 + i * 3];
    const region = MEMORY_REGIONS.find(r => r.id === id);
    if (!region) continue; // a region added by a newer console
    if (length < region.length || offset + region.length > words.length) return `console memory region ${region.name} is too small`;
    offsets[region.name] = offset;
  }
  const missing = MEMORY_REGIONS.find(r => offsets[r.name] === undefined);
  return missing ? `console memory has no ${missing.name} region` : offsets;
}

/**
 * Wrap game code with error handling to prevent crashes
 * @param {string} gameCode - The original game code
 * @returns {string} - Wrapped game code with doUpdate() function
 */
export function wrapGameCode(gameCode) {
  return `
${gameCode}

function doUpdate(deltaTime, input) {
  try {
    if (typeof __clearFrame === 'function') __clearFrame();
    return update(deltaTime, input);
  } catch (error) {
    return {
      sprites: [],
      score: 0,
      gameOver: true,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    };
  }
}

// Sprites leave the VM as 4 numbers each (id, x, y, flip bits) in a Float64Array; the rest
// of the frame as JSON. Frames with sprites that are not plain numbers go out as JSON only.
function __packFrame(c) {
  var s = c && c.sprites;
  if (!Array.isArray(s) || s.length === 0 || typeof c.toJSON === 'function') return JSON.stringify(c);
  var a = new Float64Array(s.length * 4);
  for (var i = 0; i < s.length; i++) {
    var p = s[i];
    if (!p || typeof p !== 'object' || typeof p.toJSON === 'function') return JSON.stringify(c);
    var id = p.spriteId, x = p.x, y = p.y;
    if (typeof id !== 'number' || typeof x !== 'number' || typeof y !== 'number' || !isFinite(id + x + y)) {
      return JSON.stringify(c);
    }
    a[i * 4] = id; a[i * 4 + 1] = x; a[i * 4 + 2] = y;
    a[i * 4 + 3] = (p.flipH ? 1 : 0) | (p.flipV ? 2 : 0);
  }
  c.sprites = undefined; // games often return the same object every frame, so put it back
  try { return [JSON.stringify(c), a.buffer]; } finally { c.sprites = s; }
}
`;
}

/**
 * QuickJS game executor - manages VM lifecycle and game function calls.
 * This class abstracts QuickJS operations for both client and server.
 */
export class QuickJSGameExecutor {
  constructor(vm, QuickJS) {
    this.vm = vm;
    this.QuickJS = QuickJS;
  }

  /**
   * Load and evaluate game code in the VM
   * @param {string} gameCode - The game JavaScript code
   * @returns {{metadata: Object, resources: Object, updateHandle: any}}
   */
  loadGameCode(gameCode) {
    this.memory = null;
    // Console memory first, as its own script so game line numbers in errors stay right
    this.vm.unwrapResult(this.vm.evalCode(memoryPrelude(), "console-memory.js")).dispose();

    // Wrap with error handling
    const wrappedCode = wrapGameCode(gameCode);

    // Evaluate code
    const result = this.vm.evalCode(wrappedCode, "game.js");
    if (result.error) {
      const errorMsg = this.vm.dump(this.vm.unwrapResult ? this.vm.unwrapResult(result.error) : result.error);
      result.dispose();
      throw new Error(`Failed to load game code: ${errorMsg}`);
    }
    result.dispose();

    // Get function handles
    const metadataHandle = this.vm.getProp(this.vm.global, "metadata");
    const resourcesHandle = this.vm.getProp(this.vm.global, "resources");
    const updateHandle = this.vm.getProp(this.vm.global, "doUpdate");

    if (!metadataHandle || !resourcesHandle || !updateHandle) {
      throw new Error("Game code must define metadata, resources, and update functions");
    }

    // Call metadata and resources
    const metadataResult = this.vm.callFunction(metadataHandle, this.vm.undefined);
    const resourcesResult = this.vm.callFunction(resourcesHandle, this.vm.undefined);

    if (metadataResult.error || resourcesResult.error) {
      const errorMsg = metadataResult.error
        ? this.vm.dump(this.vm.unwrapResult ? this.vm.unwrapResult(metadataResult) : metadataResult.error)
        : this.vm.dump(this.vm.unwrapResult ? this.vm.unwrapResult(resourcesResult) : resourcesResult.error);
      metadataResult.dispose();
      resourcesResult.dispose();
      throw new Error(`Failed to call game functions: ${errorMsg}`);
    }

    const metadata = this.vm.dump(this.vm.unwrapResult ? this.vm.unwrapResult(metadataResult) : metadataResult.value);
    const resources = this.vm.dump(this.vm.unwrapResult ? this.vm.unwrapResult(resourcesResult) : resourcesResult.value);

    // Cleanup
    metadataResult.dispose();
    resourcesResult.dispose();
    metadataHandle.dispose();
    resourcesHandle.dispose();

    if (metadata && metadata.memory !== undefined) {
      if (metadata.memory !== MEMORY_VERSION) {
        throw new Error(`metadata().memory must be ${MEMORY_VERSION}, got ${JSON.stringify(metadata.memory)}`);
      }
      this.memory = this.attachMemory();
    }

    return { metadata, resources, updateHandle };
  }

  /**
   * Host copy of console memory, refilled after every update()
   * @returns {{words: Int16Array, bytes: Uint8Array, offsets: Object<string, number>}}
   */
  attachMemory() {
    const handle = this.vm.getProp(this.vm.global, "__memory");
    const lifetime = this.vm.getArrayBuffer(handle);
    const bytes = lifetime.value.slice();
    lifetime.dispose();
    handle.dispose();
    const words = new Int16Array(bytes.buffer);
    const offsets = readMemoryLayout(words);
    if (typeof offsets === 'string') throw new Error(offsets);
    return { words, bytes, offsets };
  }

  /**
   * Copy console memory out of the VM into this.memory (one copy, no new arrays)
   */
  readMemory() {
    const handle = this.vm.getProp(this.vm.global, "__memory");
    const lifetime = this.vm.getArrayBuffer(handle);
    this.memory.bytes.set(lifetime.value);
    lifetime.dispose();
    handle.dispose();
  }

  /**
   * Call the update function with deltaTime and input
   * @param {any} updateHandle - QuickJS function handle
   * @param {number} deltaTime - Time since last frame in seconds
   * @param {Object} input - Input state object
   * @returns {Object} - Game state commands
   */
  callUpdate(updateHandle, deltaTime, input) {
    const deltaTimeHandle = this.vm.newNumber(deltaTime);
    const inputStateHandle = this.jsToQjs(input);

    const result = this.vm.callFunction(updateHandle, this.vm.undefined, deltaTimeHandle, inputStateHandle);

    deltaTimeHandle.dispose();
    inputStateHandle.dispose();

    if (result.error) {
      const errorMsg = this.vm.dump(this.vm.unwrapResult ? this.vm.unwrapResult(result) : result.error);
      result.dispose();
      throw new Error(`Update function error: ${errorMsg}`);
    }

    const value = this.vm.unwrapResult ? this.vm.unwrapResult(result) : result.value;
    let commands;
    if (this.memory) {
      // Video is in console memory; the returned object only carries score, sounds, music...
      commands = this.dumpJson(value);
      if (!commands || typeof commands !== 'object' || Array.isArray(commands)) commands = {};
      this.readMemory();
      commands.memory = this.memory;
    } else {
      commands = this.dumpFrame(value);
    }
    result.dispose();

    // Check if JS-side try-catch caught an error
    if (commands && commands.error) {
      throw new Error(`Game runtime error: ${commands.error.message}\nStack: ${commands.error.stack}`);
    }

    return commands;
  }

  /**
   * Call a game function by name
   * @param {string} funcName - Function name (e.g., "metadata", "resources")
   * @param {...any} args - Arguments to pass
   * @returns {any} - Function return value
   */
  callGameFunction(funcName, ...args) {
    const funcHandle = this.vm.getProp(this.vm.global, funcName);
    if (this.vm.typeof(funcHandle) !== "function") {
      funcHandle.dispose();
      return null;
    }

    // Convert args to QuickJS values
    const qjsArgs = args.map(arg => {
      if (typeof arg === "object") {
        return this.jsToQjs(arg);
      }
      return this.vm.newNumber(arg);
    });

    const result = this.vm.callFunction(funcHandle, this.vm.global, ...qjsArgs);

    // Cleanup args
    qjsArgs.forEach(arg => arg.dispose());
    funcHandle.dispose();

    if (result.error) {
      const errorMessage = this.vm.dump(result.error);
      const errorString = typeof errorMessage === 'object'
        ? JSON.stringify(errorMessage, null, 2)
        : String(errorMessage);
      result.error.dispose();
      throw new Error(`${funcName}() error: ${errorString}`);
    }

    const value = this.vm.dump(result.value);
    result.value.dispose();
    return value;
  }

  /**
   * Copy one update() result out of the VM. Sprites come out of __packFrame as binary,
   * which skips stringifying and parsing them; anything unusual goes through dumpJson.
   */
  dumpFrame(handle) {
    const pack = this.vm.getProp(this.vm.global, "__packFrame");
    if (this.vm.typeof(pack) !== "function" || typeof this.vm.getArrayBuffer !== "function") {
      pack.dispose();
      return this.dumpJson(handle);
    }
    const result = this.vm.callFunction(pack, this.vm.undefined, handle);
    pack.dispose();
    if (result.error) {
      result.error.dispose();
      return this.dumpJson(handle);
    }
    const packed = result.value;
    const type = this.vm.typeof(packed);
    if (type === "string") {
      const text = this.vm.getString(packed);
      packed.dispose();
      return JSON.parse(text);
    }
    if (type !== "object") {
      packed.dispose();
      return this.dumpJson(handle);
    }

    const jsonHandle = this.vm.getProp(packed, 0);
    const bufferHandle = this.vm.getProp(packed, 1);
    packed.dispose();
    const commands = JSON.parse(this.vm.getString(jsonHandle));
    jsonHandle.dispose();
    const bytes = this.vm.getArrayBuffer(bufferHandle);
    const values = new Float64Array(bytes.value.slice().buffer); // copy: the view points into VM memory
    bytes.dispose();
    bufferHandle.dispose();

    const sprites = new Array(values.length / 4);
    for (let i = 0; i < sprites.length; i++) {
      const flags = values[i * 4 + 3];
      sprites[i] = {
        spriteId: values[i * 4], x: values[i * 4 + 1], y: values[i * 4 + 2],
        flipH: (flags & 1) !== 0, flipV: (flags & 2) !== 0
      };
    }
    commands.sprites = sprites;
    return commands;
  }

  /**
   * Copy a QuickJS value out as plain data. Same result as vm.dump (both go through JSON),
   * but stringifying inside the VM and parsing once here is about 3x faster for a frame's commands.
   */
  dumpJson(handle) {
    const json = this.vm.getProp(this.vm.global, "JSON");
    const stringify = this.vm.getProp(json, "stringify");
    json.dispose();
    const result = this.vm.callFunction(stringify, this.vm.undefined, handle);
    stringify.dispose();
    if (result.error || this.vm.typeof(result.value) !== "string") {
      // Circular data or undefined: fall back to the general dump
      (result.error || result.value).dispose();
      return this.vm.dump(handle);
    }
    const text = this.vm.getString(result.value);
    result.value.dispose();
    return JSON.parse(text);
  }

  /**
   * Convert JavaScript object to QuickJS value
   * @param {Object} obj - JavaScript object
   * @returns {any} - QuickJS handle
   */
  jsToQjs(obj) {
    if (typeof obj === "object" && obj !== null && !Array.isArray(obj) &&
        Object.values(obj).every(v => typeof v === "boolean")) {
      // Flat boolean objects (the per-frame input state): set properties directly
      // instead of compiling source every frame
      const handle = this.vm.newObject();
      for (const key in obj) this.vm.setProp(handle, key, obj[key] ? this.vm.true : this.vm.false);
      return handle;
    }
    if (typeof obj === "object" && obj !== null) {
      const jsonStr = JSON.stringify(obj);
      const result = this.vm.evalCode(`(${jsonStr})`);
      if (result.error) {
        result.error.dispose();
        return this.vm.undefined;
      }
      return result.value;
    }
    return this.vm.undefined;
  }

  /**
   * Create input state object for game
   * @param {Object} buttonStates - Current button states
   * @param {Object} prevButtonStates - Previous button states
   * @returns {Object} - Input state for game
   */
  static createInputState(buttonStates = {}, prevButtonStates = {}) {
    const justPressed = (button) => {
      return (buttonStates[button] || false) && !(prevButtonStates[button] || false);
    };

    return {
      up: buttonStates.up || false,
      down: buttonStates.down || false,
      left: buttonStates.left || false,
      right: buttonStates.right || false,
      a: buttonStates.a || false,
      b: buttonStates.b || false,
      upPressed: justPressed('up'),
      downPressed: justPressed('down'),
      leftPressed: justPressed('left'),
      rightPressed: justPressed('right'),
      aPressed: justPressed('a'),
      bPressed: justPressed('b')
    };
  }
}

/**
 * Constants
 */
export const SCREEN_WIDTH = 128;
export const SCREEN_HEIGHT = 128;
export const SPRITE_SIZE = 8;
export const MAX_SPRITES = 64;
export const MAX_TILES_X = 128;
export const MAX_TILES_Y = 16;
