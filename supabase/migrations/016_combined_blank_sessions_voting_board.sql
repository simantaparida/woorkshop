-- Combined Migration: Blank Sessions + Voting Board Refactor
-- This migration creates the blank sessions schema AND applies voting board changes

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Blank Sessions Table
CREATE TABLE IF NOT EXISTS blank_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT NOT NULL CHECK (session_type IN ('problem_framing', 'voting', 'prioritisation')),
  created_by TEXT, -- facilitator identifier (from localStorage or auth)
  status TEXT NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'items', 'problem_framing', 'voting', 'prioritisation', 'summary', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  -- Voting Board additions
  voting_ended BOOLEAN DEFAULT false,
  voting_ended_at TIMESTAMPTZ
);

-- Session Items Table
CREATE TABLE IF NOT EXISTS session_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES blank_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tag TEXT NOT NULL CHECK (tag IN ('problem', 'idea', 'task')),
  item_order INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Problem Framing Data Table
CREATE TABLE IF NOT EXISTS item_framing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES session_items(id) ON DELETE CASCADE,
  core_problem TEXT,
  who_faces TEXT,
  why_matters TEXT,
  blocked_outcome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(item_id)
);

-- Session Participants Table (for multi-user voting)
CREATE TABLE IF NOT EXISTS session_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES blank_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_facilitator BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Voting Board additions
  submitted BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ,
  UNIQUE(session_id, name)
);

-- Item Votes Table (100-point allocation - refactored from dot voting)
CREATE TABLE IF NOT EXISTS item_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES blank_sessions(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES session_items(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES session_participants(id) ON DELETE CASCADE,
  points_allocated INT NOT NULL DEFAULT 0 CHECK (points_allocated >= 0 AND points_allocated <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(item_id, participant_id)
);

-- RICE Prioritisation Data Table
CREATE TABLE IF NOT EXISTS item_rice (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES session_items(id) ON DELETE CASCADE,
  reach INT NOT NULL,
  impact INT NOT NULL CHECK (impact >= 1 AND impact <= 5),
  confidence INT NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  effort_hours DECIMAL NOT NULL, -- normalized to hours
  score DECIMAL GENERATED ALWAYS AS ((reach * impact * confidence / 100.0) / NULLIF(effort_hours, 0)) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(item_id)
);

-- MoSCoW Prioritisation Data Table
CREATE TABLE IF NOT EXISTS item_moscow (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES session_items(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('must', 'should', 'could', 'wont')),
  category_order INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(item_id)
);

-- Session Summary Table (final notes)
CREATE TABLE IF NOT EXISTS session_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES blank_sessions(id) ON DELETE CASCADE,
  decision_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_items_session ON session_items(session_id);
CREATE INDEX IF NOT EXISTS idx_item_framing_item ON item_framing(item_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_session ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_item_votes_session ON item_votes(session_id);
CREATE INDEX IF NOT EXISTS idx_item_votes_item ON item_votes(item_id);
CREATE INDEX IF NOT EXISTS idx_item_rice_item ON item_rice(item_id);
CREATE INDEX IF NOT EXISTS idx_item_moscow_item ON item_moscow(item_id);
CREATE INDEX IF NOT EXISTS idx_blank_sessions_created_by ON blank_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_blank_sessions_status ON blank_sessions(status);

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at timestamps
DROP TRIGGER IF EXISTS update_blank_sessions_updated_at ON blank_sessions;
CREATE TRIGGER update_blank_sessions_updated_at
  BEFORE UPDATE ON blank_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_item_framing_updated_at ON item_framing;
CREATE TRIGGER update_item_framing_updated_at
  BEFORE UPDATE ON item_framing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_item_votes_updated_at ON item_votes;
CREATE TRIGGER update_item_votes_updated_at
  BEFORE UPDATE ON item_votes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_item_rice_updated_at ON item_rice;
CREATE TRIGGER update_item_rice_updated_at
  BEFORE UPDATE ON item_rice
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_item_moscow_updated_at ON item_moscow;
CREATE TRIGGER update_item_moscow_updated_at
  BEFORE UPDATE ON item_moscow
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_session_summary_updated_at ON session_summary;
CREATE TRIGGER update_session_summary_updated_at
  BEFORE UPDATE ON session_summary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE blank_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_framing ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_rice ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_moscow ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public access for MVP - refine for production)
DROP POLICY IF EXISTS "Enable all access" ON blank_sessions;
CREATE POLICY "Enable all access" ON blank_sessions FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access" ON session_items;
CREATE POLICY "Enable all access" ON session_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access" ON item_framing;
CREATE POLICY "Enable all access" ON item_framing FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access" ON session_participants;
CREATE POLICY "Enable all access" ON session_participants FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access" ON item_votes;
CREATE POLICY "Enable all access" ON item_votes FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access" ON item_rice;
CREATE POLICY "Enable all access" ON item_rice FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access" ON item_moscow;
CREATE POLICY "Enable all access" ON item_moscow FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access" ON session_summary;
CREATE POLICY "Enable all access" ON session_summary FOR ALL USING (true);

-- Add comments for clarity
COMMENT ON COLUMN item_votes.points_allocated IS 'Points allocated to this item (0-100). Each participant has 100 points total to distribute.';
COMMENT ON COLUMN session_participants.submitted IS 'Whether participant has submitted their 100-point allocation';
COMMENT ON COLUMN blank_sessions.voting_ended IS 'Whether facilitator has ended the voting round';
