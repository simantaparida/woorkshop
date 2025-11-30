-- Add voting board columns to sessions_unified
-- These columns were in the original 'sessions' table but weren't migrated to sessions_unified

-- Add host_token column (required for authentication)
ALTER TABLE sessions_unified
  ADD COLUMN host_token TEXT UNIQUE;

-- Add legacy voting board columns for backwards compatibility
ALTER TABLE sessions_unified
  ADD COLUMN host_name TEXT;

ALTER TABLE sessions_unified
  ADD COLUMN project_name TEXT;

ALTER TABLE sessions_unified
  ADD COLUMN session_goal TEXT;

ALTER TABLE sessions_unified
  ADD COLUMN duration_hours INTEGER;

-- Migrate data from session_config to top-level columns for existing voting-board sessions
UPDATE sessions_unified
SET
  host_token = session_config->>'host_token',
  duration_hours = (session_config->>'duration_hours')::integer
WHERE tool_type = 'voting-board' AND session_config IS NOT NULL;

-- Add comments
COMMENT ON COLUMN sessions_unified.host_token IS 'Authentication token for session host - required for voting-board sessions';
COMMENT ON COLUMN sessions_unified.host_name IS 'Legacy column from voting-board sessions - use created_by instead';
COMMENT ON COLUMN sessions_unified.project_name IS 'Legacy column from voting-board sessions - use title instead';
COMMENT ON COLUMN sessions_unified.session_goal IS 'Legacy column from voting-board sessions - use description instead';
COMMENT ON COLUMN sessions_unified.duration_hours IS 'Legacy column from voting-board sessions - stored in session_config for other tools';
