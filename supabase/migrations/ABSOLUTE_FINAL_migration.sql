-- Absolute Final Migration for Problem Framing
-- Handles the case where indexes exist but tables don't

-- ============================================================================
-- CLEANUP: Drop everything in the correct order
-- ============================================================================

-- Drop indexes first (they can exist independently)
DROP INDEX IF EXISTS idx_pf_participants_session;
DROP INDEX IF EXISTS idx_pf_final_statement_session;
DROP INDEX IF EXISTS idx_pf_statement_pins_statement;
DROP INDEX IF EXISTS idx_pf_statements_participant;
DROP INDEX IF EXISTS idx_pf_statements_session;
DROP INDEX IF EXISTS idx_tool_items_session;
DROP INDEX IF EXISTS idx_tool_sessions_created_by;
DROP INDEX IF EXISTS idx_tool_sessions_slug;

-- Drop tables with CASCADE (this drops policies, triggers, constraints)
DROP TABLE IF EXISTS pf_statement_pins CASCADE;
DROP TABLE IF EXISTS pf_individual_statements CASCADE;
DROP TABLE IF EXISTS pf_final_statement CASCADE;
DROP TABLE IF EXISTS pf_session_participants CASCADE;
DROP TABLE IF EXISTS tool_items CASCADE;
DROP TABLE IF EXISTS tool_sessions CASCADE;

-- Drop views
DROP VIEW IF EXISTS v_problem_framing_sessions CASCADE;
DROP VIEW IF EXISTS v_tool_sessions CASCADE;

-- ============================================================================
-- CREATE: Build everything fresh
-- ============================================================================

-- Create the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create tool_sessions table
CREATE TABLE tool_sessions (
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

-- Create tool_items table
CREATE TABLE tool_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_session_id UUID NOT NULL REFERENCES tool_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tag TEXT NOT NULL CHECK (tag IN ('problem', 'idea', 'task')),
  item_order INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for base tables
CREATE INDEX idx_tool_sessions_slug ON tool_sessions(tool_slug);
CREATE INDEX idx_tool_sessions_created_by ON tool_sessions(created_by);
CREATE INDEX idx_tool_items_session ON tool_items(tool_session_id);

-- Create trigger
CREATE TRIGGER update_tool_sessions_updated_at
  BEFORE UPDATE ON tool_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for base tables
ALTER TABLE tool_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_items ENABLE ROW LEVEL SECURITY;

-- Create policies for base tables
CREATE POLICY "Enable all access" ON tool_sessions FOR ALL USING (true);
CREATE POLICY "Enable all access" ON tool_items FOR ALL USING (true);

-- Create pf_individual_statements table
CREATE TABLE pf_individual_statements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_session_id UUID NOT NULL REFERENCES tool_sessions(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  statement TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create pf_statement_pins table
CREATE TABLE pf_statement_pins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  statement_id UUID NOT NULL REFERENCES pf_individual_statements(id) ON DELETE CASCADE,
  pinned_by_participant_id TEXT NOT NULL,
  pinned_by_participant_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(statement_id, pinned_by_participant_id)
);

-- Create pf_final_statement table
CREATE TABLE pf_final_statement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_session_id UUID NOT NULL REFERENCES tool_sessions(id) ON DELETE CASCADE,
  statement TEXT NOT NULL,
  finalized_by_participant_id TEXT NOT NULL,
  finalized_by_participant_name TEXT NOT NULL,
  finalized_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tool_session_id)
);

-- Create pf_session_participants table
CREATE TABLE pf_session_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_session_id UUID NOT NULL REFERENCES tool_sessions(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  is_facilitator BOOLEAN NOT NULL DEFAULT false,
  has_submitted BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tool_session_id, participant_id)
);

-- Create indexes for PF tables
CREATE INDEX idx_pf_statements_session ON pf_individual_statements(tool_session_id);
CREATE INDEX idx_pf_statements_participant ON pf_individual_statements(participant_id);
CREATE INDEX idx_pf_statement_pins_statement ON pf_statement_pins(statement_id);
CREATE INDEX idx_pf_final_statement_session ON pf_final_statement(tool_session_id);
CREATE INDEX idx_pf_participants_session ON pf_session_participants(tool_session_id);

-- Enable RLS for PF tables
ALTER TABLE pf_individual_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_statement_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_final_statement ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_session_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for PF tables
CREATE POLICY "Enable all access" ON pf_individual_statements FOR ALL USING (true);
CREATE POLICY "Enable all access" ON pf_statement_pins FOR ALL USING (true);
CREATE POLICY "Enable all access" ON pf_final_statement FOR ALL USING (true);
CREATE POLICY "Enable all access" ON pf_session_participants FOR ALL USING (true);

-- ============================================================================
-- COMPLETE! All tables, indexes, triggers, and policies created successfully
-- ============================================================================
