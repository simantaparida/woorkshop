-- ============================================================================
-- Migration 018: Fix ALL RLS policies to include WITH CHECK clause
-- ============================================================================
-- Context: Migrations 004, 014, and 016 created RLS policies with only USING (true)
-- This caused INSERT/UPDATE operations to fail with error 42501 (Permission Denied)
--
-- Root Cause: RLS policies need BOTH clauses:
--   - USING (true): Controls READ access (SELECT)
--   - WITH CHECK (true): Controls WRITE access (INSERT, UPDATE)
--
-- This migration fixes all problem framing and sessions tables
-- ============================================================================

-- ============================================================================
-- STEP 1: Drop existing policies (idempotent)
-- ============================================================================
DROP POLICY IF EXISTS "Enable all access" ON sessions_unified;
DROP POLICY IF EXISTS "Enable all access" ON pf_session_participants;
DROP POLICY IF EXISTS "Enable all access" ON pf_individual_statements;
DROP POLICY IF EXISTS "Enable all access" ON pf_statement_pins;
DROP POLICY IF EXISTS "Enable all access" ON pf_final_statement;
DROP POLICY IF EXISTS "Enable all access" ON pf_attachments;

-- ============================================================================
-- STEP 2: Recreate policies with BOTH USING and WITH CHECK clauses
-- ============================================================================

-- Sessions table (unified architecture)
CREATE POLICY "Enable all access" ON sessions_unified
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Problem Framing: Participants tracking
CREATE POLICY "Enable all access" ON pf_session_participants
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Problem Framing: Individual statements
CREATE POLICY "Enable all access" ON pf_individual_statements
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Problem Framing: Statement pins
CREATE POLICY "Enable all access" ON pf_statement_pins
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Problem Framing: Final statement
CREATE POLICY "Enable all access" ON pf_final_statement
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Problem Framing: Attachments
CREATE POLICY "Enable all access" ON pf_attachments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- STEP 3: Add documentation
-- ============================================================================

COMMENT ON POLICY "Enable all access" ON sessions_unified
  IS 'Allow all operations for MVP. USING (true) = read access, WITH CHECK (true) = write access.';

COMMENT ON POLICY "Enable all access" ON pf_session_participants
  IS 'Allow all operations on PF participants. Both USING and WITH CHECK required for write operations.';

COMMENT ON POLICY "Enable all access" ON pf_individual_statements
  IS 'Allow all operations on PF statements. Both USING and WITH CHECK required for write operations.';

COMMENT ON POLICY "Enable all access" ON pf_statement_pins
  IS 'Allow all operations on PF pins. Both USING and WITH CHECK required for write operations.';

COMMENT ON POLICY "Enable all access" ON pf_final_statement
  IS 'Allow all operations on PF final statement. Both USING and WITH CHECK required for write operations.';

COMMENT ON POLICY "Enable all access" ON pf_attachments
  IS 'Allow all operations on PF attachments. Both USING and WITH CHECK required for write operations.';

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- This supersedes migrations 016_fix_sessions_unified_rls.sql and
-- 017_restore_pf_tables_rls.sql by ensuring ALL tables have correct RLS policies.
--
-- Technical Note:
-- PostgreSQL RLS policies use two clauses for access control:
-- - USING: Determines which rows are visible for SELECT and which existing rows
--          can be affected by UPDATE/DELETE
-- - WITH CHECK: Determines which new rows can be added via INSERT and which
--               values are allowed for UPDATE
--
-- For permissive "allow all" policies, both must be set to (true).
-- ============================================================================
