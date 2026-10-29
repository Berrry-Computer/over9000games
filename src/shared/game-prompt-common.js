// Common prompt sections
function getFormatSection() {
  return `
<format>
You must create a single JavaScript file with three global functions: metadata(), resources(), and update().
</format>`;
}

function getExampleOutputs(pongSample, platformerSample) {
  return `
<example-output>
\`\`\`javascript
${pongSample}
\`\`\`
</example-output>

<example-output>
\`\`\`javascript
${platformerSample}
\`\`\`
</example-output>`;
}

function getRequirementsSection() {
  return `
<requirements>
- IMPORTANT: have to implement metadata(), resources(), update(deltaTime, input)
- IMPORTANT: implement fully functional game, make graphics/mechanics simple but fun
- **Sprites**: 8x8 pixels as array of 8 hex strings, each string represents one row
- **Sprite format**: \`["row0", "row1", ..., "row7"]\` where each row is an 8-character hex string
- **Hex format**: Each character (0-F) represents the palette index for that pixel
- **Color options**: Use palette indices 0-15, where 0 is typically transparent/background
- **update(deltaTime, input)**: called every frame; deltaTime is in SECONDS (~0.0167). Time everything with deltaTime, never Date.now()
- **Drawing: console memory**: put \`memory: 1\` in metadata() and draw by writing these global Int16Arrays inside update() (whole numbers; fractions are dropped, so Math.floor positions yourself or use the helpers)
  - \`OAM\`: 64 sprites x 4 values \`[spriteId, x, y, flags]\`; flags \`OAM_FLIP_H | OAM_FLIP_V\`; spriteId -1 = hidden; x/y are world pixels (screen = world - camera); later sprites draw on top; palette index 0 is transparent
  - \`TEXT\`: 16x16 screen grid, \`TEXT[y * 16 + x]\` = tile id (font letters are \`0x100 + char code\`, any sprite id works for hearts/icons), -1 = empty; it does not move with the camera
  - \`BG\`: tilemap edits \`[x, y, tileId]\` per edit, with the count in \`REGS[REG_BG_COUNT]\`; edited tiles stay changed (tileId 0 clears)
  - \`REGS\` registers keep their value until you change them: \`REGS[REG_CAM_X]\`, \`REGS[REG_CAM_Y]\` camera; \`REGS[REG_BG_COLOR]\` palette index behind everything; \`REGS[REG_TEXT_BG]\` solid backing behind text cells (-1 = none); \`REGS[REG_MAP_SCROLL] = 1\` with \`REG_MAP_X\`/\`REG_MAP_Y\` only if the tilemap should scroll differently from the sprites
  - \`PAL\`: one entry per palette index; \`PAL[i] = rgb(0xRRGGBB)\` shows another color for index i everywhere (sprites, tilemap, text, background) until set back to -1 (the resources() color). Use it for fades between screens (darken all 16), hit and score flashes, color cycling (water, lava, glowing crystals) and recoloring whole areas; copy \`rgb()\` and \`fadePalette()\` from the examples
  - \`LINE_SCROLL\`: 128 screen lines x \`[dx, dy]\`, added to the tilemap scroll on that line only (sprites and text don't move). Parallax: scroll the sky lines slower, e.g. \`LINE_SCROLL[line * 2] = Math.floor(camX / 2) - camX\` for lines showing background rows that hold no platforms; ripples and wavy water: small sine offsets. Set lines back to 0 when the effect ends
  - The console clears OAM, TEXT and the BG count before every update(), so draw everything each frame; REGS, PAL and LINE_SCROLL keep their values
  - Copy the helpers from the examples: \`spr(id, x, y, flags)\`, \`print(x, y, "SCORE 120")\`, \`tile(x, y, id)\`, \`cam(x, y)\`, and reset \`spriteCount = 0\` at the start of update()
  - Objects made of several sprites (tall paddles, 2-sprite characters): Math.floor the position ONCE and add the 8px offsets to that, otherwise the pieces can come apart by a pixel
- **update() returns**: \`{score, gameOver, music, sounds}\` - drawing goes through console memory, not the return value
- **Screen**: 128x128 pixels (16x16 cells of 8x8). Draw order, back to front: background color, tilemap, sprites, text
- **Tilemap (levels, mazes, boards)**: declare it once in resources() and the console keeps drawing it every frame
  - \`tilemap: {width, height, wrap, rows}\` - up to 256x256 tiles; rows is an array of strings with 2 hex chars per tile (\`"00"\` = empty, otherwise a sprite id 1-255)
  - Keep the rows in a module-level const so the game can use the same data for collisions (see platformer example)
  - Change tiles with \`tile(x, y, tileId)\` (tile coordinates) - only the tiles that changed this frame, up to 256 per frame
  - \`wrap: true\` repeats the map endlessly in both directions (endless runners, looping backgrounds)
- **Camera**: \`cam(x, y)\` in pixels moves the view over the world (sprites and tilemap); levels can scroll horizontally AND vertically
- **Text**: only A-Z, 0-9 and these symbols: ! # % ( ) * + , - . / : ; < = > ? [ ] (others show as blanks; print() uppercases); drawn in palette color 1, so keep palette[1] bright (e.g. white)
- **Input**: held state in input.up, input.down, input.left, input.right, input.a, input.b; just-pressed-this-frame in input.upPressed, input.downPressed, input.leftPressed, input.rightPressed, input.aPressed, input.bPressed (use these for shooting, menus, rotating pieces)
- **Design like the best NES games**: a title screen and a clear goal; difficulty that ramps up; danger that is easy to read (hazards contrast with the background); a short flashing invincibility after a hit; fades between screens and areas; lives with checkpoints rather than restarting from the beginning; a sound and a visual reaction (flash, ripple, pop) for every important event
- **Little text, like NES games**: the screen is only 16 characters wide, so let art and sound do the talking. HUD on ONE row (score, plus lives or health as icons or a short number like "X3"); no speed, height or debug readouts. Title screen: the name, at most two short lines (the goal or the main controls), and "PRESS A", all clear of the art. During play, text only as short banners ("READY", "LEVEL 2", "GAME OVER")
- **Start**: the game must not end before the player has pressed anything - e.g. show a title with "PRESS A" and start on input.aPressed (see examples)
- **Scoring**: Always include a score system - return current score as a number in update()
- **Game Over**: Include win/lose conditions - return gameOver: true when game ends; the console then shows the final score and leaderboard
- **Lives system**: If implementing lives, ensure game over triggers when lives reach 0, not below 0 (avoid stuck states)
- **Module-level gameState**: Use \`let gameState;\` not globalThis
- **Complex games**: Can have complex gameState (like Tetris boards, enemy arrays, etc.)
- **Music**: every game should have background music. Declare songs in resources() and pick one with \`music: 'name'\` in update() (\`null\` = silence); the console sequences the notes
  - \`music: {main: {bpm: 140, loop: true, tracks: [{channel: 'pulse1', notes: "E5 E5 -:0.5 C5:0.5 G5:2", volume: 0.2, envelope: 'soft'}, ...]}}\` - up to 4 tracks
  - notes are space separated \`NOTE[:beats]\` (C4, F#3, Bb2; \`-\` = rest; beats default 1); \`[C4:0.5 E4:0.5]x4\` repeats a group (groups can nest)
  - noise tracks have a drum kit: \`K\` kick, \`S\` snare, \`H\` hi-hat, \`O\` open hat, e.g. \`"[K:0.5 H:0.5 S:0.5 H:0.5]x8"\`
  - fun NES songs use all 4 channels: lead melody on pulse1, fast chord arpeggios (16th notes, low volume) on pulse2, bass bouncing between octaves on triangle (A2:0.5 A3:0.5, keep it at octave 2-3 or higher), drums on noise; end sections with a drum fill
  - keep every track of a looping song the same total beats so they stay in step
  - tracks take the sound effect voice options below (\`duty\`, \`period\`, \`vibrato\`, \`arp\`, \`vol\`), e.g. a 0.25 duty lead with light vibrato, or a noise drum track with \`period: 12\`
  - sending the same song name every frame keeps it playing; a new name switches songs (e.g. 'title', 'level', 'boss', a non-looping 'death' jingle)
- **Sound effects**: \`sounds: [{slotId: 0-7, soundId, channel: 'pulse1'|'pulse2'|'triangle'|'noise', note: 'C4' or frequency: Hz, duration: seconds, volume: 0-1, envelope: 'sharp'|'soft'|'fade'|'sustain'}]\`
  - Optional: \`sweep: {target: Hz, time: seconds, curve: 'linear'|'exp'}\` for pitch slides ('exp' sounds like NES), \`vibrato: {rate: Hz, depth: semitones}\`
  - Pulse \`duty: 0.125|0.25|0.5|0.75\`: 0.125 and 0.25 are the thin, buzzy NES sound; 0.5 is a hollow square
  - Noise \`period: 0-15\` sets the pitch (0 thin hiss for hi-hats/sparks, 8 crunch, 12-15 deep rumble for explosions); \`mode: 'periodic'\` turns noise into a metallic buzz
  - Per-frame macros, one value per 1/60s that holds the last value (\`macroLoop: true\` repeats): \`arp: [0, 0, 0, 5]\` semitone offsets (two-note coin chimes, 1-up jingles, fast chord arpeggios), \`vol: [1, 0.7, 0.4, 0.2]\` volume steps (replaces the envelope)
  - Send an effect once when it happens; it plays for its duration. Sending the same soundId again keeps it playing, a new soundId restarts the slot, soundId: null stops it
  - \`loop: true\` keeps a sound (engine hum, alarm) playing while you keep sending its soundId every frame; it stops the first frame you don't
</requirements>`;
}

// Common prompt creation function that accepts sample code as parameters
export function createGameGenerationPromptWithSamples(description, pongSample, platformerSample) {
  try {
    return `${getFormatSection()}${getExampleOutputs(pongSample, platformerSample)}${getRequirementsSection()}

<task>
Create a single JavaScript file following the exact same structure for: "${description}"
</task>
`;

  } catch (error) {
    console.error("Error creating game generation prompt:", error);
    console.error("Error stack:", error.stack);
    throw error;
  }
}

// Edit prompt creation function
export function createGameEditPromptWithSamples(editDescription, previousGame, pongSample, platformerSample) {
  try {
    return `${getFormatSection()}${getExampleOutputs(pongSample, platformerSample)}

<current-game>
GAME TO EDIT:
Title: ${previousGame.metadata?.title || 'Unknown Game'}
Description: ${previousGame.metadata?.description || 'No description'}
Original Request: ${previousGame.description || 'No original description'}

\`\`\`javascript
${previousGame.gameCode}
\`\`\`
</current-game>${getRequirementsSection()}

<task>
Edit the existing game based on this request: "${editDescription}"

Keep the same basic structure and game mechanics unless specifically asked to change them.
If the game has no \`memory: 1\` in metadata() it draws by returning sprites/text/bg/scroll from update(): convert ALL of its drawing to console memory and add \`memory: 1\` (a game with memory: 1 ignores returned sprites/text/bg/scroll).
Return the complete modified game code, not just the changes.
</task>
`;

  } catch (error) {
    console.error("Error creating game edit prompt:", error);
    console.error("Error stack:", error.stack);
    throw error;
  }
}

// Follow-up turn when a generated game fails to start in the headless console
export function createFixPrompt(failure) {
  return `
<test-result>
The game you wrote failed when the console ran it with scripted input (1s idle, then start, run, jump, fire):
${failure}
</test-result>

<task>
Fix the problem and return the complete corrected game as a single \`\`\`javascript block with metadata(), resources(), and update().
The game must not end before the player has pressed anything.
</task>
`;
}

// Follow-up turn after the game ran: the model looks at screenshots and fixes what looks wrong
export const REVIEW_OK = 'LOOKS GOOD';

export function createReviewPrompt(labels) {
  return `
<screenshots>
The game runs. The console played it with scripted input (1s idle, then A, run right, run left, up, down, B) and took these screenshots, enlarged 4x:
${labels.map((label, i) => `${i + 1}. ${label}`).join('\n')}
</screenshots>

<task>
Look at the screenshots as a player seeing the game for the first time:
- Is the title readable and does it say how to start?
- Can you see and recognize the player, enemies and items, and does the art look like what it is meant to be?
- Is any text cut off, overlapping or unreadable against what is behind it?
- Is there too much text? The HUD should fit on one row and the title should be the name, at most two short lines and how to start
- Is the screen empty, black, garbled, or missing its background or level?
- Does the HUD show the score (and lives or health if the game has them)?
- Does it look like a polished NES game?

If everything looks right, reply with only: ${REVIEW_OK}
Otherwise fix the problems and return the complete corrected game as a single \`\`\`javascript block.
</task>
`;
}

export function parseMarkdownResponse(response) {
  // Extract single JavaScript block (global functions format)
  const jsMatch = response.match(/```javascript\s*([\s\S]*?)\s*```/);
  if (!jsMatch) {
    throw new Error("No JavaScript block found in response");
  }

  const gameCode = jsMatch[1].trim();
  console.log("Extracted JavaScript code:", gameCode.substring(0, 200) + "...");

  // Return the raw game code with isPublished: false for generated games
  return {
    gameCode,
    isPublished: false
  };
}