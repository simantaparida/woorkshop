-- Migration 032: Enable Realtime for Problem Framing Tables
-- Purpose: Allow real-time updates for guest submissions to show on facilitator's view
-- Date: 2025-12-07
--
-- Problem: Real-time subscriptions were using wrong table/column names AND
--          problem framing tables were never added to the supabase_realtime publication
--
-- Note: The hook useProblemFramingSession.ts has been updated to use:
--   - sessions_unified (was: tool_sessions)
--   - session_id column (was: tool_session_id)

-- =====================================================
-- Add Problem Framing tables to realtime publication
-- =====================================================

-- First check if already added (to make migration idempotent)
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

-- =====================================================
-- Set REPLICA IDENTITY to FULL for better change detection
-- =====================================================
-- This enables the subscription to receive the full row data on UPDATE and DELETE

ALTER TABLE sessions_unified REPLICA IDENTITY FULL;
ALTER TABLE pf_session_participants REPLICA IDENTITY FULL;
ALTER TABLE pf_individual_statements REPLICA IDENTITY FULL;
ALTER TABLE pf_statement_pins REPLICA IDENTITY FULL;
ALTER TABLE pf_final_statement REPLICA IDENTITY FULL;
ALTER TABLE pf_attachments REPLICA IDENTITY FULL;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE pf_session_participants IS
  'Participants in problem framing sessions. Realtime-enabled for live updates.';

COMMENT ON TABLE pf_individual_statements IS
  'Individual problem statements. Realtime-enabled so facilitator sees guest submissions instantly.';

-- =====================================================
-- Migration Complete
-- =====================================================
