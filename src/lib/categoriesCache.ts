// src/lib/categoriesCache.ts
// Single source of truth for categories data.
// All three consumers (Navbar, CategorySection, CategoriesPage) call getCategories()
// instead of fetching independently — the first caller fires the request,
// every subsequent caller gets the same resolved promise. Zero duplicate network calls.

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

let cache:    CachedCategory[] | null       = null;
let inflight: Promise<CachedCategory[]> | null = null;

export const getCategories = (): Promise<CachedCategory[]> => {
  if (cache)    return Promise.resolve(cache);
  if (inflight) return inflight;

  inflight = fetch(
    `${SUPABASE_URL}/rest/v1/categories?is_active=eq.true&order=sort_order.asc`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  )
    .then(r => { if (!r.ok) throw new Error('Failed to fetch categories'); return r.json(); })
    .then((data: CachedCategory[]) => { cache = data; inflight = null; return data; })
    .catch(err => { inflight = null; throw err; });

  return inflight;
};

// Call this from your admin panel after adding/editing a category so the
// next page load gets fresh data without requiring a full browser refresh.
export const clearCategoriesCache = (): void => { cache = null; };