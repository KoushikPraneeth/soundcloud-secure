-- Drop existing tables if they exist
DROP TABLE IF EXISTS playlist_tracks;
DROP TABLE IF EXISTS playlists;
DROP TABLE IF EXISTS tracks;
DROP TABLE IF EXISTS user_preferences;

-- Create tracks table
CREATE TABLE tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    album VARCHAR(255),
    genre VARCHAR(100),
    year INTEGER,
    duration BIGINT,
    file_id VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    storage_url TEXT,
    format VARCHAR(50),
    bitrate BIGINT,
    encryption_key TEXT,
    iv TEXT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- Create playlists table
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    is_public BOOLEAN DEFAULT false,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- Create playlist_tracks junction table
CREATE TABLE playlist_tracks (
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    position INTEGER,
    created_at BIGINT NOT NULL,
    PRIMARY KEY (playlist_id, track_id)
);

-- Create user_preferences table
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    default_privacy BOOLEAN DEFAULT false,
    enable_encryption BOOLEAN DEFAULT true,
    cloud_storage_provider VARCHAR(50),
    cloud_storage_folder_id TEXT,
    cloud_storage_access_token TEXT,
    cloud_storage_refresh_token TEXT,
    theme VARCHAR(20) DEFAULT 'light',
    quality_preference VARCHAR(20) DEFAULT 'high',
    auto_sync_enabled BOOLEAN DEFAULT true,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- Create indexes
CREATE INDEX idx_tracks_user_id ON tracks(user_id);
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX idx_playlist_tracks_track_id ON playlist_tracks(track_id);
