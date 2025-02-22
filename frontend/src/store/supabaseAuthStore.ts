import { create } from 'zustand';
import { supabase, getSession, onAuthStateChange } from '../utils/supabase';
import { Session } from '@supabase/supabase-js';

interface SupabaseAuthState {
  user: any | null; //  use a more specific type later
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  setSession: (session: Session | null) => void;
  setUser: (user: any | null) => void; //  use a more specific type later
  clearAuth: () => void;
}

const useSupabaseAuthStore = create<SupabaseAuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,
  setSession: (session) => set({ session, isLoading: false }),
  setUser: (user) => set({ user }),
  clearAuth: () => set({ user: null, session: null, isLoading: false }),
}));

// Initialize session and set up auth change listener
async function initializeAuth() {
    const initialSession = await getSession();
    useSupabaseAuthStore.setState({ session: initialSession, isLoading: false });

    onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            useSupabaseAuthStore.setState({ user: session.user, session: session, isLoading: false });
        } else if (event === 'SIGNED_OUT') {
            useSupabaseAuthStore.setState({ user: null, session: null, isLoading: false });
        } else if (event === 'USER_UPDATED' && session) {
            useSupabaseAuthStore.setState({ user: session.user, session: session})
        }
    })
}
initializeAuth()
export default useSupabaseAuthStore;
