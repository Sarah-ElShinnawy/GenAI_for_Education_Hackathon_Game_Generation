import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { getGeminiClient, getPrimaryModel, generateContentResiliently } from '../src/lib/gemini';
import { generatePedagogicalBlueprint } from '../src/lib/planner';
import { buildStage2CodePrompt, MASTER_SYSTEM_PROMPT, GAME_RESPONSE_SCHEMA } from '../src/lib/prompts';
import { parseGameOutput } from '../src/lib/sanitizer';
import { verifyGameCode } from '../src/lib/verifier';
import { repairGameHtml } from '../src/lib/repair';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const client = getGeminiClient();
  const model = getPrimaryModel();

  console.log('[AGENT 1] Generating Pedagogical Blueprint...');
  const blueprint = await generatePedagogicalBlueprint(
    client,
    'Photosynthesis',
    'elementary',
    'Explain plant life to a child. Full-page (100vw x 100vh). Every character, plant, and tool must be a standalone detailed inline SVG illustration with gradients and curved paths in the DOM—ABSOLUTELY NO crude canvas circles or ellipses! Include a 5-second countdown "What Changed?" pop-up after each stage.'
  );

  console.log('[AGENT 2] Synthesizing Game Code with Standalone SVG Assets...');
  const prompt = buildStage2CodePrompt(blueprint, 'elementary');
  const { text: rawText, modelUsed } = await generateContentResiliently(client, {
    model,
    contents: prompt,
    systemInstruction: MASTER_SYSTEM_PROMPT,
    responseMimeType: 'application/json',
    responseSchema: GAME_RESPONSE_SCHEMA,
    temperature: 0.7,
  });

  const parsed = parseGameOutput(rawText, 'Photosynthesis');
  let qaReport = verifyGameCode(parsed.html);
  let finalHtml = qaReport.sanitizedHtml;

  if (!qaReport.passed) {
    console.log('[AGENT 3] QA Verifier found issues, dispatching repair agent...');
    const repair = await repairGameHtml(client, parsed.html, qaReport.errors.join('\n'));
    if (repair.success) {
      finalHtml = repair.html;
      console.log('QA Repair succeeded!');
    }
  } else {
    console.log('QA Verifier PASSED on first attempt with 0 errors!');
  }

  const outPath = path.resolve(process.cwd(), 'demos/elementary-photosynthesis.html');
  fs.writeFileSync(outPath, finalHtml, 'utf8');
  console.log(`Saved newly generated game to ${outPath} (${finalHtml.length} chars).`);

  // Check SVG count
  const svgMatches = finalHtml.match(/<svg/gi) || [];
  console.log(`Number of standalone <svg> elements in game: ${svgMatches.length}`);
}

run().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
