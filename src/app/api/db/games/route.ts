import { NextRequest, NextResponse } from 'next/server';
import { saveGame, getRecentGames } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  try {
    const games = await getRecentGames(20);
    return NextResponse.json({ status: 'success', games }, { status: 200, headers: CORS_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to fetch games' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, level, sourceType, title, html, takeaways, objectives } = body;

    if (!topic || !html) {
      return NextResponse.json(
        { status: 'error', message: 'topic and html are required fields' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const saved = await saveGame({
      topic,
      level: level || 'highschool',
      sourceType: sourceType || 'topic',
      title: title || topic,
      html,
      takeaways: Array.isArray(takeaways) ? takeaways : [],
      objectives: Array.isArray(objectives) ? objectives : [],
    });

    return NextResponse.json({ status: 'success', game: saved }, { status: 201, headers: CORS_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to save game' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
