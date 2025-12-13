/**
 * Liveness Probe Endpoint
 *
 * Indicates whether the application is alive and running.
 * Returns 200 if alive, 503 if not.
 *
 * Used by Kubernetes to determine if a pod needs to be restarted.
 * This should be a very lightweight check - just verify the process is running.
 *
 * GET /api/live
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // Simple check - if we can respond, we're alive
  return NextResponse.json(
    {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      }
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
      },
    }
  );
}
