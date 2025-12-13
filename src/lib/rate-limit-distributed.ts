/**
 * Distributed rate limiter using Upstash Redis
 * Production-ready implementation that works across multiple server instances
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client (only if environment variables are set)
let redis: Redis | null = null;
let isUpstashConfigured = false;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    isUpstashConfigured = true;
  }
} catch (error) {
  console.warn('Failed to initialize Upstash Redis:', error);
}

// Fallback to in-memory rate limiter when Upstash is not configured
import { rateLimit as inMemoryRateLimit } from './rate-limit';

export interface RateLimitResult {
  /** Whether the request should be allowed */
  success: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Reset time in milliseconds since epoch */
  reset: number;
  /** Optional limit value */
  limit?: number;
  /** Whether this result came from in-memory fallback */
  usingFallback?: boolean;
}

/**
 * Create a distributed rate limiter with sliding window algorithm
 */
function createRateLimiter(
  requests: number,
  window: string,
  prefix: string
): (identifier: string) => Promise<RateLimitResult> {
  // If Upstash is not configured, return fallback function
  if (!redis || !isUpstashConfigured) {
    const windowMs = parseWindowToMs(window);
    return async (identifier: string) => {
      const result = inMemoryRateLimit(identifier, {
        limit: requests,
        window: windowMs,
      });
      return {
        ...result,
        limit: requests,
        usingFallback: true,
      };
    };
  }

  // Create Upstash rate limiter with sliding window
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `ratelimit:${prefix}`,
    analytics: true,
  });

  return async (identifier: string): Promise<RateLimitResult> => {
    try {
      const result = await limiter.limit(identifier);

      return {
        success: result.success,
        remaining: result.remaining,
        reset: result.reset,
        limit: result.limit,
        usingFallback: false,
      };
    } catch (error) {
      console.error('Upstash rate limit error, falling back to in-memory:', error);

      // Fallback to in-memory on error
      const windowMs = parseWindowToMs(window);
      const fallbackResult = inMemoryRateLimit(identifier, {
        limit: requests,
        window: windowMs,
      });

      return {
        ...fallbackResult,
        limit: requests,
        usingFallback: true,
      };
    }
  };
}

/**
 * Parse window string (e.g., "60 s", "10 m") to milliseconds
 */
function parseWindowToMs(window: string): number {
  const match = window.match(/^(\d+)\s*([smhd])$/);
  if (!match) {
    throw new Error(`Invalid window format: ${window}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1000,        // seconds
    m: 60000,       // minutes
    h: 3600000,     // hours
    d: 86400000,    // days
  };

  return value * multipliers[unit];
}

/**
 * Pre-configured distributed rate limiters for common use cases
 */
export const rateLimiters = {
  /**
   * Strict rate limit for authentication endpoints
   * 5 requests per minute per IP
   */
  auth: createRateLimiter(5, '60 s', 'auth'),

  /**
   * Moderate rate limit for general API endpoints
   * 100 requests per minute per IP
   */
  api: createRateLimiter(100, '60 s', 'api'),

  /**
   * Generous rate limit for read operations
   * 300 requests per minute per IP
   */
  read: createRateLimiter(300, '60 s', 'read'),

  /**
   * Strict limit for vote submissions
   * 10 requests per minute per IP
   */
  vote: createRateLimiter(10, '60 s', 'vote'),

  /**
   * Very strict limit for CSV exports (expensive operation)
   * 2 requests per minute per IP
   */
  export: createRateLimiter(2, '60 s', 'export'),

  /**
   * Session creation limit
   * 20 sessions per hour per IP
   */
  createSession: createRateLimiter(20, '60 m', 'create-session'),
};

/**
 * Helper to get composite client identifier from request
 * Uses IP address + optional user ID for better rate limiting
 *
 * @param request - Next.js request object
 * @param userId - Optional authenticated user ID
 * @returns Client identifier string
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  // Try to get IP from headers (works with Vercel and most proxies)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0].trim() ||
             request.headers.get('x-real-ip') ||
             'unknown';

  // Composite identifier: IP + user ID (if authenticated)
  // This prevents a single user from bypassing limits with multiple IPs
  // and prevents shared IPs (corporate NAT) from affecting all users
  if (userId) {
    return `${ip}:${userId}`;
  }

  return ip;
}

/**
 * Create a rate-limited response with proper headers
 *
 * @param result - Rate limit result
 * @returns Response object with 429 status and rate limit headers
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: Math.max(retryAfter, 0),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(result.limit || 0),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
        'Retry-After': String(Math.max(retryAfter, 0)),
      },
    }
  );
}

/**
 * Check if Upstash Redis is properly configured
 */
export function isRedisConfigured(): boolean {
  return isUpstashConfigured;
}

/**
 * Get configuration status for monitoring
 */
export function getRateLimitConfig() {
  return {
    provider: isUpstashConfigured ? 'upstash' : 'in-memory',
    configured: isUpstashConfigured,
    url: process.env.UPSTASH_REDIS_REST_URL ? 'configured' : 'missing',
    token: process.env.UPSTASH_REDIS_REST_TOKEN ? 'configured' : 'missing',
  };
}
