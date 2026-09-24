import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getGeminiClient, getPrimaryModel, generateContentResiliently } from '../src/lib/gemini';
import { generatePedagogicalBlueprint } from '../src/lib/planner';
import { buildStage2CodePrompt, MASTER_SYSTEM_PROMPT, GAME_RESPONSE_SCHEMA } from '../src/lib/prompts';
import { parseGameOutput } from '../src/lib/sanitizer';
import { verifyGameCode } from '../src/lib/verifier';

async function run() {
  const topic = 'DNA & Genetics';
  const level = 'high_school' as const;
  console.log('Testing generation for:', topic);
  const t0 = Date.now();

  const plannerClient = getGeminiClient('planner');
  const coderClient = getGeminiClient('coder');
  const primaryModel = getPrimaryModel();

  console.log('1. Starting Planner with model:', primaryModel);
  const blueprint = await generatePedagogicalBlueprint(plannerClient, topic, level);
  const t1 = Date.now();
  console.log('Planner completed in:', ((t1 - t0) / 1000).toFixed(1) + 's');
  console.log('Blueprint title:', blueprint.title);

  console.log('2. Starting Coder...');
  const codePrompt = buildStage2CodePrompt(blueprint, level);
  const result = await generateContentResiliently(coderClient, {
    model: primaryModel,
    contents: codePrompt,
    systemInstruction: MASTER_SYSTEM_PROMPT,
    responseMimeType: 'application/json',
    responseSchema: GAME_RESPONSE_SCHEMA,
    temperature: 0.7,
  });
  const t2 = Date.now();
  console.log('Coder completed in:', ((t2 - t1) / 1000).toFixed(1) + 's');

  const structuredOutput = parseGameOutput(result.text, topic);
  console.log('HTML length:', structuredOutput.html.length);

  console.log('3. Running Verifier...');
  const qaReport = verifyGameCode(structuredOutput.html);
  console.log('QA Passed?', qaReport.passed);
  if (!qaReport.passed) {
    console.log('QA Errors:', qaReport.errors);
  }
  const total = ((Date.now() - t0) / 1000).toFixed(1);
  console.log('TOTAL TIME:', total + 's');
}

run().catch((err) => {
  console.error('Test error:', err);
});
