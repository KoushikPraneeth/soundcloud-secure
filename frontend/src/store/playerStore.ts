import { create } from 'zustand';
import { PlayerState, Track } from '../types';
import { extractMetadata } from '../utils/metadata';

interface PlayerStore extends PlayerState {
  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setPlaylist: (playlist: Track[]) => void;
  addToPlaylist: (track: Track) => void;
  updateTrackMetadata: (trackId: string, metadata: Track['metadata']) => void;
  setLoadingMetadata: (isLoading: boolean) => void;
  setMetadataError: (error: string | null) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.7,
  playlist: [],
  isLoadingMetadata: false,
  metadataError: null,
  setCurrentTrack: async (track) => {
    set({ currentTrack: track });
    
    if (track?.temporaryLink && !track.metadata) {
      set({ isLoadingMetadata: true, metadataError: null });
      try {
        const metadata = await extractMetadata(track.temporaryLink);
        get().updateTrackMetadata(track.id, metadata);
      } catch (error) {
        set({ metadataError: 'Failed to load track metadata' });
      } finally {
        set({ isLoadingMetadata: false });
      }
    }
  },
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume }),
  setPlaylist: (playlist) => set({ playlist }),
  addToPlaylist: (track) => set((state) => ({ 
    playlist: [...state.playlist, track] 
  })),
  updateTrackMetadata: (trackId, metadata) => set((state) => ({
    playlist: state.playlist.map(track =>
      track.id === trackId ? { ...track, metadata } : track
    ),
    currentTrack: state.currentTrack?.id === trackId
      ? { ...state.currentTrack, metadata }
      : state.currentTrack
  })),
  setLoadingMetadata: (isLoading) => set({ isLoadingMetadata: isLoading }),
  setMetadataError: (error) => set({ metadataError: error }),
}));
