import React, { useState } from 'react';
import { ListMusic, Share2, Plus, MoreVertical, Play, Pause } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table';
import { Track, Playlist } from '@/lib/types';
import { formatDuration } from '@/lib/utils';

interface PlaylistManagerProps {
    playlists: Playlist[];
    tracks: Track[];
    currentTrack: Track | null;
    isPlaying: boolean;
    onCreatePlaylist: (name: string, description: string) => void;
    onDeletePlaylist: (playlist: Playlist) => void;
    onPlayTrack: (track: Track) => void;
    onPauseTrack: () => void;
    onRemoveTrack: (playlist: Playlist, trackId: string) => void;
    onSharePlaylist: (playlist: Playlist) => void;
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({
    playlists,
    tracks,
    currentTrack,
    isPlaying,
    onCreatePlaylist,
    onDeletePlaylist,
    onPlayTrack,
    onPauseTrack,
    onRemoveTrack,
    onSharePlaylist,
}) => {
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newPlaylistDescription, setNewPlaylistDescription] = useState('');

    const handleCreatePlaylist = () => {
        if (newPlaylistName.trim()) {
            onCreatePlaylist(newPlaylistName.trim(), newPlaylistDescription.trim());
            setNewPlaylistName('');
            setNewPlaylistDescription('');
        }
    };

    const getPlaylistTracks = (playlist: Playlist) => {
        return tracks.filter(track => playlist.trackIds.includes(track.id));
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Your Playlists</h2>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Playlist
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Playlist</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                placeholder="Playlist name"
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                            />
                            <Input
                                placeholder="Description (optional)"
                                value={newPlaylistDescription}
                                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                            />
                            <Button onClick={handleCreatePlaylist} className="w-full">
                                Create Playlist
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.map((playlist) => (
                    <div
                        key={playlist.id}
                        className="border rounded-lg p-4 space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">{playlist.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {playlist.description || `${getPlaylistTracks(playlist).length} tracks`}
                                </p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onSharePlaylist(playlist)}>
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => onDeletePlaylist(playlist)}
                                        className="text-destructive"
                                    >
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {selectedPlaylist?.id === playlist.id && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Artist</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {getPlaylistTracks(playlist).map((track) => (
                                        <TableRow key={track.id}>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        if (currentTrack?.id === track.id && isPlaying) {
                                                            onPauseTrack();
                                                        } else {
                                                            onPlayTrack(track);
                                                        }
                                                    }}
                                                >
                                                    {currentTrack?.id === track.id && isPlaying ? (
                                                        <Pause className="h-4 w-4" />
                                                    ) : (
                                                        <Play className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                            <TableCell className="font-medium">{track.title}</TableCell>
                                            <TableCell>{track.artist}</TableCell>
                                            <TableCell>{formatDuration(track.duration / 1000)}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onRemoveTrack(playlist, track.id)}
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => setSelectedPlaylist(
                                selectedPlaylist?.id === playlist.id ? null : playlist
                            )}
                        >
                            {selectedPlaylist?.id === playlist.id ? 'Hide Tracks' : 'Show Tracks'}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}; 