import { NextRequest, NextResponse } from 'next/server';
import { createPFSession } from '@/lib/api/problem-framing-server';
import { getSupabaseServer } from '@/lib/supabase/server';
import type { CreatePFSessionInput } from '@/types';

/**
 * POST /api/tools/problem-framing
 * Create a new Problem Framing session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, facilitatorId, facilitatorName, attachments }: CreatePFSessionInput & { attachments?: any[] } = body;

    if (!title || !facilitatorId || !facilitatorName) {
      return NextResponse.json(
        { error: 'Missing required fields: title, facilitatorId, facilitatorName' },
        { status: 400 }
      );
    }

    // Get authenticated user from server-side Supabase
    const supabase = getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    // Use authenticated user ID if available, otherwise use facilitatorId (for anonymous users)
    const createdBy = user?.id || facilitatorId;

    // 1. Create the session
    const result = await createPFSession({
      title,
      description,
      facilitatorId: createdBy,
      facilitatorName,
    });

    // 2. Save attachments if any
    if (attachments && attachments.length > 0 && result.sessionId) {
      const supabase = getSupabaseServer();

      const attachmentsToInsert = attachments.map(att => ({
        session_id: result.sessionId,
        type: att.type,
        name: att.name,
        url: att.url,
        size: att.size || null
      }));

      const { error: attachmentError } = await supabase
        .from('pf_attachments')
        .insert(attachmentsToInsert as any);

      if (attachmentError) {
        console.warn('Attachments table not found or save failed:', attachmentError);
        // We don't fail the whole request if attachments fail, but we log it
      }
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating PF session:', error);

    // Extract detailed error info
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = (error as any)?.details || (error as any)?.hint || '';
    const errorCode = (error as any)?.code || '';

    // Log full details for debugging
    console.error('Error details:', {
      message: errorMessage,
      code: errorCode,
      details: errorDetails,
      stack: error instanceof Error ? error.stack : undefined
    });

    // Return more helpful error message
    let userMessage = 'Failed to create session';
    if (errorCode === '23503') {
      userMessage = 'Database constraint violation - please check foreign key references';
    } else if (errorCode === '42501') {
      userMessage = 'Permission denied. Please ensure database policies are configured correctly.';
    } else if (errorMessage.includes('Unable to add facilitator')) {
      userMessage = 'Failed to add facilitator to session';
    } else if (errorMessage.includes('required')) {
      userMessage = errorMessage; // Pass validation errors directly
    } else if (errorMessage && errorMessage !== 'Unknown error') {
      userMessage = errorMessage;
    }

    return NextResponse.json(
      {
        error: userMessage,
        ...(process.env.NODE_ENV === 'development' && {
          debug: { code: errorCode, details: errorDetails, message: errorMessage }
        })
      },
      { status: 500 }
    );
  }
}
