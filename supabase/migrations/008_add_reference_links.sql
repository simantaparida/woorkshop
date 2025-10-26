-- Add reference_links field to features table as JSONB
-- This will store an array of link objects with metadata
ALTER TABLE features ADD COLUMN reference_links JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN features.reference_links IS 'Array of reference links with metadata (PRD, Jira, Figma, etc.)';

-- Create index for faster queries on reference links
CREATE INDEX idx_features_reference_links ON features USING GIN (reference_links);

-- Example structure for reference_links:
-- [
--   {
--     "url": "https://jira.example.com/PROJ-123",
--     "title": "Feature Request: Dark Mode",
--     "favicon": "https://jira.example.com/favicon.ico",
--     "type": "jira"
--   },
--   {
--     "url": "https://figma.com/file/abc123",
--     "title": "Design Mockups",
--     "favicon": "https://figma.com/favicon.ico",
--     "type": "figma"
--   }
-- ]
