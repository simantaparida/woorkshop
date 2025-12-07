/**
 * Sentry Edge Configuration
 * This file configures Sentry for Edge Runtime (middleware, edge functions).
 */

import * as Sentry from '@sentry/nextjs';

// Only initialize Sentry if DSN is provided
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Adjust this value in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: process.env.NODE_ENV === 'development',

    environment: process.env.NODE_ENV,

    // Filter out certain errors
    ignoreErrors: [
      // Rate limit errors (these are normal)
      'Too many requests',
    ],

    beforeSend(event) {
      // Don't send rate limit errors to Sentry
      if (event.message?.includes('Too many requests')) {
        return null;
      }

      return event;
    },
  });
}
