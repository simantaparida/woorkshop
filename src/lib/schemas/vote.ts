/**
 * Validation schemas for vote-related API endpoints
 */

import { z } from 'zod';

/**
 * Individual vote item schema
 */
const voteItemSchema = z.object({
  featureId: z.string().uuid('Invalid feature ID'),
  points: z
    .number()
    .int('Points must be an integer')
    .min(0, 'Points cannot be negative')
    .max(100, 'Points cannot exceed 100'),
});

/**
 * POST /api/session/[id]/vote - Submit votes
 */
export const submitVotesSchema = z.object({
  playerId: z.string().uuid('Invalid player ID'),
  votes: z
    .array(voteItemSchema)
    .min(1, 'At least one vote is required')
    .max(100, 'Cannot submit more than 100 votes at once')
    .refine(
      (votes) => {
        // Check for duplicate feature IDs
        const featureIds = votes.map((v) => v.featureId);
        return new Set(featureIds).size === featureIds.length;
      },
      'Cannot vote on the same feature multiple times'
    )
    .refine(
      (votes) => {
        // Validate total points don't exceed reasonable limit
        const totalPoints = votes.reduce((sum, v) => sum + v.points, 0);
        return totalPoints <= 1000;
      },
      'Total points exceed maximum limit'
    ),
});

export type SubmitVotesInput = z.infer<typeof submitVotesSchema>;
