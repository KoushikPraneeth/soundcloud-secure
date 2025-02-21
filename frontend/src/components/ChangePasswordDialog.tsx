import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import { Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSupabase } from '../context/SupabaseContext';
import { useDropbox } from '../context/DropboxContext';
import { EncryptionManager } from '../utils/encryption';
import { useSnackbar } from 'notistack';
import ErrorModal from './ErrorModal';

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ReencryptionProgress {
  current: number;
  total: number;
  currentFile: string;
}

export default function ChangePasswordDialog({ open, onClose }: ChangePasswordDialogProps) {
  const { user, signOut } = useAuth();
  const { supabase } = useSupabase();
  const { client } = useDropbox();
  const { enqueueSnackbar } = useSnackbar();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ReencryptionProgress | null>(null);

  const validatePasswords = () => {
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }
    if (newPassword !== confirmPassword) {
      throw new Error('New passwords do not match');
    }
    if (currentPassword === newPassword) {
      throw new Error('New password must be different from current password');
    }
  };

  const handleChangePassword = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      validatePasswords();

      // 1. Verify current password by attempting to derive the master key
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('encryption_salt')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;

      const currentSalt = Uint8Array.from(atob(userData.encryption_salt), c => c.charCodeAt(0));
      const { key: oldMasterKey } = await EncryptionManager.deriveKeyFromPassword(
        currentPassword,
        currentSalt
      );

      // 2. Generate new master key with new salt
      const { key: newMasterKey, salt: newSalt } = await EncryptionManager.deriveKeyFromPassword(
        newPassword
      );

      // 3. Fetch all user's tracks
      const { data: tracks, error: tracksError } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', user?.id);

      if (tracksError) throw tracksError;

      // 4. Re-encrypt each track
      setProgress({ current: 0, total: tracks.length, currentFile: '' });

      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        setProgress({
          current: i + 1,
          total: tracks.length,
          currentFile: track.title
        });

        // Get temporary link from Dropbox
        const response = await client?.filesGetTemporaryLink({ path: track.cloud_path });
        if (!response) throw new Error('Failed to get file link from Dropbox');

        // Fetch encrypted file
        const encryptedResponse = await fetch(response.result.link);
        if (!encryptedResponse.ok) {
          throw new Error(`Failed to fetch file: ${track.title}`);
        }
        const encryptedBlob = await encryptedResponse.blob();

        // Decrypt with old key
        const decryptedBlob = await EncryptionManager.decryptFile(
          encryptedBlob,
          track.encryption_key,
          oldMasterKey,
          track.mime_type
        );

        // Re-encrypt with new key
        const { encryptedData, fileKey } = await EncryptionManager.encryptFile(
          new File([decryptedBlob], track.title),
          newMasterKey
        );

        // Upload re-encrypted file
        await client?.filesUpload({
          path: track.cloud_path,
          contents: await encryptedData.arrayBuffer(),
          mode: { '.tag': 'overwrite' }
        });

        // Update encryption key in database
        const { error: updateError } = await supabase
          .from('tracks')
          .update({ encryption_key: fileKey })
          .eq('id', track.id);

        if (updateError) throw updateError;
      }

      // 5. Update user's encryption salt
      const newSaltBase64 = btoa(String.fromCharCode(...newSalt));
      const { error: saltError } = await supabase
        .from('users')
        .update({ encryption_salt: newSaltBase64 })
        .eq('id', user?.id);

      if (saltError) throw saltError;

      // 6. Update password in auth
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (passwordError) throw passwordError;

      enqueueSnackbar('Password changed successfully. Please sign in with your new password.', {
        variant: 'success',
        autoHideDuration: 5000
      });

      // 7. Sign out user to force re-authentication with new password
      await signOut();
    } catch (error) {
      console.error('Password change error:', error);
      setError(error instanceof Error ? error.message : 'Failed to change password');
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
      setProgress(null);
      // Clear sensitive data
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      onClose();
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Lock size={24} />
          Change Password
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Changing your password will require re-encrypting all your music files.
            This process may take some time depending on the number and size of your files.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isProcessing}
              fullWidth
              required
            />
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isProcessing}
              fullWidth
              required
              helperText="Password must be at least 8 characters long"
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isProcessing}
              fullWidth
              required
            />
          </Box>

          {progress && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Re-encrypting files ({progress.current} of {progress.total})
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Current file: {progress.currentFile}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(progress.current / progress.total) * 100}
                sx={{ mt: 1 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={isProcessing || !currentPassword || !newPassword || !confirmPassword}
            startIcon={isProcessing ? <CircularProgress size={20} /> : null}
          >
            {isProcessing ? 'Processing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      <ErrorModal
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Password Change Error"
        message={error || 'An unknown error occurred'}
      />
    </>
  );
}