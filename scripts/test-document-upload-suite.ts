import { NextRequest } from 'next/server';
import { POST } from '../src/app/api/generate-from-docs/route';
import { verifyGameCode } from '../src/lib/verifier';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Helper to create a valid minimal PDF buffer with embedded text
function createSimplePdfBuffer(title: string, content: string): Buffer {
  const pdfString = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R>>endobj
4 0 obj<</Length ${content.length + 100}>>stream
BT /F1 16 Tf 50 700 Td (${title}) Tj ET
BT /F1 12 Tf 50 650 Td (${content}) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000052 00000 n 
0000000111 00000 n 
0000000212 00000 n 
trailer<</Size 5/Root 1 0 R>>
startxref
400
%%EOF`;
  return Buffer.from(pdfString);
}

async function testDocumentSuite() {
  console.log('================================================================');
  console.log('🧪 Testing Multi-PDF Ingestion & Density-Based Game Suite Engine');
  console.log('================================================================');

  // Create 2 distinct educational PDFs
  const pdf1Buffer = createSimplePdfBuffer(
    'Physics Module 1: Newton Laws of Motion',
    'Force equals mass times acceleration (F = m * a). Inertia keeps objects moving unless acted upon.'
  );

  const pdf2Buffer = createSimplePdfBuffer(
    'Physics Module 2: Conservation of Mechanical Energy',
    'Potential energy (PE = m * g * h) converts into Kinetic energy (KE = 0.5 * m * v^2) on roller coasters.'
  );

  console.log(`Created 2 PDF buffers: PDF 1 (${pdf1Buffer.length} bytes), PDF 2 (${pdf2Buffer.length} bytes).`);

  // Construct standard web FormData
  const formData = new FormData();
  formData.append(
    'files',
    new Blob([new Uint8Array(pdf1Buffer)], { type: 'application/pdf' }),
    'Module_1_Newton_Laws.pdf'
  );
  formData.append(
    'files',
    new Blob([new Uint8Array(pdf2Buffer)], { type: 'application/pdf' }),
    'Module_2_Energy_Conservation.pdf'
  );
  formData.append('level', 'high_school');
  formData.append('prompt', 'Create separate interactive labs for Newton mechanics and energy conservation.');

  console.log('\nDispatching POST request to /api/generate-from-docs...');
  const req = new NextRequest('http://localhost:3000/api/generate-from-docs', {
    method: 'POST',
    body: formData,
  });

  const startTime = Date.now();
  const res = await POST(req);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`HTTP Status: ${res.status} (Finished in ${elapsed}s)`);

  const json = await res.json();
  if (json.status !== 'success') {
    console.error('❌ Generation failed:', json.message);
    process.exit(1);
  }

  console.log(`\n✅ Document Analysis Successful!`);
  console.log(`   Content Density Assessed: "${json.density}"`);
  console.log(`   Curriculum Summary: "${json.summary}"`);
  console.log(`   Total Games Synthesized in Suite: ${json.games.length}`);

  let allPassed = true;
  for (let i = 0; i < json.games.length; i++) {
    const game = json.games[i];
    console.log(`\n🎮 [Game ${i + 1} of ${json.games.length}] "${game.title}"`);
    console.log(`   Takeaways (${game.takeaways.length}): ${game.takeaways.join('; ')}`);
    console.log(`   HTML Size: ${game.html.length} chars`);

    const qa = verifyGameCode(game.html);
    console.log(`   QA Passed: ${qa.passed ? '✅ YES' : '❌ NO'}`);
    console.log(`   Verified: ${qa.testedFunctions.join(' | ')}`);
    if (qa.warnings.length > 0) {
      console.log(`   ⚠️ Warnings: ${qa.warnings.join('; ')}`);
    }
    if (!qa.passed) {
      console.error(`   ❌ Errors: ${qa.errors.join('; ')}`);
      allPassed = false;
    }
  }

  if (allPassed && json.games.length >= 1) {
    console.log('\n🎉 ALL GAMES IN THE MULTI-PDF SUITE PASSED QA VERIFICATION WITH 0 ERRORS! 🎉\n');
  } else {
    console.error('\n❌ QA verification failed on some games in the suite.\n');
    process.exit(1);
  }
}

testDocumentSuite().catch((err) => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});
