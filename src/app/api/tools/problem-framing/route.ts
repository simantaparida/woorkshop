import { NextRequest, NextResponse } from 'next/server';
import { createPFSession } from '@/lib/api/problem-framing';
import type { CreatePFSessionInput } from '@/types';

/**
 * POST /api/tools/problem-framing
 * Create a new Problem Framing session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, facilitatorId, facilitatorName }: CreatePFSessionInput = body;

    if (!title || !facilitatorId || !facilitatorName) {
      return NextResponse.json(
        { error: 'Missing required fields: title, facilitatorId, facilitatorName' },
        { status: 400 }
      );
    }

    const result = await createPFSession({
      title,
      description,
      facilitatorId,
      facilitatorName,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating PF session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
