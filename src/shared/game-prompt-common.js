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
- **update() returns**: \`{sprites, text, bg, scroll, bgScroll, background, music, sounds, score, gameOver}\` - all optional except sprites
- **Screen**: 128x128 pixels (16x16 cells of 8x8). Draw order, back to front: background color, tilemap, sprites, text
- **Sprites**: up to 64 per frame, \`{spriteId, x, y, flipH, flipV}\`; x/y are world pixels (screen = world - scroll); palette index 0 is transparent
- **Tilemap (levels, mazes, boards)**: declare it once in resources() and the console keeps drawing it every frame
  - \`tilemap: {width, height, wrap, rows}\` - up to 256x256 tiles; rows is an array of strings with 2 hex chars per tile (\`"00"\` = empty, otherwise a sprite id 1-255)
  - Keep the rows in a module-level const so the game can use the same data for collisions (see platformer example)
  - Change tiles with \`bg: [{x, y, tileId}]\` (tile coordinates, tileId 0 clears) - send only the tiles that changed this frame, they stay changed
  - \`wrap: true\` repeats the map endlessly in both directions (endless runners, looping backgrounds)
- **Camera**: \`scroll: {x, y}\` in pixels moves the view over the world (sprites and tilemap); levels can scroll horizontally AND vertically. Use \`bgScroll: {x, y}\` only if the tilemap should scroll differently from the sprites
- **Text layer (HUD, titles, messages)**: \`text: [{x, y, text: "SCORE 120"}]\` on the 16x16 screen grid; it does not move with scroll, cleared every frame
  - Only A-Z, 0-9 and these symbols: ! # % ( ) * + , - . / : ; < = > ? [ ] (other characters show as blanks); drawn in palette color 1, so keep palette[1] bright (e.g. white)
  - \`{x, y, tileId}\` puts any sprite (hearts, icons) on the grid; \`textBg: <palette index>\` gives text cells a solid backing so they stay readable over the level
- **Background**: \`background: <palette index>\` fills the screen behind everything
- **Input**: held state in input.up, input.down, input.left, input.right, input.a, input.b; just-pressed-this-frame in input.upPressed, input.downPressed, input.leftPressed, input.rightPressed, input.aPressed, input.bPressed (use these for shooting, menus, rotating pieces)
- **Start**: the game must not end before the player has pressed anything - e.g. show a title with "PRESS A" and start on input.aPressed (see examples)
- **Scoring**: Always include a score system - return current score as a number in update()
- **Game Over**: Include win/lose conditions - return gameOver: true when game ends; the console then shows the final score and leaderboard
- **Lives system**: If implementing lives, ensure game over triggers when lives reach 0, not below 0 (avoid stuck states)
- **Module-level gameState**: Use \`let gameState;\` not globalThis
- **Complex games**: Can have complex gameState (like Tetris boards, enemy arrays, etc.)
- **Music**: every game should have background music. Declare songs in resources() and pick one with \`music: 'name'\` in update() (\`null\` = silence); the console sequences the notes
  - \`music: {main: {bpm: 140, loop: true, tracks: [{channel: 'pulse1', notes: "E5 E5 -:0.5 C5:0.5 G5:2", volume: 0.2, envelope: 'soft'}, ...]}}\` - up to 4 tracks
  - notes are space separated \`NOTE[:beats]\` (C4, F#3, Bb2; \`-\` = rest; beats default 1); typical: melody on pulse1, bass on triangle, drums on noise
  - sending the same song name every frame keeps it playing; a new name switches songs (e.g. 'title', 'level', 'boss', a non-looping 'death' jingle)
- **Sound effects**: \`sounds: [{slotId: 0-7, soundId, channel: 'pulse1'|'pulse2'|'triangle'|'noise', note: 'C4' or frequency: Hz, duration: seconds, volume: 0-1, envelope: 'sharp'|'soft'|'fade'|'sustain'}]\`
  - Optional: \`sweep: {target: Hz, time: seconds}\` for pitch slides, \`mode: 'random'|'periodic'\` for noise
  - Send an effect once when it happens; it plays for its duration. Sending the same soundId again keeps it playing, a new soundId restarts the slot, soundId: null stops it
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