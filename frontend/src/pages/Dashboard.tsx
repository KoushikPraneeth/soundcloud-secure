import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Track, Playlist } from '@/lib/types';
import { MusicPlayer } from '@/components/MusicPlayer';
import { LibraryView } from '@/components/LibraryView';
import { PlaylistManager } from '@/components/PlaylistManager';
import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Upload, Library, ListMusic } from 'lucide-react';

export default function Dashboard() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        checkAuth();
        loadTracks();
        loadPlaylists();
    }, []);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/signin');
        }
    };

    const loadTracks = async () => {
        try {
            const response = await fetch('/api/tracks');
            if (response.ok) {
                const data = await response.json();
                setTracks(data);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load tracks',
                variant: 'destructive',
            });
        }
    };

    const loadPlaylists = async () => {
        try {
            const response = await fetch('/api/playlists');
            if (response.ok) {
                const data = await response.json();
                setPlaylists(data);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load playlists',
                variant: 'destructive',
            });
        }
    };

    const handleUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/tracks/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const track = await response.json();
                setTracks(prev => [...prev, track]);
                toast({
                    title: 'Upload successful',
                    description: `${file.name} has been uploaded`,
                });
            }
        } catch (error) {
            toast({
                title: 'Upload failed',
                description: 'Failed to upload the file',
                variant: 'destructive',
            });
        }
    };

    const handleCreatePlaylist = async (name: string, description: string) => {
        try {
            const response = await fetch('/api/playlists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description }),
            });

            if (response.ok) {
                const playlist = await response.json();
                setPlaylists(prev => [...prev, playlist]);
                toast({
                    title: 'Playlist created',
                    description: `${name} has been created`,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create playlist',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteTrack = async (track: Track) => {
        try {
            const response = await fetch(`/api/tracks/${track.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setTracks(prev => prev.filter(t => t.id !== track.id));
                if (currentTrack?.id === track.id) {
                    setCurrentTrack(null);
                    setIsPlaying(false);
                }
                toast({
                    title: 'Track deleted',
                    description: `${track.title} has been deleted`,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete track',
                variant: 'destructive',
            });
        }
    };

    const handleDeletePlaylist = async (playlist: Playlist) => {
        try {
            const response = await fetch(`/api/playlists/${playlist.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setPlaylists(prev => prev.filter(p => p.id !== playlist.id));
                toast({
                    title: 'Playlist deleted',
                    description: `${playlist.name} has been deleted`,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete playlist',
                variant: 'destructive',
            });
        }
    };

    const handleSharePlaylist = async (playlist: Playlist) => {
        try {
            const response = await fetch(`/api/playlists/${playlist.id}/share`, {
                method: 'POST',
            });

            if (response.ok) {
                const shareToken = await response.json();
                const shareUrl = `${window.location.origin}/shared/${shareToken}`;
                
                // Copy to clipboard
                await navigator.clipboard.writeText(shareUrl);
                
                toast({
                    title: 'Share link copied',
                    description: 'The playlist share link has been copied to your clipboard',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to share playlist',
                variant: 'destructive',
            });
        }
    };

  return (
    <div className="min-h-screen bg-background">
            <div className="flex h-screen">
                {/* Sidebar */}
                <div className="w-64 border-r bg-card p-4">
                    <div className="space-y-4">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button className="w-full">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Music
          </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Upload Music</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6">
                                    <FileUpload onUpload={handleUpload} />
        </div>
                            </SheetContent>
                        </Sheet>

                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => document.getElementById('library')?.scrollIntoView()}
                        >
                            <Library className="h-4 w-4 mr-2" />
                            Library
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => document.getElementById('playlists')?.scrollIntoView()}
                        >
                            <ListMusic className="h-4 w-4 mr-2" />
                            Playlists
                        </Button>
              </div>
              </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto pb-24">
                    <div id="library" className="min-h-screen">
                        <LibraryView
                            tracks={tracks}
                            currentTrack={currentTrack}
                            isPlaying={isPlaying}
                            onPlay={track => {
                                setCurrentTrack(track);
                                setIsPlaying(true);
                            }}
                            onPause={() => setIsPlaying(false)}
                            onAddToPlaylist={() => {}}
                            onDelete={handleDeleteTrack}
                        />
        </div>

                    <div id="playlists" className="min-h-screen">
                        <PlaylistManager
                            playlists={playlists}
                            tracks={tracks}
                            currentTrack={currentTrack}
                            isPlaying={isPlaying}
                            onCreatePlaylist={handleCreatePlaylist}
                            onDeletePlaylist={handleDeletePlaylist}
                            onPlayTrack={track => {
                                setCurrentTrack(track);
                                setIsPlaying(true);
                            }}
                            onPauseTrack={() => setIsPlaying(false)}
                            onRemoveTrack={() => {}}
                            onSharePlaylist={handleSharePlaylist}
                        />
                    </div>
                </div>
          </div>
          
            {/* Music Player */}
            <MusicPlayer
                track={currentTrack}
                onNext={() => {}}
                onPrevious={() => {}}
            />
    </div>
  );
}
