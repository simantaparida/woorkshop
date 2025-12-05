import { NextRequest, NextResponse } from 'next/server';
import { joinPFSession } from '@/lib/api/problem-framing-server';
import type { JoinPFSessionInput } from '@/types';

/**
 * POST /api/tools/problem-framing/[sessionId]/participants
 * Join a Problem Framing session as a participant
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const body = await request.json();
    const { participantId, participantName } = body;

    if (!sessionId || !participantId || !participantName) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, participantId, participantName' },
        { status: 400 }
      );
    }

    const participant = await joinPFSession({
      sessionId,
      participantId,
      participantName,
    } as JoinPFSessionInput);

    return NextResponse.json(participant, { status: 201 });
  } catch (error: any) {
    console.error('Error joining PF session:', error);

    // Handle unique constraint violation (already joined)
    if (error?.code === '23505') {
      return NextResponse.json(
        { error: 'Participant already joined this session' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to join session' },
      { status: 500 }
    );
  }
}
