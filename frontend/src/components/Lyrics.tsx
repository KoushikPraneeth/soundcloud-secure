import React, { useState, useEffect } from 'react';
import { lyricsApi } from '../utils/lyricsApi';

interface LyricsProps {
  trackName: string;
  artist: string;
}

export const Lyrics: React.FC<LyricsProps> = ({ trackName, artist }) => {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLyrics = async () => {
      if (!trackName || !artist) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const lyricsText = await lyricsApi.searchLyrics(trackName, artist);
        setLyrics(lyricsText);
        if (!lyricsText) {
          setError('No lyrics found for this track.');
        }
      } catch (err) {
        console.error('Error fetching lyrics:', err);
        setError('Failed to load lyrics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
  }, [trackName, artist]);

  if (loading) {
    return (
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/6"></div>
            </div>
          </div>
        </div>
        <p className="text-center mt-4 text-gray-500 dark:text-gray-400">Loading lyrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-center text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!lyrics) {
    return null;
  }

  // Format lyrics with line breaks
  const formattedLyrics = lyrics.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Lyrics</h3>
      <div className="lyrics-container text-gray-700 dark:text-gray-300 whitespace-pre-line">
        {formattedLyrics}
      </div>
      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Lyrics powered by Musixmatch
      </p>
    </div>
  );
};
