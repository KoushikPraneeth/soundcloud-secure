import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSupabaseAuthStore from '../store/supabaseAuthStore';
import { getSession } from '../utils/supabase';

const SupabaseAuthCallback = () => {
  const navigate = useNavigate();
    const setSession = useSupabaseAuthStore(state => state.setSession)

  useEffect(() => {
    async function handleCallback() {
        const session = await getSession()
        setSession(session)
        navigate('/');
    }

    handleCallback();
  }, [navigate]);

  return (
    <div>
      Loading...
    </div>
  );
};

export default SupabaseAuthCallback;
