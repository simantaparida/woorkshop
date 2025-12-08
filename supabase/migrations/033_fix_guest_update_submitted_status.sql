-- =====================================================
-- Migration 033: Fix Guest User Update for has_submitted
-- =====================================================
-- Purpose: Allow guest users to update their has_submitted status
--          while maintaining strict security controls
-- Date: 2025-12-08
-- =====================================================

-- Drop existing UPDATE policy that blocks guests
DROP POLICY IF EXISTS "pf_participants_update_policy" ON pf_session_participants;

-- Create restricted UPDATE policy (only for facilitators/owners)
CREATE POLICY "pf_participants_update_policy"
  ON pf_session_participants FOR UPDATE
  USING (
    is_facilitator = true
    OR session_id IN (
      SELECT id FROM sessions_unified
      WHERE created_by = auth.uid()::text
    )
  );

-- Create SECURITY DEFINER function for guest submission updates
CREATE OR REPLACE FUNCTION update_participant_submission_status(
  p_session_id UUID,
  p_participant_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows_updated INTEGER;
  v_participant_record RECORD;
BEGIN
  -- Validate inputs
  IF p_session_id IS NULL OR p_participant_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Missing required parameters'
    );
  END IF;

  -- Check if participant exists in session
  SELECT id, has_submitted
  INTO v_participant_record
  FROM pf_session_participants
  WHERE session_id = p_session_id
    AND participant_id = p_participant_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Participant not found in session'
    );
  END IF;

  -- Check if already submitted (idempotency)
  IF v_participant_record.has_submitted = true THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_submitted', true
    );
  END IF;

  -- Update ONLY has_submitted flag
  UPDATE pf_session_participants
  SET has_submitted = true
  WHERE session_id = p_session_id
    AND participant_id = p_participant_id
    AND has_submitted = false;

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'rows_updated', v_rows_updated
  );
END;
$$;

-- Add comment
COMMENT ON FUNCTION update_participant_submission_status(UUID, UUID) IS
  'Securely updates has_submitted flag for participants. Bypasses RLS for guest access.';

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_participant_submission_status(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION update_participant_submission_status(UUID, UUID) TO authenticated;
