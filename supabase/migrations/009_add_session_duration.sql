-- Add session duration and expiration fields
ALTER TABLE sessions
ADD COLUMN duration_hours INTEGER,
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

-- Add index for efficient querying of expired sessions
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at) WHERE expires_at IS NOT NULL;

-- Add check constraint to ensure duration is positive
ALTER TABLE sessions
ADD CONSTRAINT sessions_duration_hours_check
CHECK (duration_hours IS NULL OR duration_hours > 0);
