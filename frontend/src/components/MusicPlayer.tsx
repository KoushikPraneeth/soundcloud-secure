import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Play, Pause, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { useDropbox } from '../context/DropboxContext';
import { useSupabase } from '../context/SupabaseContext';
import { useAuth } from '../context/AuthContext';
import { EncryptionManager } from '../utils/encryption';
import { Track } from '../types';
import { useSnackbar } from 'notistack';
import ErrorModal from './ErrorModal';
import LoadingOverlay from './LoadingOverlay';

interface MusicPlayerProps {
  track: Track;
  onClose: () => void;
}

export default function MusicPlayer({ track, onClose }: MusicPlayerProps) {
  const { client } = useDropbox();
  const { supabase } = useSupabase();
  const { user, masterKey } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    loadAudio();
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [track, retryCount]);

  const loadAudio = async () => {
    if (!client || !user || !masterKey) {
      setError('Not authenticated. Please try signing in again.');
      setShowErrorModal(true);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);

      // Get temporary link from Dropbox
      const response = await client.filesGetTemporaryLink({ path: track.cloud_path });
      
      // Fetch the encrypted file
      const encryptedResponse = await fetch(response.result.link);
      if (!encryptedResponse.ok) {
        throw new Error('Failed to fetch audio file from Dropbox');
      }
      const encryptedBlob = await encryptedResponse.blob();
      
      // Decrypt the file
      const decryptedBlob = await EncryptionManager.decryptFile(
        encryptedBlob,
        track.encryption_key,
        masterKey,
        track.mime_type
      );
      
      // Validate the decrypted file
      if (decryptedBlob.size === 0) {
        throw new Error('Decrypted file is empty');
      }

      // Create object URL for the decrypted blob
      const objectUrl = URL.createObjectURL(decryptedBlob);
      setAudioUrl(objectUrl);
    } catch (error) {
      console.error('Error loading audio:', error);
      let errorMessage = 'Failed to load audio file. ';

      if (error instanceof Error) {
        if (error.message.includes('decrypt')) {
          errorMessage += 'Decryption failed. The file may be corrupted.';
        } else if (error.message.includes('fetch')) {
          errorMessage += 'Could not download the file from Dropbox.';
        } else {
          errorMessage += error.message;
        }
      }

      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
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

    const handleError = (e: ErrorEvent) => {
      console.error('Audio playback error:', e);
      setError('Audio playback failed. The file might be corrupted or in an unsupported format.');
      setShowErrorModal(true);
      setIsPlaying(false);
    };

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
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

  const handleRetry = () => {
    setRetryCount(count => count + 1);
    setShowErrorModal(false);
  };

  const togglePlay = () => {
    if (!audioRef.current || error) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Playback error:', error);
        setError('Failed to start playback. Please try again.');
        setShowErrorModal(true);
      });
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

  return (
    <Paper 
      sx={{ 
        p: 3, 
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <audio ref={audioRef} src={audioUrl} />
      
      {isLoading && <LoadingOverlay message="Loading audio..." />}

      <Box sx={{ opacity: isLoading ? 0.5 : 1 }}>
        <Typography variant="h6" gutterBottom>
          {track.title}
        </Typography>
        {track.artist && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {track.artist}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 2 }}>
          <IconButton 
            onClick={togglePlay} 
            disabled={!!error || isLoading}
            color="primary"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </IconButton>

          <Box sx={{ flex: 1, mx: 2 }}>
            <Slider
              value={currentTime}
              min={0}
              max={duration}
              onChange={handleTimeChange}
              disabled={!!error || isLoading}
              color="primary"
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                {formatTime(currentTime)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTime(duration)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
            <IconButton 
              onClick={toggleMute} 
              disabled={!!error || isLoading}
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </IconButton>
            <Slider
              value={isMuted ? 0 : volume}
              min={0}
              max={1}
              step={0.1}
              onChange={handleVolumeChange}
              disabled={!!error || isLoading}
              sx={{ ml: 1 }}
              size="small"
            />
          </Box>
        </Box>
      </Box>

      <ErrorModal
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Playback Error"
        message={error || 'An unknown error occurred'}
        onRetry={handleRetry}
      />
    </Paper>
  );
}