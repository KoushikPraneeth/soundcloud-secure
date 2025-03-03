import { api } from './api';

/**
 * Lyrics API service
 */
export const lyricsApi = {
  /**
   * Search for lyrics by track name and artist
   */
  async searchLyrics(trackName: string, artist: string): Promise<string | null> {
    try {
      const response = await api.get(`/lyrics/search?track=${encodeURIComponent(trackName)}&artist=${encodeURIComponent(artist)}`);
      
      if (response.status === 'success' && response.data && response.data.lyrics) {
        return response.data.lyrics;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      return null;
    }
  }
};
