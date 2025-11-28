import { NextRequest, NextResponse } from 'next/server';
import { getPFSessionData } from '@/lib/api/problem-framing';

/**
 * GET /api/tools/problem-framing/[sessionId]
 * Get complete Problem Framing session data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const data = await getPFSessionData(sessionId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching PF session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session data' },
      { status: 500 }
    );
  }
}
