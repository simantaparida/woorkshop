/**
 * Health Check Endpoint
 *
 * Returns the health status of the application and its dependencies.
 * Used by:
 * - Load balancers to determine if instance is healthy
 * - Monitoring systems to track uptime
 * - Deployment systems to verify successful deployment
 *
 * GET /api/health
 */

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, any> = {};

  // Overall health status
  let healthy = true;

  // 1. Database connectivity check
  try {
    const supabase = getSupabaseServer();
    const dbStart = Date.now();

    // Simple query to test database connection
    const { error } = await supabase
      .from('sessions_unified')
      .select('id')
      .limit(1)
      .single();

    const dbDuration = Date.now() - dbStart;

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine for health check
      checks.database = {
        status: 'unhealthy',
        error: error.message,
        latencyMs: dbDuration
      };
      healthy = false;
    } else {
      checks.database = {
        status: 'healthy',
        latencyMs: dbDuration
      };
    }
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    healthy = false;
  }

  // 2. Environment variables check
  checks.environment = {
    status: 'healthy',
    nodeEnv: process.env.NODE_ENV,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    checks.environment.status = 'unhealthy';
    healthy = false;
  }

  // Calculate total duration
  const duration = Date.now() - startTime;

  const response = {
    status: healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
    responseTimeMs: duration
  };

  return NextResponse.json(
    response,
    {
      status: healthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}
