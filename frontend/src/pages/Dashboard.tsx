import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button, CircularProgress, IconButton } from '@mui/material';
import { Music, HardDrive, PlayCircle, Play, FileText, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDropbox } from '../context/DropboxContext';
import MusicPlayer from '../components/MusicPlayer';
import FileUploader from '../components/FileUploader';

interface MusicFile {
  name: string;
  path: string;
  size: number;
  serverModified: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { isConnected, connect, disconnect, client } = useDropbox();
  const [files, setFiles] = useState<MusicFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicFile | null>(null);

  useEffect(() => {
    if (isConnected && client) {
      loadMusicFiles();
    } else {
      setFiles([]);
    }
  }, [isConnected, client]);

  const loadMusicFiles = async () => {
    if (!client) return;
    
    setLoading(true);
    try {
      const response = await client.filesListFolder({ path: '' });
      const musicFiles = response.result.entries
        .filter(entry => 
          entry.name.toLowerCase().endsWith('.mp3') || 
          entry.name.toLowerCase().endsWith('.m4a') ||
          entry.name.toLowerCase().endsWith('.wav')
        )
        .map(file => ({
          name: file.name,
          path: file.path_display || '',
          size: (file as any).size || 0,
          serverModified: (file as any).server_modified || ''
        }));
      setFiles(musicFiles);
    } catch (error) {
      console.error('Error loading music files:', error);
      if ((error as any)?.status === 401) {
        disconnect();
      }
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back!
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <HardDrive size={40} className="mx-auto mb-4" />
            <Typography variant="h6" gutterBottom>
              Connect Storage
            </Typography>
            {isConnected ? (
              <Button 
                variant="outlined" 
                color="error" 
                onClick={disconnect}
                sx={{ mt: 1 }}
              >
                Disconnect Dropbox
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={connect}
              >
                Connect Dropbox
              </Button>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Music size={40} className="mx-auto mb-4" />
            <Typography variant="h6" gutterBottom>
              Your Library
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {files.length} tracks available
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <PlayCircle size={40} className="mx-auto mb-4" />
            <Typography variant="h6" gutterBottom>
              Playlists
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Coming soon
            </Typography>
          </Paper>
        </Grid>

        {isConnected && (
          <>
            <Grid item xs={12}>
              <FileUploader onUploadComplete={loadMusicFiles} />
            </Grid>

            {currentTrack && (
              <Grid item xs={12}>
                <MusicPlayer
                  filePath={currentTrack.path}
                  fileName={currentTrack.name}
                  onClose={() => setCurrentTrack(null)}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Your Music Files
                </Typography>
                {files.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' }
                    }}
                  >
                    <IconButton
                      onClick={() => setCurrentTrack(file)}
                      color="primary"
                    >
                      <Play size={20} />
                    </IconButton>
                    
                    <Box sx={{ ml: 2, flex: 1 }}>
                      <Typography variant="body1">{file.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <FileText size={16} />
                        <Typography variant="body2" sx={{ ml: 1, mr: 3 }}>
                          {formatFileSize(file.size)}
                        </Typography>
                        <Calendar size={16} />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {formatDate(file.serverModified)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
}