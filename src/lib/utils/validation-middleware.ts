/**
 * Validation middleware utilities for API routes
 * Provides helpers to validate request bodies with Zod schemas
 */

import { NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import type { Logger } from 'pino';

/**
 * Validation result type
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: NextResponse };

/**
 * Validate request body against a Zod schema
 *
 * @param body - Request body to validate
 * @param schema - Zod schema to validate against
 * @param log - Optional logger for validation errors
 * @returns Validation result with parsed data or error response
 *
 * @example
 * ```ts
 * const validation = validateRequest(body, createSessionSchema, log);
 * if (!validation.success) {
 *   return validation.error;
 * }
 * const { title, description } = validation.data;
 * ```
 */
export function validateRequest<T>(
  body: unknown,
  schema: z.ZodSchema<T>,
  log?: Logger
): ValidationResult<T> {
  try {
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((err) => {
        const path = err.path.join('.');
        return path ? `${path}: ${err.message}` : err.message;
      });

      if (log) {
        log.warn({
          validationErrors: error.errors,
          inputData: body,
        }, 'Request validation failed');
      }

      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Validation failed',
            details: errorMessages,
          },
          { status: 400 }
        ),
      };
    }

    // Unexpected error during validation
    if (log) {
      log.error({ error }, 'Unexpected validation error');
    }

    return {
      success: false,
      error: NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      ),
    };
  }
}

/**
 * Sanitize HTML/XSS from string
 * Removes potentially dangerous characters and scripts
 *
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Validate and sanitize a string for safe storage and display
 *
 * @param input - String to validate
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string or null if invalid
 */
export function validateString(
  input: unknown,
  maxLength: number = 500
): string | null {
  if (typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) {
    return null;
  }

  return sanitizeHtml(trimmed);
}

/**
 * Validate UUID format
 *
 * @param input - String to validate as UUID
 * @returns True if valid UUID
 */
export function isValidUuid(input: unknown): input is string {
  if (typeof input !== 'string') {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(input);
}

/**
 * Validate email format
 *
 * @param input - String to validate as email
 * @returns True if valid email
 */
export function isValidEmail(input: unknown): input is string {
  if (typeof input !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
}

/**
 * Validate URL format
 *
 * @param input - String to validate as URL
 * @returns True if valid URL
 */
export function isValidUrl(input: unknown): input is string {
  if (typeof input !== 'string') {
    return false;
  }

  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
}
