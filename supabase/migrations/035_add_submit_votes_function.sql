-- Migration: Add atomic vote submission function
-- This fixes the critical data loss issue in the vote API
-- by using a proper PostgreSQL transaction for delete + insert operations

-- Drop function if it exists (for idempotency)
DROP FUNCTION IF EXISTS submit_votes(UUID, UUID, JSONB);

-- Create function to atomically submit votes
-- This ensures votes are never lost due to failed insert after successful delete
CREATE OR REPLACE FUNCTION submit_votes(
  p_session_id UUID,
  p_player_id UUID,
  p_votes JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Run with elevated privileges to bypass RLS if needed
AS $$
DECLARE
  v_vote JSONB;
  v_feature_id UUID;
  v_points INT;
  v_note TEXT;
  v_inserted_count INT := 0;
  v_deleted_count INT := 0;
BEGIN
  -- Validate inputs
  IF p_session_id IS NULL THEN
    RAISE EXCEPTION 'session_id cannot be null';
  END IF;

  IF p_player_id IS NULL THEN
    RAISE EXCEPTION 'player_id cannot be null';
  END IF;

  IF p_votes IS NULL THEN
    RAISE EXCEPTION 'votes cannot be null';
  END IF;

  -- Start transaction (implicit in function, but explicit for clarity)
  -- All operations below are atomic

  -- Step 1: Delete existing votes for this player in this session
  DELETE FROM votes
  WHERE session_id = p_session_id
    AND player_id = p_player_id;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  -- Step 2: Insert new votes (only non-zero votes)
  FOR v_vote IN SELECT * FROM jsonb_array_elements(p_votes)
  LOOP
    v_feature_id := (v_vote->>'featureId')::UUID;
    v_points := (v_vote->>'points')::INT;
    v_note := v_vote->>'note';

    -- Validate points
    IF v_points < 0 OR v_points > 100 THEN
      RAISE EXCEPTION 'Invalid points value: %. Must be between 0 and 100', v_points;
    END IF;

    -- Only insert non-zero votes
    IF v_points > 0 THEN
      INSERT INTO votes (session_id, player_id, feature_id, points_allocated, note)
      VALUES (p_session_id, p_player_id, v_feature_id, v_points, v_note);

      v_inserted_count := v_inserted_count + 1;
    END IF;
  END LOOP;

  -- Return success with counts
  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', v_deleted_count,
    'inserted_count', v_inserted_count,
    'message', format('Deleted %s old votes, inserted %s new votes', v_deleted_count, v_inserted_count)
  );

EXCEPTION
  WHEN OTHERS THEN
    -- On any error, the entire transaction is rolled back automatically
    -- This prevents data loss - if insert fails, delete is also rolled back
    RAISE EXCEPTION 'Failed to submit votes: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION submit_votes(UUID, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_votes(UUID, UUID, JSONB) TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION submit_votes(UUID, UUID, JSONB) IS
'Atomically submit votes for a player in a session.
Deletes existing votes and inserts new ones in a single transaction.
Prevents data loss by ensuring both operations succeed or both fail.
Parameters:
  - p_session_id: Session UUID
  - p_player_id: Player UUID
  - p_votes: JSONB array of votes with structure: [{"featureId": "uuid", "points": int, "note": "text"}]
Returns:
  - JSONB object with success status and counts';
