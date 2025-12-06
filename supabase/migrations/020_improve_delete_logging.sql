-- Migration 020: Improve delete_session_cascade error reporting
-- Purpose: Add detailed error logging and return error info to caller
-- Date: 2025-12-06

-- =====================================================
-- 1. Create error logging table
-- =====================================================

CREATE TABLE IF NOT EXISTS session_deletion_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  attempt_by_user_id TEXT,
  error_step TEXT,
  error_message TEXT,
  error_detail TEXT,
  sql_state TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS but allow inserts from SECURITY DEFINER function
ALTER TABLE session_deletion_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow function inserts"
  ON session_deletion_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own deletion logs"
  ON session_deletion_logs FOR SELECT
  USING (attempt_by_user_id = auth.uid()::text);

-- =====================================================
-- 2. Replace delete_session_cascade with improved version
-- =====================================================

CREATE OR REPLACE FUNCTION delete_session_cascade(session_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_user TEXT;
  v_step TEXT;
  v_error_message TEXT;
  v_sql_state TEXT;
BEGIN
  -- Get current user for logging
  BEGIN
    v_current_user := auth.uid()::text;
  EXCEPTION WHEN OTHERS THEN
    v_current_user := 'unknown';
  END;

  -- Delete voting board data
  BEGIN
    v_step := 'votes';
    DELETE FROM votes WHERE session_id = session_id_param;

    v_step := 'features';
    DELETE FROM features WHERE session_id = session_id_param;

    v_step := 'players';
    DELETE FROM players WHERE session_id = session_id_param;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT, v_sql_state = RETURNED_SQLSTATE;

    INSERT INTO session_deletion_logs (session_id, attempt_by_user_id, error_step, error_message, sql_state)
    VALUES (session_id_param, v_current_user, v_step, v_error_message, v_sql_state);

    RETURN jsonb_build_object(
      'success', false,
      'error_step', v_step,
      'error_message', v_error_message,
      'sql_state', v_sql_state
    );
  END;

  -- Delete problem framing data
  BEGIN
    v_step := 'pf_statement_pins';
    DELETE FROM pf_statement_pins
    WHERE statement_id IN (
      SELECT id FROM pf_individual_statements WHERE session_id = session_id_param
    );

    v_step := 'pf_individual_statements';
    DELETE FROM pf_individual_statements WHERE session_id = session_id_param;

    v_step := 'pf_final_statement';
    DELETE FROM pf_final_statement WHERE session_id = session_id_param;

    v_step := 'pf_attachments';
    DELETE FROM pf_attachments WHERE session_id = session_id_param;

    v_step := 'pf_session_participants';
    DELETE FROM pf_session_participants WHERE session_id = session_id_param;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT, v_sql_state = RETURNED_SQLSTATE;

    INSERT INTO session_deletion_logs (session_id, attempt_by_user_id, error_step, error_message, sql_state)
    VALUES (session_id_param, v_current_user, v_step, v_error_message, v_sql_state);

    RETURN jsonb_build_object(
      'success', false,
      'error_step', v_step,
      'error_message', v_error_message,
      'sql_state', v_sql_state
    );
  END;

  -- Delete the session itself
  BEGIN
    v_step := 'sessions_unified';
    DELETE FROM sessions_unified WHERE id = session_id_param;

    IF NOT FOUND THEN
      -- Session was already deleted or doesn't exist
      RETURN jsonb_build_object(
        'success', false,
        'error_step', 'sessions_unified',
        'error_message', 'Session not found or already deleted',
        'sql_state', 'P0002'
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT, v_sql_state = RETURNED_SQLSTATE;

    INSERT INTO session_deletion_logs (session_id, attempt_by_user_id, error_step, error_message, sql_state)
    VALUES (session_id_param, v_current_user, v_step, v_error_message, v_sql_state);

    RETURN jsonb_build_object(
      'success', false,
      'error_step', v_step,
      'error_message', v_error_message,
      'sql_state', v_sql_state
    );
  END;

  -- Success
  RETURN jsonb_build_object('success', true);
END;
$$;

-- Add comment
COMMENT ON FUNCTION delete_session_cascade(UUID) IS
  'Cascade delete a session with detailed error reporting (returns JSONB with success/error details)';

COMMENT ON TABLE session_deletion_logs IS
  'Audit log for session deletion attempts and errors';
