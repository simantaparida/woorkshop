import { NextRequest, NextResponse } from 'next/server';
import { createPFSession } from '@/lib/api/problem-framing';
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
        tool_session_id: result.sessionId,
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
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
