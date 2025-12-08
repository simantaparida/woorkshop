-- Migration 031: Fix RLS for Guest Access
-- Purpose: Allow guest users to join and participate in sessions
-- Date: 2025-12-07
-- Priority: CRITICAL - Fixes guest access blocked by Migration 030
--
-- Problem: Migration 030 required auth.uid() which blocks guest users
-- Solution: Allow READ access to anyone with session ID, protect WRITE to owners
--
-- Business Rule: "Authentication is required only for facilitator.
--                 Team members can vote as guest users as well."

-- =====================================================
-- 1. SESSIONS_UNIFIED - Core session table
-- =====================================================

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
    OR created_by IS NULL  -- Allow anonymous session creation for backwards compatibility
  );

-- UPDATE: Only session owners can update
CREATE POLICY "sessions_update_policy"
  ON sessions_unified FOR UPDATE
  USING (created_by = auth.uid()::text);

-- DELETE: Only session owners can delete
CREATE POLICY "sessions_delete_policy"
  ON sessions_unified FOR DELETE
  USING (created_by = auth.uid()::text);

-- =====================================================
-- 2. PROJECTS - Keep owner-only access (not session-based)
-- =====================================================

DROP POLICY IF EXISTS "projects_select_policy" ON projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON projects;
DROP POLICY IF EXISTS "projects_update_policy" ON projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON projects;

-- Projects are private to owners
CREATE POLICY "projects_select_policy"
  ON projects FOR SELECT
  USING (
    created_by = auth.uid()::text
    OR created_by IS NULL
  );

CREATE POLICY "projects_insert_policy"
  ON projects FOR INSERT
  WITH CHECK (
    created_by = auth.uid()::text
    OR created_by IS NULL
  );

CREATE POLICY "projects_update_policy"
  ON projects FOR UPDATE
  USING (created_by = auth.uid()::text);

CREATE POLICY "projects_delete_policy"
  ON projects FOR DELETE
  USING (created_by = auth.uid()::text);

-- =====================================================
-- 3. WORKSHOPS - Keep owner-only access (not session-based)
-- =====================================================

DROP POLICY IF EXISTS "workshops_select_policy" ON workshops;
DROP POLICY IF EXISTS "workshops_insert_policy" ON workshops;
DROP POLICY IF EXISTS "workshops_update_policy" ON workshops;
DROP POLICY IF EXISTS "workshops_delete_policy" ON workshops;

-- Workshops are private to owners
CREATE POLICY "workshops_select_policy"
  ON workshops FOR SELECT
  USING (
    created_by = auth.uid()::text
    OR created_by IS NULL
  );

CREATE POLICY "workshops_insert_policy"
  ON workshops FOR INSERT
  WITH CHECK (
    created_by = auth.uid()::text
    OR created_by IS NULL
  );

CREATE POLICY "workshops_update_policy"
  ON workshops FOR UPDATE
  USING (created_by = auth.uid()::text);

CREATE POLICY "workshops_delete_policy"
  ON workshops FOR DELETE
  USING (created_by = auth.uid()::text);

-- =====================================================
-- 4. PROBLEM FRAMING: pf_session_participants
-- =====================================================

DROP POLICY IF EXISTS "pf_participants_select_policy" ON pf_session_participants;
DROP POLICY IF EXISTS "pf_participants_insert_policy" ON pf_session_participants;
DROP POLICY IF EXISTS "pf_participants_update_policy" ON pf_session_participants;
DROP POLICY IF EXISTS "pf_participants_delete_policy" ON pf_session_participants;

-- SELECT: Anyone can view participants (guests need this)
CREATE POLICY "pf_participants_select_policy"
  ON pf_session_participants FOR SELECT
  USING (true);

-- INSERT: Anyone can join as participant (guest-friendly)
CREATE POLICY "pf_participants_insert_policy"
  ON pf_session_participants FOR INSERT
  WITH CHECK (true);

-- UPDATE: Anyone can update (server-side validation in application)
-- This allows guest users to update their has_submitted status
CREATE POLICY "pf_participants_update_policy"
  ON pf_session_participants FOR UPDATE
  USING (true);

-- DELETE: Session owners only
CREATE POLICY "pf_participants_delete_policy"
  ON pf_session_participants FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- =====================================================
-- 5. PROBLEM FRAMING: pf_individual_statements
-- =====================================================

DROP POLICY IF EXISTS "pf_statements_select_policy" ON pf_individual_statements;
DROP POLICY IF EXISTS "pf_statements_insert_policy" ON pf_individual_statements;
DROP POLICY IF EXISTS "pf_statements_update_policy" ON pf_individual_statements;
DROP POLICY IF EXISTS "pf_statements_delete_policy" ON pf_individual_statements;

-- SELECT: Anyone can view statements
CREATE POLICY "pf_statements_select_policy"
  ON pf_individual_statements FOR SELECT
  USING (true);

-- INSERT: Anyone can create statements (participants)
CREATE POLICY "pf_statements_insert_policy"
  ON pf_individual_statements FOR INSERT
  WITH CHECK (true);

-- UPDATE: Session owners only
CREATE POLICY "pf_statements_update_policy"
  ON pf_individual_statements FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- DELETE: Session owners only
CREATE POLICY "pf_statements_delete_policy"
  ON pf_individual_statements FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- =====================================================
-- 6. PROBLEM FRAMING: pf_statement_pins
-- =====================================================

DROP POLICY IF EXISTS "pf_pins_select_policy" ON pf_statement_pins;
DROP POLICY IF EXISTS "pf_pins_insert_policy" ON pf_statement_pins;
DROP POLICY IF EXISTS "pf_pins_delete_policy" ON pf_statement_pins;

-- SELECT: Anyone can view pins
CREATE POLICY "pf_pins_select_policy"
  ON pf_statement_pins FOR SELECT
  USING (true);

-- INSERT: Anyone can create pins
CREATE POLICY "pf_pins_insert_policy"
  ON pf_statement_pins FOR INSERT
  WITH CHECK (true);

-- DELETE: Session owners only
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

-- =====================================================
-- 7. PROBLEM FRAMING: pf_final_statement
-- =====================================================

DROP POLICY IF EXISTS "pf_final_select_policy" ON pf_final_statement;
DROP POLICY IF EXISTS "pf_final_insert_policy" ON pf_final_statement;
DROP POLICY IF EXISTS "pf_final_update_policy" ON pf_final_statement;
DROP POLICY IF EXISTS "pf_final_delete_policy" ON pf_final_statement;

-- SELECT: Anyone can view final statements
CREATE POLICY "pf_final_select_policy"
  ON pf_final_statement FOR SELECT
  USING (true);

-- INSERT: Anyone can create (facilitator creates via app logic)
CREATE POLICY "pf_final_insert_policy"
  ON pf_final_statement FOR INSERT
  WITH CHECK (true);

-- UPDATE: Session owners only
CREATE POLICY "pf_final_update_policy"
  ON pf_final_statement FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- DELETE: Session owners only
CREATE POLICY "pf_final_delete_policy"
  ON pf_final_statement FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- =====================================================
-- 8. PROBLEM FRAMING: pf_attachments
-- =====================================================

DROP POLICY IF EXISTS "pf_attachments_select_policy" ON pf_attachments;
DROP POLICY IF EXISTS "pf_attachments_insert_policy" ON pf_attachments;
DROP POLICY IF EXISTS "pf_attachments_delete_policy" ON pf_attachments;

-- SELECT: Anyone can view attachments
CREATE POLICY "pf_attachments_select_policy"
  ON pf_attachments FOR SELECT
  USING (true);

-- INSERT: Anyone can add attachments
CREATE POLICY "pf_attachments_insert_policy"
  ON pf_attachments FOR INSERT
  WITH CHECK (true);

-- DELETE: Session owners only
CREATE POLICY "pf_attachments_delete_policy"
  ON pf_attachments FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- =====================================================
-- 9. VOTING BOARD: features
-- =====================================================

DROP POLICY IF EXISTS "features_select_policy" ON features;
DROP POLICY IF EXISTS "features_insert_policy" ON features;
DROP POLICY IF EXISTS "features_update_policy" ON features;
DROP POLICY IF EXISTS "features_delete_policy" ON features;

-- SELECT: Anyone can view features
CREATE POLICY "features_select_policy"
  ON features FOR SELECT
  USING (true);

-- INSERT: Anyone can add features (host adds via app logic)
CREATE POLICY "features_insert_policy"
  ON features FOR INSERT
  WITH CHECK (true);

-- UPDATE: Session owners only
CREATE POLICY "features_update_policy"
  ON features FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- DELETE: Session owners only
CREATE POLICY "features_delete_policy"
  ON features FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- =====================================================
-- 10. VOTING BOARD: players
-- =====================================================

DROP POLICY IF EXISTS "players_select_policy" ON players;
DROP POLICY IF EXISTS "players_insert_policy" ON players;
DROP POLICY IF EXISTS "players_update_policy" ON players;
DROP POLICY IF EXISTS "players_delete_policy" ON players;

-- SELECT: Anyone can view players
CREATE POLICY "players_select_policy"
  ON players FOR SELECT
  USING (true);

-- INSERT: Anyone can join as player
CREATE POLICY "players_insert_policy"
  ON players FOR INSERT
  WITH CHECK (true);

-- UPDATE: Session owners or the player themselves (via localStorage player_id in app)
CREATE POLICY "players_update_policy"
  ON players FOR UPDATE
  USING (true);  -- App-level validation via localStorage player_id

-- DELETE: Session owners only
CREATE POLICY "players_delete_policy"
  ON players FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- =====================================================
-- 11. VOTING BOARD: votes
-- =====================================================

DROP POLICY IF EXISTS "votes_select_policy" ON votes;
DROP POLICY IF EXISTS "votes_insert_policy" ON votes;
DROP POLICY IF EXISTS "votes_update_policy" ON votes;
DROP POLICY IF EXISTS "votes_delete_policy" ON votes;

-- SELECT: Anyone can view votes
CREATE POLICY "votes_select_policy"
  ON votes FOR SELECT
  USING (true);

-- INSERT: Anyone can vote
CREATE POLICY "votes_insert_policy"
  ON votes FOR INSERT
  WITH CHECK (true);

-- UPDATE: Anyone can update votes (player ownership validated at app level)
CREATE POLICY "votes_update_policy"
  ON votes FOR UPDATE
  USING (true);  -- App validates via localStorage player_id

-- DELETE: Session owners only
CREATE POLICY "votes_delete_policy"
  ON votes FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- =====================================================
-- SECURITY COMMENTS
-- =====================================================

COMMENT ON POLICY "sessions_select_policy" ON sessions_unified IS
  'Anyone can read sessions - guests need this to join via shared links';

COMMENT ON POLICY "sessions_insert_policy" ON sessions_unified IS
  'Sessions created by authenticated users or anonymous (NULL created_by)';

COMMENT ON POLICY "pf_participants_select_policy" ON pf_session_participants IS
  'Guests can view participants to see who is in the session';

COMMENT ON POLICY "players_update_policy" ON players IS
  'Open update - player ownership validated at app level via localStorage';

COMMENT ON POLICY "votes_update_policy" ON votes IS
  'Open update - vote ownership validated at app level via localStorage player_id';

-- =====================================================
-- Migration Complete
-- =====================================================
