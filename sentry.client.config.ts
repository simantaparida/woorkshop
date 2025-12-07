/**
 * Sentry Client Configuration
 * This file configures Sentry for the browser/client-side.
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

    // Replay settings for session replay
    replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0.0,
    replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.0,

    integrations: [
      Sentry.replayIntegration({
        // Mask all text and input fields
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    environment: process.env.NODE_ENV,

    // Filter out certain errors that are not actionable
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      // Random plugins/extensions
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      // Network errors
      'NetworkError',
      'Network request failed',
    ],

    beforeSend(event, hint) {
      // Filter out errors from browser extensions
      if (event.exception) {
        const error = hint.originalException as Error;
        if (error && error.stack && error.stack.includes('chrome-extension://')) {
          return null;
        }
      }
      return event;
    },
  });
}
