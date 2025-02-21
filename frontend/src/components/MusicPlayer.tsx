import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Paper,
  CircularProgress
} from '@mui/material';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useDropbox } from '../context/DropboxContext';
import { useSupabase } from '../context/SupabaseContext';
import { EncryptionManager } from '../utils/encryption';
import { Track } from '../types';

interface MusicPlayerProps {
  track: Track;
  onClose: () => void;
}

export default function MusicPlayer({ track, onClose }: MusicPlayerProps) {
  const { client } = useDropbox();
  const { supabase } = useSupabase();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');

  useEffect(() => {
    loadAudio();
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [track]);

  const loadAudio = async () => {
    if (!client) return;
    
    try {
      setIsLoading(true);
      // Get temporary link from Dropbox
      const response = await client.filesGetTemporaryLink({ path: track.cloud_path });
      
      // Fetch the encrypted file
      const encryptedResponse = await fetch(response.result.link);
      const encryptedBlob = await encryptedResponse.blob();
      
      // Decrypt the file
      const decryptedBlob = await EncryptionManager.decryptFile(encryptedBlob, track.encryption_key || '');
      
      // Create object URL for the decrypted blob
      const objectUrl = URL.createObjectURL(decryptedBlob);
      setAudioUrl(objectUrl);
    } catch (error) {
      console.error('Error loading audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      // Update track duration in database if it's not set
      if (!track.duration) {
        updateTrackDuration(audio.duration);
      }
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [track]);

  const updateTrackDuration = async (duration: number) => {
    try {
      await supabase
        .from('tracks')
        .update({ duration: Math.round(duration) })
        .eq('id', track.id);
    } catch (error) {
      console.error('Error updating track duration:', error);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume;
    } else {
      audioRef.current.volume = 0;
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const value = newValue as number;
    if (!audioRef.current) return;
    
    audioRef.current.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const handleTimeChange = (event: Event, newValue: number | number[]) => {
    const value = newValue as number;
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, width: '100%' }}>
      <audio ref={audioRef} src={audioUrl} />
      
      <Typography variant="subtitle1" gutterBottom>
        {track.title}
      </Typography>
      {track.artist && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {track.artist}
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <IconButton onClick={togglePlay}>
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </IconButton>

        <Box sx={{ flex: 1, mx: 2 }}>
          <Slider
            value={currentTime}
            min={0}
            max={duration}
            onChange={handleTimeChange}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">{formatTime(currentTime)}</Typography>
            <Typography variant="caption">{formatTime(duration)}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 100 }}>
          <IconButton onClick={toggleMute}>
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </IconButton>
          <Slider
            value={isMuted ? 0 : volume}
            min={0}
            max={1}
            step={0.1}
            onChange={handleVolumeChange}
            sx={{ ml: 1 }}
          />
        </Box>
      </Box>
    </Paper>
  );
}