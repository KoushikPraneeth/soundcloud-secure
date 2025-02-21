/*
  # Initial Schema Setup for Music App

  1. New Tables
    - `playlists`
      - `id` (uuid, primary key)
      - `name` (text)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `tracks`
      - `id` (uuid, primary key)
      - `title` (text)
      - `artist` (text)
      - `duration` (integer)
      - `cloud_provider` (text)
      - `cloud_path` (text)
      - `encryption_key` (text)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)

    - `playlist_tracks`
      - `playlist_id` (uuid, references playlists)
      - `track_id` (uuid, references tracks)
      - `position` (integer)
      - Primary key is (playlist_id, track_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tracks table
CREATE TABLE IF NOT EXISTS tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text DEFAULT '',
  duration integer DEFAULT 0,
  cloud_provider text NOT NULL,
  cloud_path text NOT NULL,
  encryption_key text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create playlist_tracks table
CREATE TABLE IF NOT EXISTS playlist_tracks (
  playlist_id uuid REFERENCES playlists(id) ON DELETE CASCADE,
  track_id uuid REFERENCES tracks(id) ON DELETE CASCADE,
  position integer NOT NULL,
  PRIMARY KEY (playlist_id, track_id)
);

-- Enable RLS
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;

-- Policies for playlists
CREATE POLICY "Users can create their own playlists"
  ON playlists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own playlists"
  ON playlists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
  ON playlists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
  ON playlists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for tracks
CREATE POLICY "Users can create their own tracks"
  ON tracks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tracks"
  ON tracks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracks"
  ON tracks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracks"
  ON tracks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for playlist_tracks
CREATE POLICY "Users can manage playlist tracks through playlist ownership"
  ON playlist_tracks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_tracks.playlist_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_tracks.playlist_id
      AND user_id = auth.uid()
    )
  );

-- Create function to update playlist updated_at
CREATE OR REPLACE FUNCTION update_playlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for playlist updated_at
CREATE TRIGGER update_playlist_timestamp
  BEFORE UPDATE ON playlists
  FOR EACH ROW
  EXECUTE FUNCTION update_playlist_updated_at();