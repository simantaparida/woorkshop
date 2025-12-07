/**
 * Simple in-memory rate limiter for API routes
 * For production with multiple servers, consider using Upstash Redis or similar
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// Note: This will be cleared on server restart
// For production, use Redis (Upstash, Vercel KV, etc.)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup interval to remove expired entries
const CLEANUP_INTERVAL = 60000; // 1 minute
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window */
  limit: number;
  /** Time window in milliseconds */
  window: number;
}

export interface RateLimitResult {
  /** Whether the request should be allowed */
  success: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Reset time in milliseconds since epoch */
  reset: number;
}

/**
 * Rate limit a request based on an identifier (IP, user ID, etc.)
 *
 * @param identifier - Unique identifier for the client (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 *
 * @example
 * ```ts
 * const result = rateLimit(request.headers.get('x-forwarded-for') || 'unknown', {
 *   limit: 10,
 *   window: 60000 // 10 requests per minute
 * });
 *
 * if (!result.success) {
 *   return new Response('Too many requests', {
 *     status: 429,
 *     headers: {
 *       'X-RateLimit-Limit': String(config.limit),
 *       'X-RateLimit-Remaining': String(result.remaining),
 *       'X-RateLimit-Reset': String(result.reset),
 *     }
 *   });
 * }
 * ```
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  const entry = rateLimitStore.get(key);

  // If no entry exists or the window has expired, create a new one
  if (!entry || entry.resetTime < now) {
    const resetTime = now + config.window;
    rateLimitStore.set(key, {
      count: 1,
      resetTime,
    });

    return {
      success: true,
      remaining: config.limit - 1,
      reset: resetTime,
    };
  }

  // Increment the counter
  entry.count++;

  // Check if limit is exceeded
  if (entry.count > config.limit) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  return {
    success: true,
    remaining: config.limit - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  /** Strict rate limit for authentication endpoints: 5 requests per minute */
  auth: (identifier: string) => rateLimit(identifier, {
    limit: 5,
    window: 60000, // 1 minute
  }),

  /** Moderate rate limit for API endpoints: 100 requests per minute */
  api: (identifier: string) => rateLimit(identifier, {
    limit: 100,
    window: 60000, // 1 minute
  }),

  /** Generous rate limit for read operations: 300 requests per minute */
  read: (identifier: string) => rateLimit(identifier, {
    limit: 300,
    window: 60000, // 1 minute
  }),

  /** Very strict rate limit for expensive operations: 10 requests per hour */
  expensive: (identifier: string) => rateLimit(identifier, {
    limit: 10,
    window: 3600000, // 1 hour
  }),
};

/**
 * Helper to get client identifier from request
 * Uses IP address from headers or falls back to 'unknown'
 *
 * @param request - Next.js request object
 * @returns Client identifier string
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (works with Vercel and most proxies)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to 'unknown' if no IP is available
  // In production, you might want to reject requests without proper headers
  return 'unknown';
}

/**
 * Create a rate-limited response with proper headers
 *
 * @param result - Rate limit result
 * @param config - Rate limit configuration
 * @returns Response object with 429 status and rate limit headers
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  config: RateLimitConfig
): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(config.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
        'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
      },
    }
  );
}
