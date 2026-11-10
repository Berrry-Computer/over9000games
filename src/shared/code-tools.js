// Code tools the model calls to change a game instead of writing the whole file again.
// Shared by the server (OpenAI Responses API) and scripts/test-generation.js (OpenRouter).
// The game is GAME_FILE; other files (the sample games) can be read but not changed.

export const GAME_FILE = 'game.js';

// Tool-call turns allowed per job before the current code is tested as is
export const MAX_TOOL_ROUNDS = 40;

const VIEW_MAX_LINES = 200;
const SEARCH_MAX_MATCHES = 40;

// Responses API format; toChatTools() converts them for chat completions
export const CODE_TOOLS = [
  {
    type: 'function',
    name: 'replace_code',
    description: 'Replace exact pieces of the game code. Put every change you can into one call: the edits run in order, each on the code left by the previous one. old_string must match the current code exactly, including indentation, and appear only once (add surrounding lines to make it unique) unless replace_all is true. An edit that fails is reported and skipped; the others still apply.',
    parameters: {
      type: 'object',
      properties: {
        edits: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              old_string: { type: 'string', description: 'Exact text to find in the current code' },
              new_string: { type: 'string', description: 'Text to put in its place' },
              replace_all: { type: 'boolean', description: 'Replace every occurrence instead of exactly one' }
            },
            required: ['old_string', 'new_string'],
            additionalProperties: false
          }
        }
      },
      required: ['edits'],
      additionalProperties: false
    }
  },
  {
    type: 'function',
    name: 'view_code',
    description: `Show lines of a file with line numbers (at most ${VIEW_MAX_LINES} lines per call): the game (${GAME_FILE}) or a sample game.`,
    parameters: {
      type: 'object',
      properties: {
        file: { type: 'string', description: `File to read; defaults to ${GAME_FILE}` },
        start_line: { type: 'integer', description: 'First line, starting at 1' },
        end_line: { type: 'integer', description: 'Last line, inclusive' }
      },
      required: ['start_line', 'end_line'],
      additionalProperties: false
    }
  },
  {
    type: 'function',
    name: 'search_code',
    description: `Find lines of a file containing some text (case-sensitive, at most ${SEARCH_MAX_MATCHES} matches): the game (${GAME_FILE}) or a sample game.`,
    parameters: {
      type: 'object',
      properties: {
        file: { type: 'string', description: `File to search; defaults to ${GAME_FILE}` },
        query: { type: 'string', description: 'Text to look for' }
      },
      required: ['query'],
      additionalProperties: false
    }
  },
  {
    type: 'function',
    name: 'write_code',
    description: 'Replace the whole game with new code. Only for rewrites where most of the code changes; use replace_code for everything else.',
    parameters: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'The complete game: metadata(), resources() and update()' }
      },
      required: ['code'],
      additionalProperties: false
    }
  }
];

export function toChatTools(tools = CODE_TOOLS) {
  return tools.map(({ type, name, description, parameters }) => ({ type, function: { name, description, parameters } }));
}

function countOccurrences(code, text) {
  let count = 0;
  for (let i = code.indexOf(text); i !== -1; i = code.indexOf(text, i + text.length)) count++;
  return count;
}

function lineOf(code, index) {
  return code.slice(0, index).split('\n').length;
}

function numbered(lines, first) {
  return lines.map((line, i) => `${String(first + i).padStart(5)}| ${line}`).join('\n');
}

// One replace_code edit; on an error the code is returned unchanged
function replaceOnce(code, { old_string: oldString, new_string: newString, replace_all: replaceAll }) {
  if (typeof oldString !== 'string' || typeof newString !== 'string') {
    return { code, output: 'Error: old_string and new_string must be strings' };
  }
  if (!oldString) return { code, output: 'Error: old_string is empty' };
  const count = countOccurrences(code, oldString);
  if (count === 0) {
    return { code, output: 'Error: old_string not found in the current code. Check it with view_code or search_code (earlier edits may have changed it).' };
  }
  if (count > 1 && !replaceAll) {
    return { code, output: `Error: old_string appears ${count} times; include more surrounding lines to make it unique, or set replace_all` };
  }
  const line = lineOf(code, code.indexOf(oldString));
  // split/join instead of String.replace so "$" in the new code is kept as is
  const updated = code.split(oldString).join(newString);
  return { code: updated, output: `Replaced ${count} occurrence${count > 1 ? 's' : ''} (first at line ${line})` };
}

// Top-level functions with their line numbers, so the model knows where to look in a file it hasn't seen
export function outlineCode(code) {
  const lines = code.split('\n');
  const entries = [];
  lines.forEach((line, i) => {
    const match = line.match(/^(?:async\s+)?function\s*\*?\s*([\w$]+)\s*\(([^)]*)\)/) ||
      line.match(/^(?:const|let|var)\s+([\w$]+)\s*=\s*(?:async\s*)?(?:function\b[^(]*\(([^)]*)\)|\(([^)]*)\)\s*=>|([\w$]+)\s*=>)/);
    if (match) entries.push(`${String(i + 1).padStart(5)}| ${match[1]}(${match[2] ?? match[3] ?? match[4] ?? ''})`);
  });
  return `${lines.length} lines; functions:\n${entries.join('\n') || '(none at the top level)'}`;
}

/**
 * Run one tool call against the code
 * @param {string} code - current game code
 * @param {string} name - tool name
 * @param {object} args - parsed arguments
 * @param {Object<string, string>} [files] - read-only files by name (the sample games)
 * @returns {{code: string, output: string}} - the code after the call and the text sent back to the model
 */
export function runCodeTool(code, name, args, files = {}) {
  // view_code and search_code can read the sample games too
  const file = args.file || GAME_FILE;
  const text = file === GAME_FILE ? code : files[file];
  if ((name === 'view_code' || name === 'search_code') && typeof text !== 'string') {
    return { code, output: `Error: no file ${file}; files: ${[GAME_FILE, ...Object.keys(files)].join(', ')}` };
  }
  switch (name) {
    case 'replace_code': {
      // A single edit at the top level is accepted too
      const edits = Array.isArray(args.edits) ? args.edits : [args];
      if (!edits.length) return { code, output: 'Error: edits is empty' };
      const lines = edits.map((edit, i) => {
        const result = replaceOnce(code, edit || {});
        code = result.code;
        return edits.length > 1 ? `${i + 1}: ${result.output}` : result.output;
      });
      return { code, output: lines.join('\n') };
    }

    case 'view_code': {
      const lines = text.split('\n');
      const start = Math.max(1, Math.floor(Number(args.start_line) || 1));
      const end = Math.min(lines.length, Math.floor(Number(args.end_line) || start), start + VIEW_MAX_LINES - 1);
      if (start > lines.length) return { code, output: `Error: the code has ${lines.length} lines` };
      return { code, output: `${numbered(lines.slice(start - 1, end), start)}\n(${lines.length} lines in total)` };
    }

    case 'search_code': {
      const { query } = args;
      if (typeof query !== 'string' || !query) return { code, output: 'Error: query must be a non-empty string' };
      const matches = [];
      text.split('\n').forEach((line, i) => {
        if (line.includes(query)) matches.push(numbered([line], i + 1));
      });
      if (!matches.length) return { code, output: 'No matches' };
      const shown = matches.slice(0, SEARCH_MAX_MATCHES).join('\n');
      return { code, output: matches.length > SEARCH_MAX_MATCHES ? `${shown}\n(${matches.length - SEARCH_MAX_MATCHES} more matches)` : shown };
    }

    case 'write_code': {
      if (typeof args.code !== 'string' || !args.code.trim()) return { code, output: 'Error: code must be the complete game' };
      return { code: args.code, output: `Wrote ${args.code.split('\n').length} lines` };
    }

    default:
      return { code, output: `Error: unknown tool ${name}` };
  }
}

/**
 * Run a turn's tool calls in order
 * @param {string} code - current game code
 * @param {{call_id: string, name: string, arguments: string}[]} calls - function calls (arguments as JSON text)
 * @param {Object<string, string>} [files] - read-only files by name (the sample games)
 * @returns {{code: string, outputs: {call_id: string, output: string}[]}}
 */
export function runCodeTools(code, calls, files = {}) {
  const outputs = [];
  for (const call of calls) {
    let args;
    try {
      args = JSON.parse(call.arguments || '{}');
    } catch {
      outputs.push({ call_id: call.call_id, output: 'Error: arguments are not valid JSON' });
      continue;
    }
    const result = runCodeTool(code, call.name, args, files);
    code = result.code;
    outputs.push({ call_id: call.call_id, output: result.output });
  }
  return { code, outputs };
}
