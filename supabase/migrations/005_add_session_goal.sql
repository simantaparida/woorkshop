-- Add session_goal field to sessions table
ALTER TABLE sessions ADD COLUMN session_goal TEXT;

-- Add check constraint for valid goal values
ALTER TABLE sessions ADD CONSTRAINT sessions_goal_check
  CHECK (session_goal IS NULL OR session_goal IN (
    'revenue_impact',
    'user_growth',
    'tech_debt',
    'user_experience',
    'market_expansion',
    'operational_efficiency'
  ));

-- Add comment
COMMENT ON COLUMN sessions.session_goal IS 'Primary goal/focus area for this prioritization session';
