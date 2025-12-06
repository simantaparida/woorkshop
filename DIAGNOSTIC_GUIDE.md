# Problem Framing Session Creation - Diagnostic Guide

## Current Status
✗ Session creation failing with: **"Failed to add facilitator to session"**
✓ RLS fix with `WITH CHECK (true)` was applied but error persists
⚠️ This indicates the root cause is **NOT the RLS policies** as initially suspected

---

## What We Know

### ✅ Your Code is Correct
- Uses `session_id` column (matches Migration 015)
- Uses `sessions_unified` table (matches Migration 015)
- Proper insert data structure
- Correct error handling with rollback

### ✅ Your Environment
- **Database:** Remote Supabase at `cyqiiywlugosygaevtfv.supabase.co`
- **Client:** Uses ANON key (RLS policies apply to all operations)
- **Auth:** Optional (supports both authenticated & anonymous users)

### ❓ What's Unknown
- Which migrations are actually applied to your database
- Whether the database schema matches what the code expects
- The exact PostgreSQL error code and message

---

## Theory: Schema Mismatch

Your codebase has **Migration 015** which renamed:
- `tool_sessions` → `sessions_unified`
- `tool_session_id` → `session_id` (in all PF tables)

**BUT** migration files in your repo don't auto-apply to remote Supabase. They must be manually run.

**If Migration 015 wasn't applied:**
- Database still has `tool_session_id` column
- Code tries to insert `session_id` field
- PostgreSQL returns error: **"column 'session_id' does not exist"**
- Error gets wrapped as: "Failed to add facilitator to session"

---

## Diagnostic Queries

Run these in **Supabase Dashboard → SQL Editor**:

### Query 1: Check Column Names 🔴 CRITICAL
```sql
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'pf_session_participants'
ORDER BY ordinal_position;
```

**Expected if Migration 015 IS applied:**
```
column_name      | data_type              | udt_name
-----------------|------------------------|----------
id               | uuid                   | uuid
session_id       | uuid                   | uuid      ← Should see THIS
participant_id   | text/uuid              | text/uuid
participant_name | text                   | text
is_facilitator   | boolean                | bool
has_submitted    | boolean                | bool
joined_at        | timestamp with tz      | timestamptz
```

**If you see `tool_session_id` instead of `session_id` → Migration 015 NOT applied**

---

### Query 2: Check RLS Policies
```sql
SELECT
  tablename,
  policyname,
  cmd,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies
WHERE tablename IN ('pf_session_participants', 'sessions_unified')
ORDER BY tablename, policyname;
```

**Expected output:**
```
tablename               | policyname        | cmd | using_clause | with_check_clause
------------------------|-------------------|-----|--------------|------------------
pf_session_participants | Enable all access | ALL | true         | true             ← Both should be "true"
sessions_unified        | Enable all access | ALL | true         | true             ← Both should be "true"
```

**If `with_check_clause` is NULL → RLS policy incomplete**

---

### Query 3: Verify Table Names
```sql
SELECT
  table_name,
  CASE WHEN table_name = 'sessions_unified' THEN '✓ New (Migration 015)'
       WHEN table_name = 'tool_sessions' THEN '✗ Old (Pre-015)'
       ELSE 'Other' END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('sessions_unified', 'tool_sessions', 'pf_session_participants')
ORDER BY table_name;
```

**Expected:**
```
table_name               | status
-------------------------|-------------------------
pf_session_participants  | Other
sessions_unified         | ✓ New (Migration 015)
```

**If you see `tool_sessions` → Migration 015 NOT applied**

---

### Query 4: Check Foreign Keys
```sql
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'pf_session_participants';
```

**Expected:**
```
constraint_name                              | column_name | foreign_table_name | foreign_column_name
---------------------------------------------|-------------|-------------------|--------------------
pf_session_participants_session_id_fkey      | session_id  | sessions_unified  | id
```

**If it references `tool_sessions` → Migration 015 NOT applied**

---

## Alternative: Check Server Logs

If SQL Editor access is difficult, get the error from your **terminal**:

1. Run `npm run dev` in terminal
2. Try creating a Problem Framing session in browser
3. Check terminal for error output

**Look for this log pattern** (from `route.ts:61-85`):
```
Error creating PF session: [message here]
Error details: {
  message: "...",
  code: "42XXX",     ← NEED THIS
  details: "...",
  stack: "..."
}
```

**Common Error Codes:**
- `42501` - RLS policy violation (permission denied)
- `42703` - Column does not exist (schema mismatch)
- `42P01` - Table does not exist
- `23503` - Foreign key violation
- `23505` - Unique constraint violation

---

## Diagnosis Decision Tree

```
START
  |
  ├─ Run Query 1 (Column Names)
  |   |
  |   ├─ Shows "session_id" ✓
  |   |   |
  |   |   └─ Run Query 2 (RLS Policies)
  |   |       |
  |   |       ├─ with_check is "true" ✓
  |   |       |   |
  |   |       |   └─ Schema is correct → Need server error logs
  |   |       |
  |   |       └─ with_check is NULL ✗
  |   |           |
  |   |           └─ FIX: Rerun RLS policy fix
  |   |
  |   └─ Shows "tool_session_id" ✗
  |       |
  |       └─ FIX: Apply Migration 015 manually
  |
  └─ Error running query
      |
      └─ Table doesn't exist → Apply ALL migrations
```

---

## Common Fixes

### Fix A: Apply Migration 015 Manually

If Query 1 shows `tool_session_id`:

```sql
-- Step 1: Rename table
ALTER TABLE tool_sessions RENAME TO sessions_unified;

-- Step 2: Add new columns to sessions_unified
ALTER TABLE sessions_unified
  ADD COLUMN IF NOT EXISTS workshop_id UUID REFERENCES workshops(id) ON DELETE SET NULL;

ALTER TABLE sessions_unified
  ADD COLUMN IF NOT EXISTS tool_type TEXT NOT NULL DEFAULT 'problem-framing';

ALTER TABLE sessions_unified
  ADD COLUMN IF NOT EXISTS session_config JSONB DEFAULT '{}';

-- Step 3: Rename column in pf_session_participants
ALTER TABLE pf_session_participants
  RENAME COLUMN tool_session_id TO session_id;

-- Step 4: Update foreign key constraint
ALTER TABLE pf_session_participants
  DROP CONSTRAINT IF EXISTS pf_session_participants_tool_session_id_fkey;

ALTER TABLE pf_session_participants
  ADD CONSTRAINT pf_session_participants_session_id_fkey
    FOREIGN KEY (session_id) REFERENCES sessions_unified(id) ON DELETE CASCADE;

-- Repeat steps 3-4 for other PF tables
ALTER TABLE pf_individual_statements RENAME COLUMN tool_session_id TO session_id;
ALTER TABLE pf_individual_statements DROP CONSTRAINT IF EXISTS pf_individual_statements_tool_session_id_fkey;
ALTER TABLE pf_individual_statements ADD CONSTRAINT pf_individual_statements_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES sessions_unified(id) ON DELETE CASCADE;

ALTER TABLE pf_final_statement RENAME COLUMN tool_session_id TO session_id;
ALTER TABLE pf_final_statement DROP CONSTRAINT IF EXISTS pf_final_statement_tool_session_id_fkey;
ALTER TABLE pf_final_statement ADD CONSTRAINT pf_final_statement_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES sessions_unified(id) ON DELETE CASCADE;

ALTER TABLE pf_attachments RENAME COLUMN tool_session_id TO session_id;
ALTER TABLE pf_attachments DROP CONSTRAINT IF EXISTS pf_attachments_tool_session_id_fkey;
ALTER TABLE pf_attachments ADD CONSTRAINT pf_attachments_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES sessions_unified(id) ON DELETE CASCADE;
```

### Fix B: Reapply RLS Policies

If Query 2 shows NULL `with_check`:

```sql
-- Drop existing incomplete policies
DROP POLICY IF EXISTS "Enable all access" ON pf_session_participants;
DROP POLICY IF EXISTS "Enable all access" ON sessions_unified;

-- Recreate with BOTH clauses
CREATE POLICY "Enable all access" ON sessions_unified
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all access" ON pf_session_participants
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

---

## Next Steps

1. **Run Query 1** - This is the most critical
2. **Share the output** with me
3. I'll provide the exact fix based on your results

---

## Contact Points

**File Locations:**
- Error handler: `/src/app/api/tools/problem-framing/route.ts` (lines 60-111)
- Session creation: `/src/lib/api/problem-framing-server.ts` (lines 19-81)
- Migration 015: `/supabase/migrations/015_unified_architecture.sql`
- RLS fix (018): `/supabase/migrations/018_fix_all_rls_with_check.sql`

**Key Insight:**
Migration files in your codebase are just SQL scripts. They don't auto-apply to your remote Supabase database. You must manually run them in SQL Editor or use Supabase CLI.
