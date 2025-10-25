-- UX Works Seed Data for Testing
-- This creates a sample session with features, players, and votes

-- Clear existing data
TRUNCATE sessions, features, players, votes CASCADE;

-- Create a test session
INSERT INTO sessions (id, host_name, host_token, project_name, status)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Alice Johnson', 'host_token_abc123', 'Mobile App Redesign', 'open');

-- Add features to the session
INSERT INTO features (session_id, title, effort, impact)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Dark mode support', 3, 8),
  ('550e8400-e29b-41d4-a716-446655440000', 'Push notifications', 5, 9),
  ('550e8400-e29b-41d4-a716-446655440000', 'Offline mode', 8, 7),
  ('550e8400-e29b-41d4-a716-446655440000', 'Social sharing', 4, 6),
  ('550e8400-e29b-41d4-a716-446655440000', 'Advanced filters', 6, 5),
  ('550e8400-e29b-41d4-a716-446655440000', 'Export to PDF', 2, 4),
  ('550e8400-e29b-41d4-a716-446655440000', 'Multi-language support', 7, 8);

-- Add test players
INSERT INTO players (id, session_id, name, is_host)
VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Alice Johnson', true),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Bob Smith', false),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Carol White', false);

-- Optional: Add sample votes (uncomment to test results screen)
-- INSERT INTO votes (session_id, player_id, feature_id, points_allocated)
-- SELECT
--   '550e8400-e29b-41d4-a716-446655440000',
--   '650e8400-e29b-41d4-a716-446655440001',
--   id,
--   (ARRAY[30, 25, 20, 15, 5, 3, 2])[row_number() OVER (ORDER BY created_at)]
-- FROM features WHERE session_id = '550e8400-e29b-41d4-a716-446655440000';

-- Test session URL: http://localhost:3000/session/550e8400-e29b-41d4-a716-446655440000
