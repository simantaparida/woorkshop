-- ============================================
-- COMPLETE FIX FOR "MARK AS READY" FEATURE
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- Step 1: Check if column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'players'
        AND column_name = 'is_ready'
    ) THEN
        RAISE NOTICE 'Column is_ready does NOT exist. Adding it now...';

        -- Add the column
        ALTER TABLE players
        ADD COLUMN is_ready BOOLEAN NOT NULL DEFAULT false;

        -- Add index
        CREATE INDEX idx_players_is_ready ON players(is_ready, session_id);

        -- Add comment
        COMMENT ON COLUMN players.is_ready IS 'Indicates whether the player has marked themselves as ready to start voting';

        RAISE NOTICE 'Column is_ready has been added successfully!';
    ELSE
        RAISE NOTICE 'Column is_ready already exists. Skipping...';
    END IF;
END $$;

-- Step 2: Verify RLS policies allow UPDATE on is_ready
DO $$
BEGIN
    -- Check if update policy exists
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'players'
        AND policyname = 'Enable update for all users'
    ) THEN
        RAISE NOTICE 'Adding UPDATE policy for players table...';
        CREATE POLICY "Enable update for all users" ON players FOR UPDATE USING (true);
    ELSE
        RAISE NOTICE 'UPDATE policy already exists for players table';
    END IF;
END $$;

-- Step 3: Force refresh PostgREST schema cache (CRITICAL!)
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';

-- Step 4: Verify everything
SELECT
    'Column Verification' as check_type,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'players'
AND column_name IN ('is_ready', 'role')
ORDER BY column_name;

SELECT
    'Index Verification' as check_type,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'players'
AND indexname LIKE '%ready%';

SELECT
    'RLS Policy Verification' as check_type,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'players';

-- Step 5: Test data integrity
SELECT
    'Data Verification' as check_type,
    COUNT(*) as total_players,
    COUNT(CASE WHEN is_ready = true THEN 1 END) as ready_count,
    COUNT(CASE WHEN is_ready = false THEN 1 END) as not_ready_count
FROM players;

-- Final message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'FIX COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Wait 10 seconds for schema cache to refresh';
    RAISE NOTICE '2. Refresh your browser';
    RAISE NOTICE '3. Go to lobby page and test "Mark as Ready" button';
    RAISE NOTICE '========================================';
END $$;
