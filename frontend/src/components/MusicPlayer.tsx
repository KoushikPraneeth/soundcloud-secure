import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Track } from '@/lib/types';
import { formatDuration } from '@/lib/utils';

interface MusicPlayerProps {
    track: Track | null;
    onNext?: () => void;
    onPrevious?: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ track, onNext, onPrevious }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (track && audioRef.current) {
            audioRef.current.src = track.storageUrl;
            audioRef.current.play().catch(() => setIsPlaying(false));
        }
    }, [track]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(() => setIsPlaying(false));
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (value: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value[0];
            setCurrentTime(value[0]);
        }
    };

    const handleVolumeChange = (value: number[]) => {
        if (audioRef.current) {
            const newVolume = value[0];
            audioRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            const newMuted = !isMuted;
            audioRef.current.volume = newMuted ? 0 : volume;
            setIsMuted(newMuted);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={onNext}
            />
            
            {track ? (
                <div className="max-w-7xl mx-auto grid grid-cols-3 gap-4 items-center">
                    <div className="flex items-center gap-4">
                        <div className="text-sm">
                            <div className="font-medium">{track.title}</div>
                            <div className="text-muted-foreground">{track.artist}</div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onPrevious}
                                disabled={!onPrevious}
                            >
                                <SkipBack className="h-5 w-5" />
                            </Button>
                            
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={togglePlay}
                            >
                                {isPlaying ? (
                                    <Pause className="h-5 w-5" />
                                ) : (
                                    <Play className="h-5 w-5" />
                                )}
                            </Button>
                            
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onNext}
                                disabled={!onNext}
                            >
                                <SkipForward className="h-5 w-5" />
                            </Button>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full">
                            <span className="text-sm text-muted-foreground w-12 text-right">
                                {formatDuration(currentTime)}
                            </span>
                            <Slider
                                value={[currentTime]}
                                min={0}
                                max={duration || 100}
                                step={1}
                                onValueChange={handleSeek}
                                className="w-96"
                            />
                            <span className="text-sm text-muted-foreground w-12">
                                {formatDuration(duration)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMute}
                        >
                            {isMuted ? (
                                <VolumeX className="h-5 w-5" />
                            ) : (
                                <Volume2 className="h-5 w-5" />
                            )}
                        </Button>
                        <Slider
                            value={[isMuted ? 0 : volume]}
                            min={0}
                            max={1}
                            step={0.1}
                            onValueChange={handleVolumeChange}
                            className="w-32"
                        />
                    </div>
                </div>
            ) : (
                <div className="text-center text-muted-foreground">
                    No track selected
                </div>
            )}
        </div>
    );
}; 