// src/hooks/useProducts.ts
// ✅ Use this hook in ALL customer-facing pages (HomePage, CategoryPage, ProductDetailPage)
// instead of importing from src/data/products.ts
// This fetches live data from Supabase so admin changes reflect on the website immediately.

import { useState, useEffect, useCallback } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../admin/lib/supabase';

// ─── Public product type (matches DB schema) ──────────────────────────────────
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
  rating:         number;
  review_count:   number;
  created_at?:    string;
}

// ─── Generic public fetch (no auth needed) ────────────────────────────────────
const publicGet = async <T>(
  table: string,
  params: Record<string, string> = {}
): Promise<T[]> => {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}${qs ? `?${qs}` : ''}`,
    {
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// ─── All products ─────────────────────────────────────────────────────────────
export function useAllProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await publicGet<Product>('products', { order: 'created_at.desc' });
      setProducts(data ?? []);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { products, loading, error, refresh: fetch };
}

// ─── Products by category ─────────────────────────────────────────────────────
export function useProductsByCategory(category: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    publicGet<Product>('products', {
      category: `eq.${category}`,
      order: 'created_at.desc',
    })
      .then((data) => { setProducts(data ?? []); setError(''); })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [category]);

  return { products, loading, error };
}

// ─── Single product by ID ─────────────────────────────────────────────────────
export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    publicGet<Product>('products', { id: `eq.${id}`, limit: '1' })
      .then((data) => { setProduct(data?.[0] ?? null); setError(''); })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  return { product, loading, error };
}

// ─── Featured / New Arrivals / Best Sellers ───────────────────────────────────
export function useFeaturedProducts() {
  const [newArrivals, setNewArrivals]   = useState<Product[]>([]);
  const [bestSellers, setBestSellers]   = useState<Product[]>([]);
  const [featured, setFeatured]         = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      publicGet<Product>('products', { is_new_arrival: 'eq.true', order: 'created_at.desc', limit: '8' }),
      publicGet<Product>('products', { is_best_seller: 'eq.true', order: 'created_at.desc', limit: '8' }),
      publicGet<Product>('products', { is_featured: 'eq.true',    order: 'created_at.desc', limit: '8' }),
    ])
      .then(([na, bs, ft]) => {
        setNewArrivals(na ?? []);
        setBestSellers(bs ?? []);
        setFeatured(ft ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  return { newArrivals, bestSellers, featured, loading };
}

// ─── Search ───────────────────────────────────────────────────────────────────
export function useProductSearch(query: string) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    // Supabase full-text search using ilike on name
    publicGet<Product>('products', {
      name: `ilike.*${query}*`,
      order: 'created_at.desc',
      limit: '20',
    })
      .then((data) => setResults(data ?? []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query]);

  return { results, loading };
}