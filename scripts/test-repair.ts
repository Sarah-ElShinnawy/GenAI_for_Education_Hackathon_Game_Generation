import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { repairGameHtml } from '../src/lib/repair';
import { getGeminiClient } from '../src/lib/gemini';
import { verifyGameCode } from '../src/lib/verifier';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const brokenPath = path.resolve(process.cwd(), 'demos/elementary-photosynthesis.html');
  const brokenHtml = fs.readFileSync(brokenPath, 'utf8');

  console.log('--- Running Initial QA Verification on Broken Demo ---');
  const initialCheck = verifyGameCode(brokenHtml);
  console.log('Passed:', initialCheck.passed);
  console.log('Errors:', initialCheck.errors);

  console.log('\n--- Triggering Automated QA Repair Agent ---');
  const client = getGeminiClient('coder');
  const result = await repairGameHtml(
    client,
    brokenHtml,
    initialCheck.errors.join('\n')
  );

  console.log('Repair Successful:', result.success);
  console.log('Attempts Taken:', result.attempts);

  if (result.success) {
    fs.writeFileSync(brokenPath, result.html, 'utf8');
    console.log('Saved repaired HTML to:', brokenPath);

    const postCheck = verifyGameCode(result.html);
    console.log('\n--- Post-Repair QA Verification ---');
    console.log('Passed:', postCheck.passed);
    console.log('Tested Functions:', postCheck.testedFunctions);
    console.log('Errors:', postCheck.errors);
  } else {
    console.error('Repair failed:', result.error);
  }
}

main().catch((err) => {
  console.error('Script error:', err);
  process.exit(1);
});
