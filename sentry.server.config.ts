/**
 * Sentry Server Configuration
 * This file configures Sentry for the server/backend (API routes, SSR).
 */

import * as Sentry from '@sentry/nextjs';

// Only initialize Sentry if DSN is provided
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: process.env.NODE_ENV === 'development',

    environment: process.env.NODE_ENV,

    // Server-specific integrations
    integrations: [
      // HTTP integration for tracking HTTP requests
      Sentry.httpIntegration(),
    ],

    // Filter out certain errors
    ignoreErrors: [
      // Supabase auth errors that are expected
      'AuthSessionMissingError',
      // Rate limit errors (these are normal)
      'Too many requests',
    ],

    beforeSend(event, hint) {
      // Don't send rate limit errors to Sentry (these are handled by rate limiting)
      if (event.message?.includes('Too many requests')) {
        return null;
      }

      // Add additional context for server errors
      if (event.contexts) {
        event.contexts.runtime = {
          name: 'node',
          version: process.version,
        };
      }

      return event;
    },
  });
}
