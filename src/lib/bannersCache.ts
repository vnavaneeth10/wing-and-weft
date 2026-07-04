// src/lib/bannersCache.ts
// Single source of truth for banner slides. Same pattern as categoriesCache.ts.

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../admin/lib/supabase';

export interface CachedBanner {
  id:         string;
  title:      string;
  subtitle:   string;
  eyebrow:    string;
  cta_text:   string;
  cta_link:   string;
  image_url:  string;
  is_active:  boolean;
  sort_order: number;
}

const STORAGE_KEY = 'wf:banners';
const TTL = 15 * 60 * 1000; // 15 min — banners are admin-driven, change rarely

interface StoredEntry {
  data:      CachedBanner[];
  fetchedAt: number;
}

let cache:    CachedBanner[] | null          = null;
let inflight: Promise<CachedBanner[]> | null = null;

function readStorage(): StoredEntry | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredEntry) : null;
  } catch {
    return null;
  }
}

function writeStorage(data: CachedBanner[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, fetchedAt: Date.now() }));
  } catch {
    // storage full/unavailable — fail silently
  }
}

function fetchFromSupabase(): Promise<CachedBanner[]> {
  return fetch(
    `${SUPABASE_URL}/rest/v1/banners?is_active=eq.true&order=sort_order.asc`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  )
    .then(r => { if (!r.ok) throw new Error('Failed to fetch banners'); return r.json(); });
}

export const getBanners = (): Promise<CachedBanner[]> => {
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

// Call from admin panel after adding/editing/reordering banners.
export const clearBannersCache = (): void => {
  cache = null;
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
};