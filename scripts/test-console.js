#!/usr/bin/env node
/**
 * Checks for the console layers (tilemap, text) and the music sequencer.
 *   node scripts/test-console.js
 */
import assert from 'assert/strict';
import { ConsoleState, checkTilemap, checkConsoleResources, checkCommands } from '../src/shared/console-state.js';
import { ConsoleRenderer } from '../src/shared/console-renderer.js';
import { MusicPlayer, parseSong } from '../src/shared/music.js';

const SOLID = (digit) => Array(8).fill(digit.repeat(8));
const sprites = [SOLID('0'), SOLID('1'), SOLID('2'), SOLID('3')];
const palette = [0x000000, 0xFFFFFF, 0xFF0000, 0x00FF00];
const WHITE = 0xFFFFFFFF, RED = 0xFF0000FF, GREEN = 0xFF00FF00, BLACK = 0xFF000000;

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log(`ok - ${name}`);
}

function render(resources, ...frames) {
  const state = new ConsoleState({ sprites, palette, ...resources });
  const renderer = new ConsoleRenderer();
  renderer.loadResources(sprites, palette);
  frames.forEach(f => state.apply(f));
  renderer.render(state);
  return { state, px: (x, y) => renderer.frame[y * 128 + x] };
}

test('tilemap draws and edits persist', () => {
  const { px } = render(
    { tilemap: { rows: ['0102', '0000'] } },
    { bg: [{ x: 0, y: 1, tileId: 3 }] },
    {} // edit stays after a frame without bg
  );
  assert.equal(px(0, 0), WHITE);
  assert.equal(px(8, 0), RED);
  assert.equal(px(0, 8), GREEN);
  assert.equal(px(16, 0), BLACK); // outside a non-wrapping map
});

test('tilemap follows scroll until bgScroll is sent', () => {
  const rows = ['01' + '00'.repeat(31)];
  const followed = render({ tilemap: { rows } }, { scroll: { x: 8, y: 0 } });
  assert.equal(followed.px(0, 0), BLACK);
  const pinned = render({ tilemap: { rows } }, { scroll: { x: 8, y: 0 }, bgScroll: { x: 0, y: 0 } });
  assert.equal(pinned.px(0, 0), WHITE);
});

test('wrapping tilemap repeats in both directions', () => {
  const { px } = render({ tilemap: { rows: ['0102'], wrap: true } }, { scroll: { x: -8, y: 8 } });
  assert.equal(px(0, 0), RED);   // tile x=-1 wraps to x=1, row wraps too
  assert.equal(px(8, 0), WHITE);
  assert.equal(px(16, 0), RED);
});

test('text layer ignores scroll, clears each frame, supports backing', () => {
  const shown = render({}, { scroll: { x: 50, y: 50 }, text: [{ x: 0, y: 0, text: 'a' }], textBg: 2 });
  assert.equal(shown.state.text[0], 0x141); // lowercase drawn as uppercase
  assert.equal(shown.px(0, 0), RED); // backing behind glyph
  assert.equal(shown.px(3, 0), WHITE); // top of the 'A' glyph
  const cleared = render({}, { text: [{ x: 0, y: 0, text: 'A' }] }, {});
  assert.equal(cleared.state.text[0], -1);
});

test('text is drawn above sprites, tilemap below sprites', () => {
  const { px } = render(
    { tilemap: { rows: ['01'] } },
    { sprites: [{ spriteId: 2, x: 0, y: 0 }], text: [{ x: 1, y: 0, tileId: 3 }] }
  );
  assert.equal(px(0, 0), RED);
  const over = render({}, { sprites: [{ spriteId: 2, x: 8, y: 0 }], text: [{ x: 1, y: 0, tileId: 3 }] });
  assert.equal(over.px(8, 0), GREEN);
});

test('games without new fields keep old state', () => {
  const { state } = render({}, { sprites: [], tiles: [{ x: 1, y: 1, tileId: 2 }] });
  assert.equal(state.tilemap, null);
  assert.equal(state.textBg, null);
  assert.equal(state.tiles[1 * 128 + 1], 2);
});

test('resource and command checks', () => {
  assert.equal(checkTilemap({ rows: ['0g'] }).includes('hex'), true);
  assert.equal(checkTilemap({ rows: ['010'] }).includes('2 hex'), true);
  assert.equal(checkTilemap({ rows: ['0102'], width: 999 }).includes('width'), true);
  assert.equal(checkTilemap({ rows: ['0102'] }), null);
  assert.match(checkConsoleResources({ music: { main: { tracks: [{ channel: 'pulse1', notes: 'H4' }] } } }), /music\.main.*bad note "H4"/);
  assert.equal(checkConsoleResources({ music: { main: { tracks: [{ channel: 'pulse1', notes: 'C4 Bb3:0.5 -:2' }] } } }), null);
  assert.match(checkCommands({ text: 'SCORE' }), /text that is not an array/);
});

test('music sequencer timing, looping and switching', () => {
  const { song } = parseSong({ bpm: 120, tracks: [{ channel: 'pulse1', notes: 'C4 -:1 E4:2' }] });
  assert.equal(song.tracks[0].notes.length, 3);

  const player = new MusicPlayer({ main: { bpm: 120, tracks: [{ channel: 'pulse1', notes: 'C4 -:1 E4:2' }] } });
  assert.equal(player.play('main'), true);
  assert.equal(player.play('main'), false); // same name keeps playing

  const started = [];
  for (let frame = 0; frame < 230; frame++) { // ~3.8s at 0.5s per beat: 2 loops of 4 beats
    for (const note of player.advance(1 / 60)) started.push({ frame, note: note.note });
  }
  assert.deepEqual(started.map(n => n.note), ['C4', 'E4', 'C4', 'E4']);
  // Within a frame of the beat boundary (float rounding of 1/60 steps)
  assert.ok(Math.abs(started[1].frame - 59) <= 1, `E4 at frame ${started[1].frame}`); // after 2 beats (1s)
  assert.ok(Math.abs(started[2].frame - 119) <= 1, `loop at frame ${started[2].frame}`); // after 4 beats (2s)

  player.play(null);
  assert.deepEqual(player.advance(1), []);

  const once = new MusicPlayer({ jingle: { loop: false, tracks: [{ channel: 'noise', notes: 'C4' }] } });
  once.play('jingle');
  assert.equal(once.advance(0.01).length, 1);
  assert.equal(once.advance(5).length, 0);
});

console.log(`\n${passed} passed`);
