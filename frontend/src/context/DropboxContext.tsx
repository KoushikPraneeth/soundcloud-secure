import React, { createContext, useContext, useState } from 'react';
import { Dropbox } from 'dropbox';
import { useSnackbar } from 'notistack';

const DROPBOX_CLIENT_ID = 'ciwpr6vuiv711pn';
const REDIRECT_URI = `${window.location.origin}/auth/dropbox/callback`;

interface DropboxContextType {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  client: Dropbox | null;
  isReconnecting: boolean;
  handleReconnect: () => Promise<void>;
}

const DropboxContext = createContext<DropboxContextType | undefined>(undefined);

export function DropboxProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<Dropbox | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const connect = () => {
    const dbx = new Dropbox({ 
      clientId: DROPBOX_CLIENT_ID,
      accessToken: window.localStorage.getItem('dropboxAccessToken') || undefined
    });
    
    if (!dbx.auth.getAccessToken()) {
      const authUrl = dbx.auth.getAuthenticationUrl(REDIRECT_URI, null, 'token', 'offline', null, 'none', true);
      window.localStorage.setItem('dropboxAuthPending', 'true');
      window.location.href = authUrl;
    } else {
      setClient(dbx);
    }
  };

  const disconnect = () => {
    if (client) {
      client.auth.signOut()
        .then(() => {
          setClient(null);
          window.localStorage.removeItem('dropboxAccessToken');
          enqueueSnackbar('Disconnected from Dropbox', { variant: 'info' });
        })
        .catch((error) => {
          console.error('Error disconnecting from Dropbox:', error);
          enqueueSnackbar('Failed to disconnect from Dropbox', { variant: 'error' });
        });
    }
  };

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      const dbx = new Dropbox({ 
        clientId: DROPBOX_CLIENT_ID,
        accessToken: window.localStorage.getItem('dropboxAccessToken') || undefined
      });
      
      // Test the connection
      await dbx.filesListFolder({ path: '' });
      
      setClient(dbx);
      enqueueSnackbar('Reconnected to Dropbox', { variant: 'success' });
    } catch (error) {
      console.error('Reconnection error:', error);
      window.localStorage.removeItem('dropboxAccessToken');
      enqueueSnackbar('Failed to reconnect. Please try connecting again.', { 
        variant: 'error',
        autoHideDuration: 5000
      });
      setClient(null);
    } finally {
      setIsReconnecting(false);
    }
  };

  // Check for existing token on mount
  React.useEffect(() => {
    const token = window.localStorage.getItem('dropboxAccessToken');
    if (token) {
      const dbx = new Dropbox({ 
        clientId: DROPBOX_CLIENT_ID,
        accessToken: token 
      });
      setClient(dbx);
    }
  }, []);

  return (
    <DropboxContext.Provider value={{
      isConnected: !!client,
      connect,
      disconnect,
      client,
      isReconnecting,
      handleReconnect
    }}>
      {children}
    </DropboxContext.Provider>
  );
}

export function useDropbox() {
  const context = useContext(DropboxContext);
  if (context === undefined) {
    throw new Error('useDropbox must be used within a DropboxProvider');
  }
  return context;
}