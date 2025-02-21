import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Divider,
  Paper,
  CircularProgress,
  Grid
} from '@mui/material';
import { Plus, Trash2, Edit2, Play, Music } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSupabase } from '../context/SupabaseContext';
import { Playlist, Track } from '../types';
import MusicPlayer from './MusicPlayer';
import { useSnackbar } from 'notistack';

interface PlaylistManagerProps {
  onPlaylistSelect: (playlist: Playlist) => void;
}

export default function PlaylistManager({ onPlaylistSelect }: PlaylistManagerProps) {
  const { user } = useAuth();
  const { supabase } = useSupabase();
  const { enqueueSnackbar } = useSnackbar();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    loadPlaylists();
  }, []);

  useEffect(() => {
    if (selectedPlaylist) {
      loadPlaylistTracks(selectedPlaylist.id);
    } else {
      setPlaylistTracks([]);
    }
  }, [selectedPlaylist]);

  const loadPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error loading playlists:', error);
      enqueueSnackbar('Failed to load playlists', { variant: 'error' });
    }
  };

  const loadPlaylistTracks = async (playlistId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('playlist_tracks')
        .select(`
          position,
          track:track_id (
            id,
            title,
            artist,
            duration,
            cloud_provider,
            cloud_path,
            encryption_key,
            mime_type
          )
        `)
        .eq('playlist_id', playlistId)
        .order('position');

      if (error) throw error;

      const tracks = data
        .sort((a, b) => a.position - b.position)
        .map(item => item.track) as Track[];

      setPlaylistTracks(tracks);
    } catch (error) {
      console.error('Error loading playlist tracks:', error);
      enqueueSnackbar('Failed to load playlist tracks', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (editingPlaylist) {
        const { error } = await supabase
          .from('playlists')
          .update({ name: playlistName })
          .eq('id', editingPlaylist.id);

        if (error) throw error;
        enqueueSnackbar('Playlist updated', { variant: 'success' });
      } else {
        const { error } = await supabase
          .from('playlists')
          .insert([{
            name: playlistName,
            user_id: user?.id
          }]);

        if (error) throw error;
        enqueueSnackbar('Playlist created', { variant: 'success' });
      }

      setOpenDialog(false);
      setPlaylistName('');
      setEditingPlaylist(null);
      loadPlaylists();
    } catch (error) {
      console.error('Error saving playlist:', error);
      enqueueSnackbar('Failed to save playlist', { variant: 'error' });
    }
  };

  const handleDelete = async (playlistId: string) => {
    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

      if (error) throw error;
      
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(null);
        setPlaylistTracks([]);
      }
      
      loadPlaylists();
      enqueueSnackbar('Playlist deleted', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting playlist:', error);
      enqueueSnackbar('Failed to delete playlist', { variant: 'error' });
    }
  };

  const handleRemoveTrack = async (trackId: string, position: number) => {
    if (!selectedPlaylist) return;
    
    setRemoving(trackId);
    try {
      // Remove the track
      const { error: removeError } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('playlist_id', selectedPlaylist.id)
        .eq('track_id', trackId);

      if (removeError) throw removeError;

      // Update positions for remaining tracks
      const { error: updateError } = await supabase
        .from('playlist_tracks')
        .update({ position: supabase.sql`position - 1` })
        .eq('playlist_id', selectedPlaylist.id)
        .gte('position', position);

      if (updateError) throw updateError;

      // Refresh the tracks list
      await loadPlaylistTracks(selectedPlaylist.id);
      enqueueSnackbar('Track removed from playlist', { variant: 'success' });
    } catch (error) {
      console.error('Error removing track:', error);
      enqueueSnackbar('Failed to remove track', { variant: 'error' });
    } finally {
      setRemoving(null);
    }
  };

  const handleEdit = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setPlaylistName(playlist.name);
    setOpenDialog(true);
  };

  const handlePlaylistSelect = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    onPlaylistSelect(playlist);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Your Playlists</Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => {
            setEditingPlaylist(null);
            setPlaylistName('');
            setOpenDialog(true);
          }}
        >
          New Playlist
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Playlists List */}
        <Grid item xs={12} md={4}>
          <List>
            {playlists.map((playlist) => (
              <ListItem
                key={playlist.id}
                button
                onClick={() => handlePlaylistSelect(playlist)}
                selected={selectedPlaylist?.id === playlist.id}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light'
                    }
                  }
                }}
              >
                <ListItemText
                  primary={playlist.name}
                  secondary={`Created ${new Date(playlist.created_at).toLocaleDateString()}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(playlist);
                    }}
                  >
                    <Edit2 size={20} />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(playlist.id);
                    }}
                  >
                    <Trash2 size={20} />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Grid>

        {/* Tracks List */}
        <Grid item xs={12} md={8}>
          {selectedPlaylist ? (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedPlaylist.name} - Tracks
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : playlistTracks.length > 0 ? (
                <>
                  {currentTrack && (
                    <Box sx={{ mb: 2 }}>
                      <MusicPlayer
                        track={currentTrack}
                        onClose={() => setCurrentTrack(null)}
                      />
                    </Box>
                  )}
                  <List>
                    {playlistTracks.map((track, index) => (
                      <React.Fragment key={track.id}>
                        <ListItem
                          sx={{
                            '&:hover': {
                              backgroundColor: 'action.hover',
                              borderRadius: 1
                            }
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => setCurrentTrack(track)}
                            sx={{ mr: 1 }}
                          >
                            <Play size={20} />
                          </IconButton>
                          <ListItemText
                            primary={track.title}
                            secondary={
                              <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {track.artist && (
                                  <>
                                    <Typography variant="body2" component="span">
                                      {track.artist}
                                    </Typography>
                                    <Typography variant="body2" component="span">•</Typography>
                                  </>
                                )}
                                <Typography variant="body2" component="span">
                                  {formatDuration(track.duration)}
                                </Typography>
                              </Box>
                            }
                          />
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveTrack(track.id, index)}
                            disabled={removing === track.id}
                          >
                            {removing === track.id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <Trash2 size={20} />
                            )}
                          </IconButton>
                        </ListItem>
                        {index < playlistTracks.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  p: 4,
                  color: 'text.secondary'
                }}>
                  <Music size={48} />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    No tracks in this playlist yet
                  </Typography>
                </Box>
              )}
            </Paper>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              p: 4,
              color: 'text.secondary'
            }}>
              <Music size={48} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Select a playlist to view its tracks
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {editingPlaylist ? 'Edit Playlist' : 'Create New Playlist'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Playlist Name"
            fullWidth
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateOrUpdate} variant="contained">
            {editingPlaylist ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}