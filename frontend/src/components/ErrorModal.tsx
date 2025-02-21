import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { AlertCircle } from 'lucide-react';

interface ErrorModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorModal({
  open,
  onClose,
  title = 'Error',
  message,
  onRetry
}: ErrorModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="error-dialog-title"
      aria-describedby="error-dialog-description"
    >
      <DialogTitle 
        id="error-dialog-title"
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: 'error.main'
        }}
      >
        <AlertCircle size={24} />
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography id="error-dialog-description">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        {onRetry && (
          <Button onClick={onRetry} variant="contained" color="primary">
            Retry
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}