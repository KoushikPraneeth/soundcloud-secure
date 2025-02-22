import { Dropbox } from 'dropbox';
import { useAuthStore } from '../store/authStore';
import { DropboxError } from '../types';
import type { DropboxAuthResponse, Track } from '../types';

const DROPBOX_APP_KEY = 'ciwpr6vuiv711pn';
const REDIRECT_URI = window.location.origin + '/auth/dropbox/callback';
const APP_FOLDER_PATH = '/Apps/SoundVaultPro';

export const getAuthUrl = async (): Promise<string> => {
  return `https://www.dropbox.com/oauth2/authorize?client_id=${DROPBOX_APP_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
};

export const handleAuthCallback = async (code: string): Promise<void> => {
  try {
    const params = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
    });

    const authString = btoa(`${DROPBOX_APP_KEY}:${'c9fgt2vpdyi3sz0'}`);

    const response = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Token exchange failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      const errorCode = errorData.error || 'unknown_error';
      const errorDesc = errorData.error_description || response.statusText;
      throw new DropboxError(
        `Failed to exchange authorization code: ${errorDesc}`,
        errorCode,
        errorDesc
      );
    }

    const data: DropboxAuthResponse = await response.json();
    const expiresAt = Date.now() + data.expires_in * 1000;

    useAuthStore.getState().setAuth({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
      isAuthenticated: true,
      error: null,
    });
  } catch (error) {
    console.error('Auth callback error:', error);
    useAuthStore.getState().setAuth({
      error: error instanceof Error ? error.message : 'Authentication failed',
    });
  }
};

export const refreshAccessToken = async (): Promise<void> => {
  const { refreshToken } = useAuthStore.getState();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const authString = btoa(`${DROPBOX_APP_KEY}:${'c9fgt2vpdyi3sz0'}`);

    const response = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Token refresh failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new DropboxError(
        'Failed to refresh token',
        errorData.error || 'unknown_error',
        errorData.error_description || response.statusText
      );
    }

    const data: DropboxAuthResponse = await response.json();
    const expiresAt = Date.now() + data.expires_in * 1000;

    useAuthStore.getState().setAuth({
      accessToken: data.access_token,
      expiresAt,
      error: null,
    });
  } catch (error) {
    useAuthStore.getState().setAuth({
      error: error instanceof Error ? error.message : 'Token refresh failed',
    });
  }
};

export const createDropboxClient = (): Dropbox | null => {
  const { accessToken, expiresAt } = useAuthStore.getState();

  if (!accessToken || !expiresAt) {
    console.log('Cannot create Dropbox client: Missing access token or expiry time');
    return null;
  }

  const timeUntilExpiry = expiresAt - Date.now();
  console.log('Access token expires in:', Math.round(timeUntilExpiry / 1000), 'seconds');

  if (timeUntilExpiry < 300000) {
    console.log('Access token expiring soon. Attempting refresh...');
    refreshAccessToken();
  }

  console.log('Creating Dropbox client with valid access token');
  return new Dropbox({ accessToken });
};

export const fetchFiles = async (client: Dropbox): Promise<Track[]> => {
  try {
    console.log('Fetching files from Dropbox root directory...');

    const response = await client.filesListFolder({
      path: '', // Fetch from the root directory
      include_media_info: true,
    });

    console.log('Files found:', response.result.entries.length);
    console.log('All files:', response.result.entries.map(entry => ({
      tag: entry['.tag'],
      path: entry.path_display,
      name: entry.name
    })));

    const tracks: Track[] = [];
    const failures: Array<{ name: string; error: string }> = [];

    for (const entry of response.result.entries) {
      if (entry['.tag'] !== 'file') {
        console.log('Skipping non-file entry:', entry['.tag'], entry.path_display);
        continue;
      }

      const path = entry.path_display;
      const name = entry.name;
      
      if (!path || !name) {
        console.log('Skipping entry with missing path or name:', { path, name });
        continue;
      }

      const isMusicFile = /\.(mp3|m4a|wav|ogg|flac)$/i.test(path);
      
      if (!isMusicFile) {
        console.log('Skipping non-music file:', path);
        continue;
      }

      console.log('Processing music file:', { name, path });
      
      try {
        console.log('Getting temporary link for:', path);
        const linkResponse = await client.filesGetTemporaryLink({
          path
        });
        console.log('Got temporary link');

        tracks.push({
          id: path,
          name,
          path,
          temporaryLink: linkResponse.result.link,
          encryptedKey: '',
          iv: ''
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to get temporary link for ${entry.name}:`, error);
        failures.push({ name: entry.name, error: errorMessage });
      }
    }

    console.log('Found music tracks:', tracks.length);
    if (failures.length > 0) {
      console.error('Failed to process some files:', failures);
      if (tracks.length === 0 && failures.length > 0) {
        throw new Error(`Failed to process any files. Errors: ${failures.map(f => `${f.name} (${f.error})`).join(', ')}`);
      }
    }
    return tracks;
  } catch (error) {
    console.error('Error fetching files:', error);
    if (error instanceof Error) {
      if (error.message.includes('path/not_found')) {
        throw new DropboxError(
          'Could not find the specified path in your Dropbox',
          'path/not_found'
        );
      } else if (error.message.includes('invalid_access_token')) {
        throw new DropboxError(
          'Your Dropbox session has expired',
          'invalid_access_token'
        );
      }
    }
    throw error;
  }
};

export const revokeAccess = async (): Promise<void> => {
  const { accessToken } = useAuthStore.getState();

  if (!accessToken) {
    return;
  }

  try {
    const response = await fetch('https://api.dropboxapi.com/2/auth/token/revoke', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Token revocation failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      let errorCode = 'unknown_error';
      if (typeof errorData.error === 'object' && errorData.error !== null && '.tag' in errorData.error) {
        errorCode = errorData.error['.tag'];
      } else if (typeof errorData.error === 'string') {
        errorCode = errorData.error;
      }

      switch (errorCode) {
        case 'invalid_access_token':
          throw new DropboxError('Token already expired or invalid', 'invalid_access_token');
        case 'expired_access_token':
          throw new DropboxError('Token has already expired', 'expired_access_token');
        default:
          throw new DropboxError(
            'Failed to revoke access',
            errorCode,
            errorData.error_description || response.statusText
          );
      }
    }

    useAuthStore.getState().clearAuth();
    console.log('Successfully revoked Dropbox access');
  } catch (error) {
    console.error('Error revoking access:', error);
    useAuthStore.getState().setAuth({
      error: error instanceof Error ? error.message : 'Failed to revoke access',
    });
    useAuthStore.getState().clearAuth();
  }
};
