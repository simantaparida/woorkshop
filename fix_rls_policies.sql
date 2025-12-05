-- ============================================================================
-- EMERGENCY FIX: Add WITH CHECK clause to all RLS policies
-- ============================================================================
-- This fixes the "Failed to add facilitator to session" error
-- Root Cause: RLS policies had USING (true) but missing WITH CHECK (true)
-- Error Code: 42501 (Permission Denied on INSERT/UPDATE operations)
--
-- INSTRUCTIONS:
-- 1. Copy this entire file
-- 2. Go to your Supabase Dashboard → SQL Editor
-- 3. Paste and run this SQL
-- 4. Test creating a new problem framing session
-- ============================================================================

-- Step 1: Drop all existing RLS policies
DROP POLICY IF EXISTS "Enable all access" ON sessions_unified;
DROP POLICY IF EXISTS "Enable all access" ON pf_session_participants;
DROP POLICY IF EXISTS "Enable all access" ON pf_individual_statements;
DROP POLICY IF EXISTS "Enable all access" ON pf_statement_pins;
DROP POLICY IF EXISTS "Enable all access" ON pf_final_statement;
DROP POLICY IF EXISTS "Enable all access" ON pf_attachments;

-- Step 2: Recreate policies with BOTH USING and WITH CHECK clauses
-- This allows both READ (USING) and WRITE (WITH CHECK) operations

CREATE POLICY "Enable all access" ON sessions_unified
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all access" ON pf_session_participants
  FOR ALL
  USING (true)
  WITH CHECK (true);

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

CREATE POLICY "Enable all access" ON pf_attachments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Step 3: Verify the fix
-- Run this query to confirm WITH CHECK is now present:
SELECT
  tablename,
  policyname,
  cmd,
  CASE WHEN with_check IS NULL THEN 'MISSING ❌' ELSE 'PRESENT ✓' END as with_check_status
FROM pg_policies
WHERE tablename IN (
  'sessions_unified',
  'pf_session_participants',
  'pf_individual_statements',
  'pf_statement_pins',
  'pf_final_statement',
  'pf_attachments'
)
ORDER BY tablename;

-- ============================================================================
-- Expected Output:
-- All tables should show "PRESENT ✓" in the with_check_status column
-- ============================================================================

-- Documentation comments
COMMENT ON POLICY "Enable all access" ON sessions_unified
  IS 'Allow all operations (SELECT, INSERT, UPDATE, DELETE) for MVP. USING controls read access, WITH CHECK controls write access.';

COMMENT ON POLICY "Enable all access" ON pf_session_participants
  IS 'Allow all operations for PF participants. Fixed in emergency patch to include WITH CHECK clause.';

COMMENT ON POLICY "Enable all access" ON pf_individual_statements
  IS 'Allow all operations for PF individual statements. Fixed to include WITH CHECK clause.';

COMMENT ON POLICY "Enable all access" ON pf_statement_pins
  IS 'Allow all operations for PF statement pins. Fixed to include WITH CHECK clause.';

COMMENT ON POLICY "Enable all access" ON pf_final_statement
  IS 'Allow all operations for PF final statement. Fixed to include WITH CHECK clause.';

COMMENT ON POLICY "Enable all access" ON pf_attachments
  IS 'Allow all operations for PF attachments. Fixed to include WITH CHECK clause.';
