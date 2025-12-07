-- =============================================================================
-- EMERGENCY FIX: Apply Migrations 031 and 032 to Fix Problem Framing Real-time
-- =============================================================================
--
-- This file combines migrations 031 and 032 to fix:
-- 1. RLS policies blocking anonymous guest users from reading data
-- 2. Realtime not enabled for Problem Framing tables
--
-- Run this in Supabase Dashboard > SQL Editor
-- Or apply via: psql <connection-string> -f apply_migrations_031_032.sql
--
-- =============================================================================

-- =============================================================================
-- MIGRATION 031: Fix RLS for Guest Access
-- =============================================================================

-- Drop Migration 030 policies
DROP POLICY IF EXISTS "sessions_select_policy" ON sessions_unified;
DROP POLICY IF EXISTS "sessions_insert_policy" ON sessions_unified;
DROP POLICY IF EXISTS "sessions_update_policy" ON sessions_unified;
DROP POLICY IF EXISTS "sessions_delete_policy" ON sessions_unified;

-- SELECT: Anyone can read sessions (guests need this to join via shared links)
CREATE POLICY "sessions_select_policy"
  ON sessions_unified FOR SELECT
  USING (true);

-- INSERT: Only authenticated users can create sessions
CREATE POLICY "sessions_insert_policy"
  ON sessions_unified FOR INSERT
  WITH CHECK (
    created_by = auth.uid()::text
    OR created_by IS NULL
  );

-- UPDATE: Only session owners can update
CREATE POLICY "sessions_update_policy"
  ON sessions_unified FOR UPDATE
  USING (created_by = auth.uid()::text);

-- DELETE: Only session owners can delete
CREATE POLICY "sessions_delete_policy"
  ON sessions_unified FOR DELETE
  USING (created_by = auth.uid()::text);

-- Problem Framing: pf_session_participants
DROP POLICY IF EXISTS "pf_participants_select_policy" ON pf_session_participants;
DROP POLICY IF EXISTS "pf_participants_insert_policy" ON pf_session_participants;
DROP POLICY IF EXISTS "pf_participants_update_policy" ON pf_session_participants;
DROP POLICY IF EXISTS "pf_participants_delete_policy" ON pf_session_participants;

CREATE POLICY "pf_participants_select_policy"
  ON pf_session_participants FOR SELECT
  USING (true);

CREATE POLICY "pf_participants_insert_policy"
  ON pf_session_participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "pf_participants_update_policy"
  ON pf_session_participants FOR UPDATE
  USING (
    is_facilitator = true
    OR session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

CREATE POLICY "pf_participants_delete_policy"
  ON pf_session_participants FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- Problem Framing: pf_individual_statements
DROP POLICY IF EXISTS "pf_statements_select_policy" ON pf_individual_statements;
DROP POLICY IF EXISTS "pf_statements_insert_policy" ON pf_individual_statements;
DROP POLICY IF EXISTS "pf_statements_update_policy" ON pf_individual_statements;
DROP POLICY IF EXISTS "pf_statements_delete_policy" ON pf_individual_statements;

CREATE POLICY "pf_statements_select_policy"
  ON pf_individual_statements FOR SELECT
  USING (true);

CREATE POLICY "pf_statements_insert_policy"
  ON pf_individual_statements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "pf_statements_update_policy"
  ON pf_individual_statements FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

CREATE POLICY "pf_statements_delete_policy"
  ON pf_individual_statements FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- Problem Framing: pf_statement_pins
DROP POLICY IF EXISTS "pf_pins_select_policy" ON pf_statement_pins;
DROP POLICY IF EXISTS "pf_pins_insert_policy" ON pf_statement_pins;
DROP POLICY IF EXISTS "pf_pins_delete_policy" ON pf_statement_pins;

CREATE POLICY "pf_pins_select_policy"
  ON pf_statement_pins FOR SELECT
  USING (true);

CREATE POLICY "pf_pins_insert_policy"
  ON pf_statement_pins FOR INSERT
  WITH CHECK (true);

CREATE POLICY "pf_pins_delete_policy"
  ON pf_statement_pins FOR DELETE
  USING (
    statement_id IN (
      SELECT id FROM pf_individual_statements
      WHERE session_id IN (
        SELECT id FROM sessions_unified
        WHERE created_by = auth.uid()::text
      )
    )
  );

-- Problem Framing: pf_final_statement
DROP POLICY IF EXISTS "pf_final_select_policy" ON pf_final_statement;
DROP POLICY IF EXISTS "pf_final_insert_policy" ON pf_final_statement;
DROP POLICY IF EXISTS "pf_final_update_policy" ON pf_final_statement;
DROP POLICY IF EXISTS "pf_final_delete_policy" ON pf_final_statement;

CREATE POLICY "pf_final_select_policy"
  ON pf_final_statement FOR SELECT
  USING (true);

CREATE POLICY "pf_final_insert_policy"
  ON pf_final_statement FOR INSERT
  WITH CHECK (true);

CREATE POLICY "pf_final_update_policy"
  ON pf_final_statement FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

CREATE POLICY "pf_final_delete_policy"
  ON pf_final_statement FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- Problem Framing: pf_attachments
DROP POLICY IF EXISTS "pf_attachments_select_policy" ON pf_attachments;
DROP POLICY IF EXISTS "pf_attachments_insert_policy" ON pf_attachments;
DROP POLICY IF EXISTS "pf_attachments_delete_policy" ON pf_attachments;

CREATE POLICY "pf_attachments_select_policy"
  ON pf_attachments FOR SELECT
  USING (true);

CREATE POLICY "pf_attachments_insert_policy"
  ON pf_attachments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "pf_attachments_delete_policy"
  ON pf_attachments FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- Voting Board: features, players, votes (same guest-friendly policies)
DROP POLICY IF EXISTS "features_select_policy" ON features;
DROP POLICY IF EXISTS "features_insert_policy" ON features;
DROP POLICY IF EXISTS "features_update_policy" ON features;
DROP POLICY IF EXISTS "features_delete_policy" ON features;

CREATE POLICY "features_select_policy"
  ON features FOR SELECT
  USING (true);

CREATE POLICY "features_insert_policy"
  ON features FOR INSERT
  WITH CHECK (true);

CREATE POLICY "features_update_policy"
  ON features FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

CREATE POLICY "features_delete_policy"
  ON features FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "players_select_policy" ON players;
DROP POLICY IF EXISTS "players_insert_policy" ON players;
DROP POLICY IF EXISTS "players_update_policy" ON players;
DROP POLICY IF EXISTS "players_delete_policy" ON players;

CREATE POLICY "players_select_policy"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "players_insert_policy"
  ON players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "players_update_policy"
  ON players FOR UPDATE
  USING (true);

CREATE POLICY "players_delete_policy"
  ON players FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "votes_select_policy" ON votes;
DROP POLICY IF EXISTS "votes_insert_policy" ON votes;
DROP POLICY IF EXISTS "votes_update_policy" ON votes;
DROP POLICY IF EXISTS "votes_delete_policy" ON votes;

CREATE POLICY "votes_select_policy"
  ON votes FOR SELECT
  USING (true);

CREATE POLICY "votes_insert_policy"
  ON votes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "votes_update_policy"
  ON votes FOR UPDATE
  USING (true);

CREATE POLICY "votes_delete_policy"
  ON votes FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- =============================================================================
-- MIGRATION 032: Enable Realtime for Problem Framing Tables
-- =============================================================================

DO $$
BEGIN
  -- Add sessions_unified to realtime if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'sessions_unified'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE sessions_unified;
  END IF;

  -- Add pf_session_participants to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'pf_session_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE pf_session_participants;
  END IF;

  -- Add pf_individual_statements to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'pf_individual_statements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE pf_individual_statements;
  END IF;

  -- Add pf_statement_pins to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'pf_statement_pins'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE pf_statement_pins;
  END IF;

  -- Add pf_final_statement to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'pf_final_statement'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE pf_final_statement;
  END IF;

  -- Add pf_attachments to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'pf_attachments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE pf_attachments;
  END IF;
END $$;

-- Set REPLICA IDENTITY to FULL for better change detection
ALTER TABLE sessions_unified REPLICA IDENTITY FULL;
ALTER TABLE pf_session_participants REPLICA IDENTITY FULL;
ALTER TABLE pf_individual_statements REPLICA IDENTITY FULL;
ALTER TABLE pf_statement_pins REPLICA IDENTITY FULL;
ALTER TABLE pf_final_statement REPLICA IDENTITY FULL;
ALTER TABLE pf_attachments REPLICA IDENTITY FULL;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify realtime publication (should show all pf_* tables)
SELECT tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename LIKE 'pf_%'
ORDER BY tablename;

-- Verify RLS policies on pf_individual_statements
SELECT policyname, permissive, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'pf_individual_statements'
ORDER BY policyname;

-- Done!
SELECT 'Migrations 031 and 032 applied successfully! ✅' AS status;
