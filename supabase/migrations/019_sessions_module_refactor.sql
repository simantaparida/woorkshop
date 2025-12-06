-- Migration 019: Sessions Module Refactor
-- Purpose: Add indexes, RLS policies, and cascade delete function for sessions module
-- Date: 2025-12-06

-- =====================================================
-- 1. Performance Indexes
-- =====================================================

-- Index for user session queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_sessions_user_created
  ON sessions_unified(created_by, created_at DESC);

-- Index for filtering by user, tool type, and status
CREATE INDEX IF NOT EXISTS idx_sessions_user_tool_status
  ON sessions_unified(created_by, tool_type, status);

-- Full-text search index on title column
CREATE INDEX IF NOT EXISTS idx_sessions_search
  ON sessions_unified USING gin(to_tsvector('english', title));

-- =====================================================
-- 2. Mark workshop_id as deprecated
-- =====================================================

COMMENT ON COLUMN sessions_unified.workshop_id IS
  'DEPRECATED: Use direct session management instead of workshops';

-- =====================================================
-- 3. Update RLS Policies (Enforce no editing)
-- =====================================================

-- Drop existing permissive policy
DROP POLICY IF EXISTS "Enable all access" ON sessions_unified;

-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions"
  ON sessions_unified FOR SELECT
  USING (created_by = auth.uid()::text OR created_by IS NULL);

-- Users can create sessions
CREATE POLICY "Users can create sessions"
  ON sessions_unified FOR INSERT
  WITH CHECK (created_by = auth.uid()::text);

-- Users can delete their own sessions
CREATE POLICY "Users can delete their own sessions"
  ON sessions_unified FOR DELETE
  USING (created_by = auth.uid()::text);

-- NOTE: No UPDATE policy - this enforces no post-creation editing

-- =====================================================
-- 4. Cascade Delete Function
-- =====================================================

CREATE OR REPLACE FUNCTION delete_session_cascade(session_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete voting board related data
  DELETE FROM votes WHERE session_id = session_id_param;
  DELETE FROM features WHERE session_id = session_id_param;
  DELETE FROM players WHERE session_id = session_id_param;

  -- Delete problem framing related data
  -- First delete pins (has foreign key to statements)
  DELETE FROM pf_statement_pins
  WHERE statement_id IN (
    SELECT id FROM pf_individual_statements WHERE session_id = session_id_param
  );

  -- Then delete statements, final statement, attachments, and participants
  DELETE FROM pf_individual_statements WHERE session_id = session_id_param;
  DELETE FROM pf_final_statement WHERE session_id = session_id_param;
  DELETE FROM pf_attachments WHERE session_id = session_id_param;
  DELETE FROM pf_session_participants WHERE session_id = session_id_param;

  -- Finally delete the session itself
  DELETE FROM sessions_unified WHERE id = session_id_param;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return false
    RAISE WARNING 'Error deleting session %: %', session_id_param, SQLERRM;
    RETURN FALSE;
END;
$$;

-- Add comment to explain function purpose
COMMENT ON FUNCTION delete_session_cascade(UUID) IS
  'Cascade delete a session and all related data across voting board and problem framing tables';
