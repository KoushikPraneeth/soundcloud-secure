import * as mmb from 'music-metadata-browser';

export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
}

export const extractMetadata = async (audioUrl: string): Promise<AudioMetadata> => {
  try {
    // Fetch the audio file
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch audio file');
    }

    const buffer = await response.arrayBuffer();
    const metadata = await mmb.parseBlob(new Blob([buffer]));

    return {
      title: metadata.common.title,
      artist: metadata.common.artist,
      album: metadata.common.album,
      // Get the first picture if available
      albumArt: metadata.common.picture?.[0] 
        ? `data:${metadata.common.picture[0].format};base64,${metadata.common.picture[0].data.toString('base64')}`
        : undefined
    };
  } catch (error) {
    console.error('Failed to extract metadata:', error);
    return {};
  }
};
