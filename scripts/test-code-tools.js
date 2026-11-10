#!/usr/bin/env node
/**
 * Checks for the code tools the model uses to edit games (src/shared/code-tools.js).
 *   node scripts/test-code-tools.js
 */
import assert from 'assert/strict';
import { runCodeTool, runCodeTools, CODE_TOOLS, toChatTools, outlineCode } from '../src/shared/code-tools.js';

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log(`ok - ${name}`);
}

const CODE = `const SPEED = 2;
function update(deltaTime, input) {
  x += SPEED;
  y += SPEED;
  return { score };
}`;

test('replace_code replaces one exact match', () => {
  const { code, output } = runCodeTool(CODE, 'replace_code', { old_string: 'const SPEED = 2;', new_string: 'const SPEED = 5;' });
  assert.ok(code.startsWith('const SPEED = 5;'));
  assert.match(output, /Replaced 1 occurrence \(first at line 1\)/);
});

test('replace_code refuses missing and ambiguous matches, and leaves the code alone', () => {
  const missing = runCodeTool(CODE, 'replace_code', { old_string: 'const SPEED = 3;', new_string: 'x' });
  assert.equal(missing.code, CODE);
  assert.match(missing.output, /^Error: old_string not found/);

  const twice = runCodeTool(CODE, 'replace_code', { old_string: '+= SPEED;', new_string: '+= SPEED * 2;' });
  assert.equal(twice.code, CODE);
  assert.match(twice.output, /appears 2 times/);

  const all = runCodeTool(CODE, 'replace_code', { old_string: '+= SPEED;', new_string: '+= SPEED * 2;', replace_all: true });
  assert.equal(all.code.split('SPEED * 2').length - 1, 2);
  assert.match(all.output, /Replaced 2 occurrences \(first at line 3\)/);
});

test('replace_code runs a list of edits in order and skips the ones that fail', () => {
  const { code, output } = runCodeTool(CODE, 'replace_code', { edits: [
    { old_string: 'const SPEED = 2;', new_string: 'const SPEED = 3;' },
    { old_string: 'not in the code', new_string: 'x' },
    { old_string: 'const SPEED = 3;', new_string: 'const SPEED = 4;' },
    { old_string: '+= SPEED;', new_string: '-= SPEED;', replace_all: true }
  ] });
  assert.ok(code.startsWith('const SPEED = 4;'));
  assert.ok(code.includes('x -= SPEED;') && code.includes('y -= SPEED;'));
  const lines = output.split('\n');
  assert.equal(lines.length, 4);
  assert.match(lines[0], /^1: Replaced 1 occurrence/);
  assert.match(lines[1], /^2: Error: old_string not found/);
  assert.match(lines[3], /^4: Replaced 2 occurrences/);
  assert.match(runCodeTool(CODE, 'replace_code', { edits: [] }).output, /^Error: edits is empty/);
});

test('replace_code keeps "$" in the new code as is', () => {
  const { code } = runCodeTool(CODE, 'replace_code', { old_string: 'return { score };', new_string: "return { score, label: '$& $1 $$' };" });
  assert.ok(code.includes("label: '$& $1 $$'"));
});

test('view_code and search_code show numbered lines', () => {
  const view = runCodeTool(CODE, 'view_code', { start_line: 2, end_line: 3 }).output;
  assert.equal(view, '    2| function update(deltaTime, input) {\n    3|   x += SPEED;\n(6 lines in total)');
  assert.match(runCodeTool(CODE, 'view_code', { start_line: 50, end_line: 60 }).output, /^Error: the code has 6 lines/);

  assert.equal(runCodeTool(CODE, 'search_code', { query: 'y +=' }).output, '    4|   y += SPEED;');
  assert.equal(runCodeTool(CODE, 'search_code', { query: 'nothing' }).output, 'No matches');
});

test('write_code replaces the game; unknown tools and bad arguments are errors', () => {
  assert.equal(runCodeTool(CODE, 'write_code', { code: 'function update() {}' }).code, 'function update() {}');
  assert.match(runCodeTool(CODE, 'write_code', { code: ' ' }).output, /^Error/);
  assert.match(runCodeTool(CODE, 'delete_everything', {}).output, /^Error: unknown tool/);
});

test('runCodeTools applies a turn of calls in order and answers each one', () => {
  const { code, outputs } = runCodeTools(CODE, [
    { call_id: 'a', name: 'replace_code', arguments: JSON.stringify({ old_string: 'const SPEED = 2;', new_string: 'const SPEED = 3;' }) },
    { call_id: 'b', name: 'replace_code', arguments: JSON.stringify({ old_string: 'const SPEED = 3;', new_string: 'const SPEED = 4;' }) },
    { call_id: 'c', name: 'replace_code', arguments: '{not json' },
    { call_id: 'd', name: 'search_code', arguments: JSON.stringify({ query: 'SPEED = ' }) }
  ]);
  assert.ok(code.startsWith('const SPEED = 4;'));
  assert.deepEqual(outputs.map(o => o.call_id), ['a', 'b', 'c', 'd']);
  assert.match(outputs[2].output, /not valid JSON/);
  assert.equal(outputs[3].output, '    1| const SPEED = 4;');
});

test('view_code and search_code read the sample files, which the edits never touch', () => {
  const files = { 'pong.js': 'function rgb(color) {\n  return color;\n}' };
  assert.equal(runCodeTool(CODE, 'search_code', { file: 'pong.js', query: 'return' }, files).output, '    2|   return color;');
  assert.match(runCodeTool(CODE, 'view_code', { file: 'pong.js', start_line: 1, end_line: 1 }, files).output, /function rgb/);
  assert.match(runCodeTool(CODE, 'view_code', { file: 'game.js', start_line: 1, end_line: 1 }, files).output, /SPEED = 2/);
  assert.match(runCodeTool(CODE, 'search_code', { file: 'nope.js', query: 'x' }, files).output, /^Error: no file nope.js; files: game.js, pong.js/);
  const { code } = runCodeTool(CODE, 'replace_code', { file: 'pong.js', old_string: 'const SPEED = 2;', new_string: 'const SPEED = 3;' }, files);
  assert.ok(code.startsWith('const SPEED = 3;'));
  assert.equal(files['pong.js'], 'function rgb(color) {\n  return color;\n}');
});

test('outlineCode lists top-level functions with line numbers', () => {
  const outline = outlineCode('function metadata() {}\nconst spr = (id, x) => id;\nconst flash = rows => rows;\nconst N = 3;\n  function inner() {}');
  assert.equal(outline, '5 lines; functions:\n    1| metadata()\n    2| spr(id, x)\n    3| flash(rows)');
});

test('tool definitions convert to chat completions format', () => {
  const chat = toChatTools();
  assert.equal(chat.length, CODE_TOOLS.length);
  assert.deepEqual(chat[0], { type: 'function', function: { name: 'replace_code', description: CODE_TOOLS[0].description, parameters: CODE_TOOLS[0].parameters } });
});

console.log(`\n${passed} passed`);
