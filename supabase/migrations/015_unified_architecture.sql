-- Unified Architecture Migration
-- Migration 015: Create Projects and Workshops tables, unify all sessions into sessions_unified
-- This migration establishes the hierarchy: Projects → Workshops → Sessions

-- ============================================================================
-- STEP 1: Create Projects Table
-- ============================================================================
-- Projects: Top-level containers (e.g., "Flipkart Mobile App", "Payment Gateway Redesign")
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  created_by TEXT, -- Facilitator/creator identifier from localStorage
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: Create Workshops Table
-- ============================================================================
-- Workshops: Can be standalone or part of a project (e.g., "Q4 Product Planning Workshop")
CREATE TABLE workshops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL, -- NULL = standalone workshop
  title TEXT NOT NULL,
  description TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: Rename tool_sessions to sessions_unified
-- ============================================================================
-- This becomes THE single sessions table for all tools
ALTER TABLE tool_sessions RENAME TO sessions_unified;

-- ============================================================================
-- STEP 4: Add new columns to sessions_unified
-- ============================================================================
-- Add workshop relationship
ALTER TABLE sessions_unified
  ADD COLUMN workshop_id UUID REFERENCES workshops(id) ON DELETE SET NULL;

-- Add tool_type to distinguish different tool types
ALTER TABLE sessions_unified
  ADD COLUMN tool_type TEXT NOT NULL DEFAULT 'problem-framing'
    CHECK (tool_type IN ('problem-framing', 'voting-board', 'rice', 'moscow'));

-- Add session_config for tool-specific configuration
ALTER TABLE sessions_unified
  ADD COLUMN session_config JSONB DEFAULT '{}';

-- Rename tool_slug to legacy_tool_slug for backwards compatibility
-- First make it nullable, then rename
ALTER TABLE sessions_unified
  ALTER COLUMN tool_slug DROP NOT NULL;

ALTER TABLE sessions_unified
  RENAME COLUMN tool_slug TO legacy_tool_slug;

-- ============================================================================
-- STEP 5: Update existing sessions_unified data
-- ============================================================================
-- Set tool_type based on legacy_tool_slug
UPDATE sessions_unified
SET tool_type = legacy_tool_slug
WHERE legacy_tool_slug = 'problem-framing';

-- ============================================================================
-- STEP 6: Migrate voting board sessions from old 'sessions' table
-- ============================================================================
-- Insert voting board sessions into sessions_unified
INSERT INTO sessions_unified (
  id,
  title,
  description,
  tool_type,
  created_by,
  status,
  created_at,
  updated_at,
  session_config
)
SELECT
  id,
  project_name as title,
  session_goal as description,
  'voting-board' as tool_type,
  host_name as created_by,
  status,
  created_at,
  updated_at,
  jsonb_build_object(
    'scoring_mode', scoring_mode,
    'workshop_mode', workshop_mode,
    'workshop_phase', workshop_phase,
    'discussion_time_minutes', discussion_time_minutes,
    'voting_time_minutes', voting_time_minutes,
    'duration_hours', duration_hours,
    'expires_at', expires_at,
    'host_token', host_token,
    'phase_started_at', phase_started_at
  ) as session_config
FROM sessions;

-- ============================================================================
-- STEP 7: Update foreign keys in related tables
-- ============================================================================

-- Features table: Update constraint to reference sessions_unified
ALTER TABLE features
  DROP CONSTRAINT IF EXISTS features_session_id_fkey;

ALTER TABLE features
  ADD CONSTRAINT features_session_id_fkey
    FOREIGN KEY (session_id) REFERENCES sessions_unified(id) ON DELETE CASCADE;

-- Players table: Update constraint to reference sessions_unified
ALTER TABLE players
  DROP CONSTRAINT IF EXISTS players_session_id_fkey;

ALTER TABLE players
  ADD CONSTRAINT players_session_id_fkey
    FOREIGN KEY (session_id) REFERENCES sessions_unified(id) ON DELETE CASCADE;

-- Votes table: Update constraint to reference sessions_unified
ALTER TABLE votes
  DROP CONSTRAINT IF EXISTS votes_session_id_fkey;

ALTER TABLE votes
  ADD CONSTRAINT votes_session_id_fkey
    FOREIGN KEY (session_id) REFERENCES sessions_unified(id) ON DELETE CASCADE;

-- Problem Framing tables: Rename column and update constraint
ALTER TABLE pf_individual_statements
  RENAME COLUMN tool_session_id TO session_id;

ALTER TABLE pf_individual_statements
  DROP CONSTRAINT IF EXISTS pf_individual_statements_tool_session_id_fkey;

ALTER TABLE pf_individual_statements
  ADD CONSTRAINT pf_individual_statements_session_id_fkey
    FOREIGN KEY (session_id) REFERENCES sessions_unified(id) ON DELETE CASCADE;

-- pf_session_participants: Rename column and update constraint
ALTER TABLE pf_session_participants
  RENAME COLUMN tool_session_id TO session_id;

ALTER TABLE pf_session_participants
  DROP CONSTRAINT IF EXISTS pf_session_participants_tool_session_id_fkey;

ALTER TABLE pf_session_participants
  ADD CONSTRAINT pf_session_participants_session_id_fkey
    FOREIGN KEY (session_id) REFERENCES sessions_unified(id) ON DELETE CASCADE;

-- pf_final_statement: Rename column and update constraint
ALTER TABLE pf_final_statement
  RENAME COLUMN tool_session_id TO session_id;

ALTER TABLE pf_final_statement
  DROP CONSTRAINT IF EXISTS pf_final_statement_tool_session_id_fkey;

ALTER TABLE pf_final_statement
  ADD CONSTRAINT pf_final_statement_session_id_fkey
    FOREIGN KEY (session_id) REFERENCES sessions_unified(id) ON DELETE CASCADE;

-- pf_attachments: Rename column and update constraint
ALTER TABLE pf_attachments
  RENAME COLUMN tool_session_id TO session_id;

ALTER TABLE pf_attachments
  DROP CONSTRAINT IF EXISTS pf_attachments_tool_session_id_fkey;

ALTER TABLE pf_attachments
  ADD CONSTRAINT pf_attachments_session_id_fkey
    FOREIGN KEY (session_id) REFERENCES sessions_unified(id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 8: Update indexes for problem framing tables
-- ============================================================================
-- Drop old indexes
DROP INDEX IF EXISTS idx_pf_statements_session;
DROP INDEX IF EXISTS idx_pf_participants_session;
DROP INDEX IF EXISTS idx_pf_final_statement_session;

-- Create new indexes with updated column name
CREATE INDEX idx_pf_statements_session ON pf_individual_statements(session_id);
CREATE INDEX idx_pf_participants_session ON pf_session_participants(session_id);
CREATE INDEX idx_pf_final_statement_session ON pf_final_statement(session_id);

-- ============================================================================
-- STEP 9: Drop old sessions table and blank_sessions tables
-- ============================================================================
-- Note: CASCADE will drop dependent objects like views, but we've already migrated foreign keys
DROP TABLE IF EXISTS sessions CASCADE;

-- Drop all blank_sessions related tables (localStorage-based system - unused)
DROP TABLE IF EXISTS session_summary CASCADE;
DROP TABLE IF EXISTS item_moscow CASCADE;
DROP TABLE IF EXISTS item_rice CASCADE;
DROP TABLE IF EXISTS item_votes CASCADE;
DROP TABLE IF EXISTS session_participants CASCADE;
DROP TABLE IF EXISTS item_framing CASCADE;
DROP TABLE IF EXISTS session_items CASCADE;
DROP TABLE IF EXISTS blank_sessions CASCADE;

-- ============================================================================
-- STEP 10: Create indexes for new tables and columns
-- ============================================================================
-- Projects indexes
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Workshops indexes
CREATE INDEX idx_workshops_project_id ON workshops(project_id);
CREATE INDEX idx_workshops_created_by ON workshops(created_by);
CREATE INDEX idx_workshops_created_at ON workshops(created_at DESC);

-- Sessions_unified indexes
CREATE INDEX idx_sessions_workshop_id ON sessions_unified(workshop_id);
CREATE INDEX idx_sessions_tool_type ON sessions_unified(tool_type);
CREATE INDEX idx_sessions_created_by ON sessions_unified(created_by);
CREATE INDEX idx_sessions_created_at ON sessions_unified(created_at DESC);
CREATE INDEX idx_sessions_status ON sessions_unified(status);

-- Composite indexes for common queries
CREATE INDEX idx_sessions_workshop_tool ON sessions_unified(workshop_id, tool_type);
CREATE INDEX idx_workshops_project_created ON workshops(project_id, created_at DESC);

-- ============================================================================
-- STEP 11: Enable Row Level Security
-- ============================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
-- sessions_unified already has RLS enabled from tool_sessions

-- ============================================================================
-- STEP 12: Create RLS Policies (Public access for MVP)
-- ============================================================================
-- Projects policies
CREATE POLICY "Enable all access" ON projects FOR ALL USING (true);

-- Workshops policies
CREATE POLICY "Enable all access" ON workshops FOR ALL USING (true);

-- ============================================================================
-- STEP 13: Add helpful comments for documentation
-- ============================================================================
COMMENT ON TABLE projects IS 'Top-level project containers (e.g., "Flipkart Mobile App", "Payment Gateway Redesign")';
COMMENT ON TABLE workshops IS 'Workshops can be standalone or part of a project (e.g., "Q4 Product Planning Workshop")';
COMMENT ON TABLE sessions_unified IS 'Unified sessions table for all tool types - individual tool usage sessions';

COMMENT ON COLUMN workshops.project_id IS 'Parent project - NULL for standalone workshops';
COMMENT ON COLUMN sessions_unified.workshop_id IS 'Parent workshop - NULL for standalone sessions';
COMMENT ON COLUMN sessions_unified.tool_type IS 'Type of facilitation tool: problem-framing, voting-board, rice, moscow';
COMMENT ON COLUMN sessions_unified.session_config IS 'Tool-specific configuration stored as JSONB';
COMMENT ON COLUMN sessions_unified.legacy_tool_slug IS 'Original tool_slug column - kept for backwards compatibility';

-- Update comments for renamed columns in problem framing tables
COMMENT ON COLUMN pf_individual_statements.session_id IS 'References sessions_unified table (formerly tool_session_id)';
COMMENT ON COLUMN pf_session_participants.session_id IS 'References sessions_unified table (formerly tool_session_id)';
COMMENT ON COLUMN pf_final_statement.session_id IS 'References sessions_unified table (formerly tool_session_id)';
COMMENT ON COLUMN pf_attachments.session_id IS 'References sessions_unified table (formerly tool_session_id)';

-- ============================================================================
-- STEP 14: Create helpful views (optional - for backward compatibility)
-- ============================================================================

-- View for voting board sessions only
CREATE VIEW voting_sessions AS
SELECT
  id,
  title,
  description,
  created_by as host_name,
  status,
  session_config->>'host_token' as host_token,
  session_config->>'scoring_mode' as scoring_mode,
  session_config->>'workshop_mode' as workshop_mode,
  session_config->>'workshop_phase' as workshop_phase,
  (session_config->>'duration_hours')::integer as duration_hours,
  (session_config->>'expires_at')::timestamptz as expires_at,
  created_at,
  updated_at
FROM sessions_unified
WHERE tool_type = 'voting-board';

-- View for problem framing sessions only
CREATE VIEW problem_framing_sessions AS
SELECT
  id,
  title,
  description,
  created_by,
  status,
  workshop_id,
  created_at,
  updated_at,
  completed_at
FROM sessions_unified
WHERE tool_type = 'problem-framing';

-- ============================================================================
-- Migration Complete!
-- ============================================================================
-- Summary:
-- - Created: projects, workshops tables
-- - Renamed: tool_sessions → sessions_unified
-- - Migrated: All voting sessions from old sessions table
-- - Updated: All foreign keys to reference sessions_unified
-- - Deleted: sessions, blank_sessions, and all blank_session related tables
-- - Added: Indexes, RLS policies, comments, and backward-compatible views
