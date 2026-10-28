function metadata() {
  return {
    title: "Pong NES",
    description: "A classic Pong game with two paddles and a ball",
    memory: 1, // draws by writing console memory (OAM, TEXT, REGS) instead of returning sprites
    controls: [
      {key: "up", action: "move player 1 paddle up"},
      {key: "down", action: "move player 1 paddle down"},
      {key: "a", action: "serve the ball"}
    ]
  };
}

function resources() {
  return {
    sprites: [
      // Sprite 0: Solid white paddle segment
      [
        "11111111",
        "11111111",
        "11111111",
        "11111111",
        "11111111",
        "11111111",
        "11111111",
        "11111111"
      ],
      // Sprite 1: Rounded paddle top with black corners
      [
        "00111100",
        "01111110",
        "11111111",
        "11111111",
        "11111111",
        "11111111",
        "11111111",
        "11111111"
      ],
      // Sprite 2: Rounded paddle bottom with black corners
      [
        "11111111",
        "11111111",
        "11111111",
        "11111111",
        "11111111",
        "11111111",
        "01111110",
        "00111100"
      ],
      // Sprite 3: Red ball with circular shape
      [
        "00000000",
        "00222200",
        "02222220",
        "22222222",
        "22222222",
        "02222220",
        "00222200",
        "00000000"
      ]
    ],
    palette: [0x000000, 0xFFFFFF, 0xFF0000],
    // Background music: the console plays the notes, update() just names the song
    music: {
      main: {
        bpm: 150,
        tracks: [
          { channel: 'pulse1', volume: 0.12, envelope: 'soft', notes: "E4 G4 A4:2 G4 E4 D4:2 C4 D4 E4 G4 A4:3 -" },
          { channel: 'triangle', volume: 0.2, envelope: 'sustain', notes: "A2:2 A2:2 G2:2 G2:2 F2:2 F2:2 E2:2 E2:2" }
        ]
      }
    }
  };
}

// Game constants
const SCREEN_WIDTH = 128;
const SCREEN_HEIGHT = 128;
const SPRITE_SIZE = 8;
const PADDLE_HEIGHT = 32; // 4 sprites tall
const PADDLE_WIDTH = SPRITE_SIZE;
const PADDLE_MARGIN = 4;
const BALL_SIZE = SPRITE_SIZE;

// Movement speeds (pixels per second)
const PLAYER_SPEED = 120;
const AI_SPEED = 100;
const BALL_SPEED = 60;

// Game timing
const GAME_DURATION = 120; // 2 minutes in seconds

// Scoring
const HIT_SCORE = 1;
const WIN_SCORE = 10;

let gameState;

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

function update(deltaTime, input) {
  spriteCount = 0;

  // Initialize game state if needed
  if (!gameState) {
    gameState = {
      player1: { x: PADDLE_MARGIN, y: SCREEN_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
      player2: { x: SCREEN_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, y: SCREEN_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
      ball: { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2, dx: BALL_SPEED, dy: BALL_SPEED },
      score: 0,
      gameOver: false,
      started: false,
      playTime: 0 // seconds, accumulated from deltaTime
    };
  }

  const sounds = [];

  // Title screen: wait for the player before serving the ball
  if (!gameState.started) {
    if (input.aPressed) {
      gameState.started = true;
    }
    print(4, 6, "PONG NES");
    print(4, 9, "PRESS A");
    return { score: 0, gameOver: false };
  }

  // Don't update if game is over
  if (gameState.gameOver) {
    return { score: gameState.score, gameOver: true };
  }

  // Player 1 controls
  const maxPlayerY = SCREEN_HEIGHT - PADDLE_HEIGHT;
  if (input.up && gameState.player1.y > 0) gameState.player1.y -= PLAYER_SPEED * deltaTime;
  if (input.down && gameState.player1.y < maxPlayerY) gameState.player1.y += PLAYER_SPEED * deltaTime;

  // Player 2 controls (AI) - target center of paddle
  const player2Center = gameState.player2.y + PADDLE_HEIGHT / 2;
  const deadZone = 4;
  if (gameState.ball.y < player2Center - deadZone) gameState.player2.y -= AI_SPEED * deltaTime;
  if (gameState.ball.y > player2Center + deadZone) gameState.player2.y += AI_SPEED * deltaTime;
  // Keep AI paddle in bounds
  if (gameState.player2.y < 0) gameState.player2.y = 0;
  if (gameState.player2.y > maxPlayerY) gameState.player2.y = maxPlayerY;

  // Update ball position using deltaTime
  gameState.ball.x += gameState.ball.dx * deltaTime;
  gameState.ball.y += gameState.ball.dy * deltaTime;

  // Ball collision with top and bottom
  const maxBallY = SCREEN_HEIGHT - BALL_SIZE;
  if (gameState.ball.y <= 0 || gameState.ball.y >= maxBallY) {
    gameState.ball.dy *= -1;
    // Wall bounce sound
    sounds.push({
      slotId: 0,
      soundId: 'wall',
      channel: 'pulse2',
      frequency: 200,
      duration: 0.05,
      volume: 0.3,
      envelope: 'sharp'
    });
  }

  // Ball collision with paddles
  const ballRight = gameState.ball.x + BALL_SIZE;
  const ballBottom = gameState.ball.y + BALL_SIZE;
  const player1Right = gameState.player1.x + PADDLE_WIDTH;
  const player1Bottom = gameState.player1.y + PADDLE_HEIGHT;
  const player2Bottom = gameState.player2.y + PADDLE_HEIGHT;

  // Check collision with player 1 paddle (left side)
  if (gameState.ball.dx < 0 && // Ball moving left
      gameState.ball.x <= player1Right &&
      ballRight >= gameState.player1.x &&
      ballBottom >= gameState.player1.y &&
      gameState.ball.y <= player1Bottom) {
    gameState.ball.dx = Math.abs(gameState.ball.dx); // Always bounce right
    gameState.ball.x = player1Right; // Move ball outside paddle
    gameState.score += HIT_SCORE;
    // Paddle hit sound
    sounds.push({
      slotId: 1,
      soundId: 'hit',
      channel: 'pulse1',
      frequency: 400,
      duration: 0.08,
      volume: 0.5,
      envelope: 'sharp'
    });
  }

  // Check collision with player 2 paddle (right side)
  if (gameState.ball.dx > 0 && // Ball moving right
      ballRight >= gameState.player2.x &&
      gameState.ball.x <= gameState.player2.x + PADDLE_WIDTH &&
      ballBottom >= gameState.player2.y &&
      gameState.ball.y <= player2Bottom) {
    gameState.ball.dx = -Math.abs(gameState.ball.dx); // Always bounce left
    gameState.ball.x = gameState.player2.x - BALL_SIZE; // Move ball outside paddle
    gameState.score += HIT_SCORE;
    // Paddle hit sound
    sounds.push({
      slotId: 1,
      soundId: 'hit',
      channel: 'pulse1',
      frequency: 400,
      duration: 0.08,
      volume: 0.5,
      envelope: 'sharp'
    });
  }

  // Check for game over conditions
  const ballOffsetMargin = 10;
  if (gameState.ball.x < -ballOffsetMargin) {
    // Ball went off left side - AI wins, game over
    gameState.gameOver = true;
  } else if (gameState.ball.x > SCREEN_WIDTH + ballOffsetMargin) {
    // Ball went off right side - Player wins, bonus points
    gameState.score += WIN_SCORE;
    // Reset ball for continued play
    gameState.ball.x = SCREEN_WIDTH / 2;
    gameState.ball.y = SCREEN_HEIGHT / 2;
    gameState.ball.dx = -BALL_SPEED;
    gameState.ball.dy = BALL_SPEED;
    // Score sound
    sounds.push({
      slotId: 2,
      soundId: 'score',
      channel: 'pulse1',
      note: 'E5',
      duration: 0.15,
      volume: 0.6,
      envelope: 'sustain'
    });
  }

  // Game over after specified duration
  gameState.playTime += deltaTime;
  if (gameState.playTime > GAME_DURATION) {
    gameState.gameOver = true;
  }


  // Paddles: rounded top, two middle segments, rounded bottom
  for (const paddle of [gameState.player1, gameState.player2]) {
    spr(1, paddle.x, paddle.y);
    spr(0, paddle.x, paddle.y + SPRITE_SIZE);
    spr(0, paddle.x, paddle.y + SPRITE_SIZE * 2);
    spr(2, paddle.x, paddle.y + SPRITE_SIZE * 3);
  }
  spr(3, gameState.ball.x, gameState.ball.y);

  // HUD on the text layer (16x16 screen grid)
  print(1, 0, "SCORE:" + gameState.score);

  return {
    music: 'main',
    score: gameState.score,
    gameOver: gameState.gameOver,
    sounds: sounds
  };
}
