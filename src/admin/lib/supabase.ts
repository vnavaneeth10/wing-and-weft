// src/admin/lib/supabase.ts

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// ─── Constants ────────────────────────────────────────────────────────────────
const SESSION_KEY  = 'ww_admin_session';
const FAILED_KEY   = 'ww_login_attempts';
const LOCKOUT_KEY  = 'ww_lockout_until';
const ACTIVITY_KEY = 'ww_last_activity';

const MAX_ATTEMPTS          = 5;
const LOCKOUT_MS            = 15 * 60 * 1000;  // 15 minutes
const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000;  // 60 minutes → auto logout

export interface AdminSession {
  access_token:  string;
  refresh_token: string;
  expires_at:    number; // unix seconds
  user: { id: string; email: string };
}

// ─── Brute-force / lockout ────────────────────────────────────────────────────

export const isLockedOut = (): boolean => {
  const until = sessionStorage.getItem(LOCKOUT_KEY);
  if (!until) return false;
  if (Date.now() < Number(until)) return true;
  sessionStorage.removeItem(LOCKOUT_KEY);
  sessionStorage.removeItem(FAILED_KEY);
  return false;
};

export const getLockoutRemaining = (): number =>
  Math.ceil((Number(sessionStorage.getItem(LOCKOUT_KEY) ?? 0) - Date.now()) / 60000);

export const getRemainingAttempts = (): number =>
  Math.max(0, MAX_ATTEMPTS - Number(sessionStorage.getItem(FAILED_KEY) ?? 0));

const recordFail = (): number => {
  const n = Number(sessionStorage.getItem(FAILED_KEY) ?? 0) + 1;
  sessionStorage.setItem(FAILED_KEY, String(n));
  if (n >= MAX_ATTEMPTS)
    sessionStorage.setItem(LOCKOUT_KEY, String(Date.now() + LOCKOUT_MS));
  return n;
};

const clearFails = () => {
  sessionStorage.removeItem(FAILED_KEY);
  sessionStorage.removeItem(LOCKOUT_KEY);
};

// ─── Session ──────────────────────────────────────────────────────────────────

const touchActivity = () =>
  sessionStorage.setItem(ACTIVITY_KEY, String(Date.now()));

export const getSession = (): AdminSession | null => {
  try {
    const last = sessionStorage.getItem(ACTIVITY_KEY);
    if (last && Date.now() - Number(last) > INACTIVITY_TIMEOUT_MS) {
      authSignOut();
      return null;
    }
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s: AdminSession = JSON.parse(raw);
    if (Math.floor(Date.now() / 1000) > s.expires_at - 60) return null;
    touchActivity();
    return s;
  } catch {
    return null;
  }
};

const saveSession = (s: AdminSession) => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  touchActivity();
};

export const authSignIn = async (
  email: string,
  password: string
): Promise<AdminSession> => {
  if (isLockedOut())
    throw new Error(`Too many failed attempts. Try again in ${getLockoutRemaining()} min.`);

  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const n   = recordFail();
    const rem = MAX_ATTEMPTS - n;
    if (rem <= 0)
      throw new Error(`Locked for ${getLockoutRemaining()} min after too many failed attempts.`);
    throw new Error(`Invalid credentials. ${rem} attempt${rem === 1 ? '' : 's'} remaining.`);
  }

  const data = await res.json();
  clearFails();

  const session: AdminSession = {
    access_token:  data.access_token,
    refresh_token: data.refresh_token,
    expires_at:    data.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
    user:          { id: data.user.id, email: data.user.email },
  };
  saveSession(session);
  return session;
};

export const authRefresh = async (rt: string): Promise<AdminSession | null> => {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ refresh_token: rt }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const s: AdminSession = {
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
      expires_at:    data.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
      user:          { id: data.user.id, email: data.user.email },
    };
    saveSession(s);
    return s;
  } catch { return null; }
};

export const authSignOut = () => {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(ACTIVITY_KEY);
};

// ─── REST helpers ─────────────────────────────────────────────────────────────

const h = (token?: string): Record<string, string> => ({
  'Content-Type': 'application/json',
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${token ?? SUPABASE_ANON_KEY}`,
  Prefer: 'return=representation',
});

/** Public read (anon) — used by customer-facing pages */
export const publicFetch = async <T>(
  table: string,
  params: Record<string, string> = {}
): Promise<T[]> => {
  const qs  = new URLSearchParams(params).toString();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}${qs ? `?${qs}` : ''}`,
    { headers: h() }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

/** Authenticated read — admin dashboard */
export const dbSelect = async <T>(
  table: string,
  token: string,
  params: Record<string, string> = {}
): Promise<T[]> => {
  const qs  = new URLSearchParams(params).toString();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}${qs ? `?${qs}` : ''}`,
    { headers: h(token) }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const dbInsert = async <T>(
  table: string,
  token: string,
  data: Partial<T> | Partial<T>[]
): Promise<T[]> => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: h(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const dbUpdate = async <T>(
  table: string,
  token: string,
  id: string,
  data: Partial<T>
): Promise<T[]> => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`,
    { method: 'PATCH', headers: h(token), body: JSON.stringify(data) }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const dbDelete = async (
  table: string, token: string, id: string
): Promise<void> => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`,
    { method: 'DELETE', headers: { ...h(token), Prefer: 'return=minimal' } }
  );
  if (!res.ok) throw new Error(await res.text());
};

// ─── Storage ──────────────────────────────────────────────────────────────────

/** Returns the full CDN public URL for a stored image */
export const getPublicUrl = (bucket: string, path: string): string =>
  `https://cdn.wingandweft.com/${bucket}/${path.replace(/^\//, '')}`;

/** Uploads a file directly to R2 via a short-lived signed URL, returns the full public URL */
export const uploadImage = async (
  bucket: string,
  path: string,
  file: File,
  token: string
): Promise<string> => {
  const cleanPath = path.replace(/^\//, '');

  const urlRes = await fetch('/api/get-upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ bucket, path: cleanPath, contentType: file.type }),
  });
  if (!urlRes.ok) throw new Error(`Could not get upload URL: ${await urlRes.text()}`);
  const { uploadUrl, publicUrl } = await urlRes.json();

  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!putRes.ok) throw new Error(`Upload to R2 failed: ${await putRes.text()}`);

  return publicUrl;
};