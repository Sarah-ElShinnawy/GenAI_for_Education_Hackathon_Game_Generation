import { NextRequest, NextResponse } from 'next/server';
import { saveContactMessage } from '@/lib/db';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { status: 'error', message: 'Name, email, and message are required.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const saved = await saveContactMessage({
      name,
      email,
      role: role || 'student',
      subject: subject || 'General Inquiry',
      message,
    });

    return NextResponse.json({ status: 'success', message: saved }, { status: 201, headers: CORS_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to submit contact message' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
