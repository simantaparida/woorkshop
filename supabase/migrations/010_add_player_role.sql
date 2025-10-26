-- Add role field to players table
ALTER TABLE players
ADD COLUMN role TEXT;

-- Add check constraint to ensure valid roles
ALTER TABLE players
ADD CONSTRAINT players_role_check
CHECK (role IS NULL OR role IN (
  'product_manager',
  'designer',
  'engineer',
  'engineering_lead',
  'data_analyst',
  'marketing',
  'executive',
  'stakeholder',
  'other'
));

-- Add index for efficient querying by role
CREATE INDEX idx_players_role ON players(role) WHERE role IS NOT NULL;
