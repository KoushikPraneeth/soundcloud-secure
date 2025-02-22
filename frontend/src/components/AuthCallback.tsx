import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { handleAuthCallback } from '../utils/dropbox';
import { useAuthStore } from '../store/authStore';
import { DropboxError } from '../types';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { error, isAuthenticated } = useAuthStore();
  const hasHandledRef = useRef(false);

  // Clear query parameters after successful auth
  const clearQueryParams = () => {
    const newUrl = `${location.pathname}${location.hash}`;
    window.history.replaceState({}, '', newUrl);
  };

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');
    const state = searchParams.get('state');

    console.log('Auth callback params:', { code, error: errorParam, state });

    // Skip if already authenticated or already handled
    if (isAuthenticated || hasHandledRef.current) {
      console.log('Skipping auth callback: Already authenticated or handled');
      navigate('/');
      return;
    }

    if (errorParam) {
      console.error('Dropbox auth error:', errorParam);
      useAuthStore.getState().setAuth({
        error: `Authentication failed: ${errorParam}`,
      });
      navigate('/');
      return;
    }

    if (code) {
      hasHandledRef.current = true;
      console.log('Handling auth code...');
      handleAuthCallback(code)
        .then(() => {
          console.log('Auth successful, redirecting...');
          clearQueryParams();
          navigate('/');
        })
        .catch((error) => {
          console.error('Auth callback error:', error);
          let errorMessage = 'Authentication failed';
          
          if (error instanceof DropboxError) {
            switch (error.code) {
              case 'invalid_grant':
                errorMessage = 'Invalid authorization code. Please try connecting again.';
                break;
              case 'invalid_client':
                errorMessage = 'Application authentication failed. Please contact support.';
                break;
              default:
                errorMessage = error.description || error.message;
            }
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }

          useAuthStore.getState().setAuth({
            error: errorMessage
          });
          navigate('/');
        });
    } else {
      console.error('No code or error in callback');
      useAuthStore.getState().setAuth({
        error: 'No authorization code received',
      });
      navigate('/');
    }
  }, [searchParams, navigate, isAuthenticated, location.pathname, location.hash]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authenticating...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
};
