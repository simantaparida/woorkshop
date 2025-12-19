import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServer: vi.fn(),
}));

vi.mock('@/lib/utils/validation', () => ({
  validateVotes: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  createApiLogger: vi.fn(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  })),
  logError: vi.fn(),
}));

import { getSupabaseServer } from '@/lib/supabase/server';
import { validateVotes } from '@/lib/utils/validation';

describe('POST /api/session/[id]/vote', () => {
  let mockSupabase: any;
  let mockRequest: NextRequest;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup default Supabase mock
    mockSupabase = {
      from: vi.fn(() => mockSupabase),
      select: vi.fn(() => mockSupabase),
      eq: vi.fn(() => mockSupabase),
      single: vi.fn(),
      rpc: vi.fn(),
      update: vi.fn(() => mockSupabase),
    };

    (getSupabaseServer as any).mockReturnValue(mockSupabase);

    // Setup default request mock
    mockRequest = {
      json: vi.fn(),
      headers: new Headers({ 'x-request-id': 'test-request-id' }),
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Input Validation', () => {
    it('should return 400 if player ID is missing', async () => {
      mockRequest.json = vi.fn().mockResolvedValue({
        playerId: null,
        votes: [],
      });

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Player ID is required');
    });

    it('should return 400 if votes validation fails', async () => {
      const validationError = 'Total points exceed 100';
      (validateVotes as any).mockReturnValue(validationError);

      mockRequest.json = vi.fn().mockResolvedValue({
        playerId: 'player-123',
        votes: [
          { featureId: 'feature-1', points: 60 },
          { featureId: 'feature-2', points: 50 },
        ],
      });

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe(validationError);
    });

    it('should validate total points do not exceed 100', async () => {
      (validateVotes as any).mockReturnValue('Total points exceed 100');

      mockRequest.json = vi.fn().mockResolvedValue({
        playerId: 'player-123',
        votes: [
          { featureId: 'feature-1', points: 70 },
          { featureId: 'feature-2', points: 40 },
        ],
      });

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(400);
      expect(validateVotes).toHaveBeenCalledWith([
        { featureId: 'feature-1', points: 70 },
        { featureId: 'feature-2', points: 40 },
      ]);
    });

    it('should accept valid votes totaling exactly 100 points', async () => {
      (validateVotes as any).mockReturnValue(null);

      mockRequest.json = vi.fn().mockResolvedValue({
        playerId: 'player-123',
        votes: [
          { featureId: 'feature-1', points: 60 },
          { featureId: 'feature-2', points: 40 },
        ],
      });

      // Mock session check
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'session-123', status: 'playing' },
        error: null,
      });

      // Mock player check
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'player-123' },
        error: null,
      });

      // Mock features check
      mockSupabase.select.mockResolvedValueOnce({
        data: [{ id: 'feature-1' }, { id: 'feature-2' }],
        error: null,
      });

      // Mock RPC call
      mockSupabase.rpc.mockResolvedValueOnce({
        data: { deleted_count: 0, inserted_count: 2 },
        error: null,
      });

      // Mock all players check
      mockSupabase.select.mockResolvedValueOnce({
        data: [{ id: 'player-123' }],
        error: null,
      });

      // Mock players with votes check
      mockSupabase.select.mockResolvedValueOnce({
        data: [{ player_id: 'player-123' }],
        error: null,
      });

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(200);
      expect(validateVotes).toHaveBeenCalled();
    });

    it('should accept valid votes totaling less than 100 points', async () => {
      (validateVotes as any).mockReturnValue(null);

      mockRequest.json = vi.fn().mockResolvedValue({
        playerId: 'player-123',
        votes: [
          { featureId: 'feature-1', points: 30 },
          { featureId: 'feature-2', points: 20 },
        ],
      });

      // Mock successful path
      mockSupabase.single
        .mockResolvedValueOnce({ data: { id: 'session-123', status: 'playing' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'player-123' }, error: null });

      mockSupabase.select
        .mockResolvedValueOnce({ data: [{ id: 'feature-1' }, { id: 'feature-2' }], error: null })
        .mockResolvedValueOnce({ data: [{ id: 'player-123' }], error: null })
        .mockResolvedValueOnce({ data: [{ player_id: 'player-123' }], error: null });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: { deleted_count: 0, inserted_count: 2 },
        error: null,
      });

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(200);
    });
  });

  describe('Session State Validation', () => {
    beforeEach(() => {
      (validateVotes as any).mockReturnValue(null);
      mockRequest.json = vi.fn().mockResolvedValue({
        playerId: 'player-123',
        votes: [{ featureId: 'feature-1', points: 50 }],
      });
    });

    it('should return 404 if session does not exist', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      const response = await POST(mockRequest, {
        params: { id: 'nonexistent-session' },
      });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error).toBe('Session not found');
    });

    it('should return 400 if session is not in "playing" state', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'session-123', status: 'lobby' },
        error: null,
      });

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Voting is not currently active for this session');
    });

    it('should accept votes when session is in "playing" state', async () => {
      mockSupabase.single
        .mockResolvedValueOnce({ data: { id: 'session-123', status: 'playing' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'player-123' }, error: null });

      mockSupabase.select
        .mockResolvedValueOnce({ data: [{ id: 'feature-1' }], error: null })
        .mockResolvedValueOnce({ data: [{ id: 'player-123' }], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: { deleted_count: 0, inserted_count: 1 },
        error: null,
      });

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(200);
    });

    it('should reject votes when session is in "results" state', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'session-123', status: 'results' },
        error: null,
      });

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Voting is not currently active for this session');
    });
  });

  describe('Player Validation', () => {
    beforeEach(() => {
      (validateVotes as any).mockReturnValue(null);
      mockRequest.json = vi.fn().mockResolvedValue({
        playerId: 'player-123',
        votes: [{ featureId: 'feature-1', points: 50 }],
      });

      // Mock session check succeeds
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'session-123', status: 'playing' },
        error: null,
      });
    });

    it('should return 404 if player does not exist in session', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Player not found' },
      });

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error).toBe('Player not found in this session');
    });

    it('should verify player belongs to the specific session', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'player-123' },
        error: null,
      });

      mockSupabase.select.mockResolvedValueOnce({
        data: [{ id: 'feature-1' }],
        error: null,
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: { deleted_count: 0, inserted_count: 1 },
        error: null,
      });

      mockSupabase.select
        .mockResolvedValueOnce({ data: [{ id: 'player-123' }], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      await POST(mockRequest, { params: { id: 'session-123' } });

      // Verify .eq('session_id', sessionId) was called
      expect(mockSupabase.eq).toHaveBeenCalledWith('session_id', 'session-123');
    });
  });

  describe('Feature Validation', () => {
    beforeEach(() => {
      (validateVotes as any).mockReturnValue(null);

      // Mock session and player checks succeed
      mockSupabase.single
        .mockResolvedValueOnce({ data: { id: 'session-123', status: 'playing' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'player-123' }, error: null });
    });

    it('should return 400 if any feature ID is invalid', async () => {
      mockRequest.json = vi.fn().mockResolvedValue({
        playerId: 'player-123',
        votes: [
          { featureId: 'feature-1', points: 50 },
          { featureId: 'invalid-feature', points: 50 },
        ],
      });

      // Mock features check - only feature-1 exists
      mockSupabase.select.mockResolvedValueOnce({
        data: [{ id: 'feature-1' }],
        error: null,
      });

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('One or more feature IDs are invalid');
    });

    it('should verify all features belong to the session', async () => {
      mockRequest.json = vi.fn().mockResolvedValue({
        playerId: 'player-123',
        votes: [
          { featureId: 'feature-1', points: 30 },
          { featureId: 'feature-2', points: 70 },
        ],
      });

      mockSupabase.select.mockResolvedValueOnce({
        data: [{ id: 'feature-1' }, { id: 'feature-2' }],
        error: null,
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: { deleted_count: 0, inserted_count: 2 },
        error: null,
      });

      mockSupabase.select
        .mockResolvedValueOnce({ data: [{ id: 'player-123' }], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(200);
      expect(mockSupabase.eq).toHaveBeenCalledWith('session_id', 'session-123');
    });

    it('should return 500 if feature verification fails', async () => {
      mockRequest.json = vi.fn().mockResolvedValue({
        playerId: 'player-123',
        votes: [{ featureId: 'feature-1', points: 50 }],
      });

      mockSupabase.select.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Failed to verify features');
    });
  });

  describe('Atomic Vote Submission', () => {
    beforeEach(() => {
      (validateVotes as any).mockReturnValue(null);

      // Mock all validation checks succeed
      mockSupabase.single
        .mockResolvedValueOnce({ data: { id: 'session-123', status: 'playing' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'player-123' }, error: null });

      mockSupabase.select.mockResolvedValueOnce({
        data: [{ id: 'feature-1' }, { id: 'feature-2' }],
        error: null,
      });
    });

    it('should call submit_votes RPC function with correct parameters', async () => {
      mockRequest.json = vi.fn().mockResolvedValue({
        playerId: 'player-123',
        votes: [
          { featureId: 'feature-1', points: 60, note: 'High priority' },
          { featureId: 'feature-2', points: 40 },
        ],
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: { deleted_count: 2, inserted_count: 2 },
        error: null,
      });

      mockSupabase.select
        .mockResolvedValueOnce({ data: [{ id: 'player-123' }], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      await POST(mockRequest, { params: { id: 'session-123' } });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('submit_votes', {
        p_session_id: 'session-123',
        p_player_id: 'player-123',
        p_votes: [
          { featureId: 'feature-1', points: 60, note: 'High priority' },
          { featureId: 'feature-2', points: 40, note: null },
        ],
      });
    });

    it('should return 500 if atomic vote submission fails', async () => {
      mockRequest.json = vi.fn().mockResolvedValue({
        playerId: 'player-123',
        votes: [{ featureId: 'feature-1', points: 50 }],
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'Transaction failed' },
      });

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Failed to record votes. Please try again.');
    });

    it('should handle vote updates (delete old, insert new)', async () => {
      mockRequest.json = vi.fn().mockResolvedValue({
        playerId: 'player-123',
        votes: [{ featureId: 'feature-1', points: 80 }],
      });

      // Simulate updating existing votes
      mockSupabase.rpc.mockResolvedValueOnce({
        data: { deleted_count: 2, inserted_count: 1 },
        error: null,
      });

      mockSupabase.select
        .mockResolvedValueOnce({ data: [{ id: 'player-123' }], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
    });
  });

  describe('Auto-Transition to Results', () => {
    beforeEach(() => {
      (validateVotes as any).mockReturnValue(null);

      mockRequest.json = vi.fn().mockResolvedValue({
        playerId: 'player-123',
        votes: [{ featureId: 'feature-1', points: 50 }],
      });

      // Mock all validation checks
      mockSupabase.single
        .mockResolvedValueOnce({ data: { id: 'session-123', status: 'playing' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'player-123' }, error: null });

      mockSupabase.select.mockResolvedValueOnce({
        data: [{ id: 'feature-1' }],
        error: null,
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: { deleted_count: 0, inserted_count: 1 },
        error: null,
      });
    });

    it('should transition to results when all players have voted', async () => {
      // Mock: 2 players total, both have voted
      mockSupabase.select
        .mockResolvedValueOnce({
          data: [{ id: 'player-1' }, { id: 'player-2' }],
          error: null,
        })
        .mockResolvedValueOnce({
          data: [{ player_id: 'player-1' }, { player_id: 'player-2' }],
          error: null,
        });

      mockSupabase.update.mockResolvedValueOnce({
        data: { id: 'session-123', status: 'results' },
        error: null,
      });

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(200);
      expect(mockSupabase.update).toHaveBeenCalledWith({ status: 'results' });
    });

    it('should not transition if not all players have voted', async () => {
      // Mock: 3 players total, only 2 have voted
      mockSupabase.select
        .mockResolvedValueOnce({
          data: [{ id: 'player-1' }, { id: 'player-2' }, { id: 'player-3' }],
          error: null,
        })
        .mockResolvedValueOnce({
          data: [{ player_id: 'player-1' }, { player_id: 'player-2' }],
          error: null,
        });

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(200);
      expect(mockSupabase.update).not.toHaveBeenCalled();
    });

    it('should not transition if session has no players', async () => {
      mockSupabase.select
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(200);
      expect(mockSupabase.update).not.toHaveBeenCalled();
    });

    it('should handle update errors gracefully', async () => {
      // Mock: all players voted
      mockSupabase.select
        .mockResolvedValueOnce({ data: [{ id: 'player-1' }], error: null })
        .mockResolvedValueOnce({ data: [{ player_id: 'player-1' }], error: null });

      // But update fails
      mockSupabase.update.mockResolvedValueOnce({
        data: null,
        error: { message: 'Update failed' },
      });

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      // Should still return 200 (vote succeeded even if status update failed)
      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on unexpected errors', async () => {
      mockRequest.json = vi.fn().mockRejectedValue(new Error('Unexpected error'));

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Internal server error');
    });

    it('should handle malformed JSON gracefully', async () => {
      mockRequest.json = vi.fn().mockRejectedValue(new SyntaxError('Invalid JSON'));

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(500);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      (validateVotes as any).mockReturnValue(null);
    });

    it('should handle zero-point votes', async () => {
      mockRequest.json = vi.fn().mockResolvedValue({
        playerId: 'player-123',
        votes: [
          { featureId: 'feature-1', points: 0 },
          { featureId: 'feature-2', points: 100 },
        ],
      });

      mockSupabase.single
        .mockResolvedValueOnce({ data: { id: 'session-123', status: 'playing' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'player-123' }, error: null });

      mockSupabase.select.mockResolvedValueOnce({
        data: [{ id: 'feature-1' }, { id: 'feature-2' }],
        error: null,
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: { deleted_count: 0, inserted_count: 2 },
        error: null,
      });

      mockSupabase.select
        .mockResolvedValueOnce({ data: [{ id: 'player-123' }], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(200);
    });

    it('should handle empty votes array', async () => {
      mockRequest.json = vi.fn().mockResolvedValue({
        playerId: 'player-123',
        votes: [],
      });

      mockSupabase.single
        .mockResolvedValueOnce({ data: { id: 'session-123', status: 'playing' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'player-123' }, error: null });

      mockSupabase.select.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: { deleted_count: 2, inserted_count: 0 },
        error: null,
      });

      mockSupabase.select
        .mockResolvedValueOnce({ data: [{ id: 'player-123' }], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const response = await POST(mockRequest, {
        params: { id: 'session-123' },
      });

      expect(response.status).toBe(200);
    });

    it('should handle votes with optional notes', async () => {
      mockRequest.json = vi.fn().mockResolvedValue({
        playerId: 'player-123',
        votes: [
          { featureId: 'feature-1', points: 50, note: 'Important feature' },
          { featureId: 'feature-2', points: 50 }, // No note
        ],
      });

      mockSupabase.single
        .mockResolvedValueOnce({ data: { id: 'session-123', status: 'playing' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'player-123' }, error: null });

      mockSupabase.select.mockResolvedValueOnce({
        data: [{ id: 'feature-1' }, { id: 'feature-2' }],
        error: null,
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: { deleted_count: 0, inserted_count: 2 },
        error: null,
      });

      mockSupabase.select
        .mockResolvedValueOnce({ data: [{ id: 'player-123' }], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      await POST(mockRequest, { params: { id: 'session-123' } });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('submit_votes', {
        p_session_id: 'session-123',
        p_player_id: 'player-123',
        p_votes: [
          { featureId: 'feature-1', points: 50, note: 'Important feature' },
          { featureId: 'feature-2', points: 50, note: null },
        ],
      });
    });
  });
});
