function metadata() {
  return {
    title: "Pong NES",
    description: "Classic Pong against the computer: first to 7 points wins",
    memory: 1, // draws by writing console memory (OAM, TEXT, REGS) instead of returning sprites
    controls: [
      {key: "up", action: "move paddle up"},
      {key: "down", action: "move paddle down"},
      {key: "a", action: "start"}
    ]
  };
}

// Paddles are 4px wide and 8px per segment; the hit flash is the same shape in yellow
const PADDLE_TOP = ["00000000", "00111100", "00111100", "00111100", "00111100", "00111100", "00111100", "00111100"];
const PADDLE_MID = ["00111100", "00111100", "00111100", "00111100", "00111100", "00111100", "00111100", "00111100"];
const PADDLE_BOTTOM = ["00111100", "00111100", "00111100", "00111100", "00111100", "00111100", "00111100", "00000000"];
const flash = (rows) => rows.map(row => row.replace(/1/g, "4"));

// Sprite ids
const SPRITE_PADDLE_TOP = 1;
const SPRITE_PADDLE_MID = 2;
const SPRITE_PADDLE_BOTTOM = 3;
const SPRITE_FLASH_OFFSET = 3; // flashing paddle segments are 4, 5, 6
const SPRITE_BALL = 7;
const TILE_WALL = 8;
const TILE_NET_LEFT = 9;  // the 2px net sits across the boundary of two tile columns
const TILE_NET_RIGHT = 10;

// 0 black, 1 white, 2 red, 3 court (walls and net), 4 paddle flash
const PALETTE = [0x000000, 0xFFFFFF, 0xFF4040, 0x5A5A7A, 0xFFE040];
const COURT_COLOR = 3;

// Court on the tilemap: walls on rows 1 and 15, a dashed net down the middle, HUD on row 0
const COURT = [];
for (let y = 0; y < 16; y++) {
  const row = new Array(16).fill(0);
  if (y === 1 || y === 15) row.fill(TILE_WALL);
  else if (y > 1) { row[7] = TILE_NET_LEFT; row[8] = TILE_NET_RIGHT; }
  COURT.push(row);
}

const SONGS = {
  // A minor chiptune: lead on pulse1, 16th-note arpeggios on pulse2, octave bass, drums
  main: {
    bpm: 150,
    tracks: [
      { channel: 'pulse1', duty: 0.25, volume: 0.18, envelope: 'soft', vibrato: { rate: 6, depth: 0.08 },
        notes: "[A4:0.5 C5:0.5 E5:0.5 A5:0.5 G5 E5]x2 [F4:0.5 A4:0.5 C5:0.5 F5:0.5 E5 C5]x2 [G4:0.5 B4:0.5 D5:0.5 G5:0.5 F5 D5]x2 E5:0.5 D5:0.5 C5:0.5 B4:0.5 A4:2 -:4" },
      { channel: 'pulse2', duty: 0.125, volume: 0.07, envelope: 'sharp',
        notes: "[A3:0.25 C4:0.25 E4:0.25 C4:0.25]x8 [F3:0.25 A3:0.25 C4:0.25 A3:0.25]x8 [G3:0.25 B3:0.25 D4:0.25 B3:0.25]x8 [E3:0.25 G#3:0.25 B3:0.25 G#3:0.25]x8" },
      { channel: 'triangle', volume: 0.25, envelope: 'sharp',
        notes: "[A2:0.5 A3:0.5]x8 [F2:0.5 F3:0.5]x8 [G2:0.5 G3:0.5]x8 [E2:0.5 E3:0.5]x8" },
      { channel: 'noise', volume: 0.22,
        notes: "[K:0.5 H:0.5 S:0.5 H:0.5]x15 S:0.25 S:0.25 S:0.5 S:0.5 S:0.5" }
    ]
  },
  win: {
    bpm: 180, loop: false,
    tracks: [
      { channel: 'pulse1', duty: 0.25, volume: 0.22, notes: "C5:0.5 E5:0.5 G5:0.5 C6:1.5 G5:0.5 C6:3" },
      { channel: 'triangle', volume: 0.3, notes: "C3:0.5 E3:0.5 G3:0.5 C4:1.5 G3:0.5 C3:3" },
      { channel: 'noise', volume: 0.25, notes: "S:0.5 S:0.5 S:0.5 K:1.5 S:0.5 K:3" }
    ]
  },
  lose: {
    bpm: 120, loop: false,
    tracks: [
      { channel: 'pulse1', duty: 0.5, volume: 0.2, notes: "E4 D#4 D4 C#4:3" },
      { channel: 'triangle', volume: 0.3, notes: "A2 G#2 G2 F#2:3" }
    ]
  }
};

function resources() {
  return {
    sprites: [
      Array(8).fill("00000000"), // 0: empty tile
      PADDLE_TOP, PADDLE_MID, PADDLE_BOTTOM,
      flash(PADDLE_TOP), flash(PADDLE_MID), flash(PADDLE_BOTTOM),
      // 7: ball, 4x4 in the middle of the sprite
      ["00000000", "00000000", "00011000", "00111100", "00111100", "00011000", "00000000", "00000000"],
      // 8: wall
      ["33333333", "11111111", "33333333", "33333333", "33333333", "33333333", "11111111", "33333333"],
      // 9, 10: net dashes, right edge of one tile and left edge of the next
      ["00000003", "00000003", "00000003", "00000003", "00000000", "00000000", "00000000", "00000000"],
      ["30000000", "30000000", "30000000", "30000000", "00000000", "00000000", "00000000", "00000000"]
    ],
    palette: PALETTE,
    tilemap: { rows: COURT, wrap: true }, // wraps so the ripple never shifts in an empty edge
    music: SONGS
  };
}

// Court
const SCREEN_WIDTH = 128;
const SPRITE_SIZE = 8;
const FIELD_TOP = 16;     // below the top wall
const FIELD_BOTTOM = 120; // above the bottom wall

// Paddles (collision box; the sprite is drawn PADDLE_INSET to the left)
const PADDLE_WIDTH = 4;
const PADDLE_HEIGHT = 24; // 3 segments
const PADDLE_INSET = 2;
const PLAYER_X = 8;
const CPU_X = SCREEN_WIDTH - 8 - PADDLE_WIDTH;
const PLAYER_SPEED = 120;      // px/s
const PADDLE_FLASH_TIME = 0.1; // seconds a paddle lights up after a hit

// Ball (collision box; the sprite is drawn BALL_INSET up and left)
const BALL_SIZE = 4;
const BALL_INSET = 2;
const SERVE_SPEED = 70;         // px/s, every point starts slow again
const SPEEDUP = 1.06;           // each paddle hit
const MAX_BALL_SPEED = 160;
const MAX_BOUNCE_ANGLE = Math.PI / 3; // hitting the paddle's edge sends the ball off at 60 degrees
const SPIN_ANGLE = 0.25;        // extra angle (radians) from moving the paddle while hitting
const SERVE_ANGLE = 0.4;        // serves leave at a random angle up to this

// Computer player: works out where the ball will arrive (bouncing off the walls), but misjudges
// it, more the longer the rally goes on, so long rallies end; it also moves at a limited speed
const CPU_SPEED = 70;           // px/s at the start of a rally
const CPU_SPEED_GAIN = 4;       // px/s faster per hit in the rally
const CPU_SPEED_MAX = 120;
const CPU_REACTION = 0.1;       // seconds between looks at the ball
const CPU_ERROR = 8;            // px of misjudgment at the start of a rally, chosen per return
const CPU_ERROR_GAIN = 1;       // px more per return in the rally
const CPU_AIM = 9;              // px off the paddle center it tries to hit with, for varied returns

// Match flow
const WIN_POINTS = 7;
const SERVE_DELAY = 0.8;  // ball blinks at the center before a serve
const POINT_DELAY = 1.0;  // pause after a point
const END_DELAY = 3.0;    // result screen before the game ends

// After a point the court flashes in the scorer's color (PAL) and ripples (LINE_SCROLL), both fading out
const PLAYER_COLOR = 0xFFE040;
const CPU_COLOR = 0xFF4040;
const RIPPLE_SIZE = 3;      // px at the start of the point pause
const RIPPLE_SPEED = 20;    // radians per second
const RIPPLE_WAVE = 0.35;   // radians per screen line

// Leaderboard score: points, plus every return, plus a win bonus
const POINT_SCORE = 100;
const RETURN_SCORE = 10;
const WIN_SCORE = 500;

let gameState;

// PAL takes RGB555: 5 bits per channel
function rgb(color) {
  return ((color >> 19) & 31) << 10 | ((color >> 11) & 31) << 5 | ((color >> 3) & 31);
}

// Blend two 0xRRGGBB colors, t = 0 gives a, 1 gives b
function mixColor(a, b, t) {
  const mix = (shift) => Math.round(((a >> shift) & 255) * (1 - t) + ((b >> shift) & 255) * t) << shift;
  return mix(16) | mix(8) | mix(0);
}

// Drawing helpers over console memory. The console clears OAM and TEXT before every update().
let spriteCount = 0;

function spr(id, x, y, flags) {
  if (spriteCount >= 64) return;
  const i = spriteCount++ * 4;
  OAM[i] = id;
  OAM[i + 1] = Math.floor(x); // whole pixels
  OAM[i + 2] = Math.floor(y);
  OAM[i + 3] = flags || 0;
}

function print(x, y, str) {
  str = String(str).toUpperCase();
  for (let i = 0; i < str.length; i++) {
    if (x + i >= 0 && x + i < 16 && y >= 0 && y < 16) TEXT[y * 16 + x + i] = 0x100 + str.charCodeAt(i);
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function newPaddle(x) {
  return { x, y: (FIELD_TOP + FIELD_BOTTOM - PADDLE_HEIGHT) / 2, vy: 0, flash: 0 };
}

// Put the ball in the middle, waiting to be served toward `dir` (-1 = player, 1 = CPU)
function resetBall(dir) {
  gameState.ball = {
    x: (SCREEN_WIDTH - BALL_SIZE) / 2, y: (FIELD_TOP + FIELD_BOTTOM - BALL_SIZE) / 2,
    dx: 0, dy: 0, speed: SERVE_SPEED, serveDir: dir
  };
  gameState.rally = 0;
  gameState.phase = 'serve';
  gameState.timer = SERVE_DELAY;
}

function serve() {
  const ball = gameState.ball;
  const angle = (Math.random() * 2 - 1) * SERVE_ANGLE;
  ball.dx = ball.serveDir * SERVE_SPEED * Math.cos(angle);
  ball.dy = SERVE_SPEED * Math.sin(angle);
  gameState.phase = 'play';
  rethinkCpu();
}

// Return the ball off a paddle: where it hits sets the angle, paddle movement adds spin
function returnBall(paddle, dir) {
  const ball = gameState.ball;
  const offset = (ball.y + BALL_SIZE / 2 - (paddle.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2 + BALL_SIZE / 2);
  const angle = clamp(clamp(offset, -1, 1) * MAX_BOUNCE_ANGLE + paddle.vy / PLAYER_SPEED * SPIN_ANGLE,
    -MAX_BOUNCE_ANGLE, MAX_BOUNCE_ANGLE);
  ball.speed = Math.min(ball.speed * SPEEDUP, MAX_BALL_SPEED);
  ball.dx = dir * ball.speed * Math.cos(angle);
  ball.dy = ball.speed * Math.sin(angle);
  paddle.flash = PADDLE_FLASH_TIME;
  gameState.rally++;
  // Hit pitch climbs with the rally, a semitone per return up to an octave
  return {
    slotId: 0, soundId: 'hit', channel: 'pulse1', duty: 0.25,
    frequency: 440 * Math.pow(2, Math.min(gameState.rally, 12) / 12),
    duration: 0.07, volume: 0.45, envelope: 'sharp'
  };
}

// Center y of the ball when it reaches x, folding its path back at each wall bounce
function predictBallY(x) {
  const ball = gameState.ball;
  const time = (x - (ball.x + BALL_SIZE)) / ball.dx;
  const span = FIELD_BOTTOM - BALL_SIZE - FIELD_TOP;
  let y = (ball.y - FIELD_TOP + ball.dy * Math.max(0, time)) % (2 * span);
  if (y < 0) y += 2 * span;
  if (y > span) y = 2 * span - y;
  return FIELD_TOP + y + BALL_SIZE / 2;
}

// New judgment for the CPU's next return: a misjudgment that grows with the rally, plus an aim
function rethinkCpu() {
  gameState.cpuError = (Math.random() * 2 - 1) * (CPU_ERROR + gameState.rally * CPU_ERROR_GAIN);
  gameState.cpuAim = (Math.random() * 2 - 1) * CPU_AIM;
}

function updateCpu(dt) {
  const cpu = gameState.cpu;
  const ball = gameState.ball;
  // Look at the ball only every CPU_REACTION seconds, then head for where it seems to be going
  gameState.cpuLook -= dt;
  if (gameState.cpuLook <= 0) {
    gameState.cpuLook = CPU_REACTION;
    gameState.cpuTarget = gameState.phase === 'play' && ball.dx > 0
      ? predictBallY(cpu.x) + gameState.cpuError + gameState.cpuAim
      : (FIELD_TOP + FIELD_BOTTOM) / 2; // drift back to the middle while the ball goes away
  }
  const speed = Math.min(CPU_SPEED + gameState.rally * CPU_SPEED_GAIN, CPU_SPEED_MAX);
  const gap = gameState.cpuTarget - (cpu.y + PADDLE_HEIGHT / 2);
  const step = clamp(gap, -speed * dt, speed * dt);
  cpu.vy = step / dt;
  cpu.y = clamp(cpu.y + step, FIELD_TOP, FIELD_BOTTOM - PADDLE_HEIGHT);
}

function update(deltaTime, input) {
  spriteCount = 0;
  // Capped so a hitch can't move the ball through a paddle
  const dt = Math.min(deltaTime, 1 / 30);

  if (!gameState) {
    gameState = {
      phase: 'title', timer: 0, blink: 0,
      player: newPaddle(PLAYER_X), cpu: newPaddle(CPU_X), ball: null,
      playerPoints: 0, cpuPoints: 0, score: 0, rally: 0,
      cpuLook: 0, cpuTarget: 0, cpuAim: 0, cpuError: 0, gameOver: false
    };
    resetBall(-1);
    gameState.phase = 'title';
  }

  const sounds = [];
  const ball = gameState.ball;
  const player = gameState.player;
  const cpu = gameState.cpu;
  gameState.blink += dt;
  player.flash = Math.max(0, player.flash - dt);
  cpu.flash = Math.max(0, cpu.flash - dt);

  if (gameState.phase === 'title') {
    if (input.aPressed) resetBall(-1);
  } else if (gameState.phase === 'serve' || gameState.phase === 'point') {
    gameState.timer -= dt;
    if (gameState.timer <= 0 && gameState.phase === 'serve') serve();
    else if (gameState.timer <= 0) {
      // After a point: the match ends at WIN_POINTS, otherwise serve to whoever lost it
      if (gameState.playerPoints >= WIN_POINTS || gameState.cpuPoints >= WIN_POINTS) {
        gameState.phase = 'over';
        gameState.timer = END_DELAY;
        if (gameState.playerPoints >= WIN_POINTS) gameState.score += WIN_SCORE;
      } else {
        resetBall(gameState.lastPointBy === 'player' ? 1 : -1);
      }
    }
  } else if (gameState.phase === 'over') {
    gameState.timer -= dt;
    if (gameState.timer <= 0) gameState.gameOver = true;
  }

  // Paddles move during serves and points too, so the player can line up
  if (gameState.phase !== 'title' && gameState.phase !== 'over') {
    const move = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    player.vy = move * PLAYER_SPEED;
    player.y = clamp(player.y + player.vy * dt, FIELD_TOP, FIELD_BOTTOM - PADDLE_HEIGHT);
    updateCpu(dt);
  }

  if (gameState.phase === 'play') {
    const prevX = ball.x;
    ball.x += ball.dx * dt;
    ball.y += ball.dy * dt;

    // Walls: put the ball back inside so it can't stick, then bounce
    if (ball.y < FIELD_TOP || ball.y + BALL_SIZE > FIELD_BOTTOM) {
      ball.y = clamp(ball.y, FIELD_TOP, FIELD_BOTTOM - BALL_SIZE);
      ball.dy = -ball.dy;
      sounds.push({ slotId: 1, soundId: 'wall', channel: 'pulse2', duty: 0.5, frequency: 220, duration: 0.04, volume: 0.3, envelope: 'sharp' });
    }

    // Paddles: hit when the ball crosses the paddle face this frame, so fast balls can't pass through
    const overlapsY = (paddle) => ball.y + BALL_SIZE > paddle.y && ball.y < paddle.y + PADDLE_HEIGHT;
    const playerFace = player.x + PADDLE_WIDTH;
    if (ball.dx < 0 && prevX >= playerFace && ball.x < playerFace && overlapsY(player)) {
      ball.x = playerFace;
      sounds.push(returnBall(player, 1));
      gameState.score += RETURN_SCORE;
      rethinkCpu();
    }
    if (ball.dx > 0 && prevX + BALL_SIZE <= cpu.x && ball.x + BALL_SIZE > cpu.x && overlapsY(cpu)) {
      ball.x = cpu.x - BALL_SIZE;
      sounds.push(returnBall(cpu, -1));
    }

    // Past a paddle: point to the other side
    if (ball.x + BALL_SIZE < 0 || ball.x > SCREEN_WIDTH) {
      const playerScored = ball.x > SCREEN_WIDTH;
      if (playerScored) {
        gameState.playerPoints++;
        gameState.score += POINT_SCORE;
        sounds.push({ slotId: 2, soundId: 'point', channel: 'pulse1', duty: 0.25, note: 'E5', arp: [0, 0, 0, 5, 5, 5, 12], duration: 0.3, volume: 0.4 });
      } else {
        gameState.cpuPoints++;
        sounds.push({ slotId: 2, soundId: 'miss', channel: 'pulse1', duty: 0.5, frequency: 330, sweep: { target: 110, time: 0.35, curve: 'exp' }, duration: 0.35, volume: 0.35, envelope: 'fade' });
      }
      gameState.lastPointBy = playerScored ? 'player' : 'cpu';
      gameState.phase = 'point';
      gameState.timer = POINT_DELAY;
      gameState.blink = 0;
    }
  }

  // Draw
  for (const paddle of [player, cpu]) {
    const top = paddle.flash > 0 ? SPRITE_PADDLE_TOP + SPRITE_FLASH_OFFSET : SPRITE_PADDLE_TOP;
    // Round once so the 3 segments stay joined (Math.floor(y + 16) can land a pixel past Math.floor(y) + 16)
    const y = Math.floor(paddle.y);
    spr(top, paddle.x - PADDLE_INSET, y);
    spr(top + 1, paddle.x - PADDLE_INSET, y + SPRITE_SIZE);
    spr(top + 2, paddle.x - PADDLE_INSET, y + SPRITE_SIZE * 2);
  }
  const ballBlinking = gameState.phase === 'serve' && Math.floor(gameState.timer * 8) % 2 === 1;
  if (gameState.phase === 'play' || (gameState.phase === 'serve' && !ballBlinking)) {
    spr(SPRITE_BALL, ball.x - BALL_INSET, ball.y - BALL_INSET);
  }

  // HUD: points on the row above the court; the side that just scored blinks
  const blinkOff = gameState.phase === 'point' && Math.floor(gameState.blink * 6) % 2 === 1;
  print(1, 0, "YOU");
  if (!(blinkOff && gameState.lastPointBy === 'player')) print(5, 0, gameState.playerPoints);
  if (!(blinkOff && gameState.lastPointBy === 'cpu')) print(10, 0, gameState.cpuPoints);
  print(12, 0, "CPU");

  // Point pause: flash and ripple the court, settling back by the next serve
  const fade = gameState.phase === 'point' ? gameState.timer / POINT_DELAY : 0; // 1 right after the point, 0 at the end
  if (fade > 0) {
    const scorerColor = gameState.lastPointBy === 'player' ? PLAYER_COLOR : CPU_COLOR;
    PAL[COURT_COLOR] = rgb(mixColor(PALETTE[COURT_COLOR], scorerColor, fade));
  } else {
    PAL[COURT_COLOR] = -1;
  }
  for (let line = 0; line < 128; line++) {
    const inCourt = line >= SPRITE_SIZE; // the HUD row stays still
    const wave = inCourt ? Math.sin(line * RIPPLE_WAVE - gameState.blink * RIPPLE_SPEED) * RIPPLE_SIZE * fade : 0;
    LINE_SCROLL[line * 2] = Math.round(wave);          // the net wobbles sideways
    LINE_SCROLL[line * 2 + 1] = Math.round(wave / 2);  // the walls bend up and down
  }

  let music = 'main';
  if (gameState.phase === 'title') {
    print(6, 5, "PONG");
    print(3, 8, "FIRST TO " + WIN_POINTS);
    if (Math.floor(gameState.blink * 2) % 2 === 0) print(4, 11, "PRESS A");
  } else if (gameState.phase === 'over') {
    const won = gameState.playerPoints >= WIN_POINTS;
    print(won ? 4 : 3, 6, won ? "YOU WIN!" : "YOU LOSE");
    print(2, 9, "SCORE " + gameState.score);
    music = won ? 'win' : 'lose';
  }

  return {
    music: music,
    score: gameState.score,
    gameOver: gameState.gameOver,
    sounds: sounds
  };
}
