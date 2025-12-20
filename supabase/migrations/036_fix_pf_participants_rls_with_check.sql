-- Migration 036: Fix pf_session_participants RLS Policy WITH CHECK Clause
-- Purpose: Ensure INSERT policy has proper WITH CHECK clause for anonymous users
-- Date: 2025-12-20
-- Priority: CRITICAL - Fixes RLS error 42501 blocking anonymous participant creation
--
-- Problem: Some Supabase instances may have INSERT policies without WITH CHECK clauses
--          causing error: "new row violates row-level security policy" (error code 42501)
-- Solution: Recreate the INSERT policy with explicit WITH CHECK (true)
--
-- Error Context:
-- errorCode: 42501
-- table: pf_session_participants
-- operation: INSERT
-- message: "RLS policies need both USING (true) and WITH CHECK (true) for write operations"

-- =====================================================
-- Fix pf_session_participants INSERT Policy
-- =====================================================

-- Drop existing policy
DROP POLICY IF EXISTS "pf_participants_insert_policy" ON pf_session_participants;

-- Recreate with explicit WITH CHECK clause
-- This allows anonymous/guest users to join sessions without authentication
CREATE POLICY "pf_participants_insert_policy"
  ON pf_session_participants FOR INSERT
  WITH CHECK (true);

-- Add helpful comment
COMMENT ON POLICY "pf_participants_insert_policy" ON pf_session_participants IS
  'Allows anyone (including guests) to join as participant - WITH CHECK (true) permits anonymous inserts';

-- =====================================================
-- Verify Other Problem Framing Tables Have Correct Policies
-- =====================================================

-- pf_individual_statements
DROP POLICY IF EXISTS "pf_statements_insert_policy" ON pf_individual_statements;
CREATE POLICY "pf_statements_insert_policy"
  ON pf_individual_statements FOR INSERT
  WITH CHECK (true);

-- pf_statement_pins
DROP POLICY IF EXISTS "pf_pins_insert_policy" ON pf_statement_pins;
CREATE POLICY "pf_pins_insert_policy"
  ON pf_statement_pins FOR INSERT
  WITH CHECK (true);

-- pf_final_statement
DROP POLICY IF EXISTS "pf_final_insert_policy" ON pf_final_statement;
CREATE POLICY "pf_final_insert_policy"
  ON pf_final_statement FOR INSERT
  WITH CHECK (true);

-- pf_attachments
DROP POLICY IF EXISTS "pf_attachments_insert_policy" ON pf_attachments;
CREATE POLICY "pf_attachments_insert_policy"
  ON pf_attachments FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- Verify Voting Board Tables Have Correct Policies
-- =====================================================

-- features
DROP POLICY IF EXISTS "features_insert_policy" ON features;
CREATE POLICY "features_insert_policy"
  ON features FOR INSERT
  WITH CHECK (true);

-- players
DROP POLICY IF EXISTS "players_insert_policy" ON players;
CREATE POLICY "players_insert_policy"
  ON players FOR INSERT
  WITH CHECK (true);

-- votes
DROP POLICY IF EXISTS "votes_insert_policy" ON votes;
CREATE POLICY "votes_insert_policy"
  ON votes FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- Migration Complete
-- =====================================================
