// src/admin/lib/supabase.ts
// ─────────────────────────────────────────────────────────────────────────────
// SETUP: Replace the two values below with your actual Supabase project details.
// Find them at: https://app.supabase.com → Project Settings → API
// ─────────────────────────────────────────────────────────────────────────────

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

// ─────────────────────────────────────────────────────────────────────────────
// Lightweight Supabase client (no npm package needed — uses fetch directly)
// ─────────────────────────────────────────────────────────────────────────────

interface QueryOptions {
  select?: string;
  eq?: Record<string, unknown>;
  order?: { column: string; ascending?: boolean };
  limit?: number;
}

class SupabaseTable {
  constructor(
    private url: string,
    private key: string,
    private table: string,
    private authToken?: string
  ) {}

  private get headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      apikey: this.key,
      Authorization: `Bearer ${this.authToken || this.key}`,
      Prefer: 'return=representation',
    };
  }

  private buildQuery(opts: QueryOptions): string {
    const params = new URLSearchParams();
    if (opts.select) params.set('select', opts.select);
    if (opts.eq) {
      Object.entries(opts.eq).forEach(([k, v]) => params.set(k, `eq.${v}`));
    }
    if (opts.order) {
      params.set('order', `${opts.order.column}.${opts.order.ascending ? 'asc' : 'desc'}`);
    }
    if (opts.limit) params.set('limit', String(opts.limit));
    return params.toString() ? `?${params.toString()}` : '';
  }

  async select(opts: QueryOptions = {}) {
    const res = await fetch(
      `${this.url}/rest/v1/${this.table}${this.buildQuery(opts)}`,
      { headers: this.headers }
    );
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async insert(data: Record<string, unknown> | Record<string, unknown>[]) {
    const res = await fetch(`${this.url}/rest/v1/${this.table}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async update(id: string, data: Record<string, unknown>) {
    const res = await fetch(`${this.url}/rest/v1/${this.table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async delete(id: string) {
    const res = await fetch(`${this.url}/rest/v1/${this.table}?id=eq.${id}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    if (!res.ok) throw new Error(await res.text());
    return true;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth helpers
// ─────────────────────────────────────────────────────────────────────────────

const SESSION_KEY = 'ww_admin_session';

export interface AdminSession {
  access_token: string;
  user: { id: string; email: string };
}

export const authSignIn = async (email: string, password: string): Promise<AdminSession> => {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error_description || 'Login failed');
  }
  const data = await res.json();
  const session: AdminSession = { access_token: data.access_token, user: data.user };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const authSignOut = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getSession = (): AdminSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Storage helpers
// ─────────────────────────────────────────────────────────────────────────────

export const uploadImage = async (
  bucket: string,
  path: string,
  file: File,
  token: string
): Promise<string> => {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': file.type,
    },
    body: file,
  });
  if (!res.ok) throw new Error('Image upload failed');
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
};

export const deleteStorageFile = async (bucket: string, path: string, token: string) => {
  await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// DB helpers — call these from your hooks/components
// ─────────────────────────────────────────────────────────────────────────────

export const getTable = (table: string, token?: string) =>
  new SupabaseTable(SUPABASE_URL, SUPABASE_ANON_KEY, table, token);
