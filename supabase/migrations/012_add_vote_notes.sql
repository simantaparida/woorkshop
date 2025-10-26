-- Add notes/rationale field to votes table
ALTER TABLE votes
ADD COLUMN note TEXT;

-- Add comment for documentation
COMMENT ON COLUMN votes.note IS 'Optional note explaining the rationale behind the vote';

-- Create index for efficient querying of votes with notes
CREATE INDEX idx_votes_with_notes ON votes(session_id, feature_id) WHERE note IS NOT NULL;
