import React, { useCallback, useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { Upload } from 'lucide-react';
import { useDropbox } from '../context/DropboxContext';
import { useSupabase } from '../context/SupabaseContext';
import { useAuth } from '../context/AuthContext';
import { EncryptionManager } from '../utils/encryption';
import { v4 as uuidv4 } from 'uuid';

export default function FileUploader({ onUploadComplete }: { onUploadComplete: () => void }) {
  const { client } = useDropbox();
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !client || !user) return;

    const isMusicFile = /\.(mp3|wav|m4a)$/i.test(file.name);
    if (!isMusicFile) {
      alert('Please select a music file (MP3, WAV, or M4A)');
      return;
    }

    setUploading(true);
    setProgress(0);

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
      
      // Derive the master key (in a real app, you'd get the password from the user)
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
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [client, onUploadComplete, supabase, user]);

  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
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
        >
          Upload Music
        </Button>
      </label>
      {uploading && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Uploading... {progress}%
        </Typography>
      )}
    </Box>
  );
}