import { NextRequest, NextResponse } from 'next/server';
import { advanceStep } from '@/lib/api/problem-framing';

/**
 * POST /api/tools/problem-framing/[sessionId]/advance
 * Advance to the next step (facilitator only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const body = await request.json();
    const { nextStep } = body;

    if (!sessionId || typeof nextStep !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: nextStep (number)' },
        { status: 400 }
      );
    }

    await advanceStep(sessionId, nextStep);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error advancing step:', error);
    return NextResponse.json(
      { error: 'Failed to advance step' },
      { status: 500 }
    );
  }
}
