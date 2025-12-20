-- Migration 037: Allow Anonymous Session Creation
-- Purpose: Allow anonymous users to create sessions (for guest facilitators)
-- Date: 2025-12-20
-- Priority: CRITICAL - Enables anonymous/guest session creation for E2E tests
--
-- Problem: Migration 032 requires auth.uid() IS NOT NULL for session creation,
--          blocking anonymous users from creating sessions
-- Solution: Allow session creation with OR created_by IS NOT NULL
--          (either authenticated user OR anonymous user with a valid ID)

-- =====================================================
-- Fix sessions_unified INSERT Policy
-- =====================================================

DROP POLICY IF EXISTS "sessions_insert_policy" ON sessions_unified;

-- Allow both authenticated and anonymous session creation
-- For authenticated users: created_by must match auth.uid()
-- For anonymous users: created_by just needs to be a non-null value
CREATE POLICY "sessions_insert_policy"
  ON sessions_unified FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND created_by = auth.uid()::text)
    OR
    (auth.uid() IS NULL AND created_by IS NOT NULL)
  );

COMMENT ON POLICY "sessions_insert_policy" ON sessions_unified IS
  'Allows authenticated users (created_by = auth.uid()) or anonymous users (created_by is any non-null value) to create sessions';

-- =====================================================
-- Migration Complete
-- =====================================================
