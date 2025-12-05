-- Migration 016: Cleanup Duplicate tool_sessions Table
-- Purpose: Remove the duplicate tool_sessions table that was recreated after migration 015
-- Migration 015 already renamed tool_sessions → sessions_unified, but ABSOLUTE_FINAL_migration recreated it

-- ============================================================================
-- STEP 1: Verify sessions_unified exists and has the correct schema
-- ============================================================================
-- Expected columns in sessions_unified:
-- - id, title, description, created_by, status, created_at, updated_at, completed_at
-- - workshop_id (added in migration 015)
-- - tool_type (added in migration 015)
-- - session_config (added in migration 015)
-- - legacy_tool_slug (renamed from tool_slug in migration 015)

-- ============================================================================
-- STEP 2: Drop the duplicate tool_sessions table if it exists
-- ============================================================================
-- This table was accidentally recreated and conflicts with sessions_unified
DROP TABLE IF EXISTS tool_sessions CASCADE;

-- Drop tool_items table as well (was part of the old architecture)
DROP TABLE IF EXISTS tool_items CASCADE;

-- ============================================================================
-- STEP 3: Verify PF tables are correctly referencing sessions_unified
-- ============================================================================
-- These should already be correct from migration 015, but verify:

-- Check pf_individual_statements
DO $$
BEGIN
  -- Verify foreign key points to sessions_unified
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'pf_individual_statements'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_name = 'sessions_unified'
      AND ccu.column_name = 'id'
  ) THEN
    RAISE EXCEPTION 'pf_individual_statements does not reference sessions_unified correctly';
  END IF;
END $$;

-- ============================================================================
-- STEP 4: Ensure indexes exist on PF tables with session_id column
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_pf_statements_session ON pf_individual_statements(session_id);
CREATE INDEX IF NOT EXISTS idx_pf_final_statement_session ON pf_final_statement(session_id);
CREATE INDEX IF NOT EXISTS idx_pf_participants_session ON pf_session_participants(session_id);

-- ============================================================================
-- STEP 5: Add helpful comment
-- ============================================================================
COMMENT ON TABLE sessions_unified IS 'Unified sessions table for all tools (voting-board, problem-framing, rice, moscow). Replaces old tool_sessions table.';

-- ============================================================================
-- Migration Complete!
-- ============================================================================
-- This migration:
-- - Removed duplicate tool_sessions and tool_items tables
-- - Verified PF tables correctly reference sessions_unified
-- - Ensured proper indexes exist
