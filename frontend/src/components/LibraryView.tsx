import React, { useState } from 'react';
import { Music, MoreVertical, Play, Pause, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
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
import { Track } from '@/lib/types';
import { formatDuration } from '@/lib/utils';

interface LibraryViewProps {
    tracks: Track[];
    currentTrack: Track | null;
    isPlaying: boolean;
    onPlay: (track: Track) => void;
    onPause: () => void;
    onAddToPlaylist: (track: Track) => void;
    onDelete: (track: Track) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
    tracks,
    currentTrack,
    isPlaying,
    onPlay,
    onPause,
    onAddToPlaylist,
    onDelete,
}) => {
    const [search, setSearch] = useState('');

    const filteredTracks = tracks.filter(track =>
        track.title.toLowerCase().includes(search.toLowerCase()) ||
        track.artist.toLowerCase().includes(search.toLowerCase()) ||
        track.album.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Your Library</h2>
                <Input
                    placeholder="Search tracks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64"
                />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Artist</TableHead>
                        <TableHead>Album</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="w-12"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredTracks.map((track) => (
                        <TableRow key={track.id}>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        if (currentTrack?.id === track.id && isPlaying) {
                                            onPause();
                                        } else {
                                            onPlay(track);
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
                            <TableCell>{track.album}</TableCell>
                            <TableCell>{formatDuration(track.duration / 1000)}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onAddToPlaylist(track)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add to Playlist
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onDelete(track)}
                                            className="text-destructive"
                                        >
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}; 