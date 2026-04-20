// src/hooks/useProducts.ts
import { useState, useEffect, useCallback } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../admin/lib/supabase';

export interface Product {
  id:             string;
  name:           string;
  category:       string;
  fabric:         string;
  price:          number;
  discount_price: number | null;
  stock:          number;
  colors:         string[];
  images:         string[];
  description:    string;
  saree_fabric:   string;
  saree_length:   string;
  blouse_length:  string;
  blouse_fabric:  string;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_featured:    boolean;
  show_rating:    boolean;
  show_colors:    boolean;
  is_visible:     boolean;
  rating:         number;
  review_count:   number;
  specifications?:       { key: string; value: string }[];
  policy_points?:        string[];
  washing_instructions?: string[];
  created_at?:    string;
}

// ─── FIX: Robust boolean parser ───────────────────────────────────────────────
// The old Boolean(val) would turn the string "false" into true — a silent bug.
// This handles booleans, strings "true"/"false", numbers 0/1, null, undefined.
const parseBool = (val: unknown, defaultVal: boolean): boolean => {
  if (val === null || val === undefined) return defaultVal;
  if (typeof val === 'boolean')          return val;
  if (typeof val === 'number')           return val !== 0;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    if (s === 'true'  || s === '1') return true;
    if (s === 'false' || s === '0') return false;
    return defaultVal;
  }
  return Boolean(val);
};

const normalise = (raw: Record<string, unknown>): Product => ({
  ...(raw as unknown as Product),
  is_visible:   parseBool(raw.is_visible,  true),
  show_colors:  parseBool(raw.show_colors, true),
  show_rating:  parseBool(raw.show_rating, false),
  rating:       Number(raw.rating       ?? 0),
  review_count: Number(raw.review_count ?? 0),
  colors: Array.isArray(raw.colors) ? (raw.colors as string[]) : [],
  images: Array.isArray(raw.images) ? (raw.images as string[]) : [],
  specifications: Array.isArray(raw.specifications)
    ? (raw.specifications as { key: string; value: string }[])
    : (() => { try { return JSON.parse(raw.specifications as string); } catch { return []; } })(),
  policy_points: Array.isArray(raw.policy_points)
    ? (raw.policy_points as string[]) : [],
  washing_instructions: Array.isArray(raw.washing_instructions)
    ? (raw.washing_instructions as string[]) : [],
});

// ─── Generic public fetch (with cache-busting) ────────────────────────────────
const publicGet = async (
  table: string,
  params: Record<string, string> = {}
): Promise<Record<string, unknown>[]> => {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}${qs ? `?${qs}` : ''}`,
    {
      headers: {
        'Content-Type':  'application/json',
        apikey:          SUPABASE_ANON_KEY,
        Authorization:   `Bearer ${SUPABASE_ANON_KEY}`,
        'Cache-Control': 'no-cache',   // ← ensures admin changes show immediately
        Pragma:          'no-cache',
      },
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export function useAllProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await publicGet('products', { order: 'created_at.desc' });
      setProducts((data ?? []).map(normalise).filter(p => p.is_visible));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  return { products, loading, error, refresh: load };
}

export function useProductsByCategory(category: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  useEffect(() => {
    if (!category) return;
    setLoading(true);
    publicGet('products', { category: `eq.${category}`, order: 'created_at.desc' })
      .then(data => { setProducts((data ?? []).map(normalise).filter(p => p.is_visible)); setError(''); })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [category]);
  return { products, loading, error };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  useEffect(() => {
    if (!id) { setLoading(false); setProduct(null); return; }
    setLoading(true);
    publicGet('products', { id: `eq.${id}`, limit: '1' })
      .then(data => { const raw = data?.[0] ?? null; setProduct(raw ? normalise(raw) : null); setError(''); })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);
  return { product, loading, error };
}

export function useFeaturedProducts() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [featured, setFeatured]       = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  useEffect(() => {
    setLoading(true);
    Promise.all([
      publicGet('products', { is_new_arrival: 'eq.true', order: 'created_at.desc', limit: '8' }),
      publicGet('products', { is_best_seller: 'eq.true', order: 'created_at.desc', limit: '8' }),
      publicGet('products', { is_featured:    'eq.true', order: 'created_at.desc', limit: '8' }),
    ]).then(([na, bs, ft]) => {
      const vis = (arr: Record<string, unknown>[]) => arr.map(normalise).filter(p => p.is_visible);
      setNewArrivals(vis(na ?? [])); setBestSellers(vis(bs ?? [])); setFeatured(vis(ft ?? []));
    }).finally(() => setLoading(false));
  }, []);
  return { newArrivals, bestSellers, featured, loading };
}

export function useProductSearch(query: string) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    publicGet('products', { name: `ilike.*${query}*`, order: 'created_at.desc', limit: '20' })
      .then(data => setResults((data ?? []).map(normalise).filter(p => p.is_visible)))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query]);
  return { results, loading };
}