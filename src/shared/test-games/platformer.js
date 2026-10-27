function metadata() {
  return {
    title: "Tomb Explorer",
    description: "Explore ancient ruins, collect treasure and reach the exit",
    controls: [
      {key: "left/right arrows", action: "move explorer"},
      {key: "up arrow or B", action: "jump"},
      {key: "down arrow", action: "look down"},
      {key: "A button", action: "throw torch / start"}
    ]
  };
}

function resources() {
  return {
    sprites: [
      // Sprite 0: Explorer head facing right - brown fedora with band and brim, face in profile
      [
        "00000000",
        "00999900",
        "00888800",
        "09999999",
        "00dddd00",
        "00dd8dd0",
        "000ddd00",
        "000ee000"
      ],
      // Sprite 1: Explorer body, standing / passing pose - khaki shirt, belt, dark trousers, boots
      [
        "00eeee00",
        "0eeeeee0",
        "0deeeed0",
        "00999900",
        "00888800",
        "00888800",
        "00880880",
        "00990990"
      ],
      // Sprite 2: Explorer body, stride - legs apart, arm swinging forward
      [
        "00eeee00",
        "0eeeeee0",
        "00eeeeed",
        "00999900",
        "00888800",
        "08800880",
        "08800880",
        "99000099"
      ],
      // Sprite 3: Scorpion tail half (left when facing right) - segmented tail curling over the back to a red stinger
      [
        "000eee00",
        "00e000e2",
        "00e00002",
        "00e00000",
        "000eeeee",
        "0e9ee9ee",
        "00909090",
        "09090909"
      ],
      // Sprite 4: Scorpion head half (right when facing right) - body, white eye and open pincers
      [
        "00000000",
        "00000000",
        "000000ee",
        "0000000e",
        "eeeee1ee",
        "9ee9eeee",
        "909090e0",
        "90909000"
      ],
      // Sprite 5: Bat, wings up - red eyes, gray body, brown wings
      [
        "90000009",
        "99000099",
        "999cc999",
        "09c22c90",
        "009cc900",
        "000cc000",
        "00000000",
        "00000000"
      ],
      // Sprite 6: Stone platform block - light top-left bevel, shadowed bottom edge, small crack
      [
        "cccccccc",
        "c7777778",
        "c7777778",
        "c7787778",
        "c7788778",
        "c7777778",
        "c7777778",
        "88888888"
      ],
      // Sprite 7: Gold coin, face on - bronze rim, white shine, stamped mark
      [
        "00eeee00",
        "0e5f55e0",
        "e5f1555e",
        "e5f5e55e",
        "e555e55e",
        "e55555ee",
        "0e5555e0",
        "00eeee00"
      ],
      // Sprite 8: Thrown torch - fireball with white-hot core
      [
        "00060000",
        "006f6000",
        "06ff6600",
        "6ff1f660",
        "6fff6f60",
        "06ff6600",
        "00666000",
        "00000000"
      ],
      // Sprite 9: Breakable sandstone brick - lighter than the wall so it stands out
      [
        "ddddddd9",
        "deeeeee9",
        "deeeeee9",
        "99999999",
        "eee9deee",
        "ee99eeee",
        "eee9eeee",
        "99999999"
      ],
      // Sprite 10: Riveted metal plate with a spot of rust
      [
        "cccccccc",
        "c1777718",
        "c7777778",
        "c7779778",
        "c7777778",
        "c7777778",
        "c1777718",
        "88888888"
      ],
      // Sprite 11: Metal floor spikes - two sharp points on a base
      [
        "00000000",
        "00100010",
        "00c000c0",
        "0cc70cc7",
        "0c770c77",
        "c7778777",
        "c7778777",
        "88888888"
      ],
      // Sprite 12: Exit door - wooden planks with iron bands and a gold handle; stacks vertically
      [
        "c999999c",
        "c9e9e9ec",
        "c9e9e9ec",
        "c888888c",
        "c9e9e95c",
        "c9e9e9ec",
        "c888888c",
        "c9e9e9ec"
      ],
      // Sprite 13: Heart - health indicator with a highlight
      [
        "02200220",
        "21222222",
        "22222222",
        "22222222",
        "02222220",
        "00222200",
        "00022000",
        "00000000"
      ],
      // Sprite 14: Explorer body hurt - arms thrown up, legs splayed
      [
        "d0eeee0d",
        "deeeeeed",
        "00eeee00",
        "00999900",
        "00888800",
        "08800880",
        "88000088",
        "90000009"
      ],
      // Sprite 15: Explorer collapsed - lying on the floor, hat fallen off (drawn without the head)
      [
        "00000000",
        "00000000",
        "00000000",
        "00000000",
        "00000000",
        "09900000",
        "99ddeee8",
        "0ddee988"
      ],
      // Sprites 16-24: backdrop tiles. They are not solid; the console draws them behind everything
      // Sprite 16: Tomb wall - offset sandstone blocks, mortar shows the black background
      [
        "43333330",
        "33333330",
        "33333330",
        "00000000",
        "33304333",
        "33303333",
        "33303333",
        "00000000"
      ],
      // Sprite 17: Tomb wall, cracked
      [
        "43333330",
        "33303330",
        "33330330",
        "00000000",
        "33304333",
        "33303033",
        "33303303",
        "00000000"
      ],
      // Sprite 18: Carved eye glyph
      [
        "43333330",
        "33444330",
        "34404430",
        "33444330",
        "33343330",
        "33433430",
        "33333330",
        "00000000"
      ],
      // Sprite 19: Carved ankh glyph
      [
        "43333330",
        "33404330",
        "33404330",
        "34444430",
        "33343330",
        "33343330",
        "33343330",
        "00000000"
      ],
      // Sprite 20: Wall torch, flame frame 1
      [
        "333f3330",
        "33f6f330",
        "336f6330",
        "33363330",
        "33999330",
        "33393330",
        "33393330",
        "00000000"
      ],
      // Sprite 21: Wall torch, flame frame 2 (leaning the other way)
      [
        "33f33330",
        "336f3330",
        "33f6f330",
        "33363330",
        "33999330",
        "33393330",
        "33393330",
        "00000000"
      ],
      // Sprite 22: Cave rock bump - mostly open darkness
      [
        "00000000",
        "00000000",
        "00000000",
        "000aa000",
        "00aaaa00",
        "0aaaaaa0",
        "00000000",
        "00000000"
      ],
      // Sprite 23: Stalactite hanging from the tile above
      [
        "aacccaaa",
        "0acccca0",
        "0aacca00",
        "00acca00",
        "00aca000",
        "000ca000",
        "000a0000",
        "00000000"
      ],
      // Sprite 24: Glowing crystal on the cavern floor
      [
        "00000000",
        "000001b0",
        "00001bb0",
        "0b01bba0",
        "0bb1ba00",
        "0abbaa00",
        "aaaaaaa0",
        "00000000"
      ],
      // Sprite 25: Bat, wings down - second flap frame
      [
        "00000000",
        "00c00c00",
        "000cc000",
        "00c22c00",
        "09cccc90",
        "99900999",
        "99000099",
        "90000009"
      ],
      // Sprite 26: Gold coin turning - narrower
      [
        "000ee000",
        "00e5fe00",
        "0e5f15e0",
        "0e5f55e0",
        "0e5555e0",
        "0e555ee0",
        "00e5ee00",
        "000ee000"
      ],
      // Sprite 27: Gold coin edge-on - thinnest spin frame
      [
        "000ee000",
        "000e5000",
        "000ef000",
        "000e5000",
        "000e5000",
        "000e5000",
        "000e5000",
        "000ee000"
      ]
    ],
    palette: [
      0x000000, // 0: Black
      0xFFFFFF, // 1: Pure white (for coin highlights)
      0xCC3300, // 2: Brick red
      0x22180F, // 3: Tomb wall (dark sandstone in shadow)
      0x3A2A1B, // 4: Tomb wall highlight / carvings
      0xFFD700, // 5: Bright gold (Mario-style coin)
      0xFF7A1A, // 6: Flame orange
      0x6B6B6B, // 7: Medium gray
      0x4A4A4A, // 8: Dark gray/shadow
      0x8B4513, // 9: Saddle brown
      0x1B2430, // a: Cave rock (cold blue-gray)
      0x5FC4E8, // b: Crystal cyan
      0xA8A8A8, // c: Light gray (stone and metal highlights)
      0xD2B48C, // d: Tan
      0xCD853F, // e: Peru/bronze
      0xFFE36B  // f: Flame yellow
    ],
    // Rows can be arrays of tile ids: the level plus backdrop tiles in its empty cells
    tilemap: { width: 64, height: 32, rows: LEVEL_ROWS.map((row, y) => parseLevelRow(row).map((id, x) => id || backdropTile(x, y))) },
    music: SONGS
  };
}

// Game constants
const SCREEN_WIDTH = 128;
const SCREEN_HEIGHT = 128;
const WORLD_WIDTH = 512;  // 64 tiles wide
const WORLD_HEIGHT = 256; // 32 tiles tall: the camera scrolls both ways
const SPRITE_SIZE = 8;
const TILE_SIZE = 8;
const TILES_X = 64;  // Expanded for scrolling
const TILES_Y = 32;

// Character dimensions
const PLAYER_WIDTH = SPRITE_SIZE;
const PLAYER_HEIGHT = 16; // 2 sprites tall
const SCORPION_WIDTH = 16; // 2 sprites wide
const SCORPION_HEIGHT = SPRITE_SIZE;
const COIN_SIZE = SPRITE_SIZE;
const PROJECTILE_SIZE = SPRITE_SIZE;

// Physics constants (pixels per second)
const PLAYER_SPEED = 64;        // Top running speed (half a screen per second)
const PLAYER_ACCEL = 360;       // Ground acceleration toward top speed
const PLAYER_DECEL = 480;       // Ground friction when no direction is held
const PLAYER_TURN_DECEL = 720;  // Braking when pushing against current direction
const AIR_CONTROL = 0.6;        // Fraction of ground acceleration available in the air
const GRAVITY = 520;            // Gravity while rising with jump held
const GRAVITY_RELEASED = 1200;  // Gravity while rising after jump is released (short hop)
const GRAVITY_FALL = 760;       // Gravity while falling - snappier descent
const MAX_FALL_SPEED = 220;
const JUMP_POWER = 176;         // Full hold reaches about 4 tiles (31px), a tap about 2
const COYOTE_TIME = 0.08;       // Can still jump this long after walking off a ledge
const JUMP_BUFFER_TIME = 0.1;   // A press this long before landing still jumps
const ENEMY_SPEED_1 = 30;
const ENEMY_SPEED_2 = 25;
const PROJECTILE_SPEED = 150;
const PROJECTILE_LIFETIME = 1.0; // seconds

// Animation timing
const PLAYER_WALK_INTERVAL = 0.2; // seconds per frame at top speed
const ENEMY_WALK_INTERVAL = 0.3; // seconds

// Camera dead zone (horizontal range where player can move without camera following)
const CAMERA_DEAD_ZONE_LEFT = 40;  // Pixels from left edge of screen before camera moves left
const CAMERA_DEAD_ZONE_RIGHT = 40; // Pixels from right edge of screen before camera moves right
// Vertical camera: rests on the last ground the player stood on, leads downward when dropping
const CAMERA_GROUND_MARGIN = 40;   // Space kept below the ground the player stands on
const CAMERA_FALL_LOOKAHEAD = 32;  // While dropping, aim to keep the player this far from the top
const CAMERA_LOOK_DOWN = 24;       // Holding down puts the player this far from the top
const CAMERA_SMOOTHING = 10;       // How quickly the camera catches up (per second)
const CAMERA_EDGE = 16;            // The player is never closer than this to the top/bottom edge
const UPPER_FLOOR_Y = 112;         // The upper level fits the screen exactly above this floor

// Game limits
const MAX_PROJECTILES = 3;

// Scoring
const ENEMY_KILL_SCORE = 100;
const COIN_SCORE = 50;
const BRICK_SCORE = 10;

// Starting positions
const PLAYER_START_X = 16;
const PLAYER_START_Y = 88; // Standing on platform at row 13 (104 - 16 = 88)

// Tile IDs
const TILE_EMPTY = 0;
const TILE_PLATFORM = 6;
const TILE_BRICK = 9;
const TILE_METAL = 10;
const TILE_SPIKES = 11;
const TILE_EXIT = 12;

// Sprite IDs
const SPRITE_EXPLORER_HEAD = 0;
const SPRITE_EXPLORER_BODY_WALK1 = 1;  // Right leg forward
const SPRITE_EXPLORER_BODY_WALK2 = 2;  // Left leg forward
const SPRITE_SCORPION_FRONT = 3;
const SPRITE_SCORPION_BACK = 4;
const SPRITE_BAT = 5;
const SPRITE_TREASURE = 7;
const SPRITE_BAT_WINGS_DOWN = 25;
const SPRITE_COIN_TURNING = 26;
const SPRITE_COIN_EDGE = 27;

// Animation frames, picked by time so every coin and bat animates without its own timer
const COIN_SPIN = [SPRITE_TREASURE, SPRITE_COIN_TURNING, SPRITE_COIN_EDGE, SPRITE_COIN_TURNING];
const COIN_FRAME_TIME = 0.12;
const BAT_FLAP = [SPRITE_BAT, SPRITE_BAT_WINGS_DOWN];
const BAT_FRAME_TIME = 0.15;

// offset staggers objects so they don't all animate in lockstep
const ENEMY_DEATH_TIME = 1.2;     // seconds a defeated enemy spends flipping off screen
const ENEMY_DEATH_HOP = -110;     // upward pop when hit, px/s
const ENEMY_DEATH_PUSH = 40;      // knocked away from the torch, px/s
const POPUP_TIME = 0.8;           // the "100" score popup rises and fades
const POPUP_RISE = 16;

// A defeated enemy pops up, flips upside down and falls off screen (classic NES style)
function killEnemy(enemy, hitVx) {
  enemy.dyingTime = 0;
  enemy.vx = Math.sign(hitVx || 1) * ENEMY_DEATH_PUSH;
  enemy.vy = ENEMY_DEATH_HOP;
  gameState.popups.push({ x: enemy.x, y: enemy.y - 4, time: 0 });
}

function updateEnemyDeaths(dt) {
  for (const enemy of [...gameState.enemies, ...gameState.bats]) {
    if (enemy.dyingTime === undefined || enemy.dyingTime >= ENEMY_DEATH_TIME) continue;
    enemy.dyingTime += dt;
    enemy.vy = Math.min(enemy.vy + GRAVITY_FALL * dt, MAX_FALL_SPEED);
    enemy.x += enemy.vx * dt;
    enemy.y += enemy.vy * dt;
  }
  for (const popup of gameState.popups) popup.time += dt;
  gameState.popups = gameState.popups.filter(popup => popup.time < POPUP_TIME);
}

// Scorpions, bats, falling defeated enemies and score popups
function enemySprites() {
  const sprites = [];
  for (const enemy of gameState.enemies) {
    const dying = enemy.health <= 0;
    if (dying && !(enemy.dyingTime < ENEMY_DEATH_TIME)) continue;
    const x = Math.floor(enemy.x);
    const y = Math.floor(enemy.y);
    // Scorpions are 2 sprites wide: facing left swaps the halves and flips both
    const facingLeft = enemy.vx < 0;
    const [left, right] = facingLeft ? [SPRITE_SCORPION_BACK, SPRITE_SCORPION_FRONT] : [SPRITE_SCORPION_FRONT, SPRITE_SCORPION_BACK];
    sprites.push({ spriteId: left, x, y, flipH: facingLeft, flipV: dying });
    sprites.push({ spriteId: right, x: x + SPRITE_SIZE, y, flipH: facingLeft, flipV: dying });
  }
  for (const bat of gameState.bats) {
    const dying = bat.health <= 0;
    if (dying && !(bat.dyingTime < ENEMY_DEATH_TIME)) continue;
    sprites.push({
      // A defeated bat stops flapping and tumbles, flipping every 0.1s
      spriteId: dying ? SPRITE_BAT : animFrame(BAT_FLAP, BAT_FRAME_TIME, bat.phase),
      x: Math.floor(bat.x),
      y: Math.floor(bat.y),
      flipH: dying ? Math.floor(bat.dyingTime / 0.1) % 2 === 0 : bat.vx < 0,
      flipV: dying
    });
  }
  for (const popup of gameState.popups) {
    const y = Math.floor(popup.y - POPUP_RISE * popup.time / POPUP_TIME);
    String(ENEMY_KILL_SCORE).split('').forEach((digit, i) => {
      sprites.push({ spriteId: 0x100 + digit.charCodeAt(0), x: Math.floor(popup.x) + i * SPRITE_SIZE, y });
    });
  }
  return sprites;
}

function animFrame(frames, frameTime, offset) {
  return frames[Math.floor(gameState.animTime / frameTime + offset) % frames.length];
}
const SPRITE_TORCH = 8;
const SPRITE_HEART = 13;
const SPRITE_EXPLORER_BODY_HURT = 14;   // Damage recoil pose
const SPRITE_EXPLORER_BODY_DEATH = 15;  // Death/collapsed pose

// Backdrop tiles: drawn in the tilemap's empty cells, never solid
const TILE_WALL = 16;
const TILE_WALL_CRACKED = 17;
const TILE_GLYPH_EYE = 18;
const TILE_GLYPH_ANKH = 19;
const TILE_WALL_TORCH_1 = 20;
const TILE_WALL_TORCH_2 = 21;
const TILE_CAVE_SPECK = 22;
const TILE_STALACTITE = 23;
const TILE_CRYSTAL = 24;

// Level: 64x32 tiles, 2 hex chars per tile (00=empty, 06=platform, 09=brick, 0a=metal, 0b=spikes, 0c=exit)
// Rows 0-15 are the ruins; a shaft near the right end drops into the cavern (rows 16-31) with the exit
// The console draws it from resources().tilemap; the game keeps its own copy for collisions
const LEVEL_ROWS = [
  "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000606060606",
  "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "00000000000000000009090900000000000000000000000000000009090900000000000000000000000009090900000000000000000000000909090000000000",
  "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "00000000090900000000000000000000000000000909000000000000000000000000090900000000000000000000000000090900000000000000000000000000",
  "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "00000000000000000000000606060000000000000000000000000000000000000000000006060600000000000000000000000000000006060600000000000000",
  "00000006060600000000000000000000000000000000000000000606060000000000000000000000000000000006060600000000000000000000000000000000",
  "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "00000000000000000b0b0b00000000000000000b0b0b0b0000000000000000000b0b0b0000000000000b0b0b00000000000000000b0b0b000000000000000000",
  "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "00060600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "06060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606060000000606060606",
  "06060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606060000000606060606",
  "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000606060606060606060606060000",
  "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "00000000000000000000000000000000000000000000000000000000000000000000000000000606060606060606060606060600000000000000000000000000",
  "00000000000009090909090909000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "00000000000000000000000000000000000000000a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a000000000000000000000000000000000000000000000000000000",
  "000c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "000c00000000000000000b0b0b0000000000000000000000000000000000000000000000000000000b0b0b0b0b0b0b0b00000000000000000000000000000000",
  "06060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606",
  "06060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606060606",
];

function parseLevelRow(row) {
  const tiles = [];
  for (let i = 0; i < row.length; i += 2) tiles.push(parseInt(row.substr(i, 2), 16));
  return tiles;
}

// Burning torches on the tomb wall; update() swaps their tiles to make the flames flicker
const WALL_TORCHES = [4, 14, 26, 36, 46, 54].map(x => ({ x, y: 6 }));
const TORCH_FLICKER_TIME = 0.18; // seconds per flame frame
const CAVERN_TOP_ROW = 14;       // The upper floor and everything below it is the cavern

// Which backdrop tile goes in an empty cell: carved tomb wall above, dark cave below
function backdropTile(x, y) {
  const solid = (tx, ty) => {
    const id = ty >= 0 && ty < LEVEL_ROWS.length ? parseInt(LEVEL_ROWS[ty].substr(tx * 2, 2), 16) : 0;
    return id === TILE_PLATFORM || id === TILE_BRICK || id === TILE_METAL;
  };
  const hash = (x * 7 + y * 13 + x * y) % 23; // fixed pseudo-random variety
  if (y < CAVERN_TOP_ROW) {
    if (WALL_TORCHES.some(t => t.x === x && t.y === y)) return TILE_WALL_TORCH_1;
    if (hash === 0) return TILE_GLYPH_EYE;
    if (hash === 11) return TILE_GLYPH_ANKH;
    return hash % 5 === 0 ? TILE_WALL_CRACKED : TILE_WALL;
  }
  if (solid(x, y - 1) && (y === CAVERN_TOP_ROW + 2 || hash % 3 === 0)) return TILE_STALACTITE;
  if (solid(x, y + 1) && !solid(x, y - 1) && hash % 7 === 0 && y > 20) return TILE_CRYSTAL;
  return hash % 9 === 0 ? TILE_CAVE_SPECK : TILE_EMPTY;
}

// Music for resources(): the console sequences the notes, update() only picks the song
// Notes are NOTE:beats, '-' is a rest, [ ... ]xN repeats; noise tracks play drums K S H O. At 140 BPM one beat is 0.43s
const SONGS = {
  // Upbeat tomb run in A minor, 32 bars: A (Am Am F G Am Am F E) twice, B (F G Em Am F G E E), A again.
  // Lead on pulse1, 16th-note chord arpeggios on pulse2, octave-bouncing bass, noise drum kit.
  // Every track is 128 beats so they stay in step when the song loops.
  main: {
    bpm: 140,
    tracks: [
      {
        channel: 'pulse1', duty: 0.25, volume: 0.2, envelope: 'soft', vibrato: { rate: 6, depth: 0.08 },
        notes:
          // A: main hook
          "E4:0.5 A4:0.5 -:0.5 A4:0.5 B4:0.5 C5:1 B4:0.5 A4:1 E4:1 -:1 E4:0.5 G4:0.5 " +
          "A4:0.5 A4:0.5 -:0.5 A4:0.5 C5:0.5 D5:1 C5:0.5 B4:1.5 G4:0.5 D5:2 " +
          "E5:0.5 E5:0.5 -:0.5 D5:0.5 C5:0.5 B4:0.5 C5:1 A4:1 E4:1 A4:0.5 B4:0.5 C5:1 " +
          "D5:0.5 C5:0.5 A4:0.5 F4:0.5 A4:1 C5:1 B4:1 G#4:1 E4:1 -:1 " +
          // A again, ending climbs into B
          "E4:0.5 A4:0.5 -:0.5 A4:0.5 B4:0.5 C5:1 B4:0.5 A4:1 E4:1 -:1 E4:0.5 G4:0.5 " +
          "A4:0.5 A4:0.5 -:0.5 A4:0.5 C5:0.5 D5:1 C5:0.5 B4:1.5 G4:0.5 D5:2 " +
          "E5:0.5 E5:0.5 -:0.5 D5:0.5 C5:0.5 B4:0.5 C5:1 A4:1 E4:1 A4:0.5 B4:0.5 C5:1 " +
          "D5:0.5 C5:0.5 A4:0.5 F4:0.5 A4:1 C5:1 B4:0.5 G#4:0.5 B4:0.5 D5:0.5 E5:2 " +
          // B: higher and busier
          "C5:0.5 C5:0.5 A4:0.5 C5:0.5 F5:1 E5:1 D5:0.5 D5:0.5 B4:0.5 D5:0.5 G5:1 F5:1 " +
          "E5:0.5 E5:0.5 B4:0.5 E5:0.5 G5:1 B5:1 A5:2 -:1 E5:0.5 G5:0.5 " +
          "A5:0.5 G5:0.5 F5:0.5 E5:0.5 F5:1 C5:1 G5:0.5 F5:0.5 E5:0.5 D5:0.5 D5:1 B4:1 " +
          "G#4:0.5 B4:0.5 E5:0.5 G#5:0.5 B5:1 G#5:1 E5:1 D5:0.5 C5:0.5 B4:1 G#4:1 " +
          // A to finish, then loop
          "E4:0.5 A4:0.5 -:0.5 A4:0.5 B4:0.5 C5:1 B4:0.5 A4:1 E4:1 -:1 E4:0.5 G4:0.5 " +
          "A4:0.5 A4:0.5 -:0.5 A4:0.5 C5:0.5 D5:1 C5:0.5 B4:1.5 G4:0.5 D5:2 " +
          "E5:0.5 E5:0.5 -:0.5 D5:0.5 C5:0.5 B4:0.5 C5:1 A4:1 E4:1 A4:0.5 B4:0.5 C5:1 " +
          "D5:0.5 C5:0.5 A4:0.5 F4:0.5 A4:1 C5:1 B4:1 G#4:1 E4:1 -:1"
      },
      {
        channel: 'pulse2', duty: 0.125, volume: 0.075, envelope: 'sharp',
        notes:
          // A twice: Am Am F G Am Am F E
          "[[A3:0.25 C4:0.25 E4:0.25 C4:0.25]x8 [F3:0.25 A3:0.25 C4:0.25 A3:0.25]x4 [G3:0.25 B3:0.25 D4:0.25 B3:0.25]x4 " +
          "[A3:0.25 C4:0.25 E4:0.25 C4:0.25]x8 [F3:0.25 A3:0.25 C4:0.25 A3:0.25]x4 [E3:0.25 G#3:0.25 B3:0.25 G#3:0.25]x4]x2 " +
          // B: F G Em Am F G E E
          "[F3:0.25 A3:0.25 C4:0.25 A3:0.25]x4 [G3:0.25 B3:0.25 D4:0.25 B3:0.25]x4 [E3:0.25 G3:0.25 B3:0.25 G3:0.25]x4 [A3:0.25 C4:0.25 E4:0.25 C4:0.25]x4 " +
          "[F3:0.25 A3:0.25 C4:0.25 A3:0.25]x4 [G3:0.25 B3:0.25 D4:0.25 B3:0.25]x4 [E3:0.25 G#3:0.25 B3:0.25 G#3:0.25]x8 " +
          // A
          "[A3:0.25 C4:0.25 E4:0.25 C4:0.25]x8 [F3:0.25 A3:0.25 C4:0.25 A3:0.25]x4 [G3:0.25 B3:0.25 D4:0.25 B3:0.25]x4 " +
          "[A3:0.25 C4:0.25 E4:0.25 C4:0.25]x8 [F3:0.25 A3:0.25 C4:0.25 A3:0.25]x4 [E3:0.25 G#3:0.25 B3:0.25 G#3:0.25]x4"
      },
      {
        channel: 'triangle', volume: 0.25, envelope: 'sharp',
        notes:
          // Octave bounce on the chord roots; the last bar of each A walks up the E chord
          "[[A2:0.5 A3:0.5]x8 [F2:0.5 F3:0.5]x4 [G2:0.5 G3:0.5]x4 [A2:0.5 A3:0.5]x8 [F2:0.5 F3:0.5]x4 " +
          "E2:0.5 E3:0.5 E2:0.5 E3:0.5 G#2:0.5 G#3:0.5 B2:0.5 B3:0.5]x2 " +
          "[F2:0.5 F3:0.5]x4 [G2:0.5 G3:0.5]x4 [E2:0.5 E3:0.5]x4 [A2:0.5 A3:0.5]x4 " +
          "[F2:0.5 F3:0.5]x4 [G2:0.5 G3:0.5]x4 [E2:0.5 E3:0.5]x6 G#2:0.5 B2:0.5 D3:0.5 E3:0.5 " +
          "[A2:0.5 A3:0.5]x8 [F2:0.5 F3:0.5]x4 [G2:0.5 G3:0.5]x4 [A2:0.5 A3:0.5]x8 [F2:0.5 F3:0.5]x4 " +
          "E2:0.5 E3:0.5 E2:0.5 E3:0.5 G#2:0.5 G#3:0.5 B2:0.5 B3:0.5"
      },
      {
        // K kick, S snare, H hi-hat, O open hat; a snare roll fills the end of each 8 bars
        channel: 'noise', volume: 0.25,
        notes:
          "[[K:0.5 H:0.5 S:0.5 H:0.5 K:0.5 K:0.5 S:0.5 H:0.5]x7 K:0.5 H:0.5 S:0.5 H:0.5 S:0.25 S:0.25 S:0.25 S:0.25 S:0.5 O:0.5]x2 " +
          "[K:0.5 H:0.25 H:0.25 S:0.5 H:0.5 K:0.25 K:0.25 H:0.5 S:0.5 O:0.5]x7 S:0.25 S:0.25 S:0.25 S:0.25 S:0.25 S:0.25 S:0.25 S:0.25 K:0.5 S:0.5 K:0.5 O:0.5 " +
          "[K:0.5 H:0.5 S:0.5 H:0.5 K:0.5 K:0.5 S:0.5 H:0.5]x7 K:0.5 H:0.5 S:0.5 H:0.5 S:0.25 S:0.25 S:0.25 S:0.25 S:0.5 O:0.5"
      }
    ]
  },
  // Deeper in: slower and echoing, Am F Dm E Am F G E twice. Every track is 64 beats
  cavern: {
    bpm: 100,
    tracks: [
      {
        channel: 'pulse2', duty: 0.125, volume: 0.2, envelope: 'fade', vibrato: { rate: 5, depth: 0.15 },
        notes:
          "E5:2 C5:1 B4:1 A4:3 -:1 F4:1 A4:1 D5:1.5 C5:0.5 B4:3 -:1 " +
          "E5:1.5 D5:0.5 C5:1 E5:1 F5:2 E5:1 C5:1 D5:1.5 B4:0.5 G4:1 B4:1 G#4:1 B4:1 E5:2 " +
          "-:2 A4:1 C5:1 C5:2 A4:2 D5:1 F5:1 E5:1 D5:1 E5:4 " +
          "A5:2 G5:1 E5:1 F5:1.5 E5:0.5 C5:2 D5:2 B4:1 G4:1 G#4:4"
      },
      {
        channel: 'pulse1', duty: 0.25, volume: 0.07, envelope: 'fade',
        notes:
          "[[A3:0.5 E4:0.5 A4:0.5 C5:0.5]x2 [F3:0.5 C4:0.5 F4:0.5 A4:0.5]x2 [D3:0.5 A3:0.5 D4:0.5 F4:0.5]x2 [E3:0.5 B3:0.5 E4:0.5 G#4:0.5]x2 " +
          "[A3:0.5 E4:0.5 A4:0.5 C5:0.5]x2 [F3:0.5 C4:0.5 F4:0.5 A4:0.5]x2 [G3:0.5 D4:0.5 G4:0.5 B4:0.5]x2 [E3:0.5 B3:0.5 E4:0.5 G#4:0.5]x2]x2"
      },
      {
        channel: 'triangle', volume: 0.3, envelope: 'sustain',
        notes: "[A2:1.5 E3:0.5 A3:2 F2:1.5 C3:0.5 F3:2 D3:1.5 A3:0.5 D4:2 E2:1.5 B2:0.5 E3:2 " +
               "A2:1.5 E3:0.5 A3:2 F2:1.5 C3:0.5 F3:2 G2:1.5 D3:0.5 G3:2 E2:1.5 B2:0.5 E3:2]x2"
      },
      {
        channel: 'noise', volume: 0.18,
        notes: "[K:1.5 H:0.5 S:1 H:0.5 H:0.5]x15 K:1 S:0.5 S:0.5 S:0.5 S:0.5 O:1"
      }
    ]
  },
  // Victory fanfare at the exit, played once (about 3.2s, matching WIN_PAUSE)
  win: {
    bpm: 180,
    loop: false,
    tracks: [
      { channel: 'pulse1', duty: 0.25, volume: 0.32, envelope: 'soft', notes: "G4:0.5 C5:0.5 E5:0.5 G5:1 E5:0.5 G5:2 -:0.5 A5:0.5 B5:0.5 C6:3" },
      { channel: 'pulse2', duty: 0.5, volume: 0.16, envelope: 'soft', notes: "E4:0.5 G4:0.5 C5:0.5 E5:1 C5:0.5 E5:2 -:0.5 F5:0.5 G5:0.5 E5:3" },
      { channel: 'triangle', volume: 0.3, envelope: 'sustain', notes: "C3:0.5 C3:0.5 C3:0.5 C3:1 C3:0.5 C3:2 -:0.5 F3:0.5 G3:0.5 C4:3" },
      { channel: 'noise', volume: 0.3, notes: "K:0.5 K:0.5 K:0.5 S:1 K:0.5 S:2 -:0.5 S:0.25 S:0.25 S:0.5 K:0.5 O:2.5" }
    ]
  },
  // Wobbly chromatic slide down, played once during the 3s death pause
  death: {
    bpm: 160,
    loop: false,
    tracks: [
      { channel: 'pulse1', duty: 0.5, volume: 0.3, envelope: 'soft', vibrato: { rate: 7, depth: 0.3 }, notes: "C5:0.5 B4:0.5 A#4:0.5 A4:1 -:0.5 G#4:0.5 G4:0.5 F#4:0.5 F4:3" },
      { channel: 'triangle', volume: 0.3, envelope: 'sustain', notes: "F3:2 -:0.5 E3:1 D#3:1 D3:3" },
      { channel: 'noise', volume: 0.25, notes: "S:2 -:0.5 S:1 S:1 K:3" }
    ]
  }
};

// Sound effects. Each event gets its own soundId so a new one restarts its slot.
// duty 0.25/0.125 gives the thin NES pulse; noise period 0-15 goes from hiss to rumble;
// arp/vol are per-frame (1/60s) macros
const SFX = {
  jump:        { slotId: 0, soundId: 'jump', channel: 'pulse1', duty: 0.25, frequency: 260, duration: 0.14, volume: 0.35, envelope: 'soft', sweep: { target: 620, time: 0.12, curve: 'exp' } },
  throwTorch:  { slotId: 1, soundId: 'throw', channel: 'noise', period: 3, duration: 0.12, volume: 0.25, vol: [1, 0.8, 0.6, 0.45, 0.3, 0.2, 0.1] },
  enemyHit:    { slotId: 2, soundId: 'enemyHit', channel: 'pulse2', duty: 0.125, frequency: 500, duration: 0.06, volume: 0.6, envelope: 'sharp' },
  enemyKill:   { slotId: 2, soundId: 'enemyKill', channel: 'pulse2', duty: 0.25, frequency: 900, duration: 0.2, volume: 0.5, envelope: 'fade', sweep: { target: 110, time: 0.2, curve: 'exp' } },
  // Two-note chime in one sound: B5 for 4 frames, then up 5 semitones to E6 while it fades
  coin:        { slotId: 3, soundId: 'coin', channel: 'pulse2', duty: 0.25, note: 'B5', duration: 0.35, volume: 0.35,
                 arp: [0, 0, 0, 0, 5], vol: [1, 1, 1, 1, 1, 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.42, 0.35, 0.28, 0.22, 0.16, 0.11, 0.07, 0.04] },
  brick:       { slotId: 4, soundId: 'brick', channel: 'noise', period: 9, duration: 0.22, volume: 0.35, envelope: 'fade' },
  brickThud:   { slotId: 5, soundId: 'brickThud', channel: 'triangle', frequency: 150, duration: 0.1, volume: 0.6, envelope: 'sharp', sweep: { target: 55, time: 0.1, curve: 'exp' } },
  land:        { slotId: 5, soundId: 'land', channel: 'noise', period: 13, duration: 0.07, volume: 0.3, envelope: 'sharp' },
  hurt:        { slotId: 6, soundId: 'hurt', channel: 'pulse1', duty: 0.125, frequency: 520, duration: 0.25, volume: 0.6, envelope: 'fade', sweep: { target: 130, time: 0.25, curve: 'exp' }, vibrato: { rate: 18, depth: 1 } },
  death:       { slotId: 7, soundId: 'death', channel: 'noise', period: 12, duration: 0.6, volume: 0.45, envelope: 'fade' },
  spikes:      { slotId: 7, soundId: 'spikes', channel: 'noise', mode: 'periodic', period: 6, duration: 0.35, volume: 0.35, envelope: 'fade' }
};
const WIN_PAUSE = 3.2;         // seconds of victory jingle before the game ends

let gameState;

function update(deltaTime, input) {
  // Initialize game state
  if (!gameState) {
    gameState = {
      player: {
        x: PLAYER_START_X,
        y: PLAYER_START_Y,
        vx: 0,
        vy: 0,
        onGround: true,
        walkFrame: 0,
        walkTimer: 0,
        facing: 1, // 1 = right, -1 = left
        health: 3, // Start with 3 hearts
        invincible: false,
        invincibleTimer: 0,
        isDead: false,
        deathTimer: 0
      },
      enemies: [
        { x: 32, y: 56, vx: -ENEMY_SPEED_1, vy: 0, onGround: false, health: 1, type: 'scorpion', walkFrame: 0, walkTimer: 0 },   // Scorpion on row 9 platform
        { x: 160, y: 96, vx: ENEMY_SPEED_2, vy: 0, onGround: false, health: 1, type: 'scorpion', walkFrame: 0, walkTimer: 0 },   // Scorpion on ground
        { x: 216, y: 56, vx: -ENEMY_SPEED_1, vy: 0, onGround: false, health: 1, type: 'scorpion', walkFrame: 0, walkTimer: 0 },  // Scorpion on row 9 platform
        { x: 368, y: 56, vx: ENEMY_SPEED_2, vy: 0, onGround: false, health: 1, type: 'scorpion', walkFrame: 0, walkTimer: 0 },   // Scorpion on row 9 platform
        { x: 232, y: 208, vx: ENEMY_SPEED_1, vy: 0, onGround: false, health: 1, type: 'scorpion', walkFrame: 0, walkTimer: 0 },  // Cavern: metal walkway
        { x: 120, y: 232, vx: -ENEMY_SPEED_2, vy: 0, onGround: false, health: 1, type: 'scorpion', walkFrame: 0, walkTimer: 0 }  // Cavern floor
      ],
      bats: [
        { x: 120, y: 40, vx: -30, vy: 0, health: 1, pattern: 'sine', phase: 0, minY: 16, maxY: 80 },  // Flying bat with sine wave pattern
        { x: 280, y: 32, vx: 35, vy: 0, health: 1, pattern: 'sine', phase: Math.PI, minY: 16, maxY: 80 },  // Flying bat
        { x: 420, y: 48, vx: -30, vy: 0, health: 1, pattern: 'sine', phase: Math.PI/2, minY: 16, maxY: 80 },  // Flying bat
        { x: 300, y: 176, vx: 30, vy: 0, health: 1, pattern: 'sine', phase: 0, minY: 150, maxY: 200 }  // Cavern bat
      ],
      popups: [], // floating score numbers from defeated enemies
      tilemap: LEVEL_ROWS.map(parseLevelRow), // copy for collisions; the console draws resources().tilemap
      coins: [
        { x: 48, y: 56, collected: false },
        { x: 32, y: 32, collected: false },
        { x: 96, y: 56, collected: false },
        { x: 80, y: 16, collected: false },
        { x: 160, y: 32, collected: false },
        { x: 224, y: 16, collected: false },
        { x: 280, y: 56, collected: false },
        { x: 336, y: 32, collected: false },
        { x: 400, y: 64, collected: false },
        { x: 456, y: 16, collected: false },
        { x: 488, y: 0, collected: false },
        // Cavern
        { x: 448, y: 152, collected: false },
        { x: 336, y: 176, collected: false },
        { x: 64, y: 184, collected: false },
        { x: 80, y: 184, collected: false },
        { x: 200, y: 200, collected: false },
        { x: 360, y: 216, collected: false }
      ],
      projectiles: [],
      gravity: GRAVITY,
      jumpPower: JUMP_POWER,
      playerSpeed: PLAYER_SPEED,
      score: 0,
      started: false,
      gameOver: false,
      levelComplete: false,
      camera: {
        x: 0,  // Current camera position
        y: 0,
        targetX: 0  // Target camera position (where we want to be)
      },
      bgEdits: [], // tilemap changes to send to the console this frame
      torchTimer: 0,
      torchFrame: 0,
      inCavern: false,
      winTimer: 0,
      animTime: 0 // seconds since start, drives sprite animation
    };
    // Initialize camera to player's starting position
    gameState.camera.x = Math.max(0, Math.min(gameState.player.x - 64, WORLD_WIDTH - SCREEN_WIDTH));
    gameState.camera.targetX = gameState.camera.x;
  }

  // Seconds since last frame, capped so a hitch can't move anything through an 8px platform
  const dt = Math.min(deltaTime, 1 / 30);
  const sounds = [];

  // Flicker the wall torches by swapping their tiles in the console's tilemap
  gameState.torchTimer += dt;
  if (gameState.torchTimer >= TORCH_FLICKER_TIME) {
    gameState.torchTimer = 0;
    gameState.torchFrame = 1 - gameState.torchFrame;
    const tileId = gameState.torchFrame ? TILE_WALL_TORCH_2 : TILE_WALL_TORCH_1;
    for (const torch of WALL_TORCHES) gameState.bgEdits.push({ x: torch.x, y: torch.y, tileId });
  }
  gameState.animTime += dt;
  updateEnemyDeaths(dt);

  // Title screen: wait for the player before starting the level
  if (!gameState.started) {
    if (input.aPressed) {
      gameState.started = true;
    }
    // Text layer over the level, with a black backing so it stays readable
    return {
      text: [
        { x: 1, y: 5, text: "TOMB EXPLORER" },
        { x: 4, y: 9, text: "PRESS A" }
      ],
      textBg: 0,
      bg: gameState.bgEdits.splice(0), // torches flicker behind the title too
      sprites: [{ spriteId: animFrame(COIN_SPIN, COIN_FRAME_TIME, 0), x: 60, y: 56 }],
      score: 0,
      gameOver: false
    };
  }

  // Handle death animation
  if (gameState.player.isDead) {
    gameState.player.deathTimer -= dt;
    if (gameState.player.deathTimer <= 0) {
      gameState.gameOver = true;
    }

    // During death animation, apply gravity but check for ground collision
    if (!gameState.gameOver) {
      // Apply gravity, capped like normal falling so the body can't skip over a platform
      gameState.player.vy = Math.min(gameState.player.vy + GRAVITY_FALL * dt, MAX_FALL_SPEED);
      const newY = gameState.player.y + gameState.player.vy * dt;

      // Simple ground/ceiling collision for death animation
      const rising = gameState.player.vy < 0;
      const bottomEdge = rising ? newY : newY + PLAYER_HEIGHT;
      const playerLeft = gameState.player.x;
      const playerRight = gameState.player.x + PLAYER_WIDTH - 1;
      let hitGround = false;

      for (let x = playerLeft; x <= playerRight; x += 4) {
        const tileX = Math.floor(x / TILE_SIZE);
        const tileY = Math.floor(bottomEdge / TILE_SIZE);
        if (tileX >= 0 && tileX < TILES_X && tileY >= 0 && tileY < TILES_Y) {
          const tileId = gameState.tilemap[tileY][tileX];
          if (tileId === TILE_PLATFORM || tileId === TILE_BRICK || tileId === TILE_METAL) {
            // Hit ground - stop falling (or bump the ceiling if still rising)
            gameState.player.y = rising ? (tileY + 1) * TILE_SIZE : tileY * TILE_SIZE - PLAYER_HEIGHT;
            gameState.player.vy = 0;
            hitGround = true;
            break;
          }
        }
      }

      // If didn't hit ground, continue falling
      if (!hitGround) {
        gameState.player.y = newY;
      }
    }
  }

  // Update invincibility timer
  if (gameState.player.invincible) {
    gameState.player.invincibleTimer -= dt;
    if (gameState.player.invincibleTimer <= 0) {
      gameState.player.invincible = false;
      gameState.player.invincibleTimer = 0;
    }
  }

  // Check for game over or level complete
  if (gameState.gameOver || gameState.levelComplete) {
    // Stop game logic, just render current state (the console keeps drawing the tilemap)
    const sprites = [];

    // Render player and enemies even when game over (frozen state)
    const facingLeft = gameState.player.facing < 0;
    let bodySprite;
    let shouldRenderHead = true;

    // Show death pose if player died, otherwise normal pose
    if (gameState.player.isDead) {
      bodySprite = SPRITE_EXPLORER_BODY_DEATH;
      shouldRenderHead = false; // Don't render head during death
    } else {
      bodySprite = gameState.player.walkFrame === 0 ? SPRITE_EXPLORER_BODY_WALK1 : SPRITE_EXPLORER_BODY_WALK2;
    }

    const playerRenderX = Math.floor(gameState.player.x);
    const playerRenderY = Math.floor(gameState.player.y);

    // Render head (unless dead)
    if (shouldRenderHead) {
      sprites.push({
        spriteId: SPRITE_EXPLORER_HEAD,
        x: playerRenderX,
        y: playerRenderY,
        flipH: facingLeft
      });
    }

    // Render body
    sprites.push({
      spriteId: bodySprite,
      x: playerRenderX,
      y: playerRenderY + SPRITE_SIZE,
      flipH: facingLeft
    });

    sprites.push(...enemySprites());

    // After reaching the exit, hold the scene while the fanfare plays, then end the game
    const text = [];
    if (gameState.levelComplete) {
      gameState.winTimer -= dt;
      if (gameState.winTimer <= 0) gameState.gameOver = true;
      text.push({ x: 2, y: 6, text: "LEVEL CLEAR!" });
      const scoreLine = "SCORE " + gameState.score;
      text.push({ x: Math.floor((16 - scoreLine.length) / 2), y: 8, text: scoreLine });
    }
    const bg = gameState.bgEdits;
    gameState.bgEdits = [];

    return {
      sprites,
      bg,
      text,
      textBg: text.length ? 0 : undefined,
      scroll: { x: Math.round(gameState.camera.x), y: Math.round(gameState.camera.y) },
      music: gameState.levelComplete ? 'win' : 'death',
      sounds,
      score: gameState.score,
      gameOver: gameState.gameOver
    };
  }

  // Player input handling with deltaTime (disabled during death)
  if (!gameState.player.isDead) {
    const player = gameState.player;
    const dir = input.left ? -1 : input.right ? 1 : 0;
    const control = player.onGround ? 1 : AIR_CONTROL;

    // Accelerate toward top speed, brake harder when turning around, coast to a stop
    if (dir !== 0) {
      player.facing = dir;
      const accel = player.vx * dir < 0 ? PLAYER_TURN_DECEL : PLAYER_ACCEL;
      player.vx += dir * accel * control * dt;
      if (Math.abs(player.vx) > gameState.playerSpeed) player.vx = dir * gameState.playerSpeed;
    } else {
      const slow = PLAYER_DECEL * control * dt;
      player.vx = Math.abs(player.vx) <= slow ? 0 : player.vx - Math.sign(player.vx) * slow;
    }

    // Jump (up arrow or B button), with coyote time and a short input buffer
    player.coyoteTimer = player.onGround ? COYOTE_TIME : Math.max(0, (player.coyoteTimer || 0) - dt);
    player.jumpBuffer = (input.upPressed || input.bPressed) ? JUMP_BUFFER_TIME : Math.max(0, (player.jumpBuffer || 0) - dt);
    if (player.jumpBuffer > 0 && player.coyoteTimer > 0) {
      player.vy = -gameState.jumpPower;
      player.onGround = false;
      player.coyoteTimer = 0;
      player.jumpBuffer = 0;
      sounds.push(SFX.jump); // rising sweep
    }

    // Attack (using A button)
    if (input.aPressed && gameState.projectiles.length < MAX_PROJECTILES) {
      gameState.projectiles.push({
        x: gameState.player.x + (gameState.player.facing > 0 ? SPRITE_SIZE : -SPRITE_SIZE),
        y: gameState.player.y + 4,
        vx: gameState.player.facing * PROJECTILE_SPEED,
        life: PROJECTILE_LIFETIME
      });
      sounds.push(SFX.throwTorch);
    }
  } else {
    // During death, stop horizontal movement
    gameState.player.vx = 0;
  }

  // Apply gravity to player (skip if dead - already handled in death animation).
  // Position is moved once, by the collision code below.
  if (!gameState.player.isDead && !gameState.player.onGround) {
    const player = gameState.player;
    const jumpHeld = input.up || input.b;
    const gravity = player.vy >= 0 ? GRAVITY_FALL : jumpHeld ? gameState.gravity : GRAVITY_RELEASED;
    player.vy = Math.min(player.vy + gravity * dt, MAX_FALL_SPEED);
  }

  // Player walking animation, faster the faster the player runs
  if (Math.abs(gameState.player.vx) > 0) {
    gameState.player.walkTimer += dt * Math.abs(gameState.player.vx) / gameState.playerSpeed;
    if (gameState.player.walkTimer > PLAYER_WALK_INTERVAL) {
      gameState.player.walkFrame = 1 - gameState.player.walkFrame;
      gameState.player.walkTimer = 0;
    }
  } else {
    gameState.player.walkFrame = 0;
  }

  // Helper function to check if a tile is solid
  function isSolidTile(tileId) {
    // Spikes are solid so walking or jumping into them just bumps; only landing on top kills
    return tileId === TILE_PLATFORM || tileId === TILE_BRICK || tileId === TILE_METAL || tileId === TILE_SPIKES;
  }

  // Helper function to get tile at position
  function getTileAt(x, y) {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    if (tileX >= 0 && tileX < TILES_X && tileY >= 0 && tileY < TILES_Y) {
      return gameState.tilemap[tileY][tileX];
    }
    return TILE_EMPTY;
  }

  // Skip collision detection and physics if dead (death animation handles falling)
  if (!gameState.player.isDead) {
  // Horizontal collision detection
  if (Math.abs(gameState.player.vx) > 0) {
    const newX = gameState.player.x + gameState.player.vx * dt;
    const playerTop = gameState.player.y;
    const playerBottom = gameState.player.y + PLAYER_HEIGHT - 1;

    // Check left and right edges for solid tiles
    let canMoveHorizontally = true;
    if (gameState.player.vx < 0) { // Moving left
      const leftEdge = newX;
      // Check multiple points along the left edge
      for (let y = playerTop; y <= playerBottom; y += 2) {
        const tileId = getTileAt(leftEdge, y);
        if (isSolidTile(tileId)) {
          canMoveHorizontally = false;
          // Snap to the right edge of the tile
          const tileX = Math.floor(leftEdge / TILE_SIZE);
          gameState.player.x = (tileX + 1) * TILE_SIZE;
          gameState.player.vx = 0;
          break;
        }
      }
    } else if (gameState.player.vx > 0) { // Moving right
      const rightEdge = newX + PLAYER_WIDTH - 1;
      // Check multiple points along the right edge
      for (let y = playerTop; y <= playerBottom; y += 2) {
        const tileId = getTileAt(rightEdge, y);
        if (isSolidTile(tileId)) {
          canMoveHorizontally = false;
          // Snap to the left edge of the tile
          const tileX = Math.floor(rightEdge / TILE_SIZE);
          gameState.player.x = tileX * TILE_SIZE - PLAYER_WIDTH;
          gameState.player.vx = 0;
          break;
        }
      }
    }

    // Apply horizontal movement if allowed
    if (canMoveHorizontally) {
      gameState.player.x = newX;
    }
  }

  // Vertical collision detection
  gameState.player.onGround = false;

  // Check if currently standing on ground
  const currentBottomEdge = gameState.player.y + PLAYER_HEIGHT;
  const playerLeft = gameState.player.x;
  const playerRight = gameState.player.x + PLAYER_WIDTH - 1;

  for (let x = playerLeft; x <= playerRight; x += 4) {
    const tileId = getTileAt(x, currentBottomEdge);
    if (isSolidTile(tileId)) {
      gameState.player.onGround = true;
      break;
    }
  }

  // Apply vertical movement
  const newY = gameState.player.y + gameState.player.vy * dt;

  if (gameState.player.vy > 0) { // Falling down
    const bottomEdge = newY + PLAYER_HEIGHT;
    let hitPlatform = false;

    for (let x = playerLeft; x <= playerRight; x += 4) {
      const tileId = getTileAt(x, bottomEdge);

      // Landing on spikes is deadly
      if (tileId === TILE_SPIKES && !gameState.player.isDead) {
        gameState.player.health = 0;
        gameState.player.isDead = true;
        gameState.player.deathTimer = 3.0;
        sounds.push(SFX.spikes);
      }

      // Check for exit
      if (tileId === TILE_EXIT && !gameState.levelComplete) {
        gameState.levelComplete = true;
        gameState.winTimer = WIN_PAUSE;
      }

      // Check for solid platforms
      if (isSolidTile(tileId)) {
        const tileY = Math.floor(bottomEdge / TILE_SIZE);
        gameState.player.y = tileY * TILE_SIZE - PLAYER_HEIGHT;
        if (gameState.player.vy >= MAX_FALL_SPEED) sounds.push(SFX.land); // thump after a long drop
        gameState.player.vy = 0;
        gameState.player.onGround = true;
        hitPlatform = true;
        break;
      }
    }

    if (!hitPlatform) {
      gameState.player.y = newY;
    }
  } else if (gameState.player.vy < 0) { // Jumping up
    const topEdge = newY;
    let hitCeiling = false;

    for (let x = playerLeft; x <= playerRight; x += 4) {
      const tileId = getTileAt(x, topEdge);
      if (isSolidTile(tileId)) {
        gameState.player.vy = 0;
        const tileY = Math.floor(topEdge / TILE_SIZE);
        gameState.player.y = (tileY + 1) * TILE_SIZE;
        hitCeiling = true;
        break;
      }
    }

    if (!hitCeiling) {
      gameState.player.y = newY;
    }
  } else {
    // No vertical velocity, but apply tiny movement for gravity
    gameState.player.y = newY;
  }

  // Check for scorpion collision (damage with invincibility) - skip if already dead
  if (!gameState.player.isDead) {
    for (const enemy of gameState.enemies) {
      if (enemy.health > 0 && !gameState.player.invincible &&
          gameState.player.x + PLAYER_WIDTH > enemy.x &&
          gameState.player.x < enemy.x + SCORPION_WIDTH &&
          gameState.player.y + PLAYER_HEIGHT > enemy.y &&
          gameState.player.y < enemy.y + SCORPION_HEIGHT) {
        gameState.player.health--;
        gameState.player.invincible = true;
        gameState.player.invincibleTimer = 1.5; // 1.5 seconds of invincibility

        sounds.push(SFX.hurt);

        if (gameState.player.health <= 0) {
          gameState.player.isDead = true;
          gameState.player.deathTimer = 3.0; // 3 second death animation before game over
          sounds.push(SFX.death);
        }
      }
    }

    // Check for bat collision (damage with invincibility)
    for (const bat of gameState.bats) {
      if (bat.health > 0 && !gameState.player.invincible &&
          gameState.player.x + PLAYER_WIDTH > bat.x &&
          gameState.player.x < bat.x + SPRITE_SIZE &&
          gameState.player.y + PLAYER_HEIGHT > bat.y &&
          gameState.player.y < bat.y + SPRITE_SIZE) {
        gameState.player.health--;
        gameState.player.invincible = true;
        gameState.player.invincibleTimer = 1.5;

        sounds.push(SFX.hurt);

        if (gameState.player.health <= 0) {
          gameState.player.isDead = true;
          gameState.player.deathTimer = 3.0; // 3 second death animation before game over
          sounds.push(SFX.death);
        }
      }
    }
  }

  // Keep player in world bounds
  if (gameState.player.x < 0) gameState.player.x = 0;
  if (gameState.player.x > WORLD_WIDTH - PLAYER_WIDTH) gameState.player.x = WORLD_WIDTH - PLAYER_WIDTH;
  if (gameState.player.y > WORLD_HEIGHT) {
    gameState.player.y = PLAYER_START_Y;
    gameState.player.x = PLAYER_START_X;
    gameState.player.vy = 0;
  }

  } // End of if (!gameState.player.isDead) collision check block

  // Check for the exit
  if (!gameState.player.isDead) {
    const playerTop = gameState.player.y;
    const playerBottom = gameState.player.y + PLAYER_HEIGHT - 1;
    const playerLeft = gameState.player.x;
    const playerRight = gameState.player.x + PLAYER_WIDTH - 1;

    for (let x = playerLeft; x <= playerRight; x += 4) {
      for (let y = playerTop; y <= playerBottom; y += 4) {
        const tileId = getTileAt(x, y);
        if (tileId === TILE_EXIT && !gameState.levelComplete) {
          gameState.levelComplete = true;
          gameState.winTimer = WIN_PAUSE;
        }
      }
    }
  }

  // Update scorpion enemies with deltaTime and gravity
  for (const enemy of gameState.enemies) {
    if (enemy.health <= 0) continue;

    // Apply gravity
    if (!enemy.onGround) {
      enemy.vy += GRAVITY * dt;
    }

    // Update position
    enemy.x += enemy.vx * dt;
    enemy.y += enemy.vy * dt;

    // Enemy walking animation
    enemy.walkTimer += dt;
    if (enemy.walkTimer > ENEMY_WALK_INTERVAL) {
      enemy.walkFrame = 1 - enemy.walkFrame;
      enemy.walkTimer = 0;
    }

    // Check if standing on ground
    enemy.onGround = false;
    const enemyBottom = enemy.y + SCORPION_HEIGHT;
    const enemyLeft = enemy.x;
    const enemyRight = enemy.x + SCORPION_WIDTH - 1;

    // Check for ground beneath scorpion
    for (let x = enemyLeft; x <= enemyRight; x += 4) {
      const tileId = getTileAt(x, enemyBottom);
      if (isSolidTile(tileId)) {
        enemy.onGround = true;
        break;
      }
    }

    // Apply vertical collision if falling
    if (enemy.vy > 0) {
      let hitPlatform = false;
      for (let x = enemyLeft; x <= enemyRight; x += 4) {
        const tileId = getTileAt(x, enemyBottom);
        if (isSolidTile(tileId)) {
          const tileY = Math.floor(enemyBottom / TILE_SIZE);
          enemy.y = tileY * TILE_SIZE - SCORPION_HEIGHT;
          enemy.vy = 0;
          enemy.onGround = true;
          hitPlatform = true;
          break;
        }
      }
    }

    // Enemy AI: reverse direction at edges or walls
    const nextX = enemy.x + (enemy.vx > 0 ? SCORPION_WIDTH : 0);
    const checkX = enemy.vx > 0 ? nextX : nextX - 1;
    const checkTileX = Math.floor(checkX / TILE_SIZE);
    const groundCheckTileX = Math.floor((enemy.x + (enemy.vx > 0 ? SCORPION_WIDTH : -1)) / TILE_SIZE);
    const groundCheckY = Math.floor((enemy.y + SCORPION_HEIGHT + 1) / TILE_SIZE);

    // Check for wall ahead
    let hitWall = false;
    for (let y = enemy.y; y < enemy.y + SCORPION_HEIGHT; y += 4) {
      const tileId = getTileAt(checkX, y);
      if (isSolidTile(tileId)) {
        hitWall = true;
        break;
      }
    }

    // Check if there's no ground ahead (edge of platform)
    let noGroundAhead = false;
    if (enemy.onGround && groundCheckTileX >= 0 && groundCheckTileX < TILES_X && groundCheckY < TILES_Y) {
      const groundTile = gameState.tilemap[groundCheckY][groundCheckTileX];
      if (groundTile === TILE_EMPTY) {
        noGroundAhead = true;
      }
    }

    // Reverse if hitting wall, edge, or world bounds
    if (hitWall || noGroundAhead || enemy.x <= 0 || enemy.x >= WORLD_WIDTH - SCORPION_WIDTH) {
      enemy.vx *= -1;
    }
  }

  // Update bats with sine wave flight pattern
  for (const bat of gameState.bats) {
    if (bat.health <= 0) continue;

    // Horizontal movement
    bat.x += bat.vx * dt;

    // Sine wave vertical movement
    bat.phase += dt * 3; // Control wave speed
    bat.y = bat.y + Math.sin(bat.phase) * 0.5; // Subtle up/down oscillation

    // Reverse direction at world bounds
    if (bat.x <= 0 || bat.x >= WORLD_WIDTH - SPRITE_SIZE) {
      bat.vx *= -1;
    }

    // Keep bats in vertical bounds
    if (bat.y < bat.minY) bat.y = bat.minY;
    if (bat.y > bat.maxY) bat.y = bat.maxY;
  }

  // Update projectiles with deltaTime
  gameState.projectiles = gameState.projectiles.filter(proj => {
    proj.x += proj.vx * dt;
    proj.life -= dt;

    // Remove if out of bounds or expired
    if (proj.x < 0 || proj.x > WORLD_WIDTH || proj.life <= 0) return false;

    // Torches break bricks: change our copy and tell the console to redraw that tile
    const hitX = Math.floor((proj.x + PROJECTILE_SIZE / 2) / TILE_SIZE);
    const hitY = Math.floor((proj.y + PROJECTILE_SIZE / 2) / TILE_SIZE);
    const hitTile = getTileAt(proj.x + PROJECTILE_SIZE / 2, proj.y + PROJECTILE_SIZE / 2);
    if (hitTile === TILE_BRICK) {
      gameState.tilemap[hitY][hitX] = TILE_EMPTY;
      gameState.bgEdits.push({ x: hitX, y: hitY, tileId: backdropTile(hitX, hitY) });
      gameState.score += BRICK_SCORE;
      sounds.push(SFX.brick, SFX.brickThud); // crumble plus a low thump
      return false;
    }
    if (hitTile === TILE_METAL || hitTile === TILE_PLATFORM) return false;

    // Check collision with scorpions
    for (const enemy of gameState.enemies) {
      if (enemy.health > 0 &&
          proj.x + PROJECTILE_SIZE > enemy.x && proj.x < enemy.x + SCORPION_WIDTH &&
          proj.y + PROJECTILE_SIZE > enemy.y && proj.y < enemy.y + SCORPION_HEIGHT) {
        enemy.health--;
        if (enemy.health <= 0) {
          gameState.score += ENEMY_KILL_SCORE;
          sounds.push(SFX.enemyKill);
          killEnemy(enemy, proj.vx);
        } else {
          sounds.push(SFX.enemyHit);
        }
        return false;
      }
    }

    // Check collision with bats
    for (const bat of gameState.bats) {
      if (bat.health > 0 &&
          proj.x + PROJECTILE_SIZE > bat.x && proj.x < bat.x + SPRITE_SIZE &&
          proj.y + PROJECTILE_SIZE > bat.y && proj.y < bat.y + SPRITE_SIZE) {
        bat.health--;
        if (bat.health <= 0) {
          gameState.score += ENEMY_KILL_SCORE;
          sounds.push(SFX.enemyKill);
          killEnemy(bat, proj.vx);
        }
        return false;
      }
    }

    return true;
  });

  // Coin collection
  for (const coin of gameState.coins) {
    if (!coin.collected &&
        gameState.player.x + PLAYER_WIDTH > coin.x && gameState.player.x < coin.x + COIN_SIZE &&
        gameState.player.y + PLAYER_HEIGHT > coin.y && gameState.player.y < coin.y + COIN_SIZE) {
      coin.collected = true;
      gameState.score += COIN_SCORE;
      sounds.push(SFX.coin);
    }
  }

  // Build render commands (the console draws the tilemap itself)
  const sprites = [];

  // Render treasure
  for (const coin of gameState.coins) {
    if (!coin.collected) {
      sprites.push({
        spriteId: animFrame(COIN_SPIN, COIN_FRAME_TIME, coin.x / 40),
        x: Math.floor(coin.x),
        y: Math.floor(coin.y)
      });
    }
  }

  // Render explorer (2-sprite character with sprite flipping and animation)
  const facingLeft = gameState.player.facing < 0;
  let bodySprite;
  let shouldRenderHead = true;
  let spriteAlpha = 1.0;

  // Determine which body sprite to use based on state (check death first!)
  if (gameState.player.isDead) {
    // Death animation overrides everything
    bodySprite = SPRITE_EXPLORER_BODY_DEATH;
    shouldRenderHead = false; // Don't render head during death
  } else if (gameState.player.invincible && gameState.player.invincibleTimer > 0 && gameState.player.health > 0) {
    // Flashing during invincibility (only if still alive)
    const flashSpeed = 10; // Flash rate
    const shouldShow = Math.floor(gameState.player.invincibleTimer * flashSpeed) % 2 === 0;
    if (!shouldShow) {
      // Skip rendering during flash-off frames
      bodySprite = null;
    } else {
      bodySprite = SPRITE_EXPLORER_BODY_HURT;
    }
  } else {
    // Normal walking animation
    bodySprite = gameState.player.walkFrame === 0 ? SPRITE_EXPLORER_BODY_WALK1 : SPRITE_EXPLORER_BODY_WALK2;
  }

  // Round player position to integers for rendering
  const playerRenderX = Math.floor(gameState.player.x);
  const playerRenderY = Math.floor(gameState.player.y);

  // Render head (unless dead)
  if (shouldRenderHead && bodySprite !== null) {
    sprites.push({
      spriteId: SPRITE_EXPLORER_HEAD,
      x: playerRenderX,
      y: playerRenderY,
      flipH: facingLeft
    });
  }

  // Render body
  if (bodySprite !== null) {
    sprites.push({
      spriteId: bodySprite,
      x: playerRenderX,
      y: playerRenderY + SPRITE_SIZE,
      flipH: facingLeft
    });
  }

  sprites.push(...enemySprites());

  // Render torches
  for (const proj of gameState.projectiles) {
    sprites.push({
      spriteId: SPRITE_TORCH,
      x: Math.floor(proj.x),
      y: Math.floor(proj.y)
    });
  }

  // Camera dead zone logic - only move camera when player approaches screen edges
  const playerScreenX = gameState.player.x - gameState.camera.x; // Player position relative to camera

  // Check if player is outside the dead zone
  if (playerScreenX < CAMERA_DEAD_ZONE_LEFT) {
    // Player too far left, move camera left to keep them in dead zone
    gameState.camera.x = gameState.player.x - CAMERA_DEAD_ZONE_LEFT;
  } else if (playerScreenX + PLAYER_WIDTH > SCREEN_WIDTH - CAMERA_DEAD_ZONE_RIGHT) {
    // Player too far right, move camera right to keep them in dead zone
    gameState.camera.x = gameState.player.x + PLAYER_WIDTH - (SCREEN_WIDTH - CAMERA_DEAD_ZONE_RIGHT);
  }

  // Vertically the camera follows the ground, not every jump, and looks ahead when dropping
  const player = gameState.player;
  if (player.onGround || player.groundY === undefined) player.groundY = player.y;
  let targetY;
  if (!player.onGround && player.vy > 0 && player.y > player.groundY + 4) {
    // Dropping below the last ledge: lead downward so the landing spot is visible
    targetY = player.y - CAMERA_FALL_LOOKAHEAD;
    // ...unless the upper floor is right below, which is already on screen
    const column = Math.floor((player.x + PLAYER_WIDTH / 2) / TILE_SIZE);
    const floorBelow = gameState.tilemap[UPPER_FLOOR_Y / TILE_SIZE][column] !== TILE_EMPTY;
    if (player.y + PLAYER_HEIGHT <= UPPER_FLOOR_Y && floorBelow) targetY = Math.min(targetY, 0);
  } else if (player.onGround && input.down && !player.isDead) {
    targetY = player.y - CAMERA_LOOK_DOWN;
  } else {
    // Keep the ground near the bottom with room above for jumps
    targetY = player.groundY + PLAYER_HEIGHT + CAMERA_GROUND_MARGIN - SCREEN_HEIGHT;
    if (player.groundY + PLAYER_HEIGHT <= UPPER_FLOOR_Y) targetY = Math.min(targetY, 0);
  }
  gameState.camera.y += (targetY - gameState.camera.y) * Math.min(1, dt * CAMERA_SMOOTHING);
  // Never let the player leave the screen while the camera catches up
  gameState.camera.y = Math.max(gameState.camera.y, player.y + PLAYER_HEIGHT + CAMERA_EDGE - SCREEN_HEIGHT);
  gameState.camera.y = Math.min(gameState.camera.y, player.y - CAMERA_EDGE);

  // Clamp camera to world bounds
  gameState.camera.x = Math.max(0, Math.min(gameState.camera.x, WORLD_WIDTH - SCREEN_WIDTH));
  gameState.camera.y = Math.max(0, Math.min(gameState.camera.y, WORLD_HEIGHT - SCREEN_HEIGHT));

  // Round camera position to avoid subpixel jitter
  const cameraScrollX = Math.round(gameState.camera.x);
  const cameraScrollY = Math.round(gameState.camera.y);

  // Switch to the cavern theme once the player drops below the upper floor (sending a new name restarts music)
  if (gameState.player.y > UPPER_FLOOR_Y + TILE_SIZE * 2) gameState.inCavern = true;

  // HUD on the text layer: screen grid, doesn't scroll with the camera
  const text = [];
  for (let i = 0; i < gameState.player.health; i++) {
    text.push({ x: i, y: 0, tileId: SPRITE_HEART });
  }
  const scoreText = String(gameState.score);
  text.push({ x: 16 - scoreText.length, y: 0, text: scoreText });

  const bg = gameState.bgEdits;
  gameState.bgEdits = [];

  return {
    sprites,
    bg,
    text,
    scroll: { x: cameraScrollX, y: cameraScrollY },
    music: gameState.player.isDead ? 'death' : gameState.inCavern ? 'cavern' : 'main',
    score: gameState.score,
    gameOver: gameState.gameOver, // after the exit, the victory pause ends the game
    sounds: sounds
  };
}