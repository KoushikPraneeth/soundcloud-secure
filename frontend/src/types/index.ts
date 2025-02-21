export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  cloudProvider: 'google' | 'dropbox';
  cloudPath: string;
  encryptionKey?: string;
}

export interface Playlist {
  id: string;
  name: string;
  user_id: string;
  tracks: Track[];
  created_at: string;
  updated_at: string;
}