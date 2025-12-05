-- Migration 017: Restore and fix RLS policies for Problem Framing tables
-- Context: Migration 015 renamed columns in PF tables and may have reset RLS policies.
-- This migration ensures all PF tables have proper RLS policies with full access.
--
-- Issue: Session creation was failing with "Failed to add facilitator to session"
-- Root Cause: RLS policies were incomplete - missing WITH CHECK clause for write operations
-- Fix: Drop and recreate policies with both USING (true) and WITH CHECK (true)

-- ============================================================================
-- STEP 1: Drop existing policies (idempotent)
-- ============================================================================
DROP POLICY IF EXISTS "Enable all access" ON pf_individual_statements;
DROP POLICY IF EXISTS "Enable all access" ON pf_statement_pins;
DROP POLICY IF EXISTS "Enable all access" ON pf_final_statement;
DROP POLICY IF EXISTS "Enable all access" ON pf_session_participants;
DROP POLICY IF EXISTS "Enable all access" ON pf_attachments;

-- ============================================================================
-- STEP 2: Ensure RLS is enabled on all tables
-- ============================================================================
ALTER TABLE pf_individual_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_statement_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_final_statement ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_attachments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: Create comprehensive RLS policies with write permissions
-- ============================================================================
-- These policies allow ALL operations (SELECT, INSERT, UPDATE, DELETE)
-- USING (true): Allows reading rows
-- WITH CHECK (true): Allows inserting/updating rows

CREATE POLICY "Enable all access" ON pf_individual_statements
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all access" ON pf_statement_pins
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all access" ON pf_final_statement
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all access" ON pf_session_participants
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all access" ON pf_attachments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- STEP 4: Add documentation
-- ============================================================================
COMMENT ON POLICY "Enable all access" ON pf_individual_statements
  IS 'Allow all operations on PF individual statements for MVP (authenticated and anonymous users)';

COMMENT ON POLICY "Enable all access" ON pf_session_participants
  IS 'Allow all operations on PF session participants for MVP (authenticated and anonymous users)';

COMMENT ON POLICY "Enable all access" ON pf_final_statement
  IS 'Allow all operations on PF final statement for MVP (authenticated and anonymous users)';

COMMENT ON POLICY "Enable all access" ON pf_statement_pins
  IS 'Allow all operations on PF statement pins for MVP (authenticated and anonymous users)';

COMMENT ON POLICY "Enable all access" ON pf_attachments
  IS 'Allow all operations on PF attachments for MVP (authenticated and anonymous users)';

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- This migration restores full RLS access to all Problem Framing tables.
-- The WITH CHECK (true) clause is critical for allowing write operations.
-- Without it, INSERT and UPDATE operations fail with permission denied errors.
