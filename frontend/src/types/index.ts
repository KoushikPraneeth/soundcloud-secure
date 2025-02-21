export interface User {
  id: string;
  email: string;
  created_at: string;
  encryption_salt?: string; // Added for storing user's encryption salt
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  cloud_provider: 'dropbox';
  cloud_path: string;
  encryption_key: string;
  mime_type: string;
}

export interface Playlist {
  id: string;
  name: string;
  user_id: string;
  tracks: Track[];
  created_at: string;
  updated_at: string;
}