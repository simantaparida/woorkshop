import { NextRequest, NextResponse } from 'next/server';
import { togglePin } from '@/lib/api/problem-framing-server';
import type { TogglePFPinInput } from '@/types';

/**
 * POST /api/tools/problem-framing/[sessionId]/pins
 * Toggle a pin on a statement (add or remove)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const body = await request.json();
    const { statementId, participantId, participantName } = body;

    if (!statementId || !participantId || !participantName) {
      return NextResponse.json(
        { error: 'Missing required fields: statementId, participantId, participantName' },
        { status: 400 }
      );
    }

    await togglePin({
      statementId,
      participantId,
      participantName,
    } as TogglePFPinInput);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error toggling pin:', error);
    return NextResponse.json(
      { error: 'Failed to toggle pin' },
      { status: 500 }
    );
  }
}
