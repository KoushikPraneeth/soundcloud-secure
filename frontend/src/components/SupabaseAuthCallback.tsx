import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSupabaseAuthStore from '../store/supabaseAuthStore';
import { handleSupabaseCallback } from '../utils/supabase';

const SupabaseAuthCallback = () => {
  const navigate = useNavigate();
  const { setSession, setUser } = useSupabaseAuthStore();

  useEffect(() => {
    async function handleCallback() {
      try {
        const session = await handleSupabaseCallback();
        if (session) {
          // Set both session and user state before navigation
          setSession(session);
          setUser(session.user);
          
          // Small delay to ensure state is updated before navigation
          await new Promise(resolve => setTimeout(resolve, 100));
          navigate('/');
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        navigate('/');
      }
    }

    handleCallback();
  }, [navigate, setSession, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default SupabaseAuthCallback;
