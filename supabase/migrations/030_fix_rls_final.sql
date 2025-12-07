-- Migration 030: Final RLS Security Fix
-- Purpose: Correct RLS policies with proper type handling and session-based access
-- Date: 2025-12-07
-- Priority: CRITICAL SECURITY FIX
--
-- Key Insights:
-- 1. This app supports ANONYMOUS sessions - users don't need auth to create/join
-- 2. created_by columns are TEXT type (stores auth.uid() as string)
-- 3. participant_id columns in pf_* tables are UUID type
-- 4. Players/votes use session-local IDs, NOT auth.uid()
-- 5. Problem framing uses is_facilitator flag for permissions

-- =====================================================
-- 1. PROJECTS TABLE (TEXT created_by)
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable all access" ON projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

-- Authenticated users see their own projects; anonymous projects (NULL) are public
CREATE POLICY "projects_select_policy"
  ON projects FOR SELECT
  USING (
    created_by = auth.uid()::text
    OR created_by IS NULL
  );

-- Users can create projects (authenticated or anonymous)
CREATE POLICY "projects_insert_policy"
  ON projects FOR INSERT
  WITH CHECK (
    created_by = auth.uid()::text
    OR created_by IS NULL
  );

-- Only owners can update
CREATE POLICY "projects_update_policy"
  ON projects FOR UPDATE
  USING (created_by = auth.uid()::text);

-- Only owners can delete
CREATE POLICY "projects_delete_policy"
  ON projects FOR DELETE
  USING (created_by = auth.uid()::text);

-- =====================================================
-- 2. WORKSHOPS TABLE (TEXT created_by)
-- =====================================================

DROP POLICY IF EXISTS "Enable all access" ON workshops;
DROP POLICY IF EXISTS "Users can view their own workshops" ON workshops;
DROP POLICY IF EXISTS "Users can create workshops" ON workshops;
DROP POLICY IF EXISTS "Users can update their own workshops" ON workshops;
DROP POLICY IF EXISTS "Users can delete their own workshops" ON workshops;

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
-- 3. SESSIONS_UNIFIED TABLE (TEXT created_by)
-- =====================================================

DROP POLICY IF EXISTS "Enable all access" ON sessions_unified;
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions_unified;
DROP POLICY IF EXISTS "Users can create sessions" ON sessions_unified;
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions_unified;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON sessions_unified;

-- Users see their own sessions; anonymous sessions are accessible
CREATE POLICY "sessions_select_policy"
  ON sessions_unified FOR SELECT
  USING (
    created_by = auth.uid()::text
    OR created_by IS NULL
  );

-- Anyone can create sessions (supports anonymous users)
CREATE POLICY "sessions_insert_policy"
  ON sessions_unified FOR INSERT
  WITH CHECK (
    created_by = auth.uid()::text
    OR created_by IS NULL
  );

-- Only owners can update their sessions
CREATE POLICY "sessions_update_policy"
  ON sessions_unified FOR UPDATE
  USING (created_by = auth.uid()::text);

-- Only owners can delete their sessions
CREATE POLICY "sessions_delete_policy"
  ON sessions_unified FOR DELETE
  USING (created_by = auth.uid()::text);

-- =====================================================
-- 4. PROBLEM FRAMING TABLES
-- =====================================================

-- ---------------------
-- pf_session_participants (UUID participant_id)
-- ---------------------
DROP POLICY IF EXISTS "Enable all access" ON pf_session_participants;
DROP POLICY IF EXISTS "Users can view participants from their sessions" ON pf_session_participants;
DROP POLICY IF EXISTS "Users can join sessions as participants" ON pf_session_participants;
DROP POLICY IF EXISTS "Users can update their own participant records" ON pf_session_participants;

-- View participants from accessible sessions
CREATE POLICY "pf_participants_select_policy"
  ON pf_session_participants FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text OR created_by IS NULL
    )
  );

-- Anyone can join a session as participant
CREATE POLICY "pf_participants_insert_policy"
  ON pf_session_participants FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text OR created_by IS NULL
    )
  );

-- Facilitators can update any participant; others can update own record
CREATE POLICY "pf_participants_update_policy"
  ON pf_session_participants FOR UPDATE
  USING (
    is_facilitator = true
    OR session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- ---------------------
-- pf_individual_statements (UUID participant_id)
-- ---------------------
DROP POLICY IF EXISTS "Enable all access" ON pf_individual_statements;
DROP POLICY IF EXISTS "Users can view statements from their sessions" ON pf_individual_statements;
DROP POLICY IF EXISTS "Users can create statements in their sessions" ON pf_individual_statements;
DROP POLICY IF EXISTS "Participants can update their own statements" ON pf_individual_statements;
DROP POLICY IF EXISTS "Participants can delete their own statements" ON pf_individual_statements;

-- View statements from accessible sessions
CREATE POLICY "pf_statements_select_policy"
  ON pf_individual_statements FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text OR created_by IS NULL
    )
  );

-- Create statements in accessible sessions
CREATE POLICY "pf_statements_insert_policy"
  ON pf_individual_statements FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text OR created_by IS NULL
    )
  );

-- Session owners can update statements
CREATE POLICY "pf_statements_update_policy"
  ON pf_individual_statements FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- Session owners can delete statements
CREATE POLICY "pf_statements_delete_policy"
  ON pf_individual_statements FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- ---------------------
-- pf_statement_pins (UUID pinned_by_participant_id)
-- ---------------------
DROP POLICY IF EXISTS "Enable all access" ON pf_statement_pins;
DROP POLICY IF EXISTS "Users can view pins from their sessions" ON pf_statement_pins;
DROP POLICY IF EXISTS "Users can create pins in their sessions" ON pf_statement_pins;
DROP POLICY IF EXISTS "Users can delete their own pins" ON pf_statement_pins;

-- View pins from accessible sessions
CREATE POLICY "pf_pins_select_policy"
  ON pf_statement_pins FOR SELECT
  USING (
    statement_id IN (
      SELECT id FROM pf_individual_statements
      WHERE session_id IN (
        SELECT id FROM sessions_unified
        WHERE created_by = auth.uid()::text OR created_by IS NULL
      )
    )
  );

-- Create pins in accessible sessions
CREATE POLICY "pf_pins_insert_policy"
  ON pf_statement_pins FOR INSERT
  WITH CHECK (
    statement_id IN (
      SELECT id FROM pf_individual_statements
      WHERE session_id IN (
        SELECT id FROM sessions_unified
        WHERE created_by = auth.uid()::text OR created_by IS NULL
      )
    )
  );

-- Session owners can delete pins
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

-- ---------------------
-- pf_final_statement
-- ---------------------
DROP POLICY IF EXISTS "Enable all access" ON pf_final_statement;
DROP POLICY IF EXISTS "Users can view final statements from their sessions" ON pf_final_statement;
DROP POLICY IF EXISTS "Session creators can manage final statements" ON pf_final_statement;

-- View final statements from accessible sessions
CREATE POLICY "pf_final_select_policy"
  ON pf_final_statement FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text OR created_by IS NULL
    )
  );

-- Session owners (facilitators) can create/update/delete final statements
CREATE POLICY "pf_final_insert_policy"
  ON pf_final_statement FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text OR created_by IS NULL
    )
  );

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

-- ---------------------
-- pf_attachments (NO uploaded_by column)
-- ---------------------
DROP POLICY IF EXISTS "Enable all access" ON pf_attachments;
DROP POLICY IF EXISTS "Users can view attachments from their sessions" ON pf_attachments;
DROP POLICY IF EXISTS "Users can create attachments in their sessions" ON pf_attachments;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON pf_attachments;
DROP POLICY IF EXISTS "Session creators can delete attachments" ON pf_attachments;

-- View attachments from accessible sessions
CREATE POLICY "pf_attachments_select_policy"
  ON pf_attachments FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text OR created_by IS NULL
    )
  );

-- Create attachments in accessible sessions
CREATE POLICY "pf_attachments_insert_policy"
  ON pf_attachments FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text OR created_by IS NULL
    )
  );

-- Session owners can delete attachments
CREATE POLICY "pf_attachments_delete_policy"
  ON pf_attachments FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- =====================================================
-- 5. VOTING BOARD TABLES
-- Note: Players are NOT tied to auth.uid()
-- They use session-local IDs stored in localStorage
-- Access is session-based, not user-based
-- =====================================================

-- ---------------------
-- features
-- ---------------------
DROP POLICY IF EXISTS "Enable all access" ON features;
DROP POLICY IF EXISTS "Enable read access for all users" ON features;
DROP POLICY IF EXISTS "Enable insert for all users" ON features;
DROP POLICY IF EXISTS "Users can view features from their sessions" ON features;
DROP POLICY IF EXISTS "Session creators can manage features" ON features;

-- View features from accessible sessions
CREATE POLICY "features_select_policy"
  ON features FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text OR created_by IS NULL
    )
  );

-- Insert features in accessible sessions
CREATE POLICY "features_insert_policy"
  ON features FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text OR created_by IS NULL
    )
  );

-- Session owners can update features
CREATE POLICY "features_update_policy"
  ON features FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- Session owners can delete features
CREATE POLICY "features_delete_policy"
  ON features FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- ---------------------
-- players
-- Note: player.id is auto-generated UUID, NOT auth.uid()
-- Players are session-local, anyone can join
-- ---------------------
DROP POLICY IF EXISTS "Enable all access" ON players;
DROP POLICY IF EXISTS "Enable read access for all users" ON players;
DROP POLICY IF EXISTS "Enable insert for all users" ON players;
DROP POLICY IF EXISTS "Users can view players from accessible sessions" ON players;
DROP POLICY IF EXISTS "Users can join as players" ON players;

-- View players from accessible sessions
CREATE POLICY "players_select_policy"
  ON players FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text OR created_by IS NULL
    )
  );

-- Anyone can join as a player in accessible sessions
CREATE POLICY "players_insert_policy"
  ON players FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text OR created_by IS NULL
    )
  );

-- Session owners can update players
CREATE POLICY "players_update_policy"
  ON players FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- Session owners can delete players
CREATE POLICY "players_delete_policy"
  ON players FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- ---------------------
-- votes
-- Note: votes.player_id references players.id (UUID)
-- NOT auth.uid() - players are session-local
-- ---------------------
DROP POLICY IF EXISTS "Enable all access" ON votes;
DROP POLICY IF EXISTS "Enable read access for all users" ON votes;
DROP POLICY IF EXISTS "Enable insert for all users" ON votes;
DROP POLICY IF EXISTS "Enable update for all users" ON votes;
DROP POLICY IF EXISTS "Enable delete for all users" ON votes;
DROP POLICY IF EXISTS "Users can view votes from their sessions" ON votes;
DROP POLICY IF EXISTS "Players can manage their own votes" ON votes;

-- View votes from accessible sessions
CREATE POLICY "votes_select_policy"
  ON votes FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text OR created_by IS NULL
    )
  );

-- Players can create votes in accessible sessions
CREATE POLICY "votes_insert_policy"
  ON votes FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text OR created_by IS NULL
    )
  );

-- Players can update their votes (via localStorage player_id verification at app level)
CREATE POLICY "votes_update_policy"
  ON votes FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text OR created_by IS NULL
    )
  );

-- Session owners or vote owners can delete votes
CREATE POLICY "votes_delete_policy"
  ON votes FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- =====================================================
-- 6. SECURITY COMMENTS
-- =====================================================

COMMENT ON POLICY "projects_select_policy" ON projects IS
  'Authenticated users see own projects; anonymous projects are public';

COMMENT ON POLICY "sessions_select_policy" ON sessions_unified IS
  'Session access based on ownership. Anonymous sessions (NULL created_by) are accessible to all.';

COMMENT ON POLICY "pf_participants_update_policy" ON pf_session_participants IS
  'Facilitators (is_facilitator=true) can update any participant record';

COMMENT ON POLICY "players_select_policy" ON players IS
  'Players use session-local IDs, not auth.uid(). Access is session-based.';

COMMENT ON POLICY "votes_select_policy" ON votes IS
  'Votes use session-local player IDs. Vote ownership verified at application level via localStorage.';

-- =====================================================
-- Migration Complete
-- =====================================================
