-- Voting Board Refactor Migration
-- Refactors Dot Voting (5 discrete votes) to Voting Board (100-point allocation)

-- Add new columns to blank_sessions for voting control
ALTER TABLE blank_sessions 
  ADD COLUMN voting_ended BOOLEAN DEFAULT false,
  ADD COLUMN voting_ended_at TIMESTAMPTZ;

-- Add submitted flag to session_participants to track submission status
ALTER TABLE session_participants
  ADD COLUMN submitted BOOLEAN DEFAULT false,
  ADD COLUMN submitted_at TIMESTAMPTZ;

-- Rename vote_count to points_allocated in item_votes
ALTER TABLE item_votes 
  RENAME COLUMN vote_count TO points_allocated;

-- Update constraint to allow 0-100 range for points
ALTER TABLE item_votes 
  DROP CONSTRAINT IF EXISTS item_votes_vote_count_check;

ALTER TABLE item_votes 
  ADD CONSTRAINT item_votes_points_allocated_check 
  CHECK (points_allocated >= 0 AND points_allocated <= 100);

-- Add comment to clarify the new voting mechanism
COMMENT ON COLUMN item_votes.points_allocated IS 'Points allocated to this item (0-100). Each participant has 100 points total to distribute.';
COMMENT ON COLUMN session_participants.submitted IS 'Whether participant has submitted their 100-point allocation';
COMMENT ON COLUMN blank_sessions.voting_ended IS 'Whether facilitator has ended the voting round';
