-- Fix missing RLS policy on sessions_unified table
-- Migration 016: Add explicit RLS policy for sessions_unified
--
-- Context: When tool_sessions was renamed to sessions_unified in migration 015,
-- the RLS policy "Enable all access" may not have transferred correctly.
-- This migration ensures the policy exists.

-- Drop existing policy if it exists (idempotent)
DROP POLICY IF EXISTS "Enable all access" ON sessions_unified;

-- Create the RLS policy to allow all operations
CREATE POLICY "Enable all access" ON sessions_unified FOR ALL USING (true);

-- Add documentation comment
COMMENT ON POLICY "Enable all access" ON sessions_unified IS 'Allow all operations on sessions_unified for MVP (authenticated and anonymous users)';
