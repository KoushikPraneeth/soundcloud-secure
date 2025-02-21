import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import { Music } from 'lucide-react';
import { useSupabase } from '../context/SupabaseContext';
import { Playlist, Track } from '../types';
import { useSnackbar } from 'notistack';

interface AddToPlaylistDialogProps {
  open: boolean;
  onClose: () => void;
  track: Track;
}

export default function AddToPlaylistDialog({ open, onClose, track }: AddToPlaylistDialogProps) {
  const { supabase } = useSupabase();
  const { enqueueSnackbar } = useSnackbar();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (open) {
      loadPlaylists();
    }
  }, [open]);

  const loadPlaylists = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlist: Playlist) => {
    setAdding(true);
    try {
      // Get the current highest position in the playlist
      const { data: positionData, error: positionError } = await supabase
        .from('playlist_tracks')
        .select('position')
        .eq('playlist_id', playlist.id)
        .order('position', { ascending: false })
        .limit(1);

      if (positionError) throw positionError;

      const nextPosition = positionData && positionData.length > 0 
        ? positionData[0].position + 1 
        : 0;

      // Check if track is already in playlist
      const { data: existingTrack, error: checkError } = await supabase
        .from('playlist_tracks')
        .select('*')
        .eq('playlist_id', playlist.id)
        .eq('track_id', track.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      if (existingTrack) {
        enqueueSnackbar('Track is already in this playlist', { variant: 'info' });
        return;
      }

      // Add track to playlist
      const { error: insertError } = await supabase
        .from('playlist_tracks')
        .insert({
          playlist_id: playlist.id,
          track_id: track.id,
          position: nextPosition
        });

      if (insertError) throw insertError;

      enqueueSnackbar('Track added to playlist', { variant: 'success' });
      onClose();
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      enqueueSnackbar('Failed to add track to playlist', { variant: 'error' });
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !adding && onClose()}>
      <DialogTitle>Add to Playlist</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : playlists.length > 0 ? (
          <List>
            {playlists.map((playlist) => (
              <ListItem
                key={playlist.id}
                button
                onClick={() => handleAddToPlaylist(playlist)}
                disabled={adding}
              >
                <ListItemText
                  primary={playlist.name}
                  secondary={`Created ${new Date(playlist.created_at).toLocaleDateString()}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            p: 3,
            color: 'text.secondary'
          }}>
            <Music size={48} />
            <Typography sx={{ mt: 2 }}>
              No playlists found. Create a playlist first.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={adding}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}