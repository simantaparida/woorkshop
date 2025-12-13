import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { rateLimiters, getClientIdentifier, createRateLimitResponse } from '@/lib/rate-limit';
import { generateRequestId } from '@/lib/logger';

/**
 * Middleware to:
 * 1. Generate request IDs for tracing
 * 2. Apply rate limiting to protect against abuse
 * 3. Refresh Supabase auth tokens and pass them to Server Components
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ==========================================================
  // REQUEST ID GENERATION
  // ==========================================================

  // Generate unique request ID for tracing
  const requestId = generateRequestId();

  // Add to request headers so API routes can access it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  // ==========================================================
  // RATE LIMITING
  // ==========================================================

  // Apply strict rate limiting to auth endpoints
  if (pathname.startsWith('/auth/') || pathname.startsWith('/api/auth/')) {
    const clientId = getClientIdentifier(request);
    const rateLimitResult = rateLimiters.auth(clientId);

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult, { limit: 5, window: 60000 });
    }
  }

  // Apply moderate rate limiting to API endpoints
  if (pathname.startsWith('/api/')) {
    const clientId = getClientIdentifier(request);
    const rateLimitResult = rateLimiters.api(clientId);

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult, { limit: 100, window: 60000 });
    }
  }

  // ==========================================================
  // SUPABASE AUTH TOKEN REFRESH
  // ==========================================================

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Add request ID to response headers for client-side debugging
  supabaseResponse.headers.set('x-request-id', requestId);

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
