// src/lib/settingsCache.ts
// Single source of truth for site settings data.
// Mirrors the categoriesCache.ts pattern: in-memory cache for same-session
// dedupe, localStorage with TTL for persistence across reloads/navigations.

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../admin/lib/supabase';

export interface SiteSettings {
  whatsapp_number:  string;
  contact_phone:    string;
  contact_email:    string;
  instagram_url:    string;
  instagram_handle: string;
  facebook_url:     string;
  facebook_name:    string;
  business_hours:   string;
  ribbon_text:      string;
  ribbon_visible:   string;
}

export const DEFAULTS: SiteSettings = {
  whatsapp_number:  '919999999999',
  contact_phone:    '+91 99999 99999',
  contact_email:    'support@wingandweft.com',
  instagram_url:    'https://www.instagram.com/wingandweft/',
  instagram_handle: '@wingandweft',
  facebook_url:     '#',
  facebook_name:    'Wing & Weft',
  business_hours:   'Mon–Sat: 10AM – 7PM',
  ribbon_text:      '',
  ribbon_visible:   'true',
};

const STORAGE_KEY = 'wf:settings';
const TTL = 15 * 60 * 1000; // 15 min — settings are admin-driven, change rarely

interface StoredEntry {
  data:      SiteSettings;
  fetchedAt: number;
}

let cache:    SiteSettings | null          = null;
let inflight: Promise<SiteSettings> | null = null;

function readStorage(): StoredEntry | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredEntry) : null;
  } catch {
    return null;
  }
}

function writeStorage(data: SiteSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, fetchedAt: Date.now() }));
  } catch {
    // storage full/unavailable — fail silently
  }
}

function mapRowsToSettings(rows: { key: string; value: string }[]): SiteSettings {
  const map: Record<string, string> = {};
  rows.forEach(r => { if (r.key) map[r.key] = r.value; });
  return {
    whatsapp_number:  map['whatsapp_number']  || DEFAULTS.whatsapp_number,
    contact_phone:    map['contact_phone']    || DEFAULTS.contact_phone,
    contact_email:    map['contact_email']    || DEFAULTS.contact_email,
    instagram_url:    map['instagram_url']    || DEFAULTS.instagram_url,
    instagram_handle: map['instagram_handle'] || DEFAULTS.instagram_handle,
    facebook_url:     map['facebook_url']     || DEFAULTS.facebook_url,
    facebook_name:    map['facebook_name']    || DEFAULTS.facebook_name,
    business_hours:   map['business_hours']   || DEFAULTS.business_hours,
    ribbon_text:      map['ribbon_text']      || DEFAULTS.ribbon_text,
    ribbon_visible:   map['ribbon_visible']   || DEFAULTS.ribbon_visible,
  };
}

function fetchFromSupabase(): Promise<SiteSettings> {
  return fetch(`${SUPABASE_URL}/rest/v1/settings?select=key,value`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  })
    .then(r => { if (!r.ok) throw new Error('Failed to fetch settings'); return r.json(); })
    .then(mapRowsToSettings);
}

export const getSettings = (): Promise<SiteSettings> => {
  // 1. Fresh in-memory cache (same page session)
  if (cache) return Promise.resolve(cache);

  // 2. Concurrent calls in flight — share the same promise
  if (inflight) return inflight;

  // 3. Fresh localStorage cache (survives reload/navigation)
  const stored = readStorage();
  if (stored && Date.now() - stored.fetchedAt < TTL) {
    cache = stored.data;
    return Promise.resolve(stored.data);
  }

  // 4. Cache missing or stale — hit Supabase, populate both layers
  inflight = fetchFromSupabase()
    .then((data) => {
      cache = data;
      inflight = null;
      writeStorage(data);
      return data;
    })
    .catch(err => {
      inflight = null;
      if (stored) { cache = stored.data; return stored.data; } // stale > nothing
      throw err;
    });

  return inflight;
};

// Call from admin panel after saving settings, so next load gets fresh data.
export const clearSettingsCache = (): void => {
  cache = null;
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
};