import { NextRequest } from 'next/server';
import { POST } from '../src/app/api/generate-game/route';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testDynamicApi() {
  console.log('--- Testing Dynamic On-Demand API with a Brand-New Topic: "Water Cycle" ---');

  const req = new NextRequest('http://localhost:3000/api/generate-game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'The Water Cycle',
      level: 'elementary',
      userIntent: 'Explain evaporation, condensation, and precipitation to a child with rich standalone SVG vector assets in the DOM.',
    }),
  });

  const res = await POST(req);
  console.log('HTTP Status:', res.status);

  const json = await res.json();
  console.log('Status:', json.status);
  console.log('Title:', json.title);
  console.log('Takeaways:', json.takeaways);
  console.log('HTML Length:', json.html?.length);

  const svgCount = (json.html?.match(/<svg/gi) || []).length;
  console.log('Standalone <svg> assets generated:', svgCount);

  const hasWhatChanged = /what-changed/i.test(json.html);
  console.log('Educational "What Changed?" Modal present:', hasWhatChanged);

  if (json.status === 'success' && svgCount > 0 && hasWhatChanged) {
    console.log('\n🎉 DYNAMIC GENERATION VERIFIED! The AI engine synthesizes fresh topics on the fly with 0 presets! 🎉\n');
  } else {
    console.error('❌ Generation did not meet criteria.');
    process.exit(1);
  }
}

testDynamicApi().catch((e) => {
  console.error('API Test Error:', e);
  process.exit(1);
});
