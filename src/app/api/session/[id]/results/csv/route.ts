import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { aggregateVotes } from '@/lib/utils/helpers';
import { sanitizeCSVCell } from '@/lib/utils/csv';
import { verifySessionAccess } from '@/lib/utils/auth';
import { createApiLogger, logError } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const log = createApiLogger(requestId, `/api/session/${params.id}/results/csv`, 'GET');
  const startTime = Date.now();

  try {
    const { id: sessionId } = params;

    log.info({ sessionId }, 'Exporting session results to CSV');

    // SECURITY: Verify user has access to this session
    const { authorized, error: authError } = await verifySessionAccess(sessionId);

    if (!authorized) {
      log.warn({ sessionId, reason: authError }, 'CSV export access denied');
      return NextResponse.json(
        { error: authError || 'Access denied' },
        { status: authError === 'Session not found' ? 404 : 403 }
      );
    }

    const supabase = getSupabaseServer();

    // Fetch session
    const { data: session, error: sessionError } = await supabase
      .from('sessions_unified')
      .select('title, project_name')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      log.warn({ sessionId }, 'Session not found for CSV export');
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Fetch features and votes
    const { data: features } = await supabase
      .from('features')
      .select('*')
      .eq('session_id', sessionId);

    const { data: votes } = await supabase
      .from('votes')
      .select('*')
      .eq('session_id', sessionId);

    // Aggregate votes
    const results = aggregateVotes(features || [], votes || []);

    // Build CSV with sanitization to prevent CSV injection
    const csvRows: string[] = [];

    // Header row
    csvRows.push([
      'Rank',
      'Feature',
      'Description',
      'Average Points',
      'Total Votes',
      'Effort',
      'Impact'
    ].map(h => sanitizeCSVCell(h)).join(','));

    // Data rows with CSV injection protection
    results.forEach((feature: any, index: number) => {
      csvRows.push([
        index + 1,
        sanitizeCSVCell(feature.title),
        sanitizeCSVCell(feature.description),
        sanitizeCSVCell(feature.averagePoints?.toFixed(1) || '0'),
        sanitizeCSVCell(feature.totalVotes || 0),
        sanitizeCSVCell(feature.effort || ''),
        sanitizeCSVCell(feature.impact || '')
      ].join(','));
    });

    const csv = csvRows.join('\n');

    const sessionName = session.title || session.project_name || 'session';
    const filename = `${sessionName.replace(/[^a-z0-9]/gi, '_')}_results.csv`;

    const duration = Date.now() - startTime;
    log.info({
      sessionId,
      featureCount: results.length,
      csvSize: csv.length,
      durationMs: duration,
      filename
    }, 'CSV export completed successfully');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        // Security headers
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(log, error, {
      sessionId: params.id,
      durationMs: duration
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
