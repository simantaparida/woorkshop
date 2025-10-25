-- Add expires_at column to sessions table
ALTER TABLE sessions
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours');

-- Update existing sessions to expire 24 hours from creation
UPDATE sessions
SET expires_at = created_at + INTERVAL '24 hours'
WHERE expires_at IS NULL;

-- Make expires_at NOT NULL
ALTER TABLE sessions
ALTER COLUMN expires_at SET NOT NULL;

-- Create index for efficient expiration queries
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Create function to auto-set expiration on insert
CREATE OR REPLACE FUNCTION set_session_expiration()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at := NOW() + INTERVAL '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-set expiration
CREATE TRIGGER trigger_set_session_expiration
  BEFORE INSERT ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION set_session_expiration();

-- Optional: Create function to clean up expired sessions (can be called manually or via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM sessions
  WHERE expires_at < NOW()
  AND status = 'results';  -- Only delete completed sessions

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Deletes expired sessions that are in results state. Returns count of deleted sessions.';
