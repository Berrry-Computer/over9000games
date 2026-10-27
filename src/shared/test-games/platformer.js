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
      // Sprite 0: Explorer head (standing/walk frame 0) - profile view with fedora hat
      [
        "00999990",
        "09dddd90",
        "9ddddd90",
        "9dd0dd00",
        "0dddd000",
        "00d2d000",
        "00ddd000",
        "000d0000"
      ],
      // Sprite 1: Explorer body walk frame 1 - right leg forward, left leg back
      [
        "000d0000",
        "00d9d000",
        "0d9dd900",
        "d99dd990",
        "d9ddd990",
        "0d9009d0",
        "00dd09d0",
        "009d0d00"
      ],
      // Sprite 2: Explorer body walk frame 2 - left leg forward, right leg back
      [
        "000d0000",
        "00d9d000",
        "0d9dd900",
        "d99dd990",
        "d9ddd990",
        "0d9009d0",
        "0d9d0d00",
        "0d009d00"
      ],
      // Sprite 3: Scorpion front - claws and head connecting to body
      [
        "90000000",
        "99000000",
        "09900088",
        "00998888",
        "00988888",
        "09900088",
        "99000000",
        "90000000"
      ],
      // Sprite 4: Scorpion back - body segments with tail curving upward
      [
        "00000009",
        "00000990",
        "88889800",
        "88888000",
        "88888000",
        "88889000",
        "88899000",
        "88900000"
      ],
      // Sprite 5: Bat - wings spread, flying enemy
      [
        "00000000",
        "90000009",
        "99800899",
        "09988990",
        "00988900",
        "00088000",
        "00000000",
        "00000000"
      ],
      // Sprite 6: Weathered stone platform with cracks and shadows
      [
        "88017708",
        "80777781",
        "17888871",
        "78811887",
        "78811887",
        "17888871",
        "80777781",
        "88888888"
      ],
      // Sprite 7: Bright golden coin like Mario - shiny yellow with white highlights
      [
        "00555500",
        "05511550",
        "51111115",
        "51111115",
        "51111115",
        "51111115",
        "05511550",
        "00555500"
      ],
      // Sprite 8: Flaming torch projectile with orange/red fire
      [
        "00055000",
        "00e5e500",
        "0e5e5e50",
        "0e52225e",
        "0e52225e",
        "0e5555e0",
        "00e55e00",
        "0005e000"
      ],
      // Sprite 9: Weathered sandstone brick with dark mortar and cracks
      [
        "0cddddc0",
        "ddd99ddd",
        "dd9889dd",
        "0cddddc0",
        "dddd9ddd",
        "dd9889dd",
        "ddd99ddd",
        "0cddddc0"
      ],
      // Sprite 10: Rusty metal platform with rivets and corrosion
      [
        "08888880",
        "87771778",
        "77999977",
        "71999917",
        "71999917",
        "77999977",
        "87771778",
        "08888880"
      ],
      // Sprite 11: Rusty metal spikes with dark shadows
      [
        "00000000",
        "00088000",
        "00899800",
        "08999980",
        "89988998",
        "88888888",
        "88888888",
        "88888888"
      ],
      // Sprite 12: Ancient wooden exit door with metal bands
      [
        "00999900",
        "09d88d90",
        "9d8dd8d9",
        "d8dddd8d",
        "d8dddd8d",
        "9d8dd8d9",
        "09d88d90",
        "00999900"
      ],
      // Sprite 13: Heart - red health indicator
      [
        "00000000",
        "02200220",
        "22222222",
        "22222222",
        "02222220",
        "00222200",
        "00022000",
        "00000000"
      ],
      // Sprite 14: Explorer body hurt - recoiling/knocked back pose
      [
        "000d0000",
        "00d9d000",
        "0d9dd900",
        "d99dd990",
        "d9ddd990",
        "00d99d00",
        "0d00d000",
        "d000d000"
      ],
      // Sprite 15: Explorer body death - falling/collapsed pose
      [
        "00000000",
        "00000000",
        "ddd9ddd0",
        "99ddd990",
        "d99d9900",
        "0d9009d0",
        "00d00d00",
        "00d00d00"
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
      0x696969, // c: Dim gray
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
  if (solid(x, y + 1) && !solid(x, y - 1) && hash % 4 === 0 && y > 20) return TILE_CRYSTAL;
  return hash % 9 === 0 ? TILE_CAVE_SPECK : TILE_EMPTY;
}

// Music for resources(): the console sequences the notes, update() only picks the song
// Notes are NOTE:beats, '-' is a rest; at 120 BPM one beat is 0.5s
const SONGS = {
  // INTRO -> VERSE -> CHORUS -> VERSE -> CHORUS -> BRIDGE -> CHORUS (finale)
  main: {
    bpm: 120,
    tracks: [
      {
        channel: 'pulse1', volume: 0.25, envelope: 'soft',
        notes:
          // INTRO (4 bars) - mysterious, sets the mood
          "A3:1 -:0.5 C4:1 -:0.5 E4:1.5 -:1 E4:1 D4:1 C4:1.5 -:1 " +

          // VERSE (8 bars) - sneaking through the tomb, main exploration theme
          "A3:1 -:0.5 C4:0.5 -:0.5 E4:1 E4:0.5 D4:0.5 C4:1 -:0.5 " +
          "G3:1 -:0.5 B3:0.5 -:0.5 D4:1 D4:0.5 C4:0.5 B3:1 -:0.5 " +
          "A3:1 -:0.5 C4:0.5 -:0.5 E4:1 E4:0.5 F4:0.5 E4:1 -:0.5 " +
          "D4:1 C4:1 B3:1 A3:1.5 -:1 " +

          // CHORUS (8 bars) - DANGER! Main hook that repeats
          "E4:0.5 E4:0.5 -:0.25 G4:0.5 -:0.25 A4:1 -:0.5 A4:0.5 G4:0.5 E4:1 -:0.5 " +
          "D4:0.5 D4:0.5 -:0.25 F4:0.5 -:0.25 G4:1 -:0.5 G4:0.5 F4:0.5 D4:1 -:0.5 " +
          "C4:0.5 E4:0.5 G4:0.5 B4:0.5 -:0.25 A4:1 -:0.5 G4:0.5 E4:0.5 D4:1 -:0.5 " +
          "C4:1 B3:1 A3:1.5 -:1 A3:1 -:0.5 " +

          // VERSE (repeat - 8 bars) - deeper into danger, slight variation
          "A3:1 -:0.5 C4:0.5 -:0.5 E4:1 E4:0.5 D4:0.5 C4:1 -:0.5 " +
          "G3:1 -:0.5 B3:0.5 -:0.5 D4:1 D4:0.5 C4:0.5 B3:1 -:0.5 " +
          "A3:1 -:0.5 C4:0.5 -:0.5 E4:1 E4:0.5 F4:0.5 G4:1 -:0.5 " +
          "F4:1 E4:1 D4:1 C4:1.5 -:1 " +

          // CHORUS (repeat - 8 bars) - main hook returns
          "E4:0.5 E4:0.5 -:0.25 G4:0.5 -:0.25 A4:1 -:0.5 A4:0.5 G4:0.5 E4:1 -:0.5 " +
          "D4:0.5 D4:0.5 -:0.25 F4:0.5 -:0.25 G4:1 -:0.5 G4:0.5 F4:0.5 D4:1 -:0.5 " +
          "C4:0.5 E4:0.5 G4:0.5 B4:0.5 -:0.25 A4:1 -:0.5 G4:0.5 E4:0.5 D4:1 -:0.5 " +
          "C4:1 B3:1 A3:1.5 -:1 A3:1 -:0.5 " +

          // BRIDGE (4 bars) - discovery moment! Chromatic tension + treasure glimpse
          "C5:0.5 C5:0.5 E5:0.5 -:0.5 G5:1 -:0.5 F5:0.5 E5:0.5 D5:1 -:0.5 " +
          "G#4:0.25 G4:0.25 F#4:0.25 F4:0.25 E4:0.5 D#4:0.25 D4:0.25 C#4:0.25 C4:0.25 -:0.5 " +

          // CHORUS FINALE (8 bars) - triumphant escape, ultimate payoff
          "E4:0.5 E4:0.5 -:0.25 G4:0.5 -:0.25 A4:1 -:0.5 A4:0.5 G4:0.5 E4:1 -:0.5 " +
          "D4:0.5 D4:0.5 -:0.25 F4:0.5 -:0.25 G4:1 -:0.5 G4:0.5 F4:0.5 D4:1 -:0.5 " +
          "C4:0.5 E4:0.5 G4:0.5 B4:0.5 -:0.25 A4:1 -:0.5 G4:0.5 E4:0.5 D4:1 -:0.5 " +
          "E4:1 -:0.5 A4:1.5 -:0.5 A4:2"
      },
      {
        channel: 'triangle', volume: 0.2, envelope: 'sustain',
        notes:
          // Intro bass (4 bars) - ominous entry
          "A1:1 -:0.5 A1:1 -:0.5 E2:1 -:0.5 A1:1 -:0.5 " +
          // Verse bass pattern (8 bars) - walking quarter notes
          "A1:1 A1:1 E2:1 A1:1 G1:1 G1:1 D2:1 G1:1 " +
          "F1:1 F1:1 C2:1 F1:1 E1:1 E1:1 B1:1 E1:1 " +
          // Chorus bass (8 bars) - powerful dotted quarters
          "A1:1.5 -:0.5 E2:1 A1:1 G1:1.5 -:0.5 D2:1 G1:1 " +
          "F1:1.5 -:0.5 C2:1 F1:1 E1:1.5 G#1:1 A1:1 -:0.5 " +
          // Verse bass (repeat - 8 bars)
          "A1:1 A1:1 E2:1 A1:1 G1:1 G1:1 D2:1 G1:1 " +
          "F1:1 F1:1 C2:1 F1:1 E1:1 E1:1 B1:1 E1:1 " +
          // Chorus bass (repeat - 8 bars)
          "A1:1.5 -:0.5 E2:1 A1:1 G1:1.5 -:0.5 D2:1 G1:1 " +
          "F1:1.5 -:0.5 C2:1 F1:1 E1:1.5 G#1:1 A1:1 -:0.5 " +
          // Bridge bass (4 bars) - tension/discovery
          "F1:0.5 F1:0.5 C2:1 -:1 G1:0.5 G1:0.5 D2:1 -:1 " +
          // Chorus finale (8 bars) - triumphant ending
          "A1:1.5 -:0.5 E2:1 A1:1 G1:1.5 -:0.5 D2:1 G1:1 " +
          "F1:1.5 -:0.5 C2:1 F1:1 E1:1.5 A1:1.5 A1:2"
      }
    ]
  },
  // Deeper in: slower, sparse and echoing, with a dripping noise channel. 32 beats per track
  cavern: {
    bpm: 96,
    tracks: [
      {
        channel: 'pulse2', volume: 0.2, envelope: 'fade',
        notes:
          "E4:1 -:1 G4:0.5 A4:0.5 -:1 C5:1 B4:1 -:2 " +
          "D4:1 -:1 F4:0.5 G4:0.5 -:1 A4:1 G4:1 -:2 " +
          "E4:1 -:1 G4:0.5 A4:0.5 -:1 E5:1 D5:1 C5:1 B4:1 " +
          "A4:2 -:1 G4:0.5 E4:0.5 A4:3 -:1"
      },
      {
        channel: 'triangle', volume: 0.22, envelope: 'sustain',
        notes: "A1:4 E2:4 D2:4 A1:4 A1:4 C2:4 E2:4 A1:4"
      },
      {
        channel: 'noise', volume: 0.06, envelope: 'sharp', mode: 'periodic',
        notes: "C6:0.25 -:5.75 G5:0.25 -:1.75 C6:0.25 -:7.75 C6:0.25 -:3.75 E6:0.25 -:3.75 C6:0.25 -:7.75"
      }
    ]
  },
  // Victory fanfare at the exit, played once
  win: {
    bpm: 150,
    loop: false,
    tracks: [
      { channel: 'pulse1', volume: 0.35, envelope: 'soft', notes: "C5:0.5 E5:0.5 G5:0.5 C6:1.5 -:0.5 A5:0.5 B5:0.5 C6:2" },
      { channel: 'triangle', volume: 0.25, envelope: 'sustain', notes: "C3:1.5 G2:1.5 C3:1 -:0.5 F2:0.5 G2:0.5 C3:1" }
    ]
  },
  // Sad descending notes, played once
  death: {
    bpm: 120,
    loop: false,
    tracks: [
      { channel: 'pulse1', volume: 0.4, envelope: 'soft', notes: "C4:1 -:0.5 B3:1 -:0.5 A3:1 -:0.5 G3:1.5 -:0.5 F3:2" }
    ]
  }
};

// Sound effects. Each event gets its own soundId so a new one restarts its slot
const SFX = {
  jump:        { slotId: 0, soundId: 'jump', channel: 'pulse1', frequency: 280, duration: 0.14, volume: 0.35, envelope: 'soft', sweep: { target: 640, time: 0.12 } },
  throwTorch:  { slotId: 1, soundId: 'throw', channel: 'noise', mode: 'random', duration: 0.12, volume: 0.3, envelope: 'fade' },
  enemyHit:    { slotId: 2, soundId: 'enemyHit', channel: 'pulse2', frequency: 500, duration: 0.08, volume: 0.35, envelope: 'sharp' },
  enemyKill:   { slotId: 2, soundId: 'enemyKill', channel: 'pulse2', frequency: 900, duration: 0.2, volume: 0.35, envelope: 'fade', sweep: { target: 110, time: 0.2 } },
  coin:        { slotId: 3, soundId: 'coin', channel: 'pulse2', note: 'B5', duration: 0.07, volume: 0.35, envelope: 'sharp' },
  coinHigh:    { slotId: 3, soundId: 'coinHigh', channel: 'pulse2', note: 'E6', duration: 0.3, volume: 0.35, envelope: 'fade' },
  brick:       { slotId: 4, soundId: 'brick', channel: 'noise', mode: 'random', duration: 0.22, volume: 0.45, envelope: 'fade' },
  brickThud:   { slotId: 5, soundId: 'brickThud', channel: 'triangle', frequency: 150, duration: 0.1, volume: 0.6, envelope: 'sharp', sweep: { target: 60, time: 0.1 } },
  land:        { slotId: 5, soundId: 'land', channel: 'triangle', frequency: 110, duration: 0.07, volume: 0.45, envelope: 'sharp', sweep: { target: 50, time: 0.07 } },
  hurt:        { slotId: 6, soundId: 'hurt', channel: 'pulse1', frequency: 520, duration: 0.25, volume: 0.4, envelope: 'fade', sweep: { target: 130, time: 0.25 } },
  death:       { slotId: 7, soundId: 'death', channel: 'noise', mode: 'random', duration: 0.5, volume: 0.6, envelope: 'fade' },
  spikes:      { slotId: 7, soundId: 'spikes', channel: 'noise', mode: 'periodic', frequency: 700, duration: 0.4, volume: 0.55, envelope: 'fade' }
};
const COIN_CHIME_DELAY = 0.07; // second coin note follows the first, like a two-note chime
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
      soundQueue: [], // {delay, sound}: effects to send a little later
      torchTimer: 0,
      torchFrame: 0,
      inCavern: false,
      winTimer: 0
    };
    // Initialize camera to player's starting position
    gameState.camera.x = Math.max(0, Math.min(gameState.player.x - 64, WORLD_WIDTH - SCREEN_WIDTH));
    gameState.camera.targetX = gameState.camera.x;
  }

  // Seconds since last frame, capped so a hitch can't move anything through an 8px platform
  const dt = Math.min(deltaTime, 1 / 30);
  const sounds = [];

  // Send queued effects whose delay has passed
  gameState.soundQueue = gameState.soundQueue.filter(queued => {
    queued.delay -= dt;
    if (queued.delay > 0) return true;
    sounds.push(queued.sound);
    return false;
  });

  // Flicker the wall torches by swapping their tiles in the console's tilemap
  gameState.torchTimer += dt;
  if (gameState.torchTimer >= TORCH_FLICKER_TIME) {
    gameState.torchTimer = 0;
    gameState.torchFrame = 1 - gameState.torchFrame;
    const tileId = gameState.torchFrame ? TILE_WALL_TORCH_2 : TILE_WALL_TORCH_1;
    for (const torch of WALL_TORCHES) gameState.bgEdits.push({ x: torch.x, y: torch.y, tileId });
  }

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
      sprites: [{ spriteId: SPRITE_TREASURE, x: 60, y: 56 }],
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

    // Render scorpions (2 sprites wide with sprite flipping)
    for (const enemy of gameState.enemies) {
      if (enemy.health > 0) {
        const enemyFacingLeft = enemy.vx < 0;
        const enemyRenderX = Math.floor(enemy.x);
        const enemyRenderY = Math.floor(enemy.y);

        if (enemyFacingLeft) {
          // When facing left, swap sprite order and flip both
          sprites.push({
            spriteId: SPRITE_SCORPION_BACK,
            x: enemyRenderX,
            y: enemyRenderY,
            flipH: true
          });
          sprites.push({
            spriteId: SPRITE_SCORPION_FRONT,
            x: enemyRenderX + SPRITE_SIZE,
            y: enemyRenderY,
            flipH: true
          });
        } else {
          // When facing right, normal order without flip
          sprites.push({
            spriteId: SPRITE_SCORPION_FRONT,
            x: enemyRenderX,
            y: enemyRenderY,
            flipH: false
          });
          sprites.push({
            spriteId: SPRITE_SCORPION_BACK,
            x: enemyRenderX + SPRITE_SIZE,
            y: enemyRenderY,
            flipH: false
          });
        }
      }
    }

    // Render bats (with sprite flipping)
    for (const bat of gameState.bats) {
      if (bat.health > 0) {
        const batFacingLeft = bat.vx < 0;
        sprites.push({
          spriteId: SPRITE_BAT,
          x: Math.floor(bat.x),
          y: Math.floor(bat.y),
          flipH: batFacingLeft
        });
      }
    }

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
    return tileId === TILE_PLATFORM || tileId === TILE_BRICK || tileId === TILE_METAL;
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

      // Check for deadly tiles
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

  // Check for deadly tiles (spikes) and exit - checked even when alive
  if (!gameState.player.isDead) {
    const playerTop = gameState.player.y;
    const playerBottom = gameState.player.y + PLAYER_HEIGHT - 1;
    const playerLeft = gameState.player.x;
    const playerRight = gameState.player.x + PLAYER_WIDTH - 1;

    for (let x = playerLeft; x <= playerRight; x += 4) {
      for (let y = playerTop; y <= playerBottom; y += 4) {
        const tileId = getTileAt(x, y);
        if (tileId === TILE_SPIKES && !gameState.player.isDead) {
          gameState.player.health = 0;
          gameState.player.isDead = true;
          gameState.player.deathTimer = 3.0;
          sounds.push(SFX.spikes);
        }
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
      // Two-note chime: the second note is sent a moment later from the sound queue
      sounds.push(SFX.coin);
      gameState.soundQueue.push({ delay: COIN_CHIME_DELAY, sound: SFX.coinHigh });
    }
  }

  // Build render commands (the console draws the tilemap itself)
  const sprites = [];

  // Render treasure
  for (const coin of gameState.coins) {
    if (!coin.collected) {
      sprites.push({
        spriteId: SPRITE_TREASURE,
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

  // Render scorpions (2 sprites wide with sprite flipping)
  for (const enemy of gameState.enemies) {
    if (enemy.health > 0) {
      const enemyFacingLeft = enemy.vx < 0;
      const enemyRenderX = Math.floor(enemy.x);
      const enemyRenderY = Math.floor(enemy.y);

      if (enemyFacingLeft) {
        // When facing left, swap sprite order and flip both
        sprites.push({
          spriteId: SPRITE_SCORPION_BACK,
          x: enemyRenderX,
          y: enemyRenderY,
          flipH: true
        });
        sprites.push({
          spriteId: SPRITE_SCORPION_FRONT,
          x: enemyRenderX + SPRITE_SIZE,
          y: enemyRenderY,
          flipH: true
        });
      } else {
        // When facing right, normal order without flip
        sprites.push({
          spriteId: SPRITE_SCORPION_FRONT,
          x: enemyRenderX,
          y: enemyRenderY,
          flipH: false
        });
        sprites.push({
          spriteId: SPRITE_SCORPION_BACK,
          x: enemyRenderX + SPRITE_SIZE,
          y: enemyRenderY,
          flipH: false
        });
      }
    }
  }

  // Render bats (single sprite with sprite flipping)
  for (const bat of gameState.bats) {
    if (bat.health > 0) {
      const batFacingLeft = bat.vx < 0;
      sprites.push({
        spriteId: SPRITE_BAT,
        x: Math.floor(bat.x),
        y: Math.floor(bat.y),
        flipH: batFacingLeft
      });
    }
  }

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