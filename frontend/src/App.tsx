import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SupabaseProvider } from './context/SupabaseContext';
import { DropboxProvider } from './context/DropboxContext';
import theme from './theme';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/auth" />;
}

// Handle Dropbox OAuth callback
function DropboxCallback() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = () => {
      const hash = location.hash;
      if (!hash) return;

      const urlParams = new URLSearchParams(hash.substring(1));
      const accessToken = urlParams.get('access_token');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      
      if (error) {
        console.error('Dropbox auth error:', error, errorDescription);
        enqueueSnackbar(
          errorDescription || 'Failed to connect to Dropbox',
          { variant: 'error', autoHideDuration: 5000 }
        );
        navigate('/');
        return;
      }
      
      if (accessToken) {
        window.localStorage.setItem('dropboxAccessToken', accessToken);
        window.localStorage.removeItem('dropboxAuthPending');
        enqueueSnackbar('Successfully connected to Dropbox', { variant: 'success' });
        navigate('/');
      }
    };

    handleCallback();
  }, [location.hash, navigate, enqueueSnackbar]);

  return <div>Processing Dropbox authentication...</div>;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        autoHideDuration={3000}
      >
        <BrowserRouter>
          <AuthProvider>
            <SupabaseProvider>
              <DropboxProvider>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/auth/dropbox/callback" element={<DropboxCallback />} />
                    <Route
                      path="/"
                      element={
                        <PrivateRoute>
                          <Dashboard />
                        </PrivateRoute>
                      }
                    />
                  </Route>
                </Routes>
              </DropboxProvider>
            </SupabaseProvider>
          </AuthProvider>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;