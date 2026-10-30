# RES-9000 - NES-Style Game Console for Reddit

A retro 8-bit game console built on Reddit's Devvit platform. Describe a game in plain words and an AI writes it; the console runs it in a sandbox inside the Reddit post, with NES-style graphics, music and a leaderboard.

## Console Specifications

### Display
- **Resolution**: 128×128 pixels (16×16 cells of 8×8)
- **Colors**: 16 per game (4-bit palette), changeable at runtime
- **Layers, back to front**: background color → tilemap → legacy tiles → sprites → text
- **Sprites**: 8×8, up to 64 on screen, horizontal/vertical flip
- **Tilemap**: up to 256×256 tiles, kept by the console between frames, optional wrap-around; scrolls in both directions
- **Text layer**: 16×16 HUD grid with a built-in font (`0x100 + char code`), fixed to the screen
- **Raster effects**: per-scanline tilemap offsets (`LINE_SCROLL`) for parallax and ripples, palette overrides (`PAL`) for fades, flashes and color cycling

### Input
- **Controls**: D-pad + A/B buttons; on-screen D-pad and buttons on touch devices
- **Keyboard**: arrows = D-pad, **X = A**, **Z = B**, Space = pause (shows high scores), Enter = restart, Esc = close menu
- Games see held state (`input.a`) and just-pressed edges (`input.aPressed`)

### Audio
- **Channels**: pulse1, pulse2, triangle, noise
- **Sound effects**: 8 slots; notes or frequencies, envelope presets (sharp/soft/fade/sustain), pulse `duty`, noise `period` 0-15 and periodic mode, exponential sweeps, `vibrato`, per-frame `arp`/`vol` macros, `loop`
- **Music**: songs declared in `resources().music` and sequenced by the console: up to 4 tracks, `NOTE[:beats]` strings, `[ ... ]xN` repeats, a K/S/H/O drum kit on noise tracks, the same voice options as sound effects
- Audio pauses with the game; sounds are dropped (not queued) while the browser has audio suspended

## Technology Stack

- [Devvit](https://developers.reddit.com/) (Devvit Web): Reddit's developer platform
- [Express](https://expressjs.com/): backend API server
- [QuickJS](https://bellard.org/quickjs/) via `quickjs-emscripten`: sandboxed execution of generated games
- HTML5 Canvas: rendering
- Web Audio API: sound synthesis
- OpenAI Responses API: game generation (OpenRouter for local model testing)
- Redis: jobs, drafts, leaderboards
- [Vite](https://vitejs.dev/): client and server builds with WebAssembly support

## Writing a Game

Games are a single JavaScript file with three global functions. New games use **console memory**: set `memory: 1` in `metadata()` and draw by writing global `Int16Array`s, like writing to NES video memory.

```javascript
function metadata() {
  return { title: "My Game", description: "A fun retro game", memory: 1,
           controls: [{ key: "arrows", action: "move" }, { key: "A", action: "jump" }] };
}

function resources() {
  return {
    sprites: [["00111100", "01111110", /* 8 rows of hex palette indices */]],
    palette: [0x000000, 0xFFFFFF, /* up to 16 colors */],
    tilemap: { width: 64, height: 16, rows: ["0000060606...", /* 2 hex chars per tile */] },
    music: { main: { bpm: 140, loop: true, tracks: [{ channel: 'pulse1', notes: "E5 E5 -:0.5 C5:0.5 G5:2" }] } }
  };
}

let gameState;
function update(deltaTime, input) {   // deltaTime in seconds
  spriteCount = 0;
  // ... game logic ...
  spr(0, player.x, player.y);         // OAM: [spriteId, x, y, flags] × 64
  print(0, 0, "SCORE " + score);      // TEXT: 16×16 grid of tile ids
  cam(cameraX, 0);                    // REGS: camera, background color, ...
  return { score, gameOver: false, music: 'main', sounds: [] };
}
```

The helpers `spr()`, `print()`, `tile()`, `cam()`, `rgb()` and `fadePalette()` are not built in; they live in the sample games (`src/shared/test-games/pong.js`, `platformer.js`), which are also the examples the AI learns from.

### Console memory regions
| Region | Size | Contents | Cleared each frame |
|---|---|---|---|
| `OAM` | 64 × 4 | `[spriteId, x, y, flags]`, flags `OAM_FLIP_H`/`OAM_FLIP_V`, id -1 = hidden | yes |
| `TEXT` | 16 × 16 | tile id per cell, -1 = empty | yes |
| `BG` | edits | `[x, y, tileId]` tilemap edits, count in `REGS[REG_BG_COUNT]` | count only; edits persist |
| `REGS` | registers | camera, background color, text backing, separate tilemap scroll | no |
| `PAL` | 16 | RGB555 color per palette index, -1 = the `resources()` color | no |
| `LINE_SCROLL` | 128 × 2 | `[dx, dy]` added to the tilemap scroll on each screen line | no |

The buffer header lists each region's id, offset and length (`MEMORY_REGIONS` in `src/shared/game-runner-common.js`), so regions can be added without breaking games.

### Older games
Games without `memory` return a state object from `update()` instead (`sprites`, `tiles`, `scroll`, `background`, `score`, `sounds`, `gameOver`) and render exactly as they always did. `scripts/golden-frames.js` checks that old games stay pixel-identical.

### Rules of thumb
- Trigger game over when lives reach 0, not below.
- The game must not end before the player presses anything (title screen with "PRESS A").
- Keep text short: a one-row HUD and a short title. The screen is 16 characters wide.

## AI Game Generation

```
"make a snake game"
   │
   ▼
POST /api/game/generate ──► job in Redis ──► OpenAI Responses API (background request)
   │                                              │
client polls GET /api/jobs/:id ◄──────────────────┘
   │
   ├─ smoke test: the server runs the game headlessly with scripted input
   │     fails to start → error sent back to the model to fix (a few attempts)
   ├─ screenshot review: 3 screenshots (title, play, end) sent to the model,
   │     which replies LOOKS GOOD or returns a fixed game
   │     (if the revision fails, the reviewed game is kept)
   └─ completed → game code to the client → QuickJS sandbox
```

- The prompt (`src/shared/game-prompt-common.js`) contains both sample games plus the console API and NES design guidance.
- Polling drives the job: each poll checks the OpenAI response, so no background worker is needed within Reddit's request time limits.
- A typical generation takes 1.5-2 minutes including the review.

## Getting Started

### Prerequisites
- Node.js 22+
- Reddit developer account
- OpenAI API key (set as the `openAIKey` app setting)

### Setup
1. `npm install`
2. `npm run login` - authenticate with Reddit
3. Configure the `openAIKey` secret in the Devvit app settings
4. `npm run dev` - build, watch and playtest on the development subreddit

### Commands

#### Development
- `npm run dev`: client + server watch and Devvit playtest (auto-uploads on change)
- `npm run dev:client` / `npm run dev:server`: watch one side only
- `npm run dev:devvit`: Devvit playtest only
- `npm run testbed`: build and run the local testbed at http://localhost:3000
- `npm run testbed:dev`: testbed with watch mode

#### Building & Deployment
- `npm run build`: build client and server
- `npm run build:client` / `npm run build:server` / `npm run build:client:testbed`
- `npm run deploy`: upload a new version to Reddit (does not publish)
- `npm run launch`: upload and file a publish request for review
- `npm run type-check`: TypeScript check

#### Releasing
1. Update `devvit` and `@devvit/web` when the developer portal says a new Devvit version is out (versions on an old API are flagged in review)
2. `npx devvit publish` (or `npm run launch`): builds, bumps the version, uploads a source zip and files it for review. It asks interactively about the source upload, so run it in a terminal. The zip honors the root `.gitignore`
3. Reddit reviews apps that create custom posts and emails when approved; `npx devvit publish --withdraw` withdraws a pending request
- The app's listing links to [Terms](docs/TERMS.md) and [Privacy Policy](docs/PRIVACY.md), which apps using external HTTP need; keep them in step with what the server stores and sends
- `assets/icon.png` should be 1024×1024 (currently 256×256, which only warns)

#### Testing
- `node scripts/test-console.js`: tilemap, text layer, memory regions, palette, line scroll and music sequencer tests
- `node scripts/golden-frames.js --check scripts/goldens.json src/shared/test-games/`: sample games render the recorded frames (`--record` to update after an intended change)
- `node scripts/test-generation.js --model "openai/gpt-6.1-sol" --prompt "snake game"`: generate through OpenRouter, including the smoke test and screenshot review; `--models a,b` compares models. Needs `OPENROUTER_API_KEY`; results go to `./generated-games/`

### Local testbed
`src/testbed/` runs the real server with Devvit APIs mocked through Node.js ESM loader hooks (Reddit context, media uploads, Redis), so games and generation can be tested without uploading. The testbed reads the sample games at startup; restart it after editing them.

## API Endpoints

### Game Generation
- `POST /api/game/generate`: create a generation job (returns jobId)
- `POST /api/game/edit`: create an editing job for an existing game
- `GET /api/jobs/:jobId`: poll status (`progress`, `fixAttempts`, `reviewing`) and get the finished game
- `POST /api/game/test`: load a sample game by name (`gameName`)

### Leaderboard
- `POST /api/score/submit`: submit a score
- `GET /api/leaderboard`: top 10 for the current post

### Drafts
- `GET /api/drafts`: list the user's drafts (max 20)
- `POST /api/drafts`: create a draft
- `GET /api/drafts/:draftId`: draft with version history
- `PUT /api/drafts/:draftId`: save a new version (max 10)
- `DELETE /api/drafts/:draftId`: delete a draft
- `POST /api/drafts/:draftId/publish`: publish a draft as a Reddit post

### Posts
- `POST /api/post/create`: create a game post with a screenshot
- `POST /api/comment/post`: comment on a post
- `GET /api/init`: app state and user context

### App Integration
- `POST /internal/on-app-install`: install handler
- `POST /internal/menu/post-create`: create a game post from the subreddit menu
- `POST /internal/menu/migrate-screenshots`: generate screenshots for old posts (moderators)
- `POST /api/admin/migrate-screenshots`: admin endpoint for screenshot migration

## Security & Sandboxing
- Generated code runs only inside QuickJS (WebAssembly): no DOM, network or file access
- Time budgets: the client stops a game whose loading takes over 2s or whose `update()` call takes over 250ms (a stuck loop shows "Game crashed" instead of freezing the tab); the server's smoke test uses the same mechanism. No memory limit is set
- Resources (sprites, palette, tilemap, music) are validated before a game runs; errors name the bad sprite or row
- The client bundles only the release-sync QuickJS build; the server uses the single-file build of the same variant

## Project Structure

### Client (`src/client/`)
- `main.js`: console UI, game creation, drafts, posting
- `splash-main.js`: splash screen (default post entry)
- `game-runner.js`: QuickJS game loop, input, pause/resume, leaderboard overlay
- `audio/audio-manager.js`: 4-channel NES-style synthesis and music playback

### Server (`src/server/`)
- `index.js`: Express routes and Devvit integration
- `job-manager.js`: Redis job queue (fix attempts, review state)
- `responses-api.js`: OpenAI Responses API calls: generate, fix, screenshot review
- `draft-manager.js`: drafts with version history
- `headless-game-runner.js`: server-side runner for smoke tests and screenshots
- `screenshot-renderer.js`: PNG encoding
- `core/post.js`: Reddit post creation

### Shared (`src/shared/`)
- `console-state.js`: video layers, console memory decoding, resource validation
- `console-renderer.js`: pixel renderer used by the client, server screenshots and tests
- `game-runner-common.js`: QuickJS executor, memory layout and prelude
- `music.js`: song parsing and note sequencing
- `bitmap-font.js`: built-in font
- `game-prompt-common.js` / `game-prompt.js`: generation, fix and review prompts; response parsing
- `game-schema.js`: game validation
- `test-games/`: sample games (`pong.js`, `platformer.js`)

### Testbed and scripts
- `src/testbed/`: local server, loader hooks and Devvit mocks
- `scripts/`: console tests, golden frames, generation testing

### Configuration
- `devvit.json`: entry points (`splash.html` inline, `index.html` tall), menu items, permissions
- `package.json`: scripts and dependencies
