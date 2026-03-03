// src/admin/lib/AdminAuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authSignIn, authSignOut, getSession, AdminSession } from './supabase';

interface AuthContextType {
  session: AdminSession | null;
  loading: boolean;
  error: string;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AdminAuthContext = createContext<AuthContextType>({
  session: null,
  loading: false,
  error: '',
  signIn: async () => {},
  signOut: () => {},
});

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setSession(getSession());
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setError('');
    setLoading(true);
    try {
      const s = await authSignIn(email, password);
      setSession(s);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    authSignOut();
    setSession(null);
  };

  return (
    <AdminAuthContext.Provider value={{ session, loading, error, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
