/*
  # Create function to delete user data

  This migration adds a stored procedure that handles the deletion of all user data
  in a transactional way. This ensures that either all data is deleted or none of it is.

  1. Function Details
    - Name: delete_user_data
    - Parameters: user_id_input (uuid)
    - Returns: void
    - Security: Can only be executed by authenticated users on their own data

  2. Operations
    - Deletes all playlist_tracks entries for user's playlists
    - Deletes all playlists owned by the user
    - Deletes all tracks owned by the user

  3. Security
    - Function can only be executed by authenticated users
    - Users can only delete their own data
*/

CREATE OR REPLACE FUNCTION delete_user_data(user_id_input uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the user is deleting their own data
  IF auth.uid() <> user_id_input THEN
    RAISE EXCEPTION 'Not authorized to delete other users data';
  END IF;

  -- Delete playlist_tracks entries for user's playlists
  DELETE FROM playlist_tracks
  WHERE playlist_id IN (
    SELECT id FROM playlists WHERE user_id = user_id_input
  );

  -- Delete user's playlists
  DELETE FROM playlists
  WHERE user_id = user_id_input;

  -- Delete user's tracks
  DELETE FROM tracks
  WHERE user_id = user_id_input;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_data TO authenticated;