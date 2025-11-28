-- Problem Framing Tool Tables
-- Migration 004: Add tables for multi-user collaborative problem framing sessions

-- Individual problem statements submitted by participants
CREATE TABLE pf_individual_statements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_session_id UUID NOT NULL REFERENCES tool_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL,
  participant_name TEXT NOT NULL,
  statement TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pinned statements (participants can mark important statements)
CREATE TABLE pf_statement_pins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  statement_id UUID NOT NULL REFERENCES pf_individual_statements(id) ON DELETE CASCADE,
  pinned_by_participant_id UUID NOT NULL,
  pinned_by_participant_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(statement_id, pinned_by_participant_id)
);

-- Final agreed problem statement (created by facilitator)
CREATE TABLE pf_final_statement (
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
CREATE TABLE pf_session_participants (
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
CREATE INDEX idx_pf_statements_session ON pf_individual_statements(tool_session_id);
CREATE INDEX idx_pf_statements_participant ON pf_individual_statements(participant_id);
CREATE INDEX idx_pf_statement_pins_statement ON pf_statement_pins(statement_id);
CREATE INDEX idx_pf_final_statement_session ON pf_final_statement(tool_session_id);
CREATE INDEX idx_pf_participants_session ON pf_session_participants(tool_session_id);

-- Enable Row Level Security
ALTER TABLE pf_individual_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_statement_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_final_statement ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_session_participants ENABLE ROW LEVEL SECURITY;

-- Public access policies (for MVP - refine for production)
CREATE POLICY "Enable all access" ON pf_individual_statements FOR ALL USING (true);
CREATE POLICY "Enable all access" ON pf_statement_pins FOR ALL USING (true);
CREATE POLICY "Enable all access" ON pf_final_statement FOR ALL USING (true);
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
