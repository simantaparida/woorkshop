-- Add description column to features table
ALTER TABLE features
ADD COLUMN description TEXT;

-- Add check constraint to limit description length to 500 characters
ALTER TABLE features
ADD CONSTRAINT features_description_length CHECK (char_length(description) <= 500);

COMMENT ON COLUMN features.description IS 'Optional description of the feature (max 500 characters)';
