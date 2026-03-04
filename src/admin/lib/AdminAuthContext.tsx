// src/admin/lib/AdminAuthContext.tsx
import React, {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, ReactNode,
} from 'react';
import {
  authSignIn, authSignOut, authRefresh,
  getSession, AdminSession,
  isLockedOut, getLockoutRemaining, getRemainingAttempts,
} from './supabase';

interface AuthCtx {
  session:           AdminSession | null;
  loading:           boolean;
  error:             string;
  remainingAttempts: number;
  lockoutMinutes:    number;
  signIn:  (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AdminAuthContext = createContext<AuthCtx>({
  session: null, loading: false, error: '',
  remainingAttempts: 5, lockoutMinutes: 0,
  signIn: async () => {}, signOut: () => {},
});

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession]   = useState<AdminSession | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [remaining, setRemaining] = useState(5);
  const [lockoutMin, setLockout]  = useState(0);

  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Inactivity auto-logout ──────────────────────────────────────────────────
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      console.info('[WW Admin] Session expired due to inactivity.');
      doSignOut();
    }, 60 * 60 * 1000); // 60 min
  }, []);

  // ── Token refresh ───────────────────────────────────────────────────────────
  const scheduleRefresh = useCallback((s: AdminSession) => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    // Refresh 5 minutes before expiry
    const msUntilRefresh = (s.expires_at - Math.floor(Date.now() / 1000) - 300) * 1000;
    if (msUntilRefresh > 0) {
      refreshTimer.current = setTimeout(async () => {
        const refreshed = await authRefresh(s.refresh_token);
        if (refreshed) {
          setSession(refreshed);
          scheduleRefresh(refreshed);
        } else {
          doSignOut();
        }
      }, msUntilRefresh);
    }
  }, []);

  const doSignOut = useCallback(() => {
    authSignOut();
    setSession(null);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
  }, []);

  // ── Boot: restore session ───────────────────────────────────────────────────
  useEffect(() => {
    const existing = getSession();
    if (existing) {
      setSession(existing);
      scheduleRefresh(existing);
      resetInactivityTimer();
    }
    setLoading(false);

    // Listen for user activity to reset inactivity timer
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const onActivity = () => resetInactivityTimer();
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [scheduleRefresh, resetInactivityTimer]);

  // ── Sign in ─────────────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    setError('');
    setLoading(true);
    try {
      const s = await authSignIn(email, password);
      setSession(s);
      scheduleRefresh(s);
      resetInactivityTimer();
      setRemaining(5);
      setLockout(0);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Login failed';
      setError(msg);
      setRemaining(getRemainingAttempts());
      setLockout(isLockedOut() ? getLockoutRemaining() : 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider value={{
      session, loading, error,
      remainingAttempts: remaining,
      lockoutMinutes:    lockoutMin,
      signIn, signOut: doSignOut,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);