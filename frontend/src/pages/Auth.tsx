import React, { useState } from 'react';
import { Container, Paper, Tabs, Tab, Box, Typography } from '@mui/material';
import LoginForm from '../components/Auth/LoginForm';
import SignUpForm from '../components/Auth/SignUpForm';

export default function Auth() {
  const [tab, setTab] = useState(0);

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography component="h1" variant="h5">
            Welcome to Cloud Music Player
          </Typography>
        </Box>
        
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} centered>
          <Tab label="Sign In" />
          <Tab label="Sign Up" />
        </Tabs>
        
        <Box sx={{ mt: 3 }}>
          {tab === 0 ? <LoginForm /> : <SignUpForm />}
        </Box>
      </Paper>
    </Container>
  );
}