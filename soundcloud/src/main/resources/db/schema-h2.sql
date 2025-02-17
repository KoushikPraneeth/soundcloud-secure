-- Drop existing tables if they exist
DROP TABLE IF EXISTS playlist_tracks;
DROP TABLE IF EXISTS playlists;
DROP TABLE IF EXISTS tracks;
DROP TABLE IF EXISTS user_preferences;

-- Create tracks table
CREATE TABLE tracks (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    album VARCHAR(255),
    genre VARCHAR(100),
    release_year INTEGER,
    duration BIGINT,
    file_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    format VARCHAR(50),
    bitrate BIGINT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- Create playlists table
CREATE TABLE playlists (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description CLOB,
    user_id VARCHAR(36) NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- Create playlist_tracks junction table
CREATE TABLE playlist_tracks (
    playlist_id VARCHAR(36),
    track_id VARCHAR(36),
    position INTEGER,
    created_at BIGINT NOT NULL,
    PRIMARY KEY (playlist_id, track_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
);

-- Create user_preferences table
CREATE TABLE user_preferences (
    user_id VARCHAR(36) PRIMARY KEY,
    default_privacy BOOLEAN DEFAULT FALSE,
    google_drive_folder_id VARCHAR(255),
    google_drive_access_token VARCHAR(255),
    google_drive_refresh_token VARCHAR(255),
    theme VARCHAR(20) DEFAULT 'light',
    quality_preference VARCHAR(20) DEFAULT 'high',
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- Create indexes
CREATE INDEX idx_tracks_user_id ON tracks(user_id);
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX idx_playlist_tracks_track_id ON playlist_tracks(track_id);
