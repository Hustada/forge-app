import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  isOfflineMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isOfflineMode = !supabase;

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!supabase) throw new Error('Running in offline mode');
    
    // Use the current origin for redirect to handle both localhost and production
    const redirectTo = `${window.location.origin}/#type=signup`;
    
    console.log('Attempting signup with redirect to:', redirectTo);
    console.log('Current origin:', window.location.origin);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          redirect_url: redirectTo  // Some Supabase configs need this too
        }
      }
    });
    
    console.log('Signup response:', { 
      data, 
      error,
      userCreated: data?.user ? 'Yes' : 'No',
      identities: data?.user?.identities,
      emailSent: data?.user && !data?.user?.email_confirmed_at ? 'Should be sent' : 'May not send'
    });
    
    if (error) throw error;
    
    // Check if user already exists (Supabase returns success even if user exists)
    if (data?.user?.identities?.length === 0) {
      console.log('User already exists, identities array is empty');
      throw new Error('User already registered. Please sign in instead.');
    }
    
    if (!data?.user) {
      throw new Error('Signup failed - no user returned');
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Running in offline mode');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
  };

  const signOut = async () => {
    if (!supabase) return;
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resendConfirmation = async (email: string) => {
    if (!supabase) throw new Error('Running in offline mode');
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    if (!supabase) throw new Error('Running in offline mode');
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#type=recovery`,
    });
    
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    if (!supabase) throw new Error('Running in offline mode');
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        resendConfirmation,
        resetPassword,
        updatePassword,
        isOfflineMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};