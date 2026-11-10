import { createGameGenerationPrompt, parseMarkdownResponse } from '../shared/game-prompt.js';
import { createFixPrompt, createReviewPrompt, INSTRUCTIONS } from '../shared/game-prompt-common.js';
import { CODE_TOOLS } from '../shared/code-tools.js';
import { HeadlessGameRunner } from './headless-game-runner.js';

// Shown to players instead of OpenAI's quota/rate-limit details (billing links etc.)
const AI_UNAVAILABLE = 'The AI service is busy or out of credits right now. Please try again later.';

export class ResponsesAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1/responses';
    this.gameRunner = new HeadlessGameRunner();
  }

  async createResponse(description, model = 'gpt-6.1-sol', previousGame = null) {
    const prompt = createGameGenerationPrompt(description, previousGame);

    console.log(`Creating OpenAI response with model ${model}:`, description.substring(0, 100) + '...');

    return this.submitResponse({ model, input: prompt });
  }

  // Continue the same conversation with a report of why the game failed to start
  async createFixResponse(previousResponseId, model, failure) {
    console.log(`Requesting fix for response ${previousResponseId}: ${failure}`);

    return this.submitResponse({
      model,
      previous_response_id: previousResponseId,
      input: createFixPrompt(failure)
    });
  }

  // Continue the conversation with screenshots of the running game so the model can fix how it looks
  async createReviewResponse(previousResponseId, model, screenshots) {
    console.log(`Requesting screenshot review for response ${previousResponseId}`);

    return this.submitResponse({
      model,
      previous_response_id: previousResponseId,
      input: [{
        role: 'user',
        content: [
          { type: 'input_text', text: createReviewPrompt(screenshots.map(s => s.label)) },
          ...screenshots.map(s => ({ type: 'input_image', image_url: s.dataUri }))
        ]
      }]
    });
  }

  async submitResponse({ model, ...request }) {
    const requestBody = {
      model,
      ...request,
      // Instructions are not carried over by previous_response_id, so always send them
      instructions: INSTRUCTIONS,
      // Includes reasoning; edits go through the code tools, so only new games are written in full
      max_output_tokens: 32000,
      // Like instructions, tools are not carried over by previous_response_id
      tools: CODE_TOOLS,
      parallel_tool_calls: true,
      background: true
    };

    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 429) {
        console.error(`OpenAI Responses API error: 429 - ${errorText}`);
        throw new Error(AI_UNAVAILABLE);
      }
      throw new Error(`OpenAI Responses API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    console.log(`OpenAI response created with ID: ${data.id}, status: ${data.status}`);

    return {
      id: data.id,
      status: data.status,
      model
    };
  }

  // Send the results of the model's code tool calls back so it can carry on
  async submitToolOutputs(previousResponseId, model, outputs) {
    return this.submitResponse({
      model,
      previous_response_id: previousResponseId,
      input: outputs.map(({ call_id, output }) => ({ type: 'function_call_output', call_id, output }))
    });
  }

  /**
   * @param {string} responseId
   * @param {{reviewed?: boolean, workingCode?: string, reviewedCode?: string}} options
   *   reviewed: this is the reply to the screenshot review; a reply that leaves the game unchanged or
   *   breaks it means "keep the reviewed game" (keepPrevious) instead of asking for a fix
   *   workingCode: the game as changed by the code tools so far; reviewedCode: the game the review looked at
   * @returns status 'tool_calls' with the calls to run, or the result of checkGame() once the model is done
   */
  async getResponse(responseId, options = {}) {

    const response = await fetch(`${this.baseURL}/${responseId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI status check failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    console.log(`OpenAI response ${responseId} status: ${data.status}`);

    // Handle completed response
    if (data.status === 'completed' || data.status === 'complete') {
      const calls = (data.output || []).filter(item => item.type === 'function_call');
      if (calls.length) {
        console.log(`Response ${responseId} called ${calls.map(c => c.name).join(', ')}`);
        return { status: 'tool_calls', calls };
      }

      // The model is done: its reply is a new game in a code block, or a short note after tool edits
      const outputText = (data.output || [])
        .filter(item => item.type === 'message')
        .flatMap(item => item.content || [])
        .map(part => part.text || '')
        .join('\n');
      console.log(`Response ${responseId} reply: ${outputText.substring(0, 200)}`);
      return this.checkGame(outputText, options);
    }

    // Handle failed response
    if (data.status === 'failed') {
      // data.error is an object ({type, code, message}); players see a string
      console.error(`OpenAI response ${responseId} failed:`, data.error);
      const { type, code, message } = data.error || {};
      let errorMessage = message || 'Unknown error from OpenAI';
      if (type === 'insufficient_quota' || code === 'rate_limit_exceeded') {
        errorMessage = AI_UNAVAILABLE;
      }

      return {
        status: 'failed',
        error: errorMessage
      };
    }

    // Handle cancelled response
    if (data.status === 'cancelled') {
      console.error(`OpenAI response ${responseId} was cancelled`);

      return {
        status: 'failed',
        error: 'Response was cancelled'
      };
    }

    // Handle incomplete response (error state)
    if (data.status === 'incomplete') {
      const reason = data.incomplete_details?.reason || 'Unknown reason';
      console.error(`OpenAI response ${responseId} incomplete:`, reason, data.incomplete_details);

      return {
        status: 'failed',
        error: `Response incomplete: ${reason}`
      };
    }

    // Handle in-progress statuses (queued, in_progress)
    let outputInfo = 'none';
    if (data.output) {
      if (typeof data.output === 'object') {
        // Log the actual content of the object when it's small
        const jsonStr = JSON.stringify(data.output);
        if (jsonStr.length < 100) {
          outputInfo = `object: ${jsonStr}`;
        } else {
          outputInfo = `object(${jsonStr.length} chars)`;
        }
      } else {
        outputInfo = `${typeof data.output}(${data.output.length} chars)`;
      }
    }
    console.log(`Response ${responseId} not yet complete. Status: ${data.status}, Output: ${outputInfo}`);

    return {
      status: data.status, // queued, in_progress, etc.
      progress: this.calculateOpenAIProgress(data.status)
    };
  }

  /**
   * Decide what the model's finished turn produced and test it
   * @param {string} replyText - the model's final reply ('' if it stopped while calling tools)
   * @param {{reviewed?: boolean, workingCode?: string, reviewedCode?: string}} options - see getResponse()
   * @returns {{status: 'completed'|'needs_review'|'needs_fix', gameDefinition?, screenshots?, keepPrevious?, error?, code?}}
   *   code: the game to keep editing when a fix is needed
   */
  async checkGame(replyText, { reviewed = false, workingCode = '', reviewedCode = '' } = {}) {
    // A code block in the reply replaces the game; otherwise the tool edits are the result
    let code = workingCode;
    try {
      code = parseMarkdownResponse(replyText).gameCode;
    } catch {
      // no code block
    }

    if (!code) {
      return { status: 'needs_fix', error: 'Could not find the game code in your reply: no ```javascript block and no code written with the tools', code: '' };
    }
    if (reviewed && code === reviewedCode) {
      console.log('Review: looks good, no changes');
      return { status: 'completed', keepPrevious: true };
    }

    // Make sure the game actually starts before handing it to the player; a first working
    // version also gets screenshots for the model to review
    const smoke = await this.gameRunner.smokeTest(code, { screenshots: !reviewed });
    if (!smoke.ok) {
      const where = smoke.frame === undefined ? 'while loading' : `at frame ${smoke.frame}`;
      console.error(`Game failed smoke test ${where}: ${smoke.error}`);
      if (reviewed) return { status: 'completed', keepPrevious: true }; // the reviewed game still works
      return { status: 'needs_fix', error: `${smoke.error} (${where})`, code };
    }

    const gameDefinition = { gameCode: code, isPublished: false };
    // Extract metadata by running game code in QuickJS
    gameDefinition.metadata = await this.gameRunner.extractMetadata(code);
    console.log('Extracted metadata:', gameDefinition.metadata?.title);

    if (!reviewed && smoke.screenshots?.length) {
      return { status: 'needs_review', gameDefinition, screenshots: smoke.screenshots };
    }
    return { status: 'completed', gameDefinition };
  }

  calculateOpenAIProgress(status) {
    switch (status) {
      case 'queued':
        return 10;
      case 'in_progress':
        return 50;
      case 'completed':
        return 100;
      case 'failed':
        return 0;
      default:
        return 25;
    }
  }

  async cancelResponse(responseId) {
    console.log(`Cancelling OpenAI response: ${responseId}`);

    const response = await fetch(`${this.baseURL}/${responseId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to cancel response ${responseId}:`, errorText);
      return false;
    }

    console.log(`Successfully cancelled OpenAI response: ${responseId}`);
    return true;
  }
}
