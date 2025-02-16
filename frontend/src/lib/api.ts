import { Track, Playlist } from './types';

const API_BASE = '/api';

export const api = {
    // Track endpoints
    tracks: {
        list: async (): Promise<Track[]> => {
            const response = await fetch(`${API_BASE}/tracks`);
            if (!response.ok) throw new Error('Failed to fetch tracks');
            return response.json();
        },

        upload: async (file: File): Promise<Track> => {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE}/tracks/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to upload track');
            return response.json();
        },

        delete: async (trackId: string): Promise<void> => {
            const response = await fetch(`${API_BASE}/tracks/${trackId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete track');
        },

        getStreamUrl: async (trackId: string): Promise<string> => {
            const response = await fetch(`${API_BASE}/tracks/${trackId}/stream`);
            if (!response.ok) throw new Error('Failed to get stream URL');
            return response.json();
        },
    },

    // Playlist endpoints
    playlists: {
        list: async (): Promise<Playlist[]> => {
            const response = await fetch(`${API_BASE}/playlists`);
            if (!response.ok) throw new Error('Failed to fetch playlists');
            return response.json();
        },

        create: async (name: string, description?: string): Promise<Playlist> => {
            const response = await fetch(`${API_BASE}/playlists`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description }),
            });

            if (!response.ok) throw new Error('Failed to create playlist');
            return response.json();
        },

        update: async (
            playlistId: string,
            data: { name?: string; description?: string; isPublic?: boolean }
        ): Promise<Playlist> => {
            const response = await fetch(`${API_BASE}/playlists/${playlistId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to update playlist');
            return response.json();
        },

        delete: async (playlistId: string): Promise<void> => {
            const response = await fetch(`${API_BASE}/playlists/${playlistId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete playlist');
        },

        addTrack: async (playlistId: string, trackId: string): Promise<void> => {
            const response = await fetch(`${API_BASE}/playlists/${playlistId}/tracks/${trackId}`, {
                method: 'POST',
            });

            if (!response.ok) throw new Error('Failed to add track to playlist');
        },

        removeTrack: async (playlistId: string, trackId: string): Promise<void> => {
            const response = await fetch(`${API_BASE}/playlists/${playlistId}/tracks/${trackId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to remove track from playlist');
        },

        share: async (playlistId: string, expiryHours?: number): Promise<string> => {
            const response = await fetch(`${API_BASE}/playlists/${playlistId}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expiryHours }),
            });

            if (!response.ok) throw new Error('Failed to share playlist');
            return response.json();
        },

        revokeShare: async (playlistId: string): Promise<void> => {
            const response = await fetch(`${API_BASE}/playlists/${playlistId}/share`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to revoke playlist share');
        },
    },

    // Shared playlist endpoint
    shared: {
        getPlaylist: async (token: string): Promise<{ playlist: Playlist; tracks: Track[] }> => {
            const response = await fetch(`${API_BASE}/shared/${token}`);
            if (!response.ok) throw new Error('Failed to fetch shared playlist');
            return response.json();
        },
    },
}; 