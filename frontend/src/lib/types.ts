export interface Track {
    id: string;
    title: string;
    artist: string;
    album: string;
    genre: string;
    year: number;
    duration: number;
    fileId: string;
    userId: string;
    storageUrl: string;
    format: string;
    bitrate: number;
    encryptionKey: string;
    iv: string;
    createdAt: number;
    updatedAt: number;
}

export interface Playlist {
    id: string;
    name: string;
    description: string;
    userId: string;
    trackIds: string[];
    isPublic: boolean;
    shareToken: string | null;
    shareExpiry: number | null;
    createdAt: number;
    updatedAt: number;
} 