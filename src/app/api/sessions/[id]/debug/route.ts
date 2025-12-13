import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { verifySessionOwnership } from '@/lib/utils/auth';

/**
 * DEBUG ENDPOINT: Test session deletion prerequisites without actually deleting
 * GET /api/sessions/[id]/debug
 *
 * SECURITY: Only available in development mode and requires session ownership
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // SECURITY: Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }

  const { id } = params;

  // SECURITY: Require authentication and session ownership
  const { authorized, error: authError } = await verifySessionOwnership(id);

  if (!authorized) {
    return NextResponse.json(
      { error: authError || 'Unauthorized' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const hostToken = searchParams.get('host_token');

  const debug = {
    timestamp: new Date().toISOString(),
    sessionId: id,
    checks: {} as Record<string, any>,
  };

  try {
    const supabase = getSupabaseServer();

    // CHECK 1: Server-side auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    debug.checks.auth = {
      success: !!user,
      userId: user?.id,
      // REDACTED: Don't expose email in debug output
      hasAuthCookie: !!user,
      error: authError?.message,
    };

    // CHECK 2: Session fetch with RLS
    const { data: session, error: fetchError } = await supabase
      .from('sessions_unified')
      .select('id, host_token, created_by, title, tool_type, status')
      .eq('id', id)
      .single();

    debug.checks.sessionFetch = {
      success: !!session,
      session: session ? {
        id: session.id,
        title: session.title,
        toolType: session.tool_type,
        status: session.status,
        createdBy: session.created_by,
        hasHostToken: !!session.host_token,
        // REDACTED: Don't expose token preview
      } : null,
      error: fetchError ? {
        code: fetchError.code,
        message: fetchError.message,
        details: fetchError.details,
        hint: fetchError.hint,
      } : null,
      rlsBlocked: fetchError?.code === 'PGRST116',
    };

    // CHECK 3: Authorization logic
    if (session) {
      const isOwner = user && session.created_by === user.id;
      const hasValidToken = hostToken && session.host_token === hostToken;

      debug.checks.authorization = {
        isOwner,
        ownershipCheck: {
          hasUser: !!user,
          userId: user?.id,
          sessionCreatedBy: session.created_by,
          idsMatch: user?.id === session.created_by,
          userIdType: typeof user?.id,
          createdByType: typeof session.created_by,
        },
        hasValidToken,
        tokenCheck: {
          hasProvidedToken: !!hostToken,
          hasSessionToken: !!session.host_token,
          tokensMatch: hostToken === session.host_token,
          // REDACTED: Don't expose token previews
        },
        wouldAuthorize: isOwner || hasValidToken,
      };
    }

    // CHECK 4: Test RLS DELETE policy (dry run)
    if (session && user) {
      // Attempt a dry-run query to check if DELETE would be allowed
      const { error: deleteCheckError } = await supabase
        .from('sessions_unified')
        .delete()
        .eq('id', id)
        .eq('id', '00000000-0000-0000-0000-000000000000'); // Impossible condition

      debug.checks.rlsDeletePolicy = {
        policyWouldAllow: !deleteCheckError || deleteCheckError.code !== '42501',
        error: deleteCheckError ? {
          code: deleteCheckError.code,
          message: deleteCheckError.message,
        } : null,
      };
    }

    // CHECK 5: Count related records
    if (session) {
      const relatedCounts = await Promise.all([
        supabase.from('players').select('id', { count: 'exact', head: true }).eq('session_id', id),
        supabase.from('features').select('id', { count: 'exact', head: true }).eq('session_id', id),
        supabase.from('votes').select('id', { count: 'exact', head: true }).eq('session_id', id),
        supabase.from('pf_individual_statements').select('id', { count: 'exact', head: true }).eq('session_id', id),
        supabase.from('pf_session_participants').select('id', { count: 'exact', head: true }).eq('session_id', id),
      ]);

      debug.checks.relatedRecords = {
        players: relatedCounts[0].count || 0,
        features: relatedCounts[1].count || 0,
        votes: relatedCounts[2].count || 0,
        pfStatements: relatedCounts[3].count || 0,
        pfParticipants: relatedCounts[4].count || 0,
      };
    }

    // CHECK 6: Environment check
    debug.checks.environment = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
    };

    return NextResponse.json({
      debug,
      summary: {
        canDelete: debug.checks.authorization?.wouldAuthorize || false,
        blockers: [
          !debug.checks.auth?.success && 'No authenticated user',
          !debug.checks.sessionFetch?.success && 'Session not found or RLS blocked',
          !debug.checks.authorization?.wouldAuthorize && 'Not authorized (neither owner nor valid token)',
        ].filter(Boolean),
      },
    }, { status: 200 });

  } catch (error) {
    debug.checks.criticalError = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    };

    return NextResponse.json({
      debug,
      error: 'Debug endpoint encountered an error',
    }, { status: 500 });
  }
}
