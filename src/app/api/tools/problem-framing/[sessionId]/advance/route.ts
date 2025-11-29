import { NextRequest, NextResponse } from 'next/server';
import { advanceStep } from '@/lib/api/problem-framing';
import { supabase } from '@/lib/supabase/client';

/**
 * POST /api/tools/problem-framing/[sessionId]/advance
 * Advance to the next step (facilitator only - with enterprise-grade security)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    // Parse request body
    const body = await request.json();
    const { nextStep, facilitatorId } = body;

    // === VALIDATION LAYER 1: Input Validation ===
    if (!sessionId || !nextStep || !facilitatorId) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Missing required fields: sessionId, nextStep, facilitatorId'
        },
        { status: 400 }
      );
    }

    // Validate nextStep is a valid number
    if (typeof nextStep !== 'number' || nextStep < 1 || nextStep > 5) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid nextStep value. Must be between 1 and 5'
        },
        { status: 400 }
      );
    }

    // Validate UUIDs format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId) || !uuidRegex.test(facilitatorId)) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid UUID format for sessionId or facilitatorId'
        },
        { status: 400 }
      );
    }

    // === VALIDATION LAYER 2: Session Existence & Authorization ===
    const { data: session, error: sessionError } = await supabase
      .from('tool_sessions')
      .select('id, created_by, status')
      .eq('id', sessionId)
      .single();

    // Check session exists
    if (sessionError || !session) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Session not found or has been deleted'
        },
        { status: 404 }
      );
    }

    // Check facilitator authorization
    if (session.created_by !== facilitatorId) {
      // Log unauthorized attempt for security monitoring
      console.warn(`Unauthorized advance attempt:`, {
        sessionId,
        attemptedBy: facilitatorId,
        actualFacilitator: session.created_by,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only the session facilitator can advance the session'
        },
        { status: 403 }
      );
    }

    // === VALIDATION LAYER 3: State Transition Validation ===
    const validTransitions: Record<string, number[]> = {
      'setup': [2],      // Can only go to input (step 2)
      'input': [3],      // Can only go to review (step 3)
      'review': [4],     // Can only go to finalize (step 4)
      'finalize': [5],   // Can only go to summary (step 5)
    };

    const allowedNextSteps = validTransitions[session.status] || [];

    if (!allowedNextSteps.includes(nextStep)) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: `Invalid state transition. Current status: ${session.status}, cannot advance to step ${nextStep}`,
          currentStatus: session.status,
          allowedNextSteps
        },
        { status: 409 }
      );
    }

    // === VALIDATION LAYER 4: Business Logic Validation ===
    // Check if prerequisites are met for advancement
    if (session.status === 'input' && nextStep === 3) {
      // Verify at least one statement submitted before advancing to review
      const { count, error: countError } = await supabase
        .from('pf_individual_statements')
        .select('id', { count: 'exact', head: true })
        .eq('tool_session_id', sessionId);

      if (countError) {
        throw new Error('Failed to verify statements');
      }

      if (count === 0) {
        return NextResponse.json(
          {
            error: 'Precondition Failed',
            message: 'Cannot advance to review: No statements have been submitted yet'
          },
          { status: 412 }
        );
      }
    }

    // === EXECUTE: Advance the session ===
    await advanceStep(sessionId, nextStep);

    // Log successful advancement for audit trail
    console.log(`Session advanced:`, {
      sessionId,
      facilitatorId,
      fromStatus: session.status,
      toStep: nextStep,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Session advanced successfully',
        nextStep
      },
      { status: 200 }
    );

  } catch (error) {
    // Log error for monitoring
    console.error('Error advancing session:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An error occurred while advancing the session'
      },
      { status: 500 }
    );
  }
}
