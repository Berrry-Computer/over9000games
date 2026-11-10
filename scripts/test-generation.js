#!/usr/bin/env node

/**
 * Standalone script to test game generation using different AI models via OpenRouter
 *
 * Usage:
 *   node scripts/test-generation.js [options]
 *
 * Options:
 *   --model <model>     Single AI model to test (required if --models not specified)
 *   --models <models>   Comma-separated list of models to test (required if --model not specified)
 *   --prompt <prompt>   Game description prompt (default: "a simple pong game")
 *   --edit <game.js>    Edit this game, with --prompt as the change request (uses the code tools)
 *   --output <dir>      Output directory for generated games (default: ./generated-games)
 *   --verbose           Enable verbose logging
 *
 * Environment Variables:
 *   OPENROUTER_API_KEY  OpenRouter API key (required)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createGameGenerationPromptWithSamples, createGameEditPromptWithSamples, createFixPrompt, createReviewPrompt, parseMarkdownResponse, INSTRUCTIONS } from '../src/shared/game-prompt-common.js';
import { toChatTools, runCodeTools, MAX_TOOL_ROUNDS } from '../src/shared/code-tools.js';
import { HeadlessGameRunner } from '../src/server/headless-game-runner.js';

// Keep in sync with src/server/responses-api.js and src/server/index.js
const MAX_OUTPUT_TOKENS = 32000;
const MAX_FIX_ATTEMPTS = 2;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    models: [],
    prompt: 'a simple pong game',
    output: './generated-games',
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--model':
        options.models = [args[++i]];
        break;
      case '--models':
        options.models = args[++i].split(',').map(m => m.trim());
        break;
      case '--prompt':
        options.prompt = args[++i];
        break;
      case '--edit':
        options.edit = args[++i];
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--help':
        console.log(`
Usage: node scripts/test-generation.js [options]

Options:
  --model <model>     Single AI model to test (required if --models not specified)
  --models <models>   Comma-separated list of models to test (required if --model not specified)
  --prompt <prompt>   Game description prompt (default: "a simple pong game")
  --edit <game.js>    Edit this game, with --prompt as the change request (uses the code tools)
  --output <dir>      Output directory for generated games (default: ./generated-games)
  --verbose           Enable verbose logging
  --help              Show this help message

Environment Variables:
  OPENROUTER_API_KEY  OpenRouter API key (required)

Examples:
  node scripts/test-generation.js --model openai/gpt-4o-mini --prompt "a snake game"
  node scripts/test-generation.js --models "openai/gpt-4o-mini,anthropic/claude-3.5-sonnet"
  node scripts/test-generation.js --model google/gemini-2.0-flash-exp --prompt "a space invaders clone"
  node scripts/test-generation.js --model openai/gpt-6.1-sol --edit src/shared/test-games/pong.js --prompt "make the ball faster"
        `);
        process.exit(0);
      default:
        console.error(`Unknown option: ${args[i]}`);
        process.exit(1);
    }
  }

  // Validate that either --model or --models was specified
  if (options.models.length === 0) {
    console.error('Error: Either --model or --models must be specified');
    console.error('Use --help for usage information');
    process.exit(1);
  }

  return options;
}

// Logging utility
function log(message, level = 'info', verbose = false) {
  if (level === 'verbose' && !verbose) return;

  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : level === 'verbose' ? '🔍' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

// Create output directory
function ensureOutputDir(outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    log(`Created output directory: ${outputDir}`);
  }
}


// Run one model turn through OpenRouter, like a job on the server: tool calls are applied to
// session.code and answered until the model replies with text; a code block in the reply replaces the game.
// Appends the turn to messages and returns the reply text.
async function runModelTurn(model, prompt, apiKey, verbose, outputDir, messages, session) {
  log(`Running ${model}...`, 'info', verbose);

  for (;;) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/your-username/over9000games',
        'X-Title': 'Over9000Games Test Script'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'system', content: INSTRUCTIONS }, ...messages],
        tools: toChatTools(),
        parallel_tool_calls: true,
        max_tokens: MAX_OUTPUT_TOKENS
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    session.responseFile = saveRawResponse(JSON.stringify(data, null, 2), model, outputDir, prompt, verbose);
    if (data.usage) {
      session.cost += data.usage.cost || 0;
      log(`${model} usage: ${data.usage.prompt_tokens} in / ${data.usage.completion_tokens} out` +
        (data.usage.cost !== undefined ? ` / $${data.usage.cost.toFixed(4)}` : ''), 'info');
    }

    // Keep the whole assistant message (tool calls, reasoning) so the next request continues it
    const message = data.choices[0].message;
    messages.push(message);

    const calls = message.tool_calls || [];
    if (!calls.length) {
      const reply = message.content || '';
      try {
        session.code = parseMarkdownResponse(reply).gameCode;
      } catch {
        // no code block: the tool edits are the result
      }
      log(`${model} reply: ${reply.substring(0, 200)}`, 'info');
      return reply;
    }

    session.toolRounds++;
    const { code, outputs } = runCodeTools(session.code, calls.map(c => ({ call_id: c.id, name: c.function.name, arguments: c.function.arguments })), session.files);
    session.code = code;
    calls.forEach((c, i) => log(`${model} ${c.function.name}: ${outputs[i].output.split('\n')[0]}`, 'info'));
    messages.push(...outputs.map(o => ({ role: 'tool', tool_call_id: o.call_id, content: o.output })));
    if (session.toolRounds >= MAX_TOOL_ROUNDS) {
      log(`${model} reached ${MAX_TOOL_ROUNDS} tool rounds, testing the current code`, 'error');
      return '';
    }
  }
}

// Save generated game to file
function saveGame(gameDefinition, model, outputDir, prompt, fullPrompt, verbose) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sanitizedPrompt = prompt.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
  const sanitizedModel = model.replace(/[^a-zA-Z0-9\-]/g, '-');

  const gameFilename = `${sanitizedModel}-${sanitizedPrompt}-${timestamp}.js`;
  const gameFilepath = path.join(outputDir, gameFilename);

  // Save ES6 game code directly
  fs.writeFileSync(gameFilepath, gameDefinition.gameCode);

  log(`Saved game to: ${gameFilepath}`, 'success', verbose);

  return { gameFile: gameFilepath };
}

// Save raw response for debugging
function saveRawResponse(content, model, outputDir, prompt, verbose, fileType = 'response') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sanitizedPrompt = prompt.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
  const sanitizedModel = model.replace(/[^a-zA-Z0-9\-]/g, '-');

  const filename = `${sanitizedModel}-${sanitizedPrompt}-${timestamp}-${fileType}.txt`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, content);
  log(`Saved ${fileType} to: ${filepath}`, 'verbose', verbose);

  return filepath;
}

// Main execution function
async function main() {
  const options = parseArgs();

  // Check for OpenRouter API key
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (!openrouterKey) {
    log('OPENROUTER_API_KEY environment variable not set', 'error');
    process.exit(1);
  }

  log(`Starting game generation test with options:`, 'info');
  log(`  Models: ${options.models.join(', ')}`, 'info');
  log(`  Prompt: "${options.prompt}"`, 'info');
  log(`  Output: ${options.output}`, 'info');
  log(`  Verbose: ${options.verbose}`, 'info');

  ensureOutputDir(options.output);

  // Read sample game files
  const pongCode = fs.readFileSync(path.join(__dirname, '../src/shared/test-games/pong.js'), 'utf8');
  const platformerCode = fs.readFileSync(path.join(__dirname, '../src/shared/test-games/platformer.js'), 'utf8');

  const sampleFiles = { 'pong.js': pongCode, 'platformer.js': platformerCode };

  // --edit: change an existing game with the code tools, like POST /api/game/edit
  const editCode = options.edit ? fs.readFileSync(options.edit, 'utf8') : '';
  const fullPrompt = options.edit
    ? createGameEditPromptWithSamples(options.prompt, { gameCode: editCode, metadata: {}, description: '' }, sampleFiles)
    : createGameGenerationPromptWithSamples(options.prompt, pongCode, platformerCode);

  // Test all models in parallel
  const testPromises = options.models.map(async (model) => {
    const startTime = Date.now();
    const session = { code: editCode, files: sampleFiles, toolRounds: 0, cost: 0, responseFile: null };

    // Always save the prompt first
    const promptFile = saveRawResponse(fullPrompt, model, options.output, options.prompt, options.verbose, 'prompt');

    try {
      // Same flow as the server: generate, smoke test, then follow-up turns to fix
      const messages = [{ role: 'user', content: fullPrompt }];
      const runner = new HeadlessGameRunner();
      let gameDefinition;
      let validationErrors = [];
      let fixAttempts = 0;

      for (;;) {
        await runModelTurn(model, options.prompt, openrouterKey, options.verbose, options.output, messages, session);
        if (!session.code) throw new Error('No game code: no ```javascript block and no code written with the tools');
        gameDefinition = { gameCode: session.code, isPublished: false };

        const smoke = await runner.smokeTest(gameDefinition.gameCode);
        if (smoke.ok) {
          validationErrors = [];
          log(`${model} game starts and survives scripted play` + (fixAttempts ? ` after ${fixAttempts} fix(es)` : ''), 'success');
          break;
        }

        const where = smoke.frame === undefined ? 'while loading' : `at frame ${smoke.frame}`;
        validationErrors = [`${smoke.error} (${where})`];
        log(`${model} smoke test failed: ${validationErrors[0]}`, 'error');
        if (fixAttempts >= MAX_FIX_ATTEMPTS) break;

        fixAttempts++;
        messages.push({ role: 'user', content: createFixPrompt(validationErrors[0]) });
        log(`${model} requesting fix ${fixAttempts}/${MAX_FIX_ATTEMPTS}...`, 'info');
      }
      // Same as the server: show the model screenshots of the working game and keep its revision if it still runs
      let reviewed = 'skipped';
      if (validationErrors.length === 0) {
        const { screenshots } = await runner.smokeTest(gameDefinition.gameCode, { screenshots: true });
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: createReviewPrompt(screenshots.map(s => s.label)) },
            ...screenshots.map(s => ({ type: 'image_url', image_url: { url: s.dataUri } }))
          ]
        });
        log(`${model} reviewing ${screenshots.length} screenshots...`, 'info');
        const reviewedCode = session.code;
        await runModelTurn(model, options.prompt, openrouterKey, options.verbose, options.output, messages, session);
        if (session.code === reviewedCode) {
          reviewed = 'looks good';
        } else if ((await runner.smokeTest(session.code)).ok) {
          gameDefinition = { gameCode: session.code, isPublished: false };
          reviewed = 'revised';
        } else {
          reviewed = 'revision failed to start, kept the first version';
        }
        log(`${model} review: ${reviewed}`, 'info');
      }
      const duration = Date.now() - startTime;

      const filepaths = saveGame(gameDefinition, model, options.output, options.prompt, fullPrompt, options.verbose);

      log(`${model} generation completed in ${duration}ms`, 'success');

      return {
        model,
        success: true,
        duration,
        validationErrors,
        fixAttempts,
        reviewed,
        filepaths: { ...filepaths, responseFile: session.responseFile, promptFile },
        toolRounds: session.toolRounds,
        cost: session.cost,
        gameDefinition
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      log(`${model} generation failed: ${error.message}`, 'error');

      return {
        model,
        success: false,
        error: error.message,
        duration,
        responseFile: session.responseFile,
        promptFile
      };
    }
  });

  // Wait for all models to complete
  const testResults = await Promise.all(testPromises);

  // Convert to results object
  const results = {};
  testResults.forEach(result => {
    const { model, ...rest } = result;
    results[model] = rest;
  });

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('GENERATION TEST SUMMARY');
  console.log('='.repeat(60));

  for (const [model, result] of Object.entries(results)) {
    console.log(`\n${model}: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (result.success) {
      console.log(`  Duration: ${result.duration}ms, $${result.cost.toFixed(4)}, ${result.toolRounds} tool round(s)`);
      console.log(`  Starts: ${result.validationErrors.length ? '❌ ' + result.validationErrors[0] : '✅'}${result.fixAttempts ? ` (after ${result.fixAttempts} fix turn(s))` : ''}`);
      console.log(`  Screenshot review: ${result.reviewed}`);
      console.log(`  Game file: ${result.filepaths.gameFile}`);
      console.log(`  Prompt file: ${result.filepaths.promptFile}`);
    } else {
      console.log(`  Error: ${result.error}`);
    }
  }

  // Exit with error code if any generation failed
  const anyFailed = Object.values(results).some(result => !result.success);
  process.exit(anyFailed ? 1 : 0);
}

// Run the script
main().catch(error => {
  log(`Script failed: ${error.message}`, 'error');
  process.exit(1);
});