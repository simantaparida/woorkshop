-- Add scoring_mode field to sessions table
ALTER TABLE sessions ADD COLUMN scoring_mode TEXT DEFAULT '100_points';

-- Add constraint to validate scoring mode values
ALTER TABLE sessions ADD CONSTRAINT sessions_scoring_mode_check
  CHECK (scoring_mode IN (
    '100_points',
    'rice',
    'moscow',
    'wsjf',
    'effort_impact'
  ));

-- Add comment for documentation
COMMENT ON COLUMN sessions.scoring_mode IS 'Scoring/prioritization methodology used for this session';

-- Add RICE-specific fields to features table for RICE scoring mode
ALTER TABLE features ADD COLUMN reach INTEGER;
ALTER TABLE features ADD COLUMN confidence INTEGER;

-- Add MoSCoW priority field
ALTER TABLE features ADD COLUMN moscow_priority TEXT;
ALTER TABLE features ADD CONSTRAINT features_moscow_priority_check
  CHECK (moscow_priority IS NULL OR moscow_priority IN ('must_have', 'should_have', 'could_have', 'wont_have'));

-- Add WSJF-specific fields
ALTER TABLE features ADD COLUMN user_business_value INTEGER;
ALTER TABLE features ADD COLUMN time_criticality INTEGER;
ALTER TABLE features ADD COLUMN risk_reduction INTEGER;
ALTER TABLE features ADD COLUMN job_size INTEGER;

-- Add comments for new fields
COMMENT ON COLUMN features.reach IS 'RICE: Number of users/customers affected per time period';
COMMENT ON COLUMN features.confidence IS 'RICE: Confidence level (percentage: 10-100)';
COMMENT ON COLUMN features.moscow_priority IS 'MoSCoW: Priority category (Must/Should/Could/Won''t have)';
COMMENT ON COLUMN features.user_business_value IS 'WSJF: User/Business value score';
COMMENT ON COLUMN features.time_criticality IS 'WSJF: Time criticality score';
COMMENT ON COLUMN features.risk_reduction IS 'WSJF: Risk reduction/opportunity enablement score';
COMMENT ON COLUMN features.job_size IS 'WSJF: Job size (effort) estimate';
