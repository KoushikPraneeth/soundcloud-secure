import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Track, Playlist } from '@/lib/types';
import { MusicPlayer } from '@/components/MusicPlayer';
import { useToast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

export default function SharedPlaylist() {
    const { token } = useParams<{ token: string }>();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadSharedPlaylist();
    }, [token]);

    const loadSharedPlaylist = async () => {
        try {
            const response = await fetch(`/api/shared/${token}`);
            if (response.ok) {
                const data = await response.json();
                setPlaylist(data.playlist);
                setTracks(data.tracks);
            } else {
                toast({
                    title: 'Error',
                    description: 'This playlist is no longer available or has expired.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load shared playlist',
                variant: 'destructive',
            });
        }
    };

    if (!playlist) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Playlist Not Found</h1>
                    <p className="text-muted-foreground">
                        This playlist is no longer available or has expired.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container py-8 pb-24">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
                    {playlist.description && (
                        <p className="text-muted-foreground">{playlist.description}</p>
                    )}
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Artist</TableHead>
                            <TableHead>Album</TableHead>
                            <TableHead>Duration</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tracks.map((track) => (
                            <TableRow key={track.id}>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            if (currentTrack?.id === track.id && isPlaying) {
                                                setIsPlaying(false);
                                            } else {
                                                setCurrentTrack(track);
                                                setIsPlaying(true);
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
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <MusicPlayer
                track={currentTrack}
                onNext={() => {
                    const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
                    if (currentIndex < tracks.length - 1) {
                        setCurrentTrack(tracks[currentIndex + 1]);
                        setIsPlaying(true);
                    }
                }}
                onPrevious={() => {
                    const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
                    if (currentIndex > 0) {
                        setCurrentTrack(tracks[currentIndex - 1]);
                        setIsPlaying(true);
                    }
                }}
            />
        </div>
    );
} 