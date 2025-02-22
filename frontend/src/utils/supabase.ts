import { createClient, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function signInWithOAuth() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/supabase/callback`,
    },
  });

  if (error) {
    console.error('Error signing in with OAuth:', error);
    throw error;
  }
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    throw error;
  }
  return data.session;
}

export async function handleSupabaseCallback() {
  try {
    // Parse the URL to get the code and refresh token
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      throw new Error('No tokens found in URL');
    }

    // Set the session with the tokens
    const { data: { session }, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error in handleSupabaseCallback:', error);
    throw error;
  }
}

export async function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const {
    data: { subscription },
  } = await supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return () => {
    subscription.unsubscribe();
  };
}
