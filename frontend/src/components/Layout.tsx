import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';
import { Music } from 'lucide-react';
import ProfileMenu from './ProfileMenu';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const showProfileMenu = user && location.pathname !== '/auth';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Music className="mr-2" />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Cloud Music Player
          </Typography>
          {showProfileMenu && <ProfileMenu />}
        </Toolbar>
      </AppBar>
      
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Outlet />
      </Container>

      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'background.paper' }}>
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Cloud Music Player
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}