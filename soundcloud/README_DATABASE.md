# Database Setup Guide

This guide explains how to set up the database schema and security policies in Supabase.

## Prerequisites

1. A Supabase project with the following credentials:
   - Project URL (from Project Settings > API)
   - Project API Key (from Project Settings > API)
   - Database Connection String (from Project Settings > Database)

## Setup Steps

### 1. Create Tables

1. Run the `schema.sql` file located in `src/main/resources/db/schema.sql` in your Supabase SQL Editor.
   This will create all necessary tables and basic indexes.

### 2. Configure Supabase-specific Settings

1. Open the Supabase SQL Editor
2. Run the following commands to configure Row Level Security and create policies:

```sql
-- Enable Row Level Security
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create partial index for public playlists
CREATE INDEX idx_playlists_public ON playlists(is_public) WHERE is_public = true;

-- Create RLS Policies for tracks
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

-- Create RLS Policies for playlists
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

-- Create RLS Policies for playlist tracks
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

-- Create RLS Policies for user preferences
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
```

### 3. Configure Spring Boot Application

1. Update `application.yml` with your Supabase credentials:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://[your-project-id].supabase.co:5432/postgres
    username: postgres
    password: [your-database-password]
```
