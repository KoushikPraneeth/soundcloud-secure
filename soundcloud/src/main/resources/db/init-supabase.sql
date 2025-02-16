-- Supabase specific initialization
-- Run this file directly in Supabase SQL editor

-- Create partial index for public playlists
CREATE INDEX idx_playlists_public ON playlists(is_public) WHERE is_public = true;

-- Enable Row Level Security
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Tracks policies
CREATE POLICY "Users can view their own tracks"
    ON tracks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracks"
    ON tracks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracks"
    ON tracks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracks"
    ON tracks FOR DELETE
    USING (auth.uid() = user_id);

-- Playlists policies
CREATE POLICY "Users can view their own playlists or public playlists"
    ON playlists FOR SELECT
    USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own playlists"
    ON playlists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
    ON playlists FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
    ON playlists FOR DELETE
    USING (auth.uid() = user_id);

-- Playlist tracks policies
CREATE POLICY "Users can view tracks in their playlists or public playlists"
    ON playlist_tracks FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM playlists p
        WHERE p.id = playlist_id
        AND (p.user_id = auth.uid() OR p.is_public = true)
    ));

CREATE POLICY "Users can add tracks to their playlists"
    ON playlist_tracks FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM playlists p
        WHERE p.id = playlist_id
        AND p.user_id = auth.uid()
    ));

CREATE POLICY "Users can remove tracks from their playlists"
    ON playlist_tracks FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM playlists p
        WHERE p.id = playlist_id
        AND p.user_id = auth.uid()
    ));

-- User preferences policies
CREATE POLICY "Users can view their own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
