/**
 * Readiness Probe Endpoint
 *
 * Indicates whether the application is ready to accept traffic.
 * Returns 200 if ready, 503 if not ready.
 *
 * Used by Kubernetes and load balancers to determine when to start
 * routing traffic to a new instance.
 *
 * GET /api/ready
 */

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function GET() {
  try {
    // Check database connectivity
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from('sessions_unified')
      .select('id')
      .limit(1);

    // If we can query the database, we're ready
    if (error && error.code !== 'PGRST116') {
      return NextResponse.json(
        { status: 'not ready', reason: 'Database not accessible' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: 'ready',
        timestamp: new Date().toISOString()
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'not ready',
        reason: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}
