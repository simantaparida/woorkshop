import { NextRequest, NextResponse } from 'next/server';
import { submitStatement } from '@/lib/api/problem-framing-server';
import type { SubmitPFStatementInput } from '@/types';

/**
 * POST /api/tools/problem-framing/[sessionId]/statements
 * Submit an individual problem statement
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const body = await request.json();
    const { participantId, participantName, statement } = body;

    if (!sessionId || !participantId || !participantName || !statement) {
      return NextResponse.json(
        { error: 'Missing required fields: participantId, participantName, statement' },
        { status: 400 }
      );
    }

    const result = await submitStatement({
      sessionId,
      participantId,
      participantName,
      statement,
    } as SubmitPFStatementInput);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error submitting statement:', error);
    return NextResponse.json(
      { error: 'Failed to submit statement' },
      { status: 500 }
    );
  }
}
