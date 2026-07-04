// src/lib/policiesCache.ts
// Single source of truth for policy content. Fetches the full active list once
// and caches it — PolicyModal looks up by id from the cached array instead of
// hitting Supabase per policy per modal-open.

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../admin/lib/supabase';

export interface CachedPolicy {
  id:      string;
  title:   string;
  content: string[];
}

const STORAGE_KEY = 'wf:policies';
const TTL = 30 * 60 * 1000; // 30 min — policy text changes very rarely

interface StoredEntry {
  data:      CachedPolicy[];
  fetchedAt: number;
}

let cache:    CachedPolicy[] | null          = null;
let inflight: Promise<CachedPolicy[]> | null = null;

function readStorage(): StoredEntry | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredEntry) : null;
  } catch {
    return null;
  }
}

function writeStorage(data: CachedPolicy[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, fetchedAt: Date.now() }));
  } catch {
    // storage full/unavailable — fail silently
  }
}

function fetchFromSupabase(): Promise<CachedPolicy[]> {
  return fetch(
    `${SUPABASE_URL}/rest/v1/policies?is_active=eq.true&select=id,title,content&order=sort_order.asc`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  )
    .then(r => { if (!r.ok) throw new Error('Failed to fetch policies'); return r.json(); })
    .then((rows: any[]) => rows.map(p => ({
      ...p,
      content: Array.isArray(p.content) ? p.content : JSON.parse(p.content),
    })));
}

export const getPolicies = (): Promise<CachedPolicy[]> => {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;

  const stored = readStorage();
  if (stored && Date.now() - stored.fetchedAt < TTL) {
    cache = stored.data;
    return Promise.resolve(stored.data);
  }

  inflight = fetchFromSupabase()
    .then((data) => {
      cache = data;
      inflight = null;
      writeStorage(data);
      return data;
    })
    .catch(err => {
      inflight = null;
      if (stored) { cache = stored.data; return stored.data; }
      throw err;
    });

  return inflight;
};

export const getPolicyById = async (id: string): Promise<CachedPolicy | null> => {
  const all = await getPolicies();
  return all.find(p => p.id === id) ?? null;
};

// Call from admin panel after editing policy content.
export const clearPoliciesCache = (): void => {
  cache = null;
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
};