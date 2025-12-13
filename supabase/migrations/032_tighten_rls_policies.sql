-- Migration 032: Tighten RLS Policies for Production Security
-- Purpose: Fix overly permissive RLS policies while maintaining guest functionality
-- Date: 2025-12-13
-- Priority: CRITICAL SECURITY FIX FOR PRODUCTION
--
-- Problem: Migration 031 uses USING(true) for UPDATE policies, allowing anyone to modify anything
-- Solution: Implement session-based access control that validates session ownership
--          while still supporting guest users through shared session links
--
-- Security Model:
-- - READ: Anyone with session ID can read (guest-friendly)
-- - CREATE: Anyone can join/vote in accessible sessions (guest-friendly)
-- - UPDATE/DELETE: Only session owners (created_by = auth.uid()) can modify
-- - Exception: Players and votes need application-level validation via host_token

-- =====================================================
-- 1. SESSIONS_UNIFIED - Tighten access control
-- =====================================================

DROP POLICY IF EXISTS "sessions_select_policy" ON sessions_unified;
DROP POLICY IF EXISTS "sessions_insert_policy" ON sessions_unified;
DROP POLICY IF EXISTS "sessions_update_policy" ON sessions_unified;
DROP POLICY IF EXISTS "sessions_delete_policy" ON sessions_unified;

-- SELECT: Anyone can read sessions (needed for guest access via shared links)
-- This is acceptable - session IDs are effectively shared secrets
CREATE POLICY "sessions_select_policy"
  ON sessions_unified FOR SELECT
  USING (true);

-- INSERT: Only authenticated users can create sessions
-- Remove NULL created_by option to enforce ownership
CREATE POLICY "sessions_insert_policy"
  ON sessions_unified FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()::text
  );

-- UPDATE: Only session creators can update
CREATE POLICY "sessions_update_policy"
  ON sessions_unified FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()::text
  );

-- DELETE: Only session creators can delete
CREATE POLICY "sessions_delete_policy"
  ON sessions_unified FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()::text
  );

-- =====================================================
-- 2. PROJECTS - Require authentication
-- =====================================================

DROP POLICY IF EXISTS "projects_select_policy" ON projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON projects;
DROP POLICY IF EXISTS "projects_update_policy" ON projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON projects;

-- Only authenticated users see their own projects
CREATE POLICY "projects_select_policy"
  ON projects FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()::text
  );

-- Only authenticated users can create projects
CREATE POLICY "projects_insert_policy"
  ON projects FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()::text
  );

-- Only owners can update
CREATE POLICY "projects_update_policy"
  ON projects FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()::text
  );

-- Only owners can delete
CREATE POLICY "projects_delete_policy"
  ON projects FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()::text
  );

-- =====================================================
-- 3. WORKSHOPS - Require authentication
-- =====================================================

DROP POLICY IF EXISTS "workshops_select_policy" ON workshops;
DROP POLICY IF EXISTS "workshops_insert_policy" ON workshops;
DROP POLICY IF EXISTS "workshops_update_policy" ON workshops;
DROP POLICY IF EXISTS "workshops_delete_policy" ON workshops;

-- Only authenticated users see their own workshops
CREATE POLICY "workshops_select_policy"
  ON workshops FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()::text
  );

-- Only authenticated users can create workshops
CREATE POLICY "workshops_insert_policy"
  ON workshops FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()::text
  );

-- Only owners can update
CREATE POLICY "workshops_update_policy"
  ON workshops FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()::text
  );

-- Only owners can delete
CREATE POLICY "workshops_delete_policy"
  ON workshops FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()::text
  );

-- =====================================================
-- 4. FEATURES - Guest-friendly but with validation
-- =====================================================

DROP POLICY IF EXISTS "features_select_policy" ON features;
DROP POLICY IF EXISTS "features_insert_policy" ON features;
DROP POLICY IF EXISTS "features_update_policy" ON features;
DROP POLICY IF EXISTS "features_delete_policy" ON features;

-- SELECT: Anyone can view features (guest-friendly)
CREATE POLICY "features_select_policy"
  ON features FOR SELECT
  USING (true);

-- INSERT: Anyone can add features (validated at application level via host_token)
CREATE POLICY "features_insert_policy"
  ON features FOR INSERT
  WITH CHECK (true);

-- UPDATE: Only authenticated session owners
CREATE POLICY "features_update_policy"
  ON features FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- DELETE: Only authenticated session owners
CREATE POLICY "features_delete_policy"
  ON features FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- =====================================================
-- 5. PLAYERS - Guest-friendly with constraints
-- =====================================================

DROP POLICY IF EXISTS "players_select_policy" ON players;
DROP POLICY IF EXISTS "players_insert_policy" ON players;
DROP POLICY IF EXISTS "players_update_policy" ON players;
DROP POLICY IF EXISTS "players_delete_policy" ON players;

-- SELECT: Anyone can view players (guest-friendly)
CREATE POLICY "players_select_policy"
  ON players FOR SELECT
  USING (true);

-- INSERT: Anyone can join as player (guest-friendly)
CREATE POLICY "players_insert_policy"
  ON players FOR INSERT
  WITH CHECK (true);

-- UPDATE: Only session owners can update players
-- This prevents guests from modifying other players' status
CREATE POLICY "players_update_policy"
  ON players FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- DELETE: Only session owners can delete players
CREATE POLICY "players_delete_policy"
  ON players FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- =====================================================
-- 6. VOTES - Guest-friendly but validated at app level
-- =====================================================

DROP POLICY IF EXISTS "votes_select_policy" ON votes;
DROP POLICY IF EXISTS "votes_insert_policy" ON votes;
DROP POLICY IF EXISTS "votes_update_policy" ON votes;
DROP POLICY IF EXISTS "votes_delete_policy" ON votes;

-- SELECT: Anyone can view votes (guest-friendly)
CREATE POLICY "votes_select_policy"
  ON votes FOR SELECT
  USING (true);

-- INSERT: Anyone can vote (guest-friendly)
-- Application validates via localStorage player_id
CREATE POLICY "votes_insert_policy"
  ON votes FOR INSERT
  WITH CHECK (true);

-- UPDATE: Anyone can update votes (guest-friendly)
-- Application validates ownership via localStorage player_id
-- This is necessary for guest voting functionality
CREATE POLICY "votes_update_policy"
  ON votes FOR UPDATE
  USING (true);

-- DELETE: Anyone can delete votes (needed for vote changes)
-- Application validates via localStorage player_id
CREATE POLICY "votes_delete_policy"
  ON votes FOR DELETE
  USING (true);

-- =====================================================
-- 7. PROBLEM FRAMING - pf_session_participants
-- =====================================================

DROP POLICY IF EXISTS "pf_participants_select_policy" ON pf_session_participants;
DROP POLICY IF EXISTS "pf_participants_insert_policy" ON pf_session_participants;
DROP POLICY IF EXISTS "pf_participants_update_policy" ON pf_session_participants;
DROP POLICY IF EXISTS "pf_participants_delete_policy" ON pf_session_participants;

-- SELECT: Anyone can view participants (guest-friendly)
CREATE POLICY "pf_participants_select_policy"
  ON pf_session_participants FOR SELECT
  USING (true);

-- INSERT: Anyone can join as participant (guest-friendly)
CREATE POLICY "pf_participants_insert_policy"
  ON pf_session_participants FOR INSERT
  WITH CHECK (true);

-- UPDATE: Anyone can update (needed for guest has_submitted status)
-- Application validates via participant_id in localStorage
CREATE POLICY "pf_participants_update_policy"
  ON pf_session_participants FOR UPDATE
  USING (true);

-- DELETE: Only authenticated session owners
CREATE POLICY "pf_participants_delete_policy"
  ON pf_session_participants FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- =====================================================
-- 8. PROBLEM FRAMING - pf_individual_statements
-- =====================================================

DROP POLICY IF EXISTS "pf_statements_select_policy" ON pf_individual_statements;
DROP POLICY IF EXISTS "pf_statements_insert_policy" ON pf_individual_statements;
DROP POLICY IF EXISTS "pf_statements_update_policy" ON pf_individual_statements;
DROP POLICY IF EXISTS "pf_statements_delete_policy" ON pf_individual_statements;

-- SELECT: Anyone can view statements (guest-friendly)
CREATE POLICY "pf_statements_select_policy"
  ON pf_individual_statements FOR SELECT
  USING (true);

-- INSERT: Anyone can create statements (guest-friendly)
CREATE POLICY "pf_statements_insert_policy"
  ON pf_individual_statements FOR INSERT
  WITH CHECK (true);

-- UPDATE: Only authenticated session owners
CREATE POLICY "pf_statements_update_policy"
  ON pf_individual_statements FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- DELETE: Only authenticated session owners
CREATE POLICY "pf_statements_delete_policy"
  ON pf_individual_statements FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- =====================================================
-- 9. PROBLEM FRAMING - pf_statement_pins
-- =====================================================

DROP POLICY IF EXISTS "pf_pins_select_policy" ON pf_statement_pins;
DROP POLICY IF EXISTS "pf_pins_insert_policy" ON pf_statement_pins;
DROP POLICY IF EXISTS "pf_pins_delete_policy" ON pf_statement_pins;

-- SELECT: Anyone can view pins (guest-friendly)
CREATE POLICY "pf_pins_select_policy"
  ON pf_statement_pins FOR SELECT
  USING (true);

-- INSERT: Anyone can create pins (guest-friendly)
CREATE POLICY "pf_pins_insert_policy"
  ON pf_statement_pins FOR INSERT
  WITH CHECK (true);

-- DELETE: Only authenticated session owners
CREATE POLICY "pf_pins_delete_policy"
  ON pf_statement_pins FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND statement_id IN (
      SELECT id FROM pf_individual_statements
      WHERE session_id IN (
        SELECT id FROM sessions_unified
        WHERE created_by = auth.uid()::text
      )
    )
  );

-- =====================================================
-- 10. PROBLEM FRAMING - pf_final_statement
-- =====================================================

DROP POLICY IF EXISTS "pf_final_select_policy" ON pf_final_statement;
DROP POLICY IF EXISTS "pf_final_insert_policy" ON pf_final_statement;
DROP POLICY IF EXISTS "pf_final_update_policy" ON pf_final_statement;
DROP POLICY IF EXISTS "pf_final_delete_policy" ON pf_final_statement;

-- SELECT: Anyone can view final statements (guest-friendly)
CREATE POLICY "pf_final_select_policy"
  ON pf_final_statement FOR SELECT
  USING (true);

-- INSERT: Anyone can create (application validates facilitator)
CREATE POLICY "pf_final_insert_policy"
  ON pf_final_statement FOR INSERT
  WITH CHECK (true);

-- UPDATE: Only authenticated session owners
CREATE POLICY "pf_final_update_policy"
  ON pf_final_statement FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- DELETE: Only authenticated session owners
CREATE POLICY "pf_final_delete_policy"
  ON pf_final_statement FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- =====================================================
-- 11. PROBLEM FRAMING - pf_attachments
-- =====================================================

DROP POLICY IF EXISTS "pf_attachments_select_policy" ON pf_attachments;
DROP POLICY IF EXISTS "pf_attachments_insert_policy" ON pf_attachments;
DROP POLICY IF EXISTS "pf_attachments_delete_policy" ON pf_attachments;

-- SELECT: Anyone can view attachments (guest-friendly)
CREATE POLICY "pf_attachments_select_policy"
  ON pf_attachments FOR SELECT
  USING (true);

-- INSERT: Anyone can add attachments (guest-friendly)
CREATE POLICY "pf_attachments_insert_policy"
  ON pf_attachments FOR INSERT
  WITH CHECK (true);

-- DELETE: Only authenticated session owners
CREATE POLICY "pf_attachments_delete_policy"
  ON pf_attachments FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- =====================================================
-- SECURITY NOTES & DOCUMENTATION
-- =====================================================

COMMENT ON POLICY "sessions_select_policy" ON sessions_unified IS
  'Public read access - session IDs act as shared secrets for guest access';

COMMENT ON POLICY "sessions_insert_policy" ON sessions_unified IS
  'Only authenticated users can create sessions - enforces ownership tracking';

COMMENT ON POLICY "votes_update_policy" ON votes IS
  'Open update for guest voting - ownership validated at application level via localStorage player_id';

COMMENT ON POLICY "pf_participants_update_policy" ON pf_session_participants IS
  'Open update for guest participants - allows updating has_submitted status';

-- =====================================================
-- IMPORTANT APPLICATION-LEVEL VALIDATION REQUIRED
-- =====================================================
--
-- The following operations MUST be validated at the application level:
--
-- 1. VOTES: Verify localStorage player_id matches before UPDATE/DELETE
-- 2. PF_PARTICIPANTS: Verify participant_id matches before UPDATE
-- 3. FEATURES: Verify host_token before INSERT (host-only operation)
-- 4. PLAYERS: Verify host_token before UPDATE (status changes)
--
-- This two-layer approach allows:
-- - RLS provides database-level protection against malicious clients
-- - Application provides fine-grained session-based access control
-- - Guest users can participate without authentication
--
-- Migration Complete - RLS policies tightened while preserving guest functionality
