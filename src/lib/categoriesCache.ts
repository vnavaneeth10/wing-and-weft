// src/lib/categoriesCache.ts
// Single source of truth for categories data.
// All three consumers (Navbar, CategorySection, CategoriesPage) call getCategories()
// instead of fetching independently.
//
// Two layers of caching:
//   1. In-memory (cache/inflight) — dedupes concurrent calls within the same page session,
//      zero JSON parsing cost on repeat calls.
//   2. localStorage with TTL — survives page reloads/navigations, so a fresh page load
//      doesn't re-hit Supabase unless the cache has actually expired.

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../admin/lib/supabase';

export interface CachedCategory {
  id:          string;
  name:        string;
  image:       string;
  description: string;
  count:       number;
  sort_order:  number;
  is_active:   boolean;
}

const STORAGE_KEY = 'wf:categories';
const TTL = 15 * 60 * 1000; // 15 min — categories change rarely, admin-driven only

interface StoredEntry {
  data:      CachedCategory[];
  fetchedAt: number;
}

let cache:    CachedCategory[] | null          = null;
let inflight: Promise<CachedCategory[]> | null = null;

function readStorage(): StoredEntry | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredEntry) : null;
  } catch {
    return null;
  }
}

function writeStorage(data: CachedCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, fetchedAt: Date.now() }));
  } catch {
    // storage full/unavailable — fail silently, network fetch still works
  }
}

function fetchFromSupabase(): Promise<CachedCategory[]> {
  return fetch(
    `${SUPABASE_URL}/rest/v1/categories?is_active=eq.true&order=sort_order.asc`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  )
    .then(r => { if (!r.ok) throw new Error('Failed to fetch categories'); return r.json(); });
}

export const getCategories = (): Promise<CachedCategory[]> => {
  // 1. Fresh in-memory cache (same page session) — instant, no parsing
  if (cache) return Promise.resolve(cache);

  // 2. Concurrent calls in flight — share the same promise
  if (inflight) return inflight;

  // 3. Fresh localStorage cache (survives reload/navigation) — no network call
  const stored = readStorage();
  if (stored && Date.now() - stored.fetchedAt < TTL) {
    cache = stored.data;
    return Promise.resolve(stored.data);
  }

  // 4. Cache missing or stale — hit Supabase, then populate both layers
  inflight = fetchFromSupabase()
    .then((data: CachedCategory[]) => {
      cache = data;
      inflight = null;
      writeStorage(data);
      return data;
    })
    .catch(err => {
      inflight = null;
      // Stale cache is better than nothing if the network call fails
      if (stored) { cache = stored.data; return stored.data; }
      throw err;
    });

  return inflight;
};

// Call this from your admin panel after adding/editing a category so the
// next page load gets fresh data without requiring a full browser refresh.
export const clearCategoriesCache = (): void => {
  cache = null;
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
};