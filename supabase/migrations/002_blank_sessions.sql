-- Blank Sessions Schema
-- This migration creates tables for the blank session flow
-- (separate from the existing voting game sessions)

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Blank Sessions Table
CREATE TABLE blank_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT NOT NULL CHECK (session_type IN ('problem_framing', 'voting', 'prioritisation')),
  created_by TEXT, -- facilitator identifier (from localStorage or auth)
  status TEXT NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'items', 'problem_framing', 'voting', 'prioritisation', 'summary', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Session Items Table
CREATE TABLE session_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES blank_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tag TEXT NOT NULL CHECK (tag IN ('problem', 'idea', 'task')),
  item_order INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Problem Framing Data Table
CREATE TABLE item_framing (
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
CREATE TABLE session_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES blank_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_facilitator BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, name)
);

-- Item Votes Table (dot voting - different from existing RICE votes)
CREATE TABLE item_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES blank_sessions(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES session_items(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES session_participants(id) ON DELETE CASCADE,
  vote_count INT NOT NULL DEFAULT 1 CHECK (vote_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(item_id, participant_id)
);

-- RICE Prioritisation Data Table
CREATE TABLE item_rice (
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
CREATE TABLE item_moscow (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES session_items(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('must', 'should', 'could', 'wont')),
  category_order INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(item_id)
);

-- Session Summary Table (final notes)
CREATE TABLE session_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES blank_sessions(id) ON DELETE CASCADE,
  decision_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id)
);

-- Indexes for performance
CREATE INDEX idx_session_items_session ON session_items(session_id);
CREATE INDEX idx_item_framing_item ON item_framing(item_id);
CREATE INDEX idx_session_participants_session ON session_participants(session_id);
CREATE INDEX idx_item_votes_session ON item_votes(session_id);
CREATE INDEX idx_item_votes_item ON item_votes(item_id);
CREATE INDEX idx_item_rice_item ON item_rice(item_id);
CREATE INDEX idx_item_moscow_item ON item_moscow(item_id);
CREATE INDEX idx_blank_sessions_created_by ON blank_sessions(created_by);
CREATE INDEX idx_blank_sessions_status ON blank_sessions(status);

-- Triggers for updated_at timestamps
CREATE TRIGGER update_blank_sessions_updated_at
  BEFORE UPDATE ON blank_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_framing_updated_at
  BEFORE UPDATE ON item_framing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_votes_updated_at
  BEFORE UPDATE ON item_votes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_rice_updated_at
  BEFORE UPDATE ON item_rice
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_moscow_updated_at
  BEFORE UPDATE ON item_moscow
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
CREATE POLICY "Enable all access" ON blank_sessions FOR ALL USING (true);
CREATE POLICY "Enable all access" ON session_items FOR ALL USING (true);
CREATE POLICY "Enable all access" ON item_framing FOR ALL USING (true);
CREATE POLICY "Enable all access" ON session_participants FOR ALL USING (true);
CREATE POLICY "Enable all access" ON item_votes FOR ALL USING (true);
CREATE POLICY "Enable all access" ON item_rice FOR ALL USING (true);
CREATE POLICY "Enable all access" ON item_moscow FOR ALL USING (true);
CREATE POLICY "Enable all access" ON session_summary FOR ALL USING (true);
