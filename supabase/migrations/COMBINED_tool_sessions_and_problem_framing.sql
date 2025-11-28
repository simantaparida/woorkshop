-- Combined Migration: Tool Sessions + Problem Framing
-- Run this single file to set up both the base tool tables and Problem Framing tables

-- ============================================================================
-- PART 1: Tool Sessions Base Tables (from 003_tool_sessions.sql)
-- ============================================================================

-- Tool sessions (separate from blank_sessions)
CREATE TABLE IF NOT EXISTS tool_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_by TEXT,
  status TEXT NOT NULL DEFAULT 'setup',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Tool session items (separate from session_items)
CREATE TABLE IF NOT EXISTS tool_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_session_id UUID NOT NULL REFERENCES tool_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tag TEXT NOT NULL CHECK (tag IN ('problem', 'idea', 'task')),
  item_order INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tool_sessions_slug ON tool_sessions(tool_slug);
CREATE INDEX IF NOT EXISTS idx_tool_sessions_created_by ON tool_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_tool_items_session ON tool_items(tool_session_id);

-- Triggers (only create if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_tool_sessions_updated_at'
  ) THEN
    CREATE TRIGGER update_tool_sessions_updated_at
      BEFORE UPDATE ON tool_sessions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS Policies
ALTER TABLE tool_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access" ON tool_sessions;
CREATE POLICY "Enable all access" ON tool_sessions FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access" ON tool_items;
CREATE POLICY "Enable all access" ON tool_items FOR ALL USING (true);

-- Comments for documentation
COMMENT ON TABLE tool_sessions IS 'Stores tool-based workshop sessions (Problem Framing, RICE, MoSCoW, Dot Voting)';
COMMENT ON TABLE tool_items IS 'Items/ideas added to tool sessions';
COMMENT ON COLUMN tool_sessions.tool_slug IS 'Tool identifier: problem-framing, rice, moscow, dot-voting';
COMMENT ON COLUMN tool_sessions.status IS 'Current progress: setup, items, in_progress, completed';

-- ============================================================================
-- PART 2: Problem Framing Tables (from 004_problem_framing.sql)
-- ============================================================================

-- Individual problem statements submitted by participants
CREATE TABLE IF NOT EXISTS pf_individual_statements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_session_id UUID NOT NULL REFERENCES tool_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL,
  participant_name TEXT NOT NULL,
  statement TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pinned statements (participants can mark important statements)
CREATE TABLE IF NOT EXISTS pf_statement_pins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  statement_id UUID NOT NULL REFERENCES pf_individual_statements(id) ON DELETE CASCADE,
  pinned_by_participant_id UUID NOT NULL,
  pinned_by_participant_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(statement_id, pinned_by_participant_id)
);

-- Final agreed problem statement (created by facilitator)
CREATE TABLE IF NOT EXISTS pf_final_statement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_session_id UUID NOT NULL REFERENCES tool_sessions(id) ON DELETE CASCADE,
  statement TEXT NOT NULL,
  finalized_by_participant_id UUID NOT NULL,
  finalized_by_participant_name TEXT NOT NULL,
  finalized_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tool_session_id)
);

-- Session participants tracking
CREATE TABLE IF NOT EXISTS pf_session_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_session_id UUID NOT NULL REFERENCES tool_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL,
  participant_name TEXT NOT NULL,
  is_facilitator BOOLEAN NOT NULL DEFAULT false,
  has_submitted BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tool_session_id, participant_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pf_statements_session ON pf_individual_statements(tool_session_id);
CREATE INDEX IF NOT EXISTS idx_pf_statements_participant ON pf_individual_statements(participant_id);
CREATE INDEX IF NOT EXISTS idx_pf_statement_pins_statement ON pf_statement_pins(statement_id);
CREATE INDEX IF NOT EXISTS idx_pf_final_statement_session ON pf_final_statement(tool_session_id);
CREATE INDEX IF NOT EXISTS idx_pf_participants_session ON pf_session_participants(tool_session_id);

-- Enable Row Level Security
ALTER TABLE pf_individual_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_statement_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_final_statement ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_session_participants ENABLE ROW LEVEL SECURITY;

-- Public access policies (for MVP - refine for production)
DROP POLICY IF EXISTS "Enable all access" ON pf_individual_statements;
CREATE POLICY "Enable all access" ON pf_individual_statements FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access" ON pf_statement_pins;
CREATE POLICY "Enable all access" ON pf_statement_pins FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access" ON pf_final_statement;
CREATE POLICY "Enable all access" ON pf_final_statement FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access" ON pf_session_participants;
CREATE POLICY "Enable all access" ON pf_session_participants FOR ALL USING (true);

-- Comments for documentation
COMMENT ON TABLE pf_individual_statements IS 'Individual problem statements submitted by participants in problem framing sessions';
COMMENT ON TABLE pf_statement_pins IS 'Pins/bookmarks on statements by participants during team review';
COMMENT ON TABLE pf_final_statement IS 'Final team-agreed problem statement created by facilitator';
COMMENT ON TABLE pf_session_participants IS 'Participants in a problem framing session with submission status';

COMMENT ON COLUMN pf_individual_statements.tool_session_id IS 'References tool_sessions table';
COMMENT ON COLUMN pf_individual_statements.participant_id IS 'Unique identifier for participant (UUID stored in localStorage)';
COMMENT ON COLUMN pf_individual_statements.participant_name IS 'Display name entered by participant';
COMMENT ON COLUMN pf_session_participants.has_submitted IS 'Tracks whether participant has submitted their individual statement';

-- ============================================================================
-- Migration Complete!
-- ============================================================================
-- This creates:
-- - 2 base tables: tool_sessions, tool_items
-- - 4 Problem Framing tables: pf_individual_statements, pf_statement_pins,
--   pf_final_statement, pf_session_participants
-- All tables have RLS enabled with permissive policies for MVP
