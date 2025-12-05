# 🔧 Problem Framing Session Creation Fix

## Issue
Creating problem framing sessions fails with error: **"Failed to add facilitator to session"**

## Root Cause
RLS policies missing `WITH CHECK (true)` clause, causing INSERT operations to fail with PostgreSQL error code `42501` (Permission Denied).

---

## ✅ Quick Fix Steps

### Step 1: Apply the SQL Fix

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Navigate to **SQL Editor** (left sidebar)

2. **Run the fix**
   - Open the file: `fix_rls_policies.sql` (in your project root)
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click **RUN** button

3. **Verify the fix**
   The query includes a verification step at the end. You should see output like:
   ```
   tablename                  | policyname        | cmd | with_check_status
   ---------------------------|-------------------|-----|------------------
   pf_attachments            | Enable all access | ALL | PRESENT ✓
   pf_final_statement        | Enable all access | ALL | PRESENT ✓
   pf_individual_statements  | Enable all access | ALL | PRESENT ✓
   pf_session_participants   | Enable all access | ALL | PRESENT ✓
   pf_statement_pins         | Enable all access | ALL | PRESENT ✓
   sessions_unified          | Enable all access | ALL | PRESENT ✓
   ```

   All tables should show **"PRESENT ✓"**.

### Step 2: Test Session Creation

1. Go to your application
2. Try creating a new Problem Framing session
3. It should now work without errors! 🎉

### Step 3: Apply Migration (Optional but Recommended)

To preserve this fix in your migration history:

```bash
# If using Supabase CLI locally
cd "/Users/simantparida/Desktop/Vibe Coding/UX Play"
npx supabase db push

# Or manually upload migration 018_fix_all_rls_with_check.sql
# via Supabase Dashboard → Database → Migrations
```

---

## 📝 What Was Fixed?

### Before (BROKEN)
```sql
CREATE POLICY "Enable all access" ON pf_session_participants
  FOR ALL
  USING (true);  -- ❌ Only allows SELECT, not INSERT/UPDATE
```

### After (FIXED)
```sql
CREATE POLICY "Enable all access" ON pf_session_participants
  FOR ALL
  USING (true)      -- ✓ Allows SELECT
  WITH CHECK (true); -- ✓ Allows INSERT/UPDATE
```

---

## 🎯 Tables Fixed

- ✅ `sessions_unified` - Main sessions table
- ✅ `pf_session_participants` - Participant tracking
- ✅ `pf_individual_statements` - Individual problem statements
- ✅ `pf_statement_pins` - Pinned statements during review
- ✅ `pf_final_statement` - Final agreed statement
- ✅ `pf_attachments` - Session attachments

---

## 🔍 How to Check if Fix is Applied

Run this query in Supabase SQL Editor:

```sql
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
```

---

## 📚 Technical Background

**PostgreSQL Row Level Security (RLS)** uses two clauses:

1. **USING clause**: Controls which rows can be **read** (SELECT) and which existing rows can be affected by UPDATE/DELETE
2. **WITH CHECK clause**: Controls which new rows can be **added** (INSERT) and which values are allowed for UPDATE

For "allow all" policies in an MVP, both must be `(true)`.

**Error without WITH CHECK:**
- Error Code: `42501`
- Message: "new row violates row-level security policy"
- Operation: INSERT or UPDATE fails

---

## 🚨 Migration History Issues (Bonus Fix Needed)

You have **4 migrations** numbered "016" which can cause ordering issues:
- `016_add_voting_board_columns.sql`
- `016_cleanup_tool_sessions_duplicate.sql`
- `016_combined_blank_sessions_voting_board.sql`
- `016_fix_sessions_unified_rls.sql`

**Recommendation**: After verifying the fix works, consider consolidating these into a single migration to avoid conflicts.

---

## ✅ Success Criteria

After applying the fix, you should be able to:

1. ✅ Create a new Problem Framing session
2. ✅ See facilitator automatically added to `pf_session_participants`
3. ✅ No "Failed to add facilitator to session" error
4. ✅ No error code `42501` in logs

---

## 🆘 Troubleshooting

### If fix doesn't work:

1. **Check which database you're using**
   - Local Supabase: Run `npx supabase start` and apply fix to local DB
   - Remote Supabase: Apply fix via dashboard

2. **Clear browser cache** and retry

3. **Check server logs** in your Next.js terminal for detailed error messages

4. **Verify environment variables**:
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

### Still having issues?

Check the API error response in browser DevTools (Network tab):
- Look for error code in the response
- Check if it's still `42501` (RLS policy issue)
- Check for `23503` (foreign key violation) or `23505` (unique constraint)

---

## 📞 Need Help?

If you're still experiencing issues after applying this fix, please provide:
1. The exact error message from browser console
2. The SQL query verification output
3. Your Supabase project URL (without sensitive keys)
