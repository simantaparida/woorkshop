-- Add workshop mode settings to sessions table
ALTER TABLE sessions
ADD COLUMN workshop_mode BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN workshop_phase TEXT DEFAULT 'introduction' CHECK (workshop_phase IN ('introduction', 'discussion', 'voting', 'results')),
ADD COLUMN discussion_time_minutes INTEGER,
ADD COLUMN voting_time_minutes INTEGER,
ADD COLUMN phase_started_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN sessions.workshop_mode IS 'Whether this session is running in facilitated workshop mode';
COMMENT ON COLUMN sessions.workshop_phase IS 'Current phase of the workshop (introduction, discussion, voting, results)';
COMMENT ON COLUMN sessions.discussion_time_minutes IS 'Allocated time for discussion phase in minutes';
COMMENT ON COLUMN sessions.voting_time_minutes IS 'Allocated time for voting phase in minutes';
COMMENT ON COLUMN sessions.phase_started_at IS 'Timestamp when current phase started for timer calculation';

-- Create index for efficient workshop session queries
CREATE INDEX idx_sessions_workshop_mode ON sessions(workshop_mode, workshop_phase);
