/**
 * Validation schemas for session-related API endpoints
 * Using Zod for runtime type validation and input sanitization
 */

import { z } from 'zod';

/**
 * Common validation rules
 */
const sanitizeText = (text: string) => text.trim().replace(/\s+/g, ' ');

const titleSchema = z
  .string()
  .min(1, 'Title is required')
  .max(100, 'Title must be 100 characters or less')
  .transform(sanitizeText)
  .refine(
    (val) => !/[<>]/.test(val),
    'Title cannot contain < or > characters'
  );

const descriptionSchema = z
  .string()
  .max(500, 'Description must be 500 characters or less')
  .transform(sanitizeText)
  .optional()
  .nullable();

const uuidSchema = z.string().uuid('Invalid ID format');

const toolTypeSchema = z.enum(['voting-board', 'problem-framing'], {
  message: 'Invalid tool type',
});

const sessionStatusSchema = z.enum(['open', 'playing', 'results', 'completed'], {
  message: 'Invalid status',
});

/**
 * POST /api/sessions - Create session
 */
export const createSessionSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  tool_type: toolTypeSchema,
  workshop_id: uuidSchema.optional().nullable(),
  session_config: z.record(z.string(), z.any()).optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

/**
 * PATCH /api/sessions/[id] - Update session
 */
export const updateSessionSchema = z.object({
  title: titleSchema.optional(),
  description: descriptionSchema,
  status: sessionStatusSchema.optional(),
  workshop_id: uuidSchema.optional().nullable(),
  session_config: z.record(z.string(), z.any()).optional(),
});

export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;

/**
 * POST /api/session/[id]/join - Join session
 */
export const joinSessionSchema = z.object({
  playerName: z
    .string()
    .min(1, 'Player name is required')
    .max(50, 'Player name must be 50 characters or less')
    .transform(sanitizeText)
    .refine(
      (val) => /^[a-zA-Z0-9\s._-]+$/.test(val),
      'Player name can only contain letters, numbers, spaces, dots, underscores, and hyphens'
    ),
  role: z
    .string()
    .max(50, 'Role must be 50 characters or less')
    .transform(sanitizeText)
    .optional()
    .nullable(),
});

export type JoinSessionInput = z.infer<typeof joinSessionSchema>;

/**
 * POST /api/session/[id]/start - Start session
 */
export const startSessionSchema = z.object({
  hostToken: z
    .string()
    .min(1, 'Host token is required')
    .max(500, 'Invalid host token'),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;

/**
 * DELETE /api/session/[id]/delete - Delete session
 */
export const deleteSessionSchema = z.object({
  hostToken: z
    .string()
    .min(1, 'Host token is required')
    .max(500, 'Invalid host token'),
});

export type DeleteSessionInput = z.infer<typeof deleteSessionSchema>;
