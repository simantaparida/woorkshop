-- Add is_ready field to players table
ALTER TABLE players
ADD COLUMN is_ready BOOLEAN NOT NULL DEFAULT false;

-- Add index for efficient querying by ready status
CREATE INDEX idx_players_is_ready ON players(is_ready, session_id);

-- Add comment for documentation
COMMENT ON COLUMN players.is_ready IS 'Indicates whether the player has marked themselves as ready to start voting';
