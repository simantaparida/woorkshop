-- Tool sessions (separate from blank_sessions)
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

-- Tool session items (separate from session_items)
CREATE TABLE tool_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_session_id UUID NOT NULL REFERENCES tool_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tag TEXT NOT NULL CHECK (tag IN ('problem', 'idea', 'task')),
  item_order INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tool_sessions_slug ON tool_sessions(tool_slug);
CREATE INDEX idx_tool_sessions_created_by ON tool_sessions(created_by);
CREATE INDEX idx_tool_items_session ON tool_items(tool_session_id);

-- Triggers
CREATE TRIGGER update_tool_sessions_updated_at
  BEFORE UPDATE ON tool_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE tool_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access" ON tool_sessions FOR ALL USING (true);
CREATE POLICY "Enable all access" ON tool_items FOR ALL USING (true);

-- Comments for documentation
COMMENT ON TABLE tool_sessions IS 'Stores tool-based workshop sessions (Problem Framing, RICE, MoSCoW, Dot Voting)';
COMMENT ON TABLE tool_items IS 'Items/ideas added to tool sessions';
COMMENT ON COLUMN tool_sessions.tool_slug IS 'Tool identifier: problem-framing, rice, moscow, dot-voting';
COMMENT ON COLUMN tool_sessions.status IS 'Current progress: setup, items, in_progress, completed';
