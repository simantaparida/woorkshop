/**
 * Validation schemas for feature-related API endpoints
 */

import { z } from 'zod';

const sanitizeText = (text: string) => text.trim().replace(/\s+/g, ' ');

/**
 * Feature effort levels
 */
export const effortSchema = z.enum(['small', 'medium', 'large'], {
  errorMap: () => ({ message: 'Invalid effort level' }),
});

/**
 * Feature impact levels
 */
export const impactSchema = z.enum(['low', 'medium', 'high'], {
  errorMap: () => ({ message: 'Invalid impact level' }),
});

/**
 * POST /api/features - Create feature
 */
export const createFeatureSchema = z.object({
  session_id: z.string().uuid('Invalid session ID'),
  title: z
    .string()
    .min(1, 'Feature title is required')
    .max(200, 'Feature title must be 200 characters or less')
    .transform(sanitizeText)
    .refine(
      (val) => !/[<>]/.test(val),
      'Title cannot contain < or > characters'
    ),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .transform(sanitizeText)
    .optional()
    .nullable(),
  effort: effortSchema.optional().nullable(),
  impact: impactSchema.optional().nullable(),
});

export type CreateFeatureInput = z.infer<typeof createFeatureSchema>;

/**
 * PATCH /api/features/[id] - Update feature
 */
export const updateFeatureSchema = z.object({
  title: z
    .string()
    .min(1, 'Feature title is required')
    .max(200, 'Feature title must be 200 characters or less')
    .transform(sanitizeText)
    .refine(
      (val) => !/[<>]/.test(val),
      'Title cannot contain < or > characters'
    )
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .transform(sanitizeText)
    .optional()
    .nullable(),
  effort: effortSchema.optional().nullable(),
  impact: impactSchema.optional().nullable(),
});

export type UpdateFeatureInput = z.infer<typeof updateFeatureSchema>;
