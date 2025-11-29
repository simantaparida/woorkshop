-- Add attachments table for Problem Framing sessions
CREATE TABLE IF NOT EXISTS pf_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_session_id UUID NOT NULL REFERENCES tool_sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('link', 'image', 'document')),
  name TEXT NOT NULL,
  url TEXT NOT NULL, -- Stores URL for links, or Base64 data for files (MVP)
  size INT, -- Size in bytes, null for links
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_pf_attachments_session ON pf_attachments(tool_session_id);

-- Enable RLS
ALTER TABLE pf_attachments ENABLE ROW LEVEL SECURITY;

-- Public access policy
DROP POLICY IF EXISTS "Enable all access" ON pf_attachments;
CREATE POLICY "Enable all access" ON pf_attachments FOR ALL USING (true);

-- Comments
COMMENT ON TABLE pf_attachments IS 'Stores attachments (links, files) for Problem Framing sessions';
COMMENT ON COLUMN pf_attachments.url IS 'Stores URL for links, or Base64 data for files (MVP approach)';
