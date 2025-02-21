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
  Typography
} from '@mui/material';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSupabase } from '../context/SupabaseContext';
import { Playlist } from '../types';

interface PlaylistManagerProps {
  onPlaylistSelect: (playlist: Playlist) => void;
}

export default function PlaylistManager({ onPlaylistSelect }: PlaylistManagerProps) {
  const { user } = useAuth();
  const { supabase } = useSupabase();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    loadPlaylists();
  }, []);

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
      } else {
        const { error } = await supabase
          .from('playlists')
          .insert([
            {
              name: playlistName,
              user_id: user?.id
            }
          ]);

        if (error) throw error;
      }

      setOpenDialog(false);
      setPlaylistName('');
      setEditingPlaylist(null);
      loadPlaylists();
    } catch (error) {
      console.error('Error saving playlist:', error);
    }
  };

  const handleDelete = async (playlistId: string) => {
    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

      if (error) throw error;
      loadPlaylists();
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const handleEdit = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setPlaylistName(playlist.name);
    setOpenDialog(true);
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

      <List>
        {playlists.map((playlist) => (
          <ListItem
            key={playlist.id}
            button
            onClick={() => onPlaylistSelect(playlist)}
            sx={{
              borderRadius: 1,
              mb: 1,
              '&:hover': {
                backgroundColor: 'action.hover'
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