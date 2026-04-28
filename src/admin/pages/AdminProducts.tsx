// src/admin/pages/AdminProducts.tsx
import React, { useState, useMemo, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, ChevronDown, ChevronUp, Package, Download, FileDown, Eye, EyeOff, Star, Clock } from 'lucide-react';
import {
  AdminBtn, Badge, Modal, Field, inputCls, useAdminInputStyle,
  ConfirmDialog, MultiImageUploader, Spinner, EmptyState, Toast, useAdminTk,
} from '../components/AdminUI';
import { useProducts, useCategories, DBProduct, ProductSpec, formatAddedDate } from '../hooks/useAdminData';
import { exportToExcel, exportToPDF, downloadImage } from '../lib/adminExport';

const DEFAULT_POLICY_POINTS = [
  'Exchange accepted within 7 days of delivery.',
  'Product must be unused and in original packaging.',
  'Cancellation allowed within 12 hours of order placement.',
  'Refunds processed within 5–7 business days.',
  'Free shipping on orders above ₹2000.',
];

const DEFAULT_SPECS: ProductSpec[] = [
  { key: 'Saree Fabric', value: '' },
  { key: 'Saree Length', value: '' },
];

const EMPTY_PRODUCT: Omit<DBProduct, 'id' | 'created_at'> = {
  name: '', category: '', fabric: '',
  price: 0, discount_price: null, stock: 10, colors: ['#bc3d3e'], images: [],
  description: '',
  saree_fabric: '', saree_length: '6.0 meters', blouse_length: '', blouse_fabric: '',
  specifications: DEFAULT_SPECS,
  policy_points: [...DEFAULT_POLICY_POINTS],
  is_best_seller: false, is_new_arrival: true, is_featured: false,
  show_rating: false,
  rating: 0,
  review_count: 0,
  is_visible: true,
  show_colors: true,
  washing_instructions: [],
};

type ToastState = { msg: string; type: 'success' | 'error' } | null;

// ─── Tag badge styles ─────────────────────────────────────────────────────────
const TAG_STYLES = {
  new:      { bg: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.4)',  color: '#a5b4fc', dot: '#a5b4fc' },
  best:     { bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.4)',  color: '#fcd34d', dot: '#fcd34d' },
  featured: { bg: 'rgba(14,165,233,0.15)',  border: 'rgba(14,165,233,0.4)',  color: '#7dd3fc', dot: '#7dd3fc' },
} as const;

// ─── Stock badge with coloured dot indicator ──────────────────────────────────
const StockBadge: React.FC<{ stock: number }> = ({ stock }) => {
  const cfg =
    stock === 0  ? { dot: '#fca5a5', color: '#fca5a5', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   label: 'Out of Stock'       } :
    stock <= 3   ? { dot: '#fdba74', color: '#fdba74', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.3)',  label: `${stock} in stock`  } :
                   { dot: '#86efac', color: '#86efac', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)',   label: `${stock} in stock`  };
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, fontFamily: '"Raleway",sans-serif' }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

// ─── Tag badge with dot ───────────────────────────────────────────────────────
const TagBadge: React.FC<{ type: keyof typeof TAG_STYLES; label: string }> = ({ type, label }) => {
  const s = TAG_STYLES[type];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontFamily: '"Raleway",sans-serif' }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {label}
    </span>
  );
};

// ─── Download helper ──────────────────────────────────────────────────────────
const downloadImageFromUrl = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('fetch failed');
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

// ─── Collapsible section ──────────────────────────────────────────────────────
const CollapsibleSection: React.FC<{
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  tk: ReturnType<typeof useAdminTk>;
}> = ({ title, hint, defaultOpen = false, children, tk }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${tk.borderMed}` }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
        style={{ background: open ? 'rgba(188,61,62,0.06)' : tk.inputBg }}
      >
        <div>
          <span className="text-sm font-semibold" style={{ fontFamily: '"Raleway",sans-serif', color: tk.textPrimary }}>{title}</span>
          {hint && <span className="text-xs ml-2" style={{ color: tk.textMuted }}>{hint}</span>}
        </div>
        {open
          ? <ChevronUp size={14} style={{ color: tk.textMuted }} />
          : <ChevronDown size={14} style={{ color: tk.textMuted }} />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3" style={{ borderTop: `1px solid ${tk.border}` }}>
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Star picker ─────────────────────────────────────────────────────────────
const StarPicker: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          aria-label={`Set rating ${s}`}>
          <Star size={22}
            fill={s <= display ? '#b6893c' : 'none'}
            style={{ color: s <= display ? '#b6893c' : '#6b7280', transition: 'color 0.15s' }} />
        </button>
      ))}
      {value > 0 && (
        <button type="button" onClick={() => onChange(0)}
          className="text-xs ml-1" style={{ color: '#6b7280', fontFamily: '"Raleway",sans-serif' }}
          title="Clear rating">✕</button>
      )}
    </div>
  );
};

// ─── Single image card with download button ───────────────────────────────────
const ExistingImageItem: React.FC<{
  url: string;
  index: number;
  productId: string;
  tk: ReturnType<typeof useAdminTk>;
}> = ({ url, index, productId, tk }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    const ext = url.split('?')[0].split('.').pop() ?? 'jpg';
    await downloadImageFromUrl(url, `${productId}-img${index + 1}.${ext}`);
    setDownloading(false);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden flex-shrink-0"
      style={{ border: `1px solid ${tk.border}`, minWidth: 0 }}>
      <img src={url} alt={`Product image ${index + 1}`}
        className="w-full object-cover block" style={{ height: '88px' }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: 'rgba(0,0,0,0.55)' }}>
        <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: '"Raleway",sans-serif' }}>
          Image {index + 1}
        </span>
        <button type="button" onClick={handleDownload} disabled={downloading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{
            background: downloading ? 'rgba(182,137,60,0.5)' : '#b6893c',
            color: '#fff',
            fontFamily: '"Raleway",sans-serif',
            border: 'none',
            cursor: downloading ? 'wait' : 'pointer',
          }}>
          <Download size={11} />
          {downloading ? 'Saving…' : 'Download'}
        </button>
      </div>
    </div>
  );
};

// ─── Panel showing all saved images with download buttons ─────────────────────
const ExistingImagesPanel: React.FC<{
  images: string[];
  productId: string;
  tk: ReturnType<typeof useAdminTk>;
}> = ({ images, productId, tk }) => {
  const existingUrls = images.filter(Boolean);
  if (existingUrls.length === 0) return null;

  const handleDownloadAll = async () => {
    for (let i = 0; i < existingUrls.length; i++) {
      const ext = existingUrls[i].split('?')[0].split('.').pop() ?? 'jpg';
      await downloadImageFromUrl(existingUrls[i], `${productId}-img${i + 1}.${ext}`);
      if (i < existingUrls.length - 1) await new Promise(r => setTimeout(r, 450));
    }
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${tk.borderMed}` }}>
      <div className="px-4 py-2.5 flex items-center justify-between"
        style={{ background: 'rgba(182,137,60,0.08)', borderBottom: `1px solid ${tk.border}` }}>
        <div>
          <span className="text-xs font-bold" style={{ fontFamily: '"Raleway",sans-serif', color: '#b6893c' }}>
            📷 Current Images
          </span>
          <span className="text-xs ml-2" style={{ fontFamily: '"Raleway",sans-serif', color: tk.textMuted }}>
            hover any image to download
          </span>
        </div>
        <button type="button" onClick={handleDownloadAll}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{
            background: 'rgba(182,137,60,0.15)',
            border: '1px solid rgba(182,137,60,0.35)',
            color: '#b6893c',
            fontFamily: '"Raleway",sans-serif',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(182,137,60,0.28)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(182,137,60,0.15)'}>
          <Download size={12} />
          Download All
        </button>
      </div>
      <div className="p-3 flex gap-2">
        {existingUrls.map((url, i) => (
          <div key={`${productId}-img-${i}`} style={{ flex: '1 1 0', minWidth: 0 }}>
            <ExistingImageItem url={url} index={i} productId={productId} tk={tk} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const AdminProducts: React.FC = () => {
  const tk = useAdminTk();
  const is = useAdminInputStyle();
  const { products, loading, addProduct, updateProduct, deleteProduct, updateStock } = useProducts();
  const { categories: dbCategories } = useCategories();

  // ✅ FIX: Synchronous save guard in the UI layer — first defence against double-clicks
  // before the call even reaches useProducts' isSavingRef guard.
  const isSavingRef = useRef(false);

  const [search, setSearch]           = useState('');
  const [catFilter, setCatFilter]     = useState('all');
  const [tagFilter, setTagFilter]     = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  // ✅ Default sort: newest first
  const [sortCol, setSortCol]         = useState<keyof DBProduct>('created_at');
  const [sortAsc, setSortAsc]         = useState(false);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editProduct, setEditProduct] = useState<DBProduct | null>(null);
  const [form, setForm]               = useState<Omit<DBProduct, 'id' | 'created_at'>>(EMPTY_PRODUCT);
  const [pendingImages, setPendingImages] = useState<(File | null)[]>([null, null, null, null]);
  const [saving, setSaving]           = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DBProduct | null>(null);
  const [deleting, setDeleting]       = useState(false);
  const [inlineStockId, setInlineStockId] = useState<string | null>(null);
  const [inlineStockVal, setInlineStockVal] = useState(0);
  const [toast, setToast]             = useState<ToastState>(null);
  const [togglingId, setTogglingId]   = useState<string | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const categoryOptions = useMemo(() => dbCategories.filter(c => c.is_active), [dbCategories]);

  const displayed = useMemo(() => {
    let list = [...products];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q)
      );
    }
    if (catFilter !== 'all') list = list.filter(p => p.category === catFilter);
    if (tagFilter === 'new')      list = list.filter(p => p.is_new_arrival);
    if (tagFilter === 'best')     list = list.filter(p => p.is_best_seller);
    if (tagFilter === 'featured') list = list.filter(p => p.is_featured);
    if (stockFilter === 'out') list = list.filter(p => p.stock === 0);
    if (stockFilter === 'low') list = list.filter(p => p.stock > 0 && p.stock <= 3);
    list.sort((a, b) => {
      const av = a[sortCol] ?? '', bv = b[sortCol] ?? '';
      return av < bv ? (sortAsc ? -1 : 1) : av > bv ? (sortAsc ? 1 : -1) : 0;
    });
    return list;
  }, [products, search, catFilter, tagFilter, stockFilter, sortCol, sortAsc]);

  const openAdd = () => {
    setEditProduct(null);
    setForm({
      ...EMPTY_PRODUCT,
      category: categoryOptions[0]?.id ?? '',
      specifications: DEFAULT_SPECS.map(s => ({ ...s })),
    });
    setPendingImages([null, null, null, null]);
    setModalOpen(true);
  };

  const openEdit = (p: DBProduct) => {
    setEditProduct(p);
    setForm({
      name: p.name, category: p.category, fabric: p.fabric,
      price: p.price, discount_price: p.discount_price,
      stock: p.stock, colors: p.colors || ['#bc3d3e'],
      images: p.images || [], description: p.description,
      saree_fabric: p.saree_fabric, saree_length: p.saree_length,
      blouse_length: p.blouse_length, blouse_fabric: p.blouse_fabric,
      specifications: p.specifications?.length
        ? p.specifications : DEFAULT_SPECS.map(s => ({ ...s })),
      policy_points: p.policy_points?.length
        ? p.policy_points : [...DEFAULT_POLICY_POINTS],
      is_best_seller: p.is_best_seller, is_new_arrival: p.is_new_arrival,
      is_featured: p.is_featured,
      show_rating:  p.show_rating  ?? false,
      rating:       p.rating       ?? 0,
      review_count: p.review_count ?? 0,
      is_visible:   p.is_visible   ?? true,
      show_colors:  p.show_colors  ?? true,
      washing_instructions: p.washing_instructions || [],
    });
    setPendingImages([null, null, null, null]);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim())     { showToast('Product name is required', 'error'); return; }
    if (form.price <= 0)       { showToast('Price must be greater than 0', 'error'); return; }
    if (!form.category.trim()) { showToast('Please select a category', 'error'); return; }

    // ✅ FIX: Synchronous UI-layer guard — reject double-clicks before any async work.
    if (isSavingRef.current) { showToast('Already saving — please wait.', 'error'); return; }
    isSavingRef.current = true;

    const cleanedSpecs = form.specifications.filter(s => s.key.trim() || s.value.trim());
    const toSave = { ...form, specifications: cleanedSpecs };
    setSaving(true);
    try {
      if (editProduct) {
        await updateProduct(editProduct.id, toSave, pendingImages);
        showToast('Product updated successfully', 'success');
      } else {
        await addProduct(toSave, pendingImages);
        showToast('Product added successfully', 'success');
      }
      setModalOpen(false);
    } catch (e) { showToast(e instanceof Error ? e.message : 'Save failed', 'error'); }
    finally {
      setSaving(false);
      isSavingRef.current = false;
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      showToast('Product deleted', 'success');
    } catch { showToast('Delete failed', 'error'); }
    finally { setDeleting(false); }
  };

  // ✅ FIX: Only send the single field that changed — no full product spread,
  // no dummy file array. The image upload path in updateProduct is skipped
  // entirely when pendingFiles is undefined.
  const handleToggleVisibility = async (p: DBProduct) => {
    setTogglingId(p.id);
    try {
      await updateProduct(p.id, { is_visible: !p.is_visible });
      showToast(`Product ${!p.is_visible ? 'visible' : 'hidden'} on website`, 'success');
    } catch { showToast('Failed to update visibility', 'error'); }
    finally { setTogglingId(null); }
  };

  const saveInlineStock = async (id: string) => {
    try { await updateStock(id, inlineStockVal); showToast('Stock updated', 'success'); }
    catch { showToast('Failed to update stock', 'error'); }
    setInlineStockId(null);
  };

  const toggleSort = (col: keyof DBProduct) => {
    if (sortCol === col) setSortAsc(v => !v);
    else { setSortCol(col); setSortAsc(true); }
  };

  const SortIcon = ({ col }: { col: keyof DBProduct }) =>
    sortCol !== col
      ? <ChevronDown size={12} style={{ color: tk.textMuted }} />
      : sortAsc
        ? <ChevronUp size={12} className="text-brand-orange" />
        : <ChevronDown size={12} className="text-brand-orange" />;

  const addSpec = () =>
    setForm(f => ({ ...f, specifications: [...f.specifications, { key: '', value: '' }] }));
  const updateSpec = (idx: number, field: 'key' | 'value', val: string) =>
    setForm(f => {
      const updated = [...f.specifications];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...f, specifications: updated };
    });
  const removeSpec = (idx: number) =>
    setForm(f => ({ ...f, specifications: f.specifications.filter((_, i) => i !== idx) }));

  const addWashInstruction = () =>
    setForm(f => ({ ...f, washing_instructions: [...(f.washing_instructions || []), ''] }));
  const updateWashInstruction = (idx: number, val: string) =>
    setForm(f => {
      const updated = [...(f.washing_instructions || [])];
      updated[idx] = val;
      return { ...f, washing_instructions: updated };
    });
  const removeWashInstruction = (idx: number) =>
    setForm(f => ({ ...f, washing_instructions: (f.washing_instructions || []).filter((_, i) => i !== idx) }));

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>Products</h1>
          <p className="text-sm mt-0.5" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>
            {displayed.length} of {products.length} products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AdminBtn variant="secondary" icon={<Download size={14} />}
            onClick={() => exportToExcel(products.map(p => {
              const added = formatAddedDate(p.created_at);
              return {
                ID: p.id, Name: p.name, Category: p.category, Fabric: p.fabric,
                Price: p.price, 'Discount Price': p.discount_price ?? '',
                'Discount %': p.discount_price ? Math.round(((p.price - p.discount_price) / p.price) * 100) + '%' : '',
                Stock: p.stock, Visible: (p.is_visible ?? true) ? 'Yes' : 'No',
                Rating: p.show_rating ? p.rating : 'Hidden',
                'New Arrival': p.is_new_arrival ? 'Yes' : 'No',
                'Best Seller': p.is_best_seller ? 'Yes' : 'No',
                Featured: p.is_featured ? 'Yes' : 'No',
                'Added On': added ? `${added.date} ${added.time}` : '',
              };
            }), 'products')}
            className="text-xs py-2 px-3">Excel</AdminBtn>
          <AdminBtn variant="secondary" icon={<FileDown size={14} />}
            onClick={() => exportToPDF('Products',
              ['ID', 'Name', 'Category', 'Price', 'Discount', 'Stock', 'Visible', 'Added On'],
              products.map(p => {
                const added = formatAddedDate(p.created_at);
                return [
                  p.id, p.name, p.category,
                  `₹${p.price}`,
                  p.discount_price ? `₹${p.discount_price} (-${Math.round(((p.price - p.discount_price) / p.price) * 100)}%)` : '-',
                  p.stock, (p.is_visible ?? true) ? 'Yes' : 'No',
                  added ? added.date : '-',
                ];
              }),
              'products')}
            className="text-xs py-2 px-3">PDF</AdminBtn>
          <AdminBtn icon={<Plus size={16} />} onClick={openAdd} disabled={saving}>Add Product</AdminBtn>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="rounded-2xl p-4 flex flex-wrap gap-3 items-center transition-colors duration-300"
        style={{ background: tk.cardBg, border: `1px solid ${tk.border}` }}>
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: tk.textMuted }} />
          <input type="text" placeholder="Search by name, ID, fabric…" value={search}
            onChange={e => setSearch(e.target.value)}
            className={`${inputCls} pl-9`} style={is} />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className={`${inputCls} w-auto`} style={is} aria-label="Filter by category">
          <option value="all">All Categories</option>
          {categoryOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={tagFilter} onChange={e => setTagFilter(e.target.value)}
          className={`${inputCls} w-auto`} style={is} aria-label="Filter by tag">
          <option value="all">All Tags</option>
          <option value="new">New Arrivals</option>
          <option value="best">Best Sellers</option>
          <option value="featured">Featured</option>
        </select>
        <select value={stockFilter} onChange={e => setStockFilter(e.target.value)}
          className={`${inputCls} w-auto`} style={is} aria-label="Filter by stock">
          <option value="all">All Stock</option>
          <option value="out">Out of Stock</option>
          <option value="low">Low Stock (≤3)</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl overflow-hidden transition-colors duration-300"
        style={{ background: tk.cardBg, border: `1px solid ${tk.border}` }}>
        {loading ? <Spinner /> : displayed.length === 0 ? (
          <EmptyState message="No products found. Try adjusting filters or add a new product." icon={<Package />} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: tk.border }}>
                  {[
                    { label: 'Product',   col: 'name'       as keyof DBProduct },
                    { label: 'Category',  col: 'category'   as keyof DBProduct },
                    { label: 'Price',     col: 'price'      as keyof DBProduct },
                    { label: 'Stock',     col: 'stock'      as keyof DBProduct },
                    { label: 'Tags',      col: null },
                    { label: 'Visible',   col: null },
                    { label: 'Added On',  col: 'created_at' as keyof DBProduct },
                    { label: 'Actions',   col: null },
                  ].map(({ label, col }) => (
                    <th key={label}
                      className={`px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${col ? 'cursor-pointer' : ''}`}
                      style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}
                      onClick={col ? () => toggleSort(col) : undefined}>
                      <span className="flex items-center gap-1">{label}{col && <SortIcon col={col} />}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map(p => {
                  const isVisible = p.is_visible ?? true;
                  const rowDiscount = p.discount_price
                    ? Math.round(((p.price - p.discount_price) / p.price) * 100)
                    : 0;
                  const addedDate = formatAddedDate(p.created_at);
                  return (
                    <tr key={p.id} className="border-b transition-colors"
                      style={{ borderColor: tk.border, opacity: isVisible ? 1 : 0.55 }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = tk.cardBgHover}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>

                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                            style={{ background: tk.inputBg, border: `1px solid ${tk.border}` }}>
                            {p.images?.[0]
                              ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                              : <Package size={14} style={{ color: tk.textMuted }} />}
                          </div>
                          <div>
                            <p className="font-medium text-xs" style={{ fontFamily: '"Raleway",sans-serif', color: tk.textPrimary }}>{p.name}</p>
                            <p className="text-xs" style={{ fontFamily: '"Raleway",sans-serif', color: tk.textMuted }}>{p.id}</p>
                            {p.show_rating && p.rating > 0 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Star size={10} fill="#b6893c" style={{ color: '#b6893c' }} />
                                <span style={{ fontSize: '10px', color: '#b6893c', fontFamily: '"Raleway",sans-serif' }}>{p.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="text-xs capitalize" style={{ fontFamily: '"Raleway",sans-serif', color: tk.textSecondary }}>
                          {categoryOptions.find(c => c.id === p.category)?.name || p.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-bold text-brand-red" style={{ fontFamily: '"Raleway",sans-serif' }}>
                          ₹{(p.discount_price || p.price).toLocaleString()}
                        </span>
                        {p.discount_price && (
                          <>
                            <span className="text-xs line-through ml-1.5" style={{ fontFamily: '"Raleway",sans-serif', color: tk.textMuted }}>
                              ₹{p.price.toLocaleString()}
                            </span>
                            <span className="text-xs ml-1 font-bold" style={{ color: '#e05c1a', fontFamily: '"Raleway",sans-serif' }}>
                              -{rowDiscount}%
                            </span>
                          </>
                        )}
                      </td>

                      {/* Stock — improved badge with coloured dot */}
                      <td className="px-4 py-3">
                        {inlineStockId === p.id ? (
                          <div className="flex items-center gap-2">
                            <input type="number" min={0} value={inlineStockVal}
                              onChange={e => setInlineStockVal(Number(e.target.value))}
                              className="w-16 px-2 py-1 rounded-lg text-xs outline-none"
                              style={{ background: tk.inputBg, border: '1px solid rgba(188,61,62,0.4)', color: tk.textPrimary }}
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveInlineStock(p.id);
                                if (e.key === 'Escape') setInlineStockId(null);
                              }} />
                            <button onClick={() => saveInlineStock(p.id)} className="text-green-400 text-xs">✓</button>
                            <button onClick={() => setInlineStockId(null)} className="text-xs" style={{ color: tk.textMuted }}>✕</button>
                          </div>
                        ) : (
                          <button onClick={() => { setInlineStockId(p.id); setInlineStockVal(p.stock); }}
                            className="flex items-center gap-1.5 group" title="Click to edit stock">
                            <StockBadge stock={p.stock} />
                            <Edit2 size={10} style={{ color: tk.textMuted }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        )}
                      </td>

                      {/* Tags — improved badges with coloured dots */}
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {p.is_new_arrival  && <TagBadge type="new"      label="New"      />}
                          {p.is_best_seller  && <TagBadge type="best"     label="Best"     />}
                          {p.is_featured     && <TagBadge type="featured" label="Featured" />}
                        </div>
                      </td>

                      {/* Visible */}
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleVisibility(p)}
                          disabled={togglingId === p.id}
                          title={isVisible ? 'Visible — click to hide' : 'Hidden — click to show'}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={{
                            background: isVisible ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${isVisible ? 'rgba(34,197,94,0.3)' : tk.border}`,
                            color: isVisible ? '#4ade80' : tk.textMuted,
                            opacity: togglingId === p.id ? 0.5 : 1,
                            fontFamily: '"Raleway",sans-serif',
                          }}>
                          {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                          {isVisible ? 'Live' : 'Hidden'}
                        </button>
                      </td>

                      {/* Added On */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {addedDate ? (
                          <div>
                            <p className="text-xs font-medium" style={{ fontFamily: '"Raleway",sans-serif', color: tk.textSecondary }}>
                              {addedDate.date}
                            </p>
                            <p className="flex items-center gap-1 text-xs mt-0.5" style={{ color: tk.textMuted, fontFamily: '"Raleway",sans-serif' }}>
                              <Clock size={9} />
                              {addedDate.time}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: tk.textMuted }}>—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(p)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style={{ color: tk.textMuted }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = tk.textPrimary; (e.currentTarget as HTMLButtonElement).style.background = tk.cardBgHover; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = tk.textMuted; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                            title="Edit product">
                            <Edit2 size={14} />
                          </button>
                          {p.images?.[0] && (
                            <button onClick={() => downloadImage(p.images[0], `${p.id}-img1.jpg`)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                              style={{ color: tk.textMuted }}
                              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fcd34d'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(182,137,60,0.08)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = tk.textMuted; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                              title="Download main image">
                              <Download size={14} />
                            </button>
                          )}
                          <button onClick={() => setDeleteTarget(p)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style={{ color: tk.textMuted }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = tk.textMuted; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                            title="Delete product">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <Modal
          title={editProduct ? `Edit: ${editProduct.name}` : 'Add New Product'}
          onClose={() => setModalOpen(false)}
          wide
          footer={
            <>
              <AdminBtn variant="secondary" onClick={() => setModalOpen(false)}>Cancel</AdminBtn>
              <AdminBtn loading={saving} onClick={handleSave} disabled={saving}>
                {editProduct ? 'Save Changes' : 'Add Product'}
              </AdminBtn>
            </>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">

            {/* ── Left column ── */}
            <div className="space-y-4">

              <Field label="Product Name" required>
                <input className={inputCls} style={is} placeholder="e.g. Kanchipuram Royal Silk"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </Field>

              {!editProduct ? (
                <div className="px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(182,137,60,0.08)', border: '1px solid rgba(182,137,60,0.2)' }}>
                  <span style={{ fontSize: '0.7rem', fontFamily: '"Raleway",sans-serif', color: tk.textMuted }}>
                    🔑 ID auto-generated on save — <span style={{ fontFamily: 'monospace', color: tk.textSecondary }}>WW-YYYYMMDD-XXXX</span>
                  </span>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(182,137,60,0.06)', border: '1px solid rgba(182,137,60,0.15)' }}>
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span style={{ fontSize: '0.7rem', fontFamily: '"Raleway",sans-serif', color: tk.textMuted }}>
                      🔑 ID: <span style={{ fontFamily: 'monospace', color: tk.textSecondary }}>{editProduct.id}</span>
                    </span>
                    {formatAddedDate(editProduct.created_at) && (() => {
                      const d = formatAddedDate(editProduct.created_at)!;
                      return (
                        <span style={{ fontSize: '0.7rem', fontFamily: '"Raleway",sans-serif', color: tk.textMuted }}>
                          🕐 Added {d.date} at {d.time}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              )}

              <Field label="Category" required>
                <select className={inputCls} style={is} value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="">— Select a category —</option>
                  {categoryOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>

              <Field label="Fabric" required hint="e.g. Pure Silk, Handloom Cotton…">
                <input className={inputCls} style={is} placeholder="e.g. Pure Silk, Handloom Cotton…"
                  value={form.fabric}
                  onChange={e => setForm(f => ({ ...f, fabric: e.target.value }))} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Original Price (₹)" required>
                  <input type="number" min={0} className={inputCls} style={is} placeholder="5000"
                    value={form.price || ''}
                    onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
                </Field>
                <Field label="Discounted Price (₹)" hint="Leave blank if no discount">
                  <input type="number" min={0} className={inputCls} style={is} placeholder="4200"
                    value={form.discount_price || ''}
                    onChange={e => setForm(f => ({ ...f, discount_price: e.target.value ? Number(e.target.value) : null }))} />
                </Field>
              </div>

              {form.discount_price && form.price > 0 && form.discount_price < form.price && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(224,92,26,0.08)', border: '1px solid rgba(224,92,26,0.25)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#e05c1a', fontFamily: '"Raleway",sans-serif' }}>
                    {Math.round(((form.price - form.discount_price) / form.price) * 100)}% OFF
                  </span>
                  <span style={{ fontSize: '0.72rem', color: tk.textMuted, fontFamily: '"Raleway",sans-serif' }}>
                    · Customer saves ₹{(form.price - form.discount_price).toLocaleString()}
                  </span>
                </div>
              )}

              <Field label="Stock Count" required>
                <input type="number" min={0} className={inputCls} style={is} placeholder="10"
                  value={form.stock}
                  onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} />
              </Field>

              <Field label="Description">
                <textarea rows={4} className={inputCls} style={{ ...is, resize: 'none' }}
                  placeholder="Detailed description…"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </Field>

              {/* ── Star Rating ── */}
              <CollapsibleSection title="Star Rating" hint="shown on product page" tk={tk}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ fontFamily: '"Raleway",sans-serif', color: tk.textSecondary }}>
                      Show rating on product page
                    </span>
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, show_rating: !f.show_rating }))}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: form.show_rating ? 'rgba(182,137,60,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${form.show_rating ? 'rgba(182,137,60,0.4)' : tk.border}`,
                        color: form.show_rating ? '#b6893c' : tk.textMuted,
                        fontFamily: '"Raleway",sans-serif',
                      }}>
                      <Star size={12} fill={form.show_rating ? '#b6893c' : 'none'}
                        style={{ color: form.show_rating ? '#b6893c' : tk.textMuted }} />
                      {form.show_rating ? 'Visible' : 'Hidden'}
                    </button>
                  </div>

                  <div style={{ opacity: form.show_rating ? 1 : 0.4, pointerEvents: form.show_rating ? 'auto' : 'none' }}>
                    <p className="text-xs mb-2" style={{ color: tk.textMuted, fontFamily: '"Raleway",sans-serif' }}>
                      Star rating (click to set)
                    </p>
                    <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                    <p className="text-xs mt-1" style={{ color: tk.textMuted, fontFamily: '"Raleway",sans-serif' }}>
                      Current: {form.rating > 0 ? `${form.rating} / 5` : 'Not set'}
                    </p>
                  </div>

                  <div style={{ opacity: form.show_rating ? 1 : 0.4, pointerEvents: form.show_rating ? 'auto' : 'none' }}>
                    <Field label="Number of Reviews" hint="Shown next to the stars">
                      <input type="number" min={0} className={inputCls} style={is} placeholder="0"
                        value={form.review_count || ''}
                        onChange={e => setForm(f => ({ ...f, review_count: Number(e.target.value) }))} />
                    </Field>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Visibility */}
              <Field label="Visible on Website">
                <button type="button"
                  onClick={() => setForm(f => ({ ...f, is_visible: !f.is_visible }))}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: form.is_visible ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${form.is_visible ? 'rgba(34,197,94,0.3)' : tk.border}`,
                    color: form.is_visible ? '#4ade80' : tk.textMuted,
                    fontFamily: '"Raleway",sans-serif',
                  }}>
                  {form.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  {form.is_visible ? 'Visible' : 'Hidden'}
                </button>
              </Field>

              {/* Tags */}
              <Field label="Tags">
                <div className="flex gap-3 flex-wrap">
                  {([
                    { key: 'is_new_arrival' as const, label: 'New Arrival', type: 'new'      as const },
                    { key: 'is_best_seller' as const, label: 'Best Seller', type: 'best'     as const },
                    { key: 'is_featured'    as const, label: 'Featured',    type: 'featured' as const },
                  ]).map(({ key, label, type }) => {
                    const s = TAG_STYLES[type];
                    return (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <div
                          className="w-4 h-4 rounded border flex items-center justify-center transition-all"
                          style={{
                            background: form[key] ? s.bg : 'transparent',
                            border: `1px solid ${form[key] ? s.border : tk.borderMed}`,
                          }}
                          onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                          role="checkbox" aria-checked={form[key]} aria-label={label}>
                          {form[key] && <span style={{ color: s.color, fontSize: '10px' }}>✓</span>}
                        </div>
                        <span className="text-sm" style={{ fontFamily: '"Raleway",sans-serif', color: tk.textSecondary }}>{label}</span>
                      </label>
                    );
                  })}
                </div>
              </Field>
            </div>

            {/* ── Right column ── */}
            <div className="space-y-4">

              {editProduct && (
                <ExistingImagesPanel
                  images={form.images}
                  productId={editProduct.id}
                  tk={tk}
                />
              )}

              <Field label="Product Images" hint="Upload up to 4 photos" required>
                <MultiImageUploader
                  values={form.images}
                  onChange={(urls, files) => {
                    setForm(f => ({ ...f, images: urls }));
                    setPendingImages(files);
                  }} />
              </Field>

              {/* ── Colours ── */}
              <CollapsibleSection title="Colours" hint="optional" tk={tk}>
                <p className="text-xs mb-3" style={{ color: tk.textMuted, fontFamily: '"Raleway",sans-serif' }}>
                  Add colour swatches and choose whether to show them on the product page.
                </p>
                <div className="flex items-center justify-between mb-4 pb-3"
                  style={{ borderBottom: `1px solid ${tk.border}` }}>
                  <span className="text-sm" style={{ fontFamily: '"Raleway",sans-serif', color: tk.textSecondary }}>
                    Show colours on product page
                  </span>
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, show_colors: !f.show_colors }))}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: form.show_colors ? 'rgba(188,61,62,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${form.show_colors ? 'rgba(188,61,62,0.4)' : tk.border}`,
                      color: form.show_colors ? '#bc3d3e' : tk.textMuted,
                      fontFamily: '"Raleway",sans-serif',
                    }}>
                    {form.show_colors ? <Eye size={12} /> : <EyeOff size={12} />}
                    {form.show_colors ? 'Visible' : 'Hidden'}
                  </button>
                </div>
                <div style={{ opacity: form.show_colors ? 1 : 0.4, pointerEvents: form.show_colors ? 'auto' : 'none' }}>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.colors.map((color, i) => (
                      <div key={i} className="relative group">
                        <input type="color" value={color}
                          onChange={e => {
                            const updated = [...form.colors];
                            updated[i] = e.target.value;
                            setForm(f => ({ ...f, colors: updated }));
                          }}
                          className="w-9 h-9 rounded-full cursor-pointer border-2"
                          style={{ borderColor: tk.borderMed, padding: '2px' }}
                          title={`Colour ${i + 1}`} />
                        {form.colors.length > 1 && (
                          <button type="button"
                            onClick={() => setForm(f => ({ ...f, colors: f.colors.filter((_, ci) => ci !== i) }))}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: '#ef4444', fontSize: '10px' }}>✕</button>
                        )}
                      </div>
                    ))}
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, colors: [...f.colors, '#bc3d3e'] }))}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xl transition-all"
                      style={{ border: `2px dashed ${tk.borderMed}`, color: tk.textMuted }}>+</button>
                  </div>
                </div>
              </CollapsibleSection>

              {/* ── Specifications ── */}
              <CollapsibleSection title="Specifications" hint="shown on product page" defaultOpen tk={tk}>
                <p className="text-xs mb-3" style={{ color: tk.textMuted, fontFamily: '"Raleway",sans-serif' }}>
                  Add any details — e.g. Saree Length, Fabric, Blouse Length.
                </p>
                {form.specifications.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-1 px-1">
                    <span className="text-xs font-semibold" style={{ color: tk.textMuted, fontFamily: '"Raleway",sans-serif' }}>Label</span>
                    <span className="text-xs font-semibold" style={{ color: tk.textMuted, fontFamily: '"Raleway",sans-serif' }}>Value</span>
                  </div>
                )}
                <div className="space-y-2">
                  {form.specifications.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input className={`${inputCls} flex-1 text-sm`} style={is}
                        value={spec.key} placeholder="e.g. Saree Length"
                        onChange={e => updateSpec(idx, 'key', e.target.value)} />
                      <input className={`${inputCls} flex-1 text-sm`} style={is}
                        value={spec.value} placeholder="e.g. 6.3 meters"
                        onChange={e => updateSpec(idx, 'value', e.target.value)} />
                      <button type="button" onClick={() => removeSpec(idx)}
                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ color: tk.textMuted }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = tk.textMuted; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addSpec}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all mt-1"
                    style={{ border: `1px dashed ${tk.borderMed}`, color: tk.textMuted, fontFamily: '"Raleway",sans-serif' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#b6893c'; (e.currentTarget as HTMLButtonElement).style.color = '#b6893c'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = tk.borderMed; (e.currentTarget as HTMLButtonElement).style.color = tk.textMuted; }}>
                    <Plus size={13} /> Add Row
                  </button>
                </div>
              </CollapsibleSection>

              {/* ── Washing Instructions ── */}
              <CollapsibleSection title="Washing Instructions" hint="optional" tk={tk}>
                <p className="text-xs mb-3" style={{ color: tk.textMuted, fontFamily: '"Raleway",sans-serif' }}>
                  Add care instructions — e.g. "Dry clean only".
                </p>
                <div className="space-y-2">
                  {(form.washing_instructions || []).map((instr, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-2"
                        style={{ background: 'rgba(14,165,233,0.12)', color: '#7dd3fc', fontFamily: '"Raleway",sans-serif' }}>
                        {idx + 1}
                      </span>
                      <input className={`${inputCls} flex-1 text-sm`} style={is}
                        value={instr} placeholder="e.g. Dry clean only"
                        onChange={e => updateWashInstruction(idx, e.target.value)} />
                      <button type="button" onClick={() => removeWashInstruction(idx)}
                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-1 transition-all"
                        style={{ color: tk.textMuted }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = tk.textMuted; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addWashInstruction}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all mt-1"
                    style={{ border: `1px dashed ${tk.borderMed}`, color: tk.textMuted, fontFamily: '"Raleway",sans-serif' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#7dd3fc'; (e.currentTarget as HTMLButtonElement).style.color = '#7dd3fc'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = tk.borderMed; (e.currentTarget as HTMLButtonElement).style.color = tk.textMuted; }}>
                    <Plus size={13} /> Add Instruction
                  </button>
                </div>
              </CollapsibleSection>

              {/* ── Policy Points ── */}
              <CollapsibleSection title="Policy Points" hint="shown on product page" defaultOpen tk={tk}>
                <div className="space-y-2">
                  {(form.policy_points || []).map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-2"
                        style={{ background: 'rgba(188,61,62,0.12)', color: '#bc3d3e', fontFamily: '"Raleway",sans-serif' }}>
                        {idx + 1}
                      </span>
                      <input className={`${inputCls} flex-1 text-sm`} style={is}
                        value={point} placeholder={`Policy point ${idx + 1}`}
                        onChange={e => {
                          const updated = [...(form.policy_points || [])];
                          updated[idx] = e.target.value;
                          setForm(f => ({ ...f, policy_points: updated }));
                        }} />
                      <button type="button"
                        onClick={() => setForm(f => ({ ...f, policy_points: (f.policy_points || []).filter((_, i) => i !== idx) }))}
                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-1 transition-all"
                        style={{ color: tk.textMuted }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = tk.textMuted; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, policy_points: [...(f.policy_points || []), ''] }))}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all mt-1"
                    style={{ border: `1px dashed ${tk.borderMed}`, color: tk.textMuted, fontFamily: '"Raleway",sans-serif' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#bc3d3e'; (e.currentTarget as HTMLButtonElement).style.color = '#bc3d3e'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = tk.borderMed; (e.currentTarget as HTMLButtonElement).style.color = tk.textMuted; }}>
                    <Plus size={13} /> Add Policy Point
                  </button>
                </div>
              </CollapsibleSection>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
      )}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
};

export default AdminProducts;