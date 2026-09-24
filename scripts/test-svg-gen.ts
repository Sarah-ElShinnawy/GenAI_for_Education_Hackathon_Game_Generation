import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

async function testSvg() {
  try {
    const res = await client.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: `Generate a beautiful, modern, high-quality SVG illustration of a 2D game asset: a cute stylized potted plant with layered leaves, veins, cute expressive eyes, and terracotta pot with gradient shading. 
Output ONLY valid inline <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">...</svg> code with <defs><linearGradient> and <path> details. No markdown.`,
    });
    console.log('SVG Output length:', res.text?.length);
    console.log(res.text?.slice(0, 800));
  } catch(e) {
    console.error('Error:', e);
  }
}

testSvg();
