// src/admin/hooks/useAdminData.ts
import { useState, useEffect, useCallback } from 'react';
import { dbSelect, dbInsert, dbUpdate, dbDelete, uploadImage, publicFetch } from '../lib/supabase';
import { useAdminAuth } from '../lib/AdminAuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DBProduct {
  id:             string;
  name:           string;
  category:       string;
  fabric:         string;
  price:          number;
  discount_price: number | null;
  stock:          number;
  colors:         string[];
  images:         string[];   // ← always full public URLs now
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

export interface DBBanner {
  id:         string;
  title:      string;
  subtitle:   string;
  cta_text:   string;
  cta_link:   string;
  image_url:  string;   // ← full public URL
  sort_order: number;
  is_active:  boolean;
}

export interface DBInquiry {
  id:             string;
  customer_name:  string;
  customer_phone: string;
  product_id:     string | null;
  product_name:   string | null;
  message:        string;
  status:         'new' | 'seen' | 'replied';
  created_at:     string;
}

export interface DBSettings {
  id:    string;
  key:   string;
  value: string;
}

// ─── Helper: generate a unique file path ──────────────────────────────────────
const uniquePath = (prefix: string, index: number, file: File): string => {
  const ext  = file.name.split('.').pop() ?? 'jpg';
  const slug = `${prefix}_${index}_${Date.now()}`;
  return `${slug}.${ext}`;
};

// ─── Products ─────────────────────────────────────────────────────────────────

export function useProducts() {
  const { session } = useAdminAuth();
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const token = session?.access_token;
      const data = token
        ? await dbSelect<DBProduct>('products', token, { order: 'created_at.desc' })
        : await publicFetch<DBProduct>('products', { order: 'created_at.desc' });
      setProducts(data ?? []);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { refresh(); }, [refresh]);

  // ── Upload images and return full public URLs ──────────────────────────────
  const uploadProductImages = async (
    productId: string,
    pendingFiles: (File | null)[],
    existingUrls: string[]
  ): Promise<string[]> => {
    if (!session) throw new Error('Not authenticated');
    const finalUrls = [...existingUrls];
    while (finalUrls.length < 4) finalUrls.push('');

    await Promise.all(
      pendingFiles.map(async (file, i) => {
        if (!file) return; // no new file for this slot → keep existing URL
        const path   = `products/${productId}/${uniquePath(`img`, i, file)}`;
        const pubUrl = await uploadImage('product-images', path, file, session.access_token);
        finalUrls[i] = pubUrl;  // ← full https://xxx.supabase.co/... URL
      })
    );

    return finalUrls.filter(Boolean); // remove empty slots
  };

  const addProduct = async (
    product: Omit<DBProduct, 'id' | 'created_at'>,
    pendingFiles: (File | null)[]
  ): Promise<DBProduct> => {
    if (!session) throw new Error('Not authenticated');

    // 1. Insert without images first to get the DB-generated ID
    const [created] = await dbInsert<DBProduct>('products', session.access_token, {
      ...product,
      images: [],
    });

    // 2. Upload images using the real product ID
    const imageUrls = await uploadProductImages(created.id, pendingFiles, []);

    // 3. Update the record with the full image URLs
    const [updated] = await dbUpdate<DBProduct>(
      'products', session.access_token, created.id, { images: imageUrls }
    );

    setProducts((prev) => [updated, ...prev]);
    return updated;
  };

  const updateProduct = async (
    id: string,
    updates: Partial<DBProduct>,
    pendingFiles?: (File | null)[]
  ): Promise<void> => {
    if (!session) throw new Error('Not authenticated');

    let finalUpdates = { ...updates };

    // If there are new image files, upload them and merge with existing URLs
    if (pendingFiles && pendingFiles.some(Boolean)) {
      const existing   = updates.images ?? products.find((p) => p.id === id)?.images ?? [];
      const imageUrls  = await uploadProductImages(id, pendingFiles, existing);
      finalUpdates     = { ...finalUpdates, images: imageUrls };
    }

    await dbUpdate<DBProduct>('products', session.access_token, id, finalUpdates);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...finalUpdates } : p))
    );
  };

  const deleteProduct = async (id: string): Promise<void> => {
    if (!session) throw new Error('Not authenticated');
    await dbDelete('products', session.access_token, id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateStock = async (id: string, stock: number): Promise<void> => {
    if (!session) throw new Error('Not authenticated');
    await dbUpdate<DBProduct>('products', session.access_token, id, { stock });
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock } : p)));
  };

  return {
    products, loading, error, refresh,
    addProduct, updateProduct, deleteProduct, updateStock,
  };
}

// ─── Banners ──────────────────────────────────────────────────────────────────

// REPLACE only the useBanners function in src/admin/hooks/useAdminData.ts
// The uploadBannerImage had (id, file) but was being called with (file, id) — now consistent

export function useBanners() {
  const { session } = useAdminAuth();
  const [banners, setBanners] = useState<DBBanner[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = session
        ? await dbSelect<DBBanner>('banners', session.access_token, { order: 'sort_order.asc' })
        : await publicFetch<DBBanner>('banners', { order: 'sort_order.asc', is_active: 'eq.true' });
      setBanners(data ?? []);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { refresh(); }, [refresh]);

  const updateBanner = async (id: string, updates: Partial<DBBanner>): Promise<void> => {
    if (!session) throw new Error('Not authenticated');
    await dbUpdate<DBBanner>('banners', session.access_token, id, updates);
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  // ✅ FIX: argument order is (id, file) — consistent with how AdminBanners.tsx calls it
  const uploadBannerImage = async (id: string, file: File): Promise<string> => {
    if (!session) throw new Error('Not authenticated');
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `banners/${id}_${Date.now()}.${ext}`;
    // Returns full public URL
    const pubUrl = await uploadImage('banner-images', path, file, session.access_token);
    // Save the URL to the database immediately
    await updateBanner(id, { image_url: pubUrl });
    return pubUrl;
  };

  return { banners, loading, refresh, updateBanner, uploadBannerImage };
}

// ─── Inquiries ────────────────────────────────────────────────────────────────

export function useInquiries() {
  const { session } = useAdminAuth();
  const [inquiries, setInquiries] = useState<DBInquiry[]>([]);
  const [loading, setLoading]     = useState(true);

  const refresh = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const data = await dbSelect<DBInquiry>('inquiries', session.access_token, {
        order: 'created_at.desc',
      });
      setInquiries(data ?? []);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { refresh(); }, [refresh]);

  const setStatus = async (id: string, status: DBInquiry['status']) => {
    if (!session) throw new Error('Not authenticated');
    await dbUpdate<DBInquiry>('inquiries', session.access_token, id, { status });
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
  };

  const newCount = inquiries.filter((i) => i.status === 'new').length;

  return {
    inquiries, loading, refresh,
    markSeen:    (id: string) => setStatus(id, 'seen'),
    markReplied: (id: string) => setStatus(id, 'replied'),
    newCount,
  };
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function useSettings() {
  const { session } = useAdminAuth();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // Settings are readable publicly (website needs them)
      const data: DBSettings[] = await publicFetch<DBSettings>('settings');
      const map: Record<string, string> = {};
      (data ?? []).forEach((s) => { map[s.key] = s.value; });
      setSettings(map);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const saveSetting = async (key: string, value: string): Promise<void> => {
    if (!session) throw new Error('Not authenticated');
    const all = await dbSelect<DBSettings>('settings', session.access_token);
    const existing = all.find((s) => s.key === key);
    if (existing) {
      await dbUpdate<DBSettings>('settings', session.access_token, existing.id, { value });
    } else {
      await dbInsert<DBSettings>('settings', session.access_token, { key, value });
    }
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return { settings, loading, refresh, saveSetting };
}

  // ─── ADD THIS to src/admin/hooks/useAdminData.ts ─────────────────────────────
// Paste this entire block at the bottom of the file, before the closing

export interface DBCategory {
  id:          string;
  name:        string;
  image:       string;
  description: string;
  count:       number;
  sort_order:  number;
  is_active:   boolean;
  created_at?: string;
}

export function useCategories() {
  const { session } = useAdminAuth();
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = session
        ? await dbSelect<DBCategory>('categories', session.access_token, { order: 'sort_order.asc' })
        : await publicFetch<DBCategory>('categories', { order: 'sort_order.asc', is_active: 'eq.true' });
      setCategories(data ?? []);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { refresh(); }, [refresh]);

  const addCategory = async (
    category: Omit<DBCategory, 'created_at'>,
    imageFile?: File | null
  ): Promise<DBCategory> => {
    if (!session) throw new Error('Not authenticated');
    let imageUrl = category.image;

    // Upload image file if provided
    if (imageFile) {
      const ext  = imageFile.name.split('.').pop() ?? 'jpg';
      const path = `categories/${category.id}_${Date.now()}.${ext}`;
      imageUrl   = await uploadImage('category-images', path, imageFile, session.access_token);
    }

    const [created] = await dbInsert<DBCategory>('categories', session.access_token, {
      ...category,
      image: imageUrl,
    });
    setCategories((prev) => [...prev, created].sort((a, b) => a.sort_order - b.sort_order));
    return created;
  };

  const updateCategory = async (
    id: string,
    updates: Partial<DBCategory>,
    imageFile?: File | null
  ): Promise<void> => {
    if (!session) throw new Error('Not authenticated');
    let finalUpdates = { ...updates };

    // Upload new image if provided
    if (imageFile) {
      const ext  = imageFile.name.split('.').pop() ?? 'jpg';
      const path = `categories/${id}_${Date.now()}.${ext}`;
      finalUpdates.image = await uploadImage('category-images', path, imageFile, session.access_token);
    }

    await dbUpdate<DBCategory>('categories', session.access_token, id, finalUpdates);
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...finalUpdates } : c))
    );
  };

  const deleteCategory = async (id: string): Promise<void> => {
    if (!session) throw new Error('Not authenticated');
    await dbDelete('categories', session.access_token, id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    categories, loading, error, refresh,
    addCategory, updateCategory, deleteCategory,
  };
}


