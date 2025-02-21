import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { EncryptionManager } from '../utils/encryption';

interface AuthContextType {
  user: User | null;
  supabase: SupabaseClient;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  masterKey: CryptoKey | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        // Clear master key on logout
        setMasterKey(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // After successful login, get the user's encryption salt
      const { data: userData, error: saltError } = await supabase
        .from('users')
        .select('encryption_salt')
        .single();

      if (saltError) throw saltError;

      // Convert base64 salt to Uint8Array
      const salt = Uint8Array.from(atob(userData.encryption_salt || ''), c => c.charCodeAt(0));
      
      // Derive the master key from the password
      const { key } = await EncryptionManager.deriveKeyFromPassword(password, salt);
      setMasterKey(key);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Generate encryption key and salt
      const { key, salt } = await EncryptionManager.deriveKeyFromPassword(password);
      
      // Convert salt to base64 for storage
      const saltBase64 = btoa(String.fromCharCode(...salt));

      // Sign up the user
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      // Update the user's profile with encryption salt
      const { error: updateError } = await supabase
        .from('users')
        .update({ encryption_salt: saltBase64 })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      // Set the master key
      setMasterKey(key);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setMasterKey(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!user) throw new Error('No user logged in');

    try {
      // Start a transaction by using RPC
      const { error: rpcError } = await supabase.rpc('delete_user_data', {
        user_id_input: user.id
      });

      if (rpcError) throw rpcError;

      // Delete the user's auth account
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        user.id
      );

      if (deleteError) throw deleteError;

      // Clear master key and sign out
      setMasterKey(null);
      await signOut();
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      supabase, 
      signIn, 
      signUp, 
      signOut, 
      deleteAccount,
      masterKey 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}