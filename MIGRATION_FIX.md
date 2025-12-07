# Migration 028 → 029 Fix

## Issue Found

Migration 028 (`028_fix_rls_security_policies.sql`) had column name errors that caused it to fail when running:

```
ERROR: 42703: column "participant_id" does not exist
```

## Root Cause

The problem framing tables use different column naming conventions:

1. **pf_individual_statements**: Has `participant_id` as UUID (not text)
2. **pf_statement_pins**: Uses `pinned_by_participant_id` (not `participant_id`)
3. **pf_attachments**: Does NOT have `uploaded_by` column
4. **pf_session_participants**: Has `participant_id` as UUID (not text)

## Solution

Created **Migration 029** (`029_fix_rls_policies_corrected.sql`) with corrected column names and types.

### Key Corrections

#### 1. UUID Type Handling
```sql
-- WRONG (Migration 028):
USING (participant_id = auth.uid()::text)

-- CORRECT (Migration 029):
USING (participant_id = auth.uid())  -- UUID to UUID comparison
```

#### 2. Statement Pins Column
```sql
-- WRONG (Migration 028):
USING (participant_id = auth.uid()::text)

-- CORRECT (Migration 029):
USING (pinned_by_participant_id = auth.uid())  -- Correct column name
```

#### 3. Attachments Deletion
```sql
-- WRONG (Migration 028):
-- Tried to use non-existent uploaded_by column
USING (
  uploaded_by = auth.uid()::text
  OR session_id IN (...)
)

-- CORRECT (Migration 029):
-- Only session creators can delete attachments
CREATE POLICY "Session creators can delete attachments"
  ON pf_attachments FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );
```

## Deployment Instructions

### Option 1: Fresh Installation
If you haven't run migration 028 yet:
1. **Skip migration 028** entirely
2. Run migration 029 directly:
   ```sql
   -- Run in Supabase SQL Editor
   -- File: supabase/migrations/029_fix_rls_policies_corrected.sql
   ```

### Option 2: Already Ran 028 (Failed)
If migration 028 failed partway through:
1. Check which policies were created:
   ```sql
   SELECT schemaname, tablename, policyname
   FROM pg_policies
   WHERE schemaname = 'public'
   ORDER BY tablename, policyname;
   ```

2. Migration 029 uses `DROP POLICY IF EXISTS`, so it's safe to run
3. Run migration 029 - it will clean up and recreate all policies correctly

### Option 3: Want to be Extra Safe
1. Backup your database first
2. Manually drop all policies on affected tables:
   ```sql
   -- Drop all policies (they'll be recreated by migration 029)
   DROP POLICY IF EXISTS "Enable all access" ON projects;
   DROP POLICY IF EXISTS "Enable all access" ON workshops;
   DROP POLICY IF EXISTS "Enable all access" ON sessions_unified;
   DROP POLICY IF EXISTS "Enable all access" ON pf_individual_statements;
   DROP POLICY IF EXISTS "Enable all access" ON pf_statement_pins;
   DROP POLICY IF EXISTS "Enable all access" ON pf_final_statement;
   DROP POLICY IF EXISTS "Enable all access" ON pf_session_participants;
   DROP POLICY IF EXISTS "Enable all access" ON pf_attachments;
   DROP POLICY IF EXISTS "Enable all access" ON features;
   DROP POLICY IF EXISTS "Enable all access" ON players;
   DROP POLICY IF EXISTS "Enable all access" ON votes;
   ```
3. Then run migration 029

## Verification

After running migration 029, verify the policies are in place:

```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'projects', 'workshops', 'sessions_unified',
    'pf_individual_statements', 'pf_statement_pins',
    'pf_final_statement', 'pf_session_participants', 'pf_attachments',
    'features', 'players', 'votes'
  )
ORDER BY tablename;

-- Check policies exist (should see multiple per table)
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'projects', 'workshops', 'sessions_unified',
    'pf_individual_statements', 'pf_statement_pins',
    'pf_final_statement', 'pf_session_participants', 'pf_attachments',
    'features', 'players', 'votes'
  )
ORDER BY tablename, policyname;
```

Expected results:
- All tables should have `rowsecurity = true`
- Each table should have 2-4 policies (SELECT, INSERT, UPDATE, DELETE)
- No "Enable all access" policies should remain

## Testing the Policies

Test with a real user session:

```sql
-- Set the JWT context to test as a specific user
-- Replace 'user-uuid-here' with an actual user ID
SET request.jwt.claims = '{"sub": "user-uuid-here"}';

-- Try to access someone else's session (should return empty)
SELECT * FROM sessions_unified WHERE created_by != 'user-uuid-here';

-- Should only see your own sessions
SELECT * FROM sessions_unified WHERE created_by = 'user-uuid-here';

-- Reset
RESET request.jwt.claims;
```

## Files to Use

✅ **USE**: `supabase/migrations/029_fix_rls_policies_corrected.sql`
❌ **IGNORE**: `supabase/migrations/028_fix_rls_security_policies.sql` (has errors)

## Summary

Migration 029 is the corrected version with:
- ✅ Proper UUID type handling
- ✅ Correct column names for all tables
- ✅ Proper deletion policies for attachments
- ✅ Idempotent (safe to run multiple times)
- ✅ All security fixes from the original plan

**Status**: Ready to deploy
**Priority**: CRITICAL - Deploy before production
