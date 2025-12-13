/**
 * Structured Logging Utility
 *
 * Provides production-ready logging with:
 * - Log levels (DEBUG, INFO, WARN, ERROR, FATAL)
 * - Structured JSON output in production
 * - Pretty-printed output in development
 * - Request correlation via request IDs
 * - Automatic context injection (timestamp, environment, etc.)
 */

import pino from 'pino';

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Create base logger configuration
const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

  // Format configuration
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },

  // Base context that appears in every log
  base: {
    env: process.env.NODE_ENV,
    pid: process.pid,
  },

  // Timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,

  // Transport for pretty printing in development
  transport: isProduction ? undefined : {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
      singleLine: false,
    },
  },

  // Redact sensitive fields
  redact: {
    paths: [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'apiKey',
      'secret',
      'authorization',
      'cookie',
      '*.password',
      '*.token',
      '*.secret',
    ],
    censor: '[REDACTED]',
  },
});

/**
 * Creates a child logger with additional context
 *
 * @param context - Additional context to include in all logs
 * @returns Child logger instance
 *
 * @example
 * const log = createLogger({ requestId: '123', userId: 'user-456' });
 * log.info('User logged in');
 */
export function createLogger(context: Record<string, any> = {}) {
  return logger.child(context);
}

/**
 * Creates a logger for API routes with request context
 *
 * @param requestId - Unique request identifier
 * @param route - API route path
 * @param method - HTTP method
 * @returns Logger instance
 *
 * @example
 * const log = createApiLogger(requestId, '/api/sessions/123', 'GET');
 * log.info('Fetching session');
 */
export function createApiLogger(
  requestId: string,
  route: string,
  method: string
) {
  return logger.child({
    requestId,
    route,
    method,
    type: 'api',
  });
}

/**
 * Generates a unique request ID
 * Uses nanoid for short, URL-safe unique IDs
 *
 * @returns Unique request ID
 */
export function generateRequestId(): string {
  // Use nanoid for short unique IDs (21 characters)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Logs an HTTP request
 *
 * @param log - Logger instance
 * @param method - HTTP method
 * @param path - Request path
 * @param statusCode - Response status code
 * @param durationMs - Request duration in milliseconds
 */
export function logHttpRequest(
  log: pino.Logger,
  method: string,
  path: string,
  statusCode: number,
  durationMs: number
) {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

  log[level]({
    http: {
      method,
      path,
      statusCode,
      durationMs,
    },
  }, `${method} ${path} ${statusCode} - ${durationMs}ms`);
}

/**
 * Logs a database query
 *
 * @param log - Logger instance
 * @param table - Database table name
 * @param operation - Operation type (SELECT, INSERT, UPDATE, DELETE)
 * @param durationMs - Query duration in milliseconds
 * @param rowCount - Number of rows affected
 */
export function logDatabaseQuery(
  log: pino.Logger,
  table: string,
  operation: string,
  durationMs: number,
  rowCount?: number
) {
  log.debug({
    db: {
      table,
      operation,
      durationMs,
      rowCount,
    },
  }, `DB ${operation} ${table} - ${durationMs}ms${rowCount !== undefined ? ` (${rowCount} rows)` : ''}`);
}

/**
 * Logs an error with full context
 *
 * @param log - Logger instance
 * @param error - Error object
 * @param context - Additional context
 */
export function logError(
  log: pino.Logger,
  error: Error | unknown,
  context: Record<string, any> = {}
) {
  const err = error instanceof Error ? error : new Error(String(error));

  log.error({
    err: {
      message: err.message,
      stack: err.stack,
      name: err.name,
    },
    ...context,
  }, err.message);
}

/**
 * Logs a security event
 *
 * @param log - Logger instance
 * @param event - Security event type
 * @param context - Event context
 */
export function logSecurityEvent(
  log: pino.Logger,
  event: string,
  context: Record<string, any> = {}
) {
  log.warn({
    security: {
      event,
      ...context,
    },
  }, `Security event: ${event}`);
}

// Export default logger for convenience
export default logger;
