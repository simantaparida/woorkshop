import { NextRequest, NextResponse } from 'next/server';
import { finalizePFStatement } from '@/lib/api/problem-framing-server';
import type { FinalizePFStatementInput } from '@/types';

/**
 * POST /api/tools/problem-framing/[sessionId]/finalize
 * Finalize the final problem statement (facilitator only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const body = await request.json();
    const { statement, participantId, participantName } = body;

    if (!sessionId || !statement || !participantId || !participantName) {
      return NextResponse.json(
        { error: 'Missing required fields: statement, participantId, participantName' },
        { status: 400 }
      );
    }

    const result = await finalizePFStatement({
      sessionId,
      statement,
      participantId,
      participantName,
    } as FinalizePFStatementInput);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error finalizing statement:', error);
    return NextResponse.json(
      { error: 'Failed to finalize statement' },
      { status: 500 }
    );
  }
}
