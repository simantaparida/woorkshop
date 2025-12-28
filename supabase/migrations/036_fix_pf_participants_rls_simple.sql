-- Migration 036: Fix pf_session_participants RLS - Simplified
-- Run this in Supabase SQL Editor if the full migration fails

-- Fix the critical table first
DROP POLICY IF EXISTS "pf_participants_insert_policy" ON pf_session_participants;

CREATE POLICY "pf_participants_insert_policy"
  ON pf_session_participants FOR INSERT
  WITH CHECK (true);
