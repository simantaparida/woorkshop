-- Fixed Migration: Tool Sessions + Problem Framing
-- This version includes the required function and handles dependencies properly

-- ============================================================================
-- STEP 1: Create the update function if it doesn't exist
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 2: Tool Sessions Base Tables
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

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_tool_sessions_updated_at ON tool_sessions;
CREATE TRIGGER update_tool_sessions_updated_at
  BEFORE UPDATE ON tool_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE tool_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access" ON tool_sessions;
CREATE POLICY "Enable all access" ON tool_sessions FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access" ON tool_items;
CREATE POLICY "Enable all access" ON tool_items FOR ALL USING (true);

-- ============================================================================
-- STEP 3: Problem Framing Tables
-- ============================================================================

-- Individual problem statements submitted by participants
CREATE TABLE IF NOT EXISTS pf_individual_statements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_session_id UUID NOT NULL REFERENCES tool_sessions(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  statement TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pinned statements (participants can mark important statements)
CREATE TABLE IF NOT EXISTS pf_statement_pins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  statement_id UUID NOT NULL REFERENCES pf_individual_statements(id) ON DELETE CASCADE,
  pinned_by_participant_id TEXT NOT NULL,
  pinned_by_participant_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(statement_id, pinned_by_participant_id)
);

-- Final agreed problem statement (created by facilitator)
CREATE TABLE IF NOT EXISTS pf_final_statement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_session_id UUID NOT NULL REFERENCES tool_sessions(id) ON DELETE CASCADE,
  statement TEXT NOT NULL,
  finalized_by_participant_id TEXT NOT NULL,
  finalized_by_participant_name TEXT NOT NULL,
  finalized_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tool_session_id)
);

-- Session participants tracking
CREATE TABLE IF NOT EXISTS pf_session_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_session_id UUID NOT NULL REFERENCES tool_sessions(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL,
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

-- ============================================================================
-- Migration Complete!
-- ============================================================================
