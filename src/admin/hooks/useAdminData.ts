// src/admin/hooks/useAdminData.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { dbSelect, dbInsert, dbUpdate, dbDelete, uploadImage, publicFetch, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';
import { useAdminAuth } from '../lib/AdminAuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductSpec {
  key:   string;
  value: string;
}

export interface DBProduct {
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
  specifications: ProductSpec[];
  policy_points:  string[];
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_featured:    boolean;
  show_rating:    boolean;
  rating:         number;
  review_count:   number;
  is_visible:     boolean;
  show_colors:    boolean;
  washing_instructions: string[];
  created_at?:    string;
}

export interface DBBanner {
  id:         string;
  title:      string;
  subtitle:   string;
  eyebrow:    string;
  cta_text:   string;
  cta_link:   string;
  image_url:  string;
  sort_order: number;
  is_active:  boolean;
}

export interface DBInquiry {
  id:             string;
  customer_name:  string;
  customer_phone: string;
  customer_email: string | null;
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

export interface DBPolicy {
  id:          string;
  title:       string;
  content:     string[];
  sort_order:  number;
  is_active:   boolean;
  updated_at?: string;
}

// ─── Helper: generate a unique file path ──────────────────────────────────────
const uniquePath = (prefix: string, index: number, file: File): string => {
  const ext  = file.name.split('.').pop() ?? 'jpg';
  const slug = `${prefix}_${index}_${Date.now()}`;
  return `${slug}.${ext}`;
};

// ─── Helper: delete a file from Supabase storage by its public URL ────────────
const deleteStorageFile = async (
  bucket: string,
  publicUrl: string,
  token: string
): Promise<void> => {
  try {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const oldPath = publicUrl.split(marker)[1];
    if (!oldPath) return;
    await fetch(
      `${SUPABASE_URL}/storage/v1/object/${bucket}/${oldPath}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  } catch (e) {
    // Non-fatal — log and continue
    console.warn(`[deleteStorageFile] Could not delete from ${bucket}:`, e);
  }
};

// ─── Auto product ID generator ───────────────────────────────────────────────
export function generateProductId(): string {
  const date = new Date();
  const dateStr = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `WW-${dateStr}-${rand}`;
}

// ─── Date formatter ───────────────────────────────────────────────────────────
export function formatAddedDate(isoString?: string): { date: string; time: string } | null {
  if (!isoString) return null;
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return null;
  return {
    date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
  };
}

// ─── Products ─────────────────────────────────────────────────────────────────

export function useProducts() {
  const { session } = useAdminAuth();
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const isSavingRef = useRef(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const token = session?.access_token;
      const raw = token
        ? await dbSelect<DBProduct>('products', token, { order: 'created_at.desc' })
        : await publicFetch<DBProduct>('products', { order: 'created_at.desc' });

      const normalised = (raw ?? []).map(p => ({
        ...p,
        specifications: Array.isArray(p.specifications)
          ? p.specifications
          : (() => {
              try {
                const parsed = JSON.parse(p.specifications as unknown as string);
                return Array.isArray(parsed) ? parsed : [];
              } catch (err) {
                console.warn(`[useProducts] Failed to parse specifications for product ${p.id}:`, err);
                return [];
              }
            })(),
        show_rating: p.show_rating ?? false,
        is_visible:  p.is_visible  ?? true,
        show_colors: p.show_colors ?? true,
      }));

      setProducts(normalised);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { refresh(); }, [refresh]);

  // ✅ FIX: Delete old image at each slot before uploading the new one.
  // This prevents stale JPG/PNG files accumulating in storage every time
  // a product is edited and re-saved with new images.
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
        if (!file) return;

        // Delete old image at this slot before uploading replacement
        const oldUrl = finalUrls[i];
        if (oldUrl) {
          await deleteStorageFile('product-images', oldUrl, session.access_token);
        }

        const path   = `products/${productId}/${uniquePath('img', i, file)}`;
        const pubUrl = await uploadImage('product-images', path, file, session.access_token);
        finalUrls[i] = pubUrl;
      })
    );

    return finalUrls.filter(Boolean);
  };

  const addProduct = async (
    product: Omit<DBProduct, 'id' | 'created_at'>,
    pendingFiles: (File | null)[]
  ): Promise<DBProduct> => {
    if (!session) throw new Error('Not authenticated');

    if (isSavingRef.current) throw new Error('Save already in progress — please wait.');
    isSavingRef.current = true;

    try {
      const autoId = generateProductId();
      const [created] = await dbInsert<DBProduct>('products', session.access_token, {
        ...product,
        id: autoId,
        images: [],
      });
      const imageUrls = await uploadProductImages(created.id, pendingFiles, []);
      const [updated] = await dbUpdate<DBProduct>('products', session.access_token, created.id, { images: imageUrls });
      setProducts((prev) => [updated, ...prev]);
      return updated;
    } finally {
      isSavingRef.current = false;
    }
  };

  const updateProduct = async (
    id: string,
    updates: Partial<DBProduct>,
    pendingFiles?: (File | null)[]
  ): Promise<void> => {
    if (!session) throw new Error('Not authenticated');
    let finalUpdates = { ...updates };
    if (pendingFiles && pendingFiles.some(Boolean)) {
      const existing  = updates.images ?? products.find((p) => p.id === id)?.images ?? [];
      const imageUrls = await uploadProductImages(id, pendingFiles, existing);
      finalUpdates    = { ...finalUpdates, images: imageUrls };
    }
    await dbUpdate<DBProduct>('products', session.access_token, id, finalUpdates);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...finalUpdates } : p)));
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
      setBanners((data ?? []).map(b => ({ ...b, eyebrow: b.eyebrow ?? '' })));
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

  // ✅ FIX: Delete old banner image before uploading the new one.
  // Previously, every banner image update left the old file in storage.
  const uploadBannerImage = async (id: string, file: File): Promise<string> => {
    if (!session) throw new Error('Not authenticated');

    // Delete old banner image if one exists
    const existingBanner = banners.find(b => b.id === id);
    if (existingBanner?.image_url) {
      await deleteStorageFile('banner-images', existingBanner.image_url, session.access_token);
    }

    const ext    = file.name.split('.').pop() ?? 'jpg';
    const path   = `banners/${id}_${Date.now()}.${ext}`;
    const pubUrl = await uploadImage('banner-images', path, file, session.access_token);
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
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
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
    const rows = await dbSelect<DBSettings>('settings', session.access_token);
    const existing = rows.find((s) => s.key === key);
    if (existing) {
      await dbUpdate<DBSettings>('settings', session.access_token, existing.id, { value });
    } else {
      await dbInsert<DBSettings>('settings', session.access_token, { key, value });
    }
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return { settings, loading, refresh, saveSetting };
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useCategories() {
  const { session } = useAdminAuth();
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const enrichWithProductCount = useCallback(
    (cats: DBCategory[], products: DBProduct[]): DBCategory[] => {
      if (!products.length) return cats;
      return cats.map(cat => ({
        ...cat,
        count: products.filter(p => p.category === cat.id && (p.is_visible ?? true)).length,
      }));
    },
    []
  );

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

  // ✅ FIX: Delete old category image before uploading the new one.
  const updateCategory = async (
    id: string,
    updates: Partial<DBCategory>,
    imageFile?: File | null
  ): Promise<void> => {
    if (!session) throw new Error('Not authenticated');
    let finalUpdates = { ...updates };
    if (imageFile) {
      // Delete old category image if one exists
      const existingCat = categories.find(c => c.id === id);
      if (existingCat?.image) {
        await deleteStorageFile('category-images', existingCat.image, session.access_token);
      }

      const ext  = imageFile.name.split('.').pop() ?? 'jpg';
      const path = `categories/${id}_${Date.now()}.${ext}`;
      finalUpdates.image = await uploadImage('category-images', path, imageFile, session.access_token);
    }
    await dbUpdate<DBCategory>('categories', session.access_token, id, finalUpdates);
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...finalUpdates } : c)));
  };

  const deleteCategory = async (id: string): Promise<void> => {
    if (!session) throw new Error('Not authenticated');
    await dbDelete('categories', session.access_token, id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    categories, loading, error, refresh,
    addCategory, updateCategory, deleteCategory,
    enrichWithProductCount,
  };
}

// ─── Policies ─────────────────────────────────────────────────────────────────

export function usePolicies() {
  const { session } = useAdminAuth();
  const [policies, setPolicies] = useState<DBPolicy[]>([]);
  const [loading, setLoading]   = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = session
        ? await dbSelect<DBPolicy>('policies', session.access_token, { order: 'sort_order.asc' })
        : await publicFetch<DBPolicy>('policies', { order: 'sort_order.asc', is_active: 'eq.true' });
      setPolicies(
        (data ?? []).map((p) => ({
          ...p,
          content: Array.isArray(p.content)
            ? p.content
            : JSON.parse(p.content as unknown as string),
        }))
      );
    } catch {
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { refresh(); }, [refresh]);

  const updatePolicy = useCallback(async (
    id: string,
    updates: Partial<DBPolicy>
  ): Promise<void> => {
    if (!session) throw new Error('Not authenticated');
    await dbUpdate<DBPolicy>('policies', session.access_token, id, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
    await refresh();
  }, [session, refresh]);

  return { policies, loading, refresh, updatePolicy };
}