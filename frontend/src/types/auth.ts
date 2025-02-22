export interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    user_metadata: {
      username?: string;
    };
  };
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface AuthError {
  message: string;
  status?: number;
}
