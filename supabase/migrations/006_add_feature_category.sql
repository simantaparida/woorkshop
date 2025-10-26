-- Add category field to features table
ALTER TABLE features ADD COLUMN category TEXT;

-- Add constraint to validate category values
ALTER TABLE features ADD CONSTRAINT features_category_check
  CHECK (category IS NULL OR category IN (
    'performance',
    'ux_design',
    'growth',
    'infrastructure',
    'analytics',
    'security',
    'monetization',
    'engagement'
  ));

-- Add comment for documentation
COMMENT ON COLUMN features.category IS 'Optional category/theme for grouping features (e.g., Performance, UX, Growth)';

-- Create index for faster filtering by category
CREATE INDEX idx_features_category ON features(category) WHERE category IS NOT NULL;
