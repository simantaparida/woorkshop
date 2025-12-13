/**
 * Validation schemas for workshop-related API endpoints
 */

import { z } from 'zod';

const sanitizeText = (text: string) => text.trim().replace(/\s+/g, ' ');

/**
 * POST /api/workshops - Create workshop
 */
export const createWorkshopSchema = z.object({
  title: z
    .string()
    .min(1, 'Workshop title is required')
    .max(100, 'Workshop title must be 100 characters or less')
    .transform(sanitizeText)
    .refine(
      (val) => !/[<>]/.test(val),
      'Title cannot contain < or > characters'
    ),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .transform(sanitizeText)
    .optional()
    .nullable(),
  created_by: z
    .string()
    .uuid('Invalid user ID')
    .optional()
    .nullable(),
});

export type CreateWorkshopInput = z.infer<typeof createWorkshopSchema>;

/**
 * PATCH /api/workshops/[id] - Update workshop
 */
export const updateWorkshopSchema = z.object({
  title: z
    .string()
    .min(1, 'Workshop title is required')
    .max(100, 'Workshop title must be 100 characters or less')
    .transform(sanitizeText)
    .refine(
      (val) => !/[<>]/.test(val),
      'Title cannot contain < or > characters'
    )
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .transform(sanitizeText)
    .optional()
    .nullable(),
});

export type UpdateWorkshopInput = z.infer<typeof updateWorkshopSchema>;
