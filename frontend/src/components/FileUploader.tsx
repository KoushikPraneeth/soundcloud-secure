import React, { useCallback, useState } from 'react';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Typography, 
  Paper,
  LinearProgress
} from '@mui/material';
import { Upload, Music } from 'lucide-react';
import { useDropbox } from '../context/DropboxContext';
import { useSupabase } from '../context/SupabaseContext';
import { useAuth } from '../context/AuthContext';
import { EncryptionManager } from '../utils/encryption';
import { v4 as uuidv4 } from 'uuid';
import ErrorModal from './ErrorModal';

export default function FileUploader({ onUploadComplete }: { onUploadComplete: () => void }) {
  const { client } = useDropbox();
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !client || !user) return;

    const isMusicFile = /\.(mp3|wav|m4a)$/i.test(file.name);
    if (!isMusicFile) {
      setError('Please select a music file (MP3, WAV, or M4A)');
      setShowErrorModal(true);
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Get the user's encryption salt
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('encryption_salt')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Convert base64 salt to Uint8Array
      const salt = Uint8Array.from(atob(userData.encryption_salt), c => c.charCodeAt(0));
      
      // Derive the master key
      const { key: masterKey } = await EncryptionManager.deriveKeyFromPassword('temporary-password', salt);
      
      // Encrypt the file
      const { encryptedData, fileKey } = await EncryptionManager.encryptFile(file, masterKey);
      
      const maxChunkSize = 8 * 1024 * 1024; // 8MB chunks
      const fileSize = encryptedData.size;
      const chunks = Math.ceil(fileSize / maxChunkSize);
      
      let sessionId = null;
      const uniqueFileName = `${uuidv4()}-${file.name}`;
      
      for (let i = 0; i < chunks; i++) {
        const start = i * maxChunkSize;
        const end = Math.min(start + maxChunkSize, fileSize);
        const chunk = encryptedData.slice(start, end);
        
        const isLastChunk = i === chunks - 1;
        const chunkData = await chunk.arrayBuffer();
        
        if (i === 0) {
          // Start upload session
          const response = await client.filesUploadSessionStart({
            close: false,
            contents: chunkData
          });
          sessionId = response.result.session_id;
        } else if (isLastChunk) {
          // Finish upload session
          await client.filesUploadSessionFinish({
            cursor: {
              session_id: sessionId!,
              offset: start
            },
            commit: {
              path: '/' + uniqueFileName,
              mode: { '.tag': 'add' },
              autorename: true
            },
            contents: chunkData
          });
        } else {
          // Append to upload session
          await client.filesUploadSessionAppendV2({
            cursor: {
              session_id: sessionId!,
              offset: start
            },
            close: false,
            contents: chunkData
          });
        }
        
        setProgress(Math.round(((i + 1) / chunks) * 100));
      }

      // Save track metadata to Supabase
      const { error } = await supabase.from('tracks').insert([
        {
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
          cloud_provider: 'dropbox',
          cloud_path: '/' + uniqueFileName,
          encryption_key: fileKey,
          mime_type: EncryptionManager.getMimeType(file.name),
          user_id: user.id
        }
      ]);

      if (error) throw error;
      
      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload file. Please try again.');
      setShowErrorModal(true);
    } finally {
      setUploading(false);
      setProgress(0);
      // Clear the input
      event.target.value = '';
    }
  }, [client, onUploadComplete, supabase, user]);

  return (
    <Paper sx={{ p: 3, position: 'relative' }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        opacity: uploading ? 0.7 : 1
      }}>
        <Music size={40} className="mb-4" />
        <Typography variant="h6" gutterBottom>
          Upload Music
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Select MP3, WAV, or M4A files to upload
        </Typography>

        <input
          type="file"
          accept=".mp3,.wav,.m4a"
          style={{ display: 'none' }}
          id="music-file-input"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        <label htmlFor="music-file-input">
          <Button
            variant="contained"
            component="span"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <Upload />}
            sx={{ minWidth: 200 }}
          >
            {uploading ? 'Uploading...' : 'Choose File'}
          </Button>
        </label>

        {uploading && (
          <Box sx={{ width: '100%', mt: 3 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                }
              }}
            />
            <Typography 
              variant="body2" 
              color="text.secondary" 
              align="center" 
              sx={{ mt: 1 }}
            >
              {progress}% Complete
            </Typography>
          </Box>
        )}
      </Box>

      <ErrorModal
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Upload Error"
        message={error || 'An unknown error occurred'}
      />
    </Paper>
  );
}