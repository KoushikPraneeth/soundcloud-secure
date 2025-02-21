import React, { createContext, useContext, useState } from 'react';
import { Dropbox } from 'dropbox';

const DROPBOX_CLIENT_ID = 'ciwpr6vuiv711pn';
const REDIRECT_URI = `${window.location.origin}/auth/dropbox/callback`;

interface DropboxContextType {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  client: Dropbox | null;
}

const DropboxContext = createContext<DropboxContextType | undefined>(undefined);

export function DropboxProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<Dropbox | null>(null);

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
      client.auth.signOut();
      setClient(null);
      window.localStorage.removeItem('dropboxAccessToken');
    }
  };

  const handleAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = urlParams.get('access_token');
    
    if (accessToken) {
      const dbx = new Dropbox({ 
        clientId: DROPBOX_CLIENT_ID,
        accessToken 
      });
      setClient(dbx);
      window.localStorage.setItem('dropboxAccessToken', accessToken);
      window.localStorage.removeItem('dropboxAuthPending');
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

    // Handle OAuth callback
    if (window.location.hash && window.localStorage.getItem('dropboxAuthPending')) {
      handleAuthCallback();
    }
  }, []);

  return (
    <DropboxContext.Provider value={{
      isConnected: !!client,
      connect,
      disconnect,
      client
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