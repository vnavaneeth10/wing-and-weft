// src/hooks/index.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Product } from '../types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../admin/lib/supabase';

// ─── Debounce hook ────────────────────────────────────────────────────────────
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Search suggestions — live from Supabase products ────────────────────────
export function useSearchSuggestions(query: string): Product[] {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const q = debouncedQuery.trim().toLowerCase();

    const search = async () => {
      try {
        // Build URL manually — URLSearchParams encodes commas inside or() which breaks Supabase
        const encoded = encodeURIComponent(q);
        const url = `${SUPABASE_URL}/rest/v1/products`
          + `?or=(name.ilike.*${encoded}*,category.ilike.*${encoded}*,fabric.ilike.*${encoded}*)`
          + `&select=id,name,category,fabric,price,discount_price,images`
          + `&limit=6`;

        const res = await fetch(url,
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
        );
        if (!res.ok) return;
        const data: Product[] = await res.json();
        if (!cancelled) setSuggestions(data);
      } catch {
        // Silently fail — search suggestions are non-critical
      }
    };

    search();
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  return suggestions;
}

// ─── Scroll to top hook ───────────────────────────────────────────────────────
export function useScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { visible, scrollToTop };
}

// ─── Intersection observer hook for lazy animations ───────────────────────────
export function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}