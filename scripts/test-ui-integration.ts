import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import JSZip from 'jszip';
import { NextRequest } from 'next/server';
import { parsePptxBuffer } from '../src/lib/pptx-parser';

async function createSamplePptxBuffer(): Promise<Buffer> {
  const zip = new JSZip();

  // Create minimal PPTX structure
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`);

  zip.file('ppt/slides/slide1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p><a:r><a:t>Introduction to Cellular Respiration</a:t></a:r></a:p>
          <a:p><a:r><a:t>Glycolysis converts glucose into pyruvate in the cytoplasm.</a:t></a:r></a:p>
          <a:p><a:r><a:t>Yields 2 ATP and 2 NADH molecules anaerobically.</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`);

  zip.file('ppt/slides/slide2.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p><a:r><a:t>Krebs Cycle and Electron Transport Chain</a:t></a:r></a:p>
          <a:p><a:r><a:t>Occurs within the mitochondrial matrix and inner membrane.</a:t></a:r></a:p>
          <a:p><a:r><a:t>Oxidative phosphorylation generates up to 34 ATP using ATP synthase.</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`);

  return zip.generateAsync({ type: 'nodebuffer' });
}

async function runTests() {
  console.log('=== Testing UI Integration & PPTX/Document Engine ===\n');

  // 1. Test PPTX Parser directly
  console.log('[1/4] Testing PPTX buffer parser...');
  const pptxBuf = await createSamplePptxBuffer();
  const parsedPptx = await parsePptxBuffer(pptxBuf, 'Respiration_Lecture.pptx');

  console.log(`  ✓ Title: "${parsedPptx.title}"`);
  console.log(`  ✓ Total Slides parsed: ${parsedPptx.totalSlides}`);
  console.log(`  ✓ Slide 1 Title: "${parsedPptx.slides[0].title}"`);
  console.log(`  ✓ Slide 1 Bullets: ${parsedPptx.slides[0].bullets.length} items`);
  console.log(`  ✓ Slide 1 Tags: ${parsedPptx.slides[0].tags.join(', ')}`);
  console.log(`  ✓ Slide 2 Title: "${parsedPptx.slides[1].title}"`);

  if (parsedPptx.totalSlides !== 2) {
    throw new Error(`Expected 2 slides, got ${parsedPptx.totalSlides}`);
  }

  // 2. Test Document Analyzer with PPTX input
  console.log('\n[2/4] Testing Document Analyzer with PPTX input...');
  const { analyzeDocumentsAndPlanGames } = await import('../src/lib/document-analyzer');
  const { getGeminiClient } = await import('../src/lib/gemini');

  const client = getGeminiClient('planner');
  const result = await analyzeDocumentsAndPlanGames(
    client,
    [
      {
        name: 'Respiration_Lecture.pptx',
        type: 'pptx',
        buffer: pptxBuf,
      },
    ],
    'high_school',
    'Focus on ATP synthesis and energy yield'
  );

  console.log(`  ✓ Density: ${result.density}`);
  console.log(`  ✓ Game Count: ${result.gameCount}`);
  console.log(`  ✓ Blueprint Title: "${result.blueprints[0].title}"`);
  console.log(`  ✓ Objectives generated: ${result.blueprints[0].objectives?.length || 0}`);

  // 3. Test /api/analyze-document for DocumentSideViewer
  console.log('\n[3/4] Testing /api/analyze-document endpoint for DocumentSideViewer...');
  const { POST: analyzeDocPost } = await import('../src/app/api/analyze-document/route');

  const analyzeFormData = new FormData();
  const pptxBlobForViewer = new Blob([new Uint8Array(pptxBuf)], {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  });
  analyzeFormData.append('file', pptxBlobForViewer as any, 'Respiration_Lecture.pptx');

  const analyzeReq = new NextRequest('http://localhost:3000/api/analyze-document', {
    method: 'POST',
    body: analyzeFormData,
  });

  const analyzeRes = await analyzeDocPost(analyzeReq);
  const analyzeData = await analyzeRes.json();

  console.log(`  ✓ Analyze Status: ${analyzeRes.status}`);
  console.log(`  ✓ Extracted Title: "${analyzeData.document?.title}"`);
  console.log(`  ✓ Total Slides: ${analyzeData.document?.totalSlides}`);
  console.log(`  ✓ Slide 1: "${analyzeData.document?.slides?.[0]?.title}"`);
  console.log(`  ✓ Extracted Terms: ${analyzeData.document?.extractedTerms}`);

  if (analyzeRes.status !== 200 || !analyzeData.document?.slides?.length) {
    throw new Error('Analyze document endpoint failed to extract slides.');
  }

  // 4. Test generate-from-docs route with PPTX FormData
  console.log('\n[4/4] Testing /api/generate-from-docs endpoint with PPTX upload...');
  const { POST: generateDocsPost } = await import('../src/app/api/generate-from-docs/route');

  const generateFormData = new FormData();
  const pptxBlob = new Blob([new Uint8Array(pptxBuf)], {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  });
  generateFormData.append('files', pptxBlob as any, 'Respiration_Lecture.pptx');
  generateFormData.append('level', 'highschool'); // Testing UI's 'highschool' without underscore
  generateFormData.append('prompt', 'Cellular respiration ATP challenge');

  const generateReq = new NextRequest('http://localhost:3000/api/generate-from-docs', {
    method: 'POST',
    body: generateFormData,
  });

  const generateRes = await generateDocsPost(generateReq);
  const generateData = await generateRes.json();

  console.log(`  ✓ Response Status: ${generateRes.status}`);
  console.log(`  ✓ Mode: ${generateData.mode}`);
  console.log(`  ✓ Density: ${generateData.density}`);
  console.log(`  ✓ Games count: ${generateData.games?.length}`);
  console.log(`  ✓ Game 1 Title: "${generateData.games[0]?.title}"`);
  console.log(`  ✓ Game 1 HTML length: ${generateData.games[0]?.html?.length} chars`);
  console.log(`  ✓ Game 1 Takeaways: ${generateData.games[0]?.takeaways?.length}`);
  console.log(`  ✓ Game 1 Objectives: ${generateData.games[0]?.objectives?.length}`);

  if (generateRes.status !== 200 || !generateData.games?.[0]?.html) {
    throw new Error('API failed to synthesize working game from PPTX.');
  }

  console.log('\n🎉 ALL UI INTEGRATION & PPTX/DOCUMENT TESTS PASSED WITH 0 ERRORS! 🎉');
}

runTests().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
