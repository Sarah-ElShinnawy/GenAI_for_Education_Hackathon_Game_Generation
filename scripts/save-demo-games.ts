import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { getGeminiClient, getPrimaryModel, generateContentResiliently } from '../src/lib/gemini';
import { generatePedagogicalBlueprint } from '../src/lib/planner';
import { buildStage2CodePrompt, MASTER_SYSTEM_PROMPT, GAME_RESPONSE_SCHEMA } from '../src/lib/prompts';
import { parseGameOutput } from '../src/lib/sanitizer';
import { verifyGameCode } from '../src/lib/verifier';
import { repairGameHtml } from '../src/lib/repair';
import { GameLevel } from '../src/types/game';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const DEMO_CASES: Array<{
  topic: string;
  level: GameLevel;
  filename: string;
  userIntent: string;
}> = [
  {
    topic: 'Photosynthesis',
    level: 'elementary',
    filename: 'elementary-photosynthesis.html',
    userIntent:
      'I am a young child learning about plants for the first time. Full-page immersive layout (100vw x 100vh). Make it super gentle, cheerful, and explain step-by-step why plants need water, sunlight, and air. Render rich inline SVG assets: organic curved stems, multi-layered gradient green leaves with veins, cute smiling face on the plant, soil layers, glowing water drops, radiant sunbeams. Initial plant starts hungry and thirsty so child must actively feed it. Include a 5-second countdown "What Changed?" pop-up after each stage before the child can continue.',
  },
  {
    topic: 'Projectile Motion',
    level: 'high_school',
    filename: 'high-school-projectile-motion.html',
    userIntent:
      'Make a full-page (100vw x 100vh) physics arena. Render rich inline SVG assets: detailed metallic cannon with angle gauge, wheel spokes, target bullseye with concentric rings. DO NOT pre-set the winning answer! The initial cannon angle must start at 15 degrees and low speed (20 m/s) so firing immediately misses the distant target. The player must calculate, observe the arc, and adjust angle and speed to hit moving targets. Include a 5-second countdown "What Changed?" pop-up when targets are hit explaining trajectory physics.',
  },
  {
    topic: 'Binary Search Algorithm',
    level: 'university',
    filename: 'university-binary-search.html',
    userIntent:
      'Make a full-page (100vw x 100vh) interactive algorithm laboratory. Render rich SVG/styled cards for array elements, glowing pointer pins for Low, Mid, High, and glowing elimination states. The array must start in an un-searched state. Let the player step through Low, Mid, and High pointers, watching the search space halve in real time with plain-English mentor explanations. Include a 5-second countdown "What Changed?" pop-up explaining logarithmic search space elimination.',
  },
];

async function generateAndSaveDemos() {
  const demosDir = path.resolve(process.cwd(), 'demos');
  if (!fs.existsSync(demosDir)) {
    fs.mkdirSync(demosDir, { recursive: true });
  }

  const client = getGeminiClient();
  const model = getPrimaryModel();
  const summaryManifest: Array<{
    level: string;
    topic: string;
    title: string;
    mentor: string;
    conceptExplanation: string;
    takeaways: string[];
    htmlFile: string;
  }> = [];

  for (const demo of DEMO_CASES) {
    console.log(`\n======================================================`);
    console.log(`[STAGE 1] Designing Pedagogical Blueprint for [${demo.level}] "${demo.topic}"...`);
    const blueprint = await generatePedagogicalBlueprint(
      client,
      demo.topic,
      demo.level,
      demo.userIntent
    );

    console.log(`Mentor Guide: ${blueprint.mentorEmoji} ${blueprint.mentorName}`);
    console.log(`Concept: "${blueprint.conceptExplanation}"`);
    console.log(`Stages planned: ${blueprint.stages.length}`);

    console.log(`\n[STAGE 2] Synthesizing Full-Page HTML5 Game Code...`);
    const codePrompt = buildStage2CodePrompt(blueprint, demo.level);

    const { text: rawText, modelUsed } = await generateContentResiliently(client, {
      model,
      contents: codePrompt,
      systemInstruction: MASTER_SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: GAME_RESPONSE_SCHEMA,
      temperature: 0.7,
    });

    const parsed = parseGameOutput(rawText, demo.topic);
    let qaReport = verifyGameCode(parsed.html);
    let finalHtml = qaReport.sanitizedHtml;

    // Automated QA Repair Loop if verifier catches syntax or DOM errors
    if (!qaReport.passed) {
      console.warn(`QA Verifier found issues: ${qaReport.errors.join('; ')}. Dispatching QA repair agent...`);
      const repair = await repairGameHtml(client, parsed.html, qaReport.errors.join('\n'));
      if (repair.success) {
        finalHtml = repair.html;
        console.log(`QA repair succeeded on attempt ${repair.attempts}!`);
      } else {
        console.error('QA repair failed:', repair.error);
      }
    } else {
      console.log(`QA Verifier PASSED with 0 errors! Verified: ${qaReport.testedFunctions.join(', ')}`);
    }

    const targetHtmlPath = path.join(demosDir, demo.filename);
    fs.writeFileSync(targetHtmlPath, finalHtml, 'utf-8');
    console.log(`Saved full-page HTML game to: ${targetHtmlPath} (${finalHtml.length} chars) via ${modelUsed}`);

    summaryManifest.push({
      level: demo.level,
      topic: demo.topic,
      title: parsed.title || blueprint.title,
      mentor: `${blueprint.mentorEmoji} ${blueprint.mentorName}`,
      conceptExplanation: blueprint.conceptExplanation,
      takeaways: parsed.takeaways.length >= 2 ? parsed.takeaways : blueprint.takeaways,
      htmlFile: demo.filename,
    });
  }

  // Save the API response manifest
  const manifestPath = path.join(demosDir, 'sample-api-responses.json');
  fs.writeFileSync(manifestPath, JSON.stringify(summaryManifest, null, 2), 'utf-8');
  console.log(`\nSaved sample API response manifest to: ${manifestPath}`);
  console.log('All full-page, active-learning demo outputs successfully generated and saved to /demos!\n');
}

generateAndSaveDemos().catch((err) => {
  console.error('Error generating demo games:', err);
  process.exit(1);
});
