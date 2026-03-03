// src/admin/hooks/useAdminData.ts
import { useState, useEffect, useCallback } from 'react';
import { getTable, uploadImage } from '../lib/supabase';
import { useAdminAuth } from '../lib/AdminAuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DBProduct {
  id: string;
  name: string;
  category: string;
  fabric: string;
  price: number;
  discount_price: number | null;
  stock: number;
  colors: string[];
  images: string[];
  description: string;
  saree_fabric: string;
  saree_length: string;
  blouse_length: string;
  blouse_fabric: string;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_featured: boolean;
  rating: number;
  review_count: number;
  created_at?: string;
}

export interface DBBanner {
  id: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

export interface DBInquiry {
  id: string;
  customer_name: string;
  customer_phone: string;
  product_id: string | null;
  product_name: string | null;
  message: string;
  status: 'new' | 'seen' | 'replied';
  created_at: string;
}

export interface DBSettings {
  id: string;
  key: string;
  value: string;
}

// ─── Products hook ─────────────────────────────────────────────────────────────

export function useProducts() {
  const { session } = useAdminAuth();
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const table = getTable('products', session?.access_token);
      const data = await table.select({ order: { column: 'created_at', ascending: false } });
      setProducts(data || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { fetch(); }, [fetch]);

  const addProduct = async (product: Omit<DBProduct, 'id' | 'created_at'>) => {
    const table = getTable('products', session?.access_token);
    const [created] = await table.insert(product as Record<string, unknown>);
    setProducts((prev) => [created, ...prev]);
    return created;
  };

  const updateProduct = async (id: string, updates: Partial<DBProduct>) => {
    const table = getTable('products', session?.access_token);
    await table.update(id, updates as Record<string, unknown>);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProduct = async (id: string) => {
    const table = getTable('products', session?.access_token);
    await table.delete(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateStock = async (id: string, stock: number) => {
    await updateProduct(id, { stock });
  };

  const uploadProductImage = async (file: File, productId: string, index: number): Promise<string> => {
    if (!session) throw new Error('Not authenticated');
    const ext = file.name.split('.').pop();
    const path = `products/${productId}/${index}.${ext}`;
    return uploadImage('product-images', path, file, session.access_token);
  };

  return { products, loading, error, refresh: fetch, addProduct, updateProduct, deleteProduct, updateStock, uploadProductImage };
}

// ─── Banners hook ─────────────────────────────────────────────────────────────

export function useBanners() {
  const { session } = useAdminAuth();
  const [banners, setBanners] = useState<DBBanner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const table = getTable('banners', session?.access_token);
      const data = await table.select({ order: { column: 'sort_order', ascending: true } });
      setBanners(data || []);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateBanner = async (id: string, updates: Partial<DBBanner>) => {
    const table = getTable('banners', session?.access_token);
    await table.update(id, updates as Record<string, unknown>);
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const uploadBannerImage = async (file: File, bannerId: string): Promise<string> => {
    if (!session) throw new Error('Not authenticated');
    const ext = file.name.split('.').pop();
    const path = `banners/${bannerId}.${ext}`;
    return uploadImage('banner-images', path, file, session.access_token);
  };

  return { banners, loading, refresh: fetch, updateBanner, uploadBannerImage };
}

// ─── Inquiries hook ───────────────────────────────────────────────────────────

export function useInquiries() {
  const { session } = useAdminAuth();
  const [inquiries, setInquiries] = useState<DBInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const table = getTable('inquiries', session?.access_token);
      const data = await table.select({ order: { column: 'created_at', ascending: false } });
      setInquiries(data || []);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { fetch(); }, [fetch]);

  const markSeen = async (id: string) => {
    const table = getTable('inquiries', session?.access_token);
    await table.update(id, { status: 'seen' });
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'seen' as const } : i)));
  };

  const markReplied = async (id: string) => {
    const table = getTable('inquiries', session?.access_token);
    await table.update(id, { status: 'replied' });
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'replied' as const } : i)));
  };

  const newCount = inquiries.filter((i) => i.status === 'new').length;

  return { inquiries, loading, refresh: fetch, markSeen, markReplied, newCount };
}

// ─── Settings hook ────────────────────────────────────────────────────────────

export function useSettings() {
  const { session } = useAdminAuth();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const table = getTable('settings', session?.access_token);
      const data: DBSettings[] = await table.select();
      const map: Record<string, string> = {};
      (data || []).forEach((s) => { map[s.key] = s.value; });
      setSettings(map);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { fetch(); }, [fetch]);

  const saveSetting = async (key: string, value: string) => {
    const table = getTable('settings', session?.access_token);
    // Upsert: delete then insert (simple approach without upsert header)
    const existing = settings[key];
    if (existing !== undefined) {
      const all: DBSettings[] = await getTable('settings', session?.access_token).select();
      const row = all.find((s) => s.key === key);
      if (row) await table.update(row.id, { value });
    } else {
      await table.insert({ key, value } as Record<string, unknown>);
    }
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return { settings, loading, refresh: fetch, saveSetting };
}
