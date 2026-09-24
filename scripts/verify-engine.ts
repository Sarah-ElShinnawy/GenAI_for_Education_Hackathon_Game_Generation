import { stripMarkdown, validateGameHtml, parseGameOutput } from '../src/lib/sanitizer';
import { repairGameHtml } from '../src/lib/repair';
import { getGeminiClient, getPrimaryModel, generateContentResiliently } from '../src/lib/gemini';
import { buildUserPrompt, MASTER_SYSTEM_PROMPT, GAME_RESPONSE_SCHEMA } from '../src/lib/prompts';
import { GameLevel } from '../src/types/game';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ ${message}`);
  }
}

async function testSanitizerUnitTests() {
  console.log('\n--- 1. Testing Sanitizer & Structural Validator ---');

  // Test 1: Markdown stripping
  const markdownSample = '```html\n<!DOCTYPE html><html><head></head><body><script>console.log(1);</script></body></html>\n```';
  const stripped = stripMarkdown(markdownSample);
  assert(stripped.startsWith('<!DOCTYPE html>') && stripped.endsWith('</html>'), 'stripMarkdown cleans code blocks cleanly');

  // Test 2: Conversational intro & outro removal
  const conversationalSample = 'Here is the game you requested:\n<!DOCTYPE html><html><head></head><body><script>console.log(1);</script></body></html>\nEnjoy playing!';
  const strippedConv = stripMarkdown(conversationalSample);
  assert(strippedConv.startsWith('<!DOCTYPE html>') && strippedConv.endsWith('</html>'), 'stripMarkdown trims conversational intro and outro');

  // Test 3: Structural validation on valid game
  const validGame = `<!DOCTYPE html>
<html>
<head><style>body { margin: 0; background: #000; }</style></head>
<body>
  <div id="hud"><button id="restart">Restart</button></div>
  <canvas id="game"></canvas>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const audio = new (window.AudioContext || window.webkitAudioContext)();
      console.log('Game started');
    });
  </script>
</body>
</html>`;
  const validRes = validateGameHtml(validGame);
  assert(validRes.isValid, 'validateGameHtml recognizes valid standalone game');

  // Test 4: Missing script tag fails
  const missingScript = `<!DOCTYPE html><html><head></head><body><div>No script</div></body></html>`;
  const invalidRes1 = validateGameHtml(missingScript);
  assert(!invalidRes1.isValid && invalidRes1.error!.includes('<script>'), 'validateGameHtml catches missing script block');

  // Test 5: External CDN dependency fails
  const externalDep = `<!DOCTYPE html><html><head><script src="https://cdn.jsdelivr.net/npm/phaser"></script></head><body><script>console.log(1);</script></body></html>`;
  const invalidRes2 = validateGameHtml(externalDep);
  assert(!invalidRes2.isValid && invalidRes2.error!.includes('zero-external-dependencies'), 'validateGameHtml blocks external CDN scripts');
}

async function testLiveGeneration(topic: string, level: GameLevel) {
  console.log(`\n--- Testing Live Generation: "${topic}" (${level}) ---`);
  const client = getGeminiClient();
  const model = getPrimaryModel();
  const prompt = buildUserPrompt(topic, level);

  const start = Date.now();
  const { text: rawText, modelUsed } = await generateContentResiliently(client, {
    model,
    contents: prompt,
    systemInstruction: MASTER_SYSTEM_PROMPT,
    responseMimeType: 'application/json',
    responseSchema: GAME_RESPONSE_SCHEMA,
    temperature: 0.7,
  });
  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`Generated in ${elapsed}s using ${modelUsed}`);

  const parsed = parseGameOutput(rawText, topic);

  assert(typeof parsed.title === 'string' && parsed.title.length > 0, `Game has title: "${parsed.title}"`);
  assert(Array.isArray(parsed.takeaways) && parsed.takeaways.length >= 2, `Game has ${parsed.takeaways.length} takeaways`);
  console.log('Takeaways:', parsed.takeaways);

  const validation = validateGameHtml(parsed.html);
  assert(validation.isValid, `HTML passes structural validation (${validation.error || 'Passed'})`);
  assert(validation.sanitizedHtml.includes('AudioContext') || validation.sanitizedHtml.includes('webkitAudioContext'), 'Game incorporates Web Audio API sound synthesis');
  assert(!/<(?:script|link|img)[^>]*(?:src|href)=["']https?:\/\//i.test(validation.sanitizedHtml), 'Zero external dependencies verified');

  console.log(`Game HTML length: ${validation.sanitizedHtml.length} characters`);
}

async function testSelfHealingRepair() {
  console.log('\n--- 2. Testing Automated Self-Healing Repair Loop ---');
  const client = getGeminiClient();

  // Intentionally broken HTML (missing closing tags, broken script syntax)
  const brokenSnippet = `<html><head><style>body { color: red; }</style><body><h1>Incomplete Game<canvas id="c"></canvas><script>function start() { const ctx = document.getElementById('c').getContext('2d');`;
  const validationBefore = validateGameHtml(brokenSnippet);
  assert(!validationBefore.isValid, 'Broken snippet correctly recognized as invalid');

  console.log(`Triggering repair loop with error: "${validationBefore.error}"...`);
  const repairResult = await repairGameHtml(client, brokenSnippet, validationBefore.error || 'Incomplete HTML and syntax');

  assert(repairResult.success, 'Automated repair loop succeeded');
  assert(repairResult.html.startsWith('<!DOCTYPE html>') || repairResult.html.startsWith('<html'), 'Repaired HTML starts with doctype/html');
  assert(repairResult.html.includes('</html>'), 'Repaired HTML contains </html>');
  assert(repairResult.html.includes('</script>'), 'Repaired HTML contains </script>');
  console.log(`Repaired HTML length: ${repairResult.html.length} chars`);
}

async function runAllTests() {
  try {
    await testSanitizerUnitTests();
    await testSelfHealingRepair();
    await testLiveGeneration('Photosynthesis', 'elementary');
    await testLiveGeneration('Projectile Motion', 'high_school');
    await testLiveGeneration('Binary Search', 'university');

    console.log('\n🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

runAllTests();
