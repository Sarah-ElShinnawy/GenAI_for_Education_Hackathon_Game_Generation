import * as fs from 'fs';
import * as path from 'path';
import { verifyGameCode } from '../src/lib/verifier';

const demoFiles = [
  'elementary-photosynthesis.html',
  'high-school-projectile-motion.html',
  'university-binary-search.html',
];

console.log('--- Verifying All Generated Demo Games in /demos ---');
let allPassed = true;

for (const file of demoFiles) {
  const filePath = path.resolve(process.cwd(), 'demos', file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    allPassed = false;
    continue;
  }

  const html = fs.readFileSync(filePath, 'utf8');
  const report = verifyGameCode(html);

  console.log(`\n📄 [${file}] (${html.length} chars)`);
  console.log(`   Passed: ${report.passed ? '✅ YES' : '❌ NO'}`);
  console.log(`   Tested: ${report.testedFunctions.join(' | ')}`);
  if (report.warnings.length > 0) {
    console.log(`   ⚠️ Warnings: ${report.warnings.join('; ')}`);
  }
  if (!report.passed) {
    console.error(`   ❌ Errors: ${report.errors.join('; ')}`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log('\n🎉 ALL 3 DEMO GAMES PASSED FULL QA VERIFICATION WITH 0 ERRORS! 🎉\n');
  process.exit(0);
} else {
  console.error('\n❌ Some demo games failed verification.\n');
  process.exit(1);
}
