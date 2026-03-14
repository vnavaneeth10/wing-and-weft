// src/admin/pages/AdminProducts.tsx
import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, ChevronDown, ChevronUp, Package } from 'lucide-react';
import {
  AdminBtn, Badge, Modal, Field, inputCls, useAdminInputStyle,
  ConfirmDialog, MultiImageUploader, ColorPicker, Spinner, EmptyState, Toast, useAdminTk,
} from '../components/AdminUI';
import { useProducts, DBProduct } from '../hooks/useAdminData';

const CATEGORIES = [
  { id: 'silk-sarees', label: 'Silk Sarees' }, { id: 'cotton-sarees', label: 'Cotton Sarees' },
  { id: 'georgette-sarees', label: 'Georgette Sarees' }, { id: 'linen-sarees', label: 'Linen Sarees' },
  { id: 'chiffon-sarees', label: 'Chiffon Sarees' },
];

const FABRICS = ['Pure Silk', 'Banarasi Silk', 'Crepe Silk', 'Tussar Silk', 'Pure Cotton', 'Handloom Cotton', 'Tant Cotton', 'Ikat Cotton', 'Georgette', 'Pure Linen', 'Belgian Linen', 'Linen Silk', 'Chiffon'];

const EMPTY_PRODUCT: Omit<DBProduct, 'id' | 'created_at'> = {
  name: '', category: 'silk-sarees', fabric: 'Pure Silk',
  price: 0, discount_price: null, stock: 10, colors: ['#bc3d3e'], images: [], description: '',
  saree_fabric: '', saree_length: '6.0 meters', blouse_length: '0.8 meters', blouse_fabric: '',
  is_best_seller: false, is_new_arrival: true, is_featured: false, rating: 4.5, review_count: 0,
};

type ToastState = { msg: string; type: 'success' | 'error' } | null;

const AdminProducts: React.FC = () => {
  const tk = useAdminTk();
  const is = useAdminInputStyle();
  const { products, loading, addProduct, updateProduct, deleteProduct, updateStock } = useProducts();

  const [search, setSearch]           = useState('');
  const [catFilter, setCatFilter]     = useState('all');
  const [tagFilter, setTagFilter]     = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortCol, setSortCol]         = useState<keyof DBProduct>('name');
  const [sortAsc, setSortAsc]         = useState(true);
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

  const showToast = (msg: string, type: 'success' | 'error') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const displayed = useMemo(() => {
    let list = [...products];
    if (search) { const q = search.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(q) || p.id?.toLowerCase().includes(q) || p.fabric.toLowerCase().includes(q)); }
    if (catFilter !== 'all') list = list.filter(p => p.category === catFilter);
    if (tagFilter === 'new') list = list.filter(p => p.is_new_arrival);
    if (tagFilter === 'best') list = list.filter(p => p.is_best_seller);
    if (tagFilter === 'featured') list = list.filter(p => p.is_featured);
    if (stockFilter === 'out') list = list.filter(p => p.stock === 0);
    if (stockFilter === 'low') list = list.filter(p => p.stock > 0 && p.stock <= 3);
    list.sort((a, b) => { const av = a[sortCol] ?? '', bv = b[sortCol] ?? ''; return av < bv ? (sortAsc ? -1 : 1) : av > bv ? (sortAsc ? 1 : -1) : 0; });
    return list;
  }, [products, search, catFilter, tagFilter, stockFilter, sortCol, sortAsc]);

  const openAdd = () => { setEditProduct(null); setForm(EMPTY_PRODUCT); setPendingImages([null,null,null,null]); setModalOpen(true); };
  const openEdit = (p: DBProduct) => {
    setEditProduct(p);
    setForm({ name: p.name, category: p.category, fabric: p.fabric, price: p.price, discount_price: p.discount_price, stock: p.stock, colors: p.colors || ['#bc3d3e'], images: p.images || [], description: p.description, saree_fabric: p.saree_fabric, saree_length: p.saree_length, blouse_length: p.blouse_length, blouse_fabric: p.blouse_fabric, is_best_seller: p.is_best_seller, is_new_arrival: p.is_new_arrival, is_featured: p.is_featured, rating: p.rating, review_count: p.review_count });
    setPendingImages([null,null,null,null]); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Product name is required', 'error'); return; }
    if (form.price <= 0)   { showToast('Price must be greater than 0', 'error'); return; }
    setSaving(true);
    try {
      if (editProduct) { await updateProduct(editProduct.id, form, pendingImages); showToast('Product updated successfully', 'success'); }
      else             { await addProduct(form, pendingImages); showToast('Product added successfully', 'success'); }
      setModalOpen(false);
    } catch (e) { showToast(e instanceof Error ? e.message : 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await deleteProduct(deleteTarget.id); setDeleteTarget(null); showToast('Product deleted', 'success'); }
    catch { showToast('Delete failed', 'error'); }
    finally { setDeleting(false); }
  };

  const saveInlineStock = async (id: string) => {
    try { await updateStock(id, inlineStockVal); showToast('Stock updated', 'success'); }
    catch { showToast('Failed to update stock', 'error'); }
    setInlineStockId(null);
  };

  const toggleSort = (col: keyof DBProduct) => { if (sortCol === col) setSortAsc(v => !v); else { setSortCol(col); setSortAsc(true); } };

  const SortIcon = ({ col }: { col: keyof DBProduct }) => {
    if (sortCol !== col) return <ChevronDown size={12} style={{ color: tk.textMuted }} />;
    return sortAsc ? <ChevronUp size={12} className="text-brand-orange" /> : <ChevronDown size={12} className="text-brand-orange" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>Products</h1>
          <p className="text-sm mt-0.5" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>{displayed.length} of {products.length} products</p>
        </div>
        <AdminBtn icon={<Plus size={16} />} onClick={openAdd}>Add Product</AdminBtn>
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-4 flex flex-wrap gap-3 items-center transition-colors duration-300"
        style={{ background: tk.cardBg, border: `1px solid ${tk.border}` }}>
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: tk.textMuted }} />
          <input type="text" placeholder="Search by name, ID, fabric…" value={search} onChange={e => setSearch(e.target.value)}
            className={`${inputCls} pl-9`} style={is} />
        </div>
        {[
          { value: catFilter, onChange: setCatFilter, options: [['all', 'All Categories'], ...CATEGORIES.map(c => [c.id, c.label])], label: 'category' },
          { value: tagFilter, onChange: setTagFilter, options: [['all','All Tags'],['new','New Arrivals'],['best','Best Sellers'],['featured','Featured']], label: 'tag' },
          { value: stockFilter, onChange: setStockFilter, options: [['all','All Stock'],['out','Out of Stock'],['low','Low Stock (≤3)']], label: 'stock' },
        ].map(({ value, onChange, options, label }) => (
          <select key={label} value={value} onChange={e => onChange(e.target.value)}
            className={`${inputCls} w-auto`} style={is} aria-label={`Filter by ${label}`}>
            {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden transition-colors duration-300" style={{ background: tk.cardBg, border: `1px solid ${tk.border}` }}>
        {loading ? <Spinner /> : displayed.length === 0 ? (
          <EmptyState message="No products found. Try adjusting filters or add a new product." icon={<Package />} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: tk.border }}>
                  {[
                    { label: 'Product', col: 'name' as keyof DBProduct },
                    { label: 'Category', col: 'category' as keyof DBProduct },
                    { label: 'Price', col: 'price' as keyof DBProduct },
                    { label: 'Stock', col: 'stock' as keyof DBProduct },
                    { label: 'Tags', col: null },
                    { label: 'Actions', col: null },
                  ].map(({ label, col }) => (
                    <th key={label} className={`px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${col ? 'cursor-pointer' : ''}`}
                      style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.1em', color: tk.textMuted }}
                      onClick={col ? () => toggleSort(col) : undefined}>
                      <span className="flex items-center gap-1">{label}{col && <SortIcon col={col} />}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map(p => (
                  <tr key={p.id} className="border-b transition-colors" style={{ borderColor: tk.border }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = tk.cardBgHover}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ background: tk.inputBg }}>
                          {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            : <Package size={14} className="m-auto mt-2.5" style={{ color: tk.textMuted }} />}
                        </div>
                        <div>
                          <p className="font-medium text-xs" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>{p.name}</p>
                          <p className="text-xs" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs capitalize" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>
                        {CATEGORIES.find(c => c.id === p.category)?.label || p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-bold text-brand-red" style={{ fontFamily: '"Raleway", sans-serif' }}>
                        ₹{(p.discount_price || p.price).toLocaleString()}
                      </span>
                      {p.discount_price && <span className="text-xs line-through ml-1.5" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>₹{p.price.toLocaleString()}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {inlineStockId === p.id ? (
                        <div className="flex items-center gap-2">
                          <input type="number" min={0} value={inlineStockVal} onChange={e => setInlineStockVal(Number(e.target.value))}
                            className="w-16 px-2 py-1 rounded-lg text-xs outline-none focus:ring-1 focus:ring-brand-red/50"
                            style={{ background: tk.inputBg, border: '1px solid rgba(188,61,62,0.4)', color: tk.textPrimary, fontFamily: '"Raleway", sans-serif' }}
                            autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') saveInlineStock(p.id); if (e.key === 'Escape') setInlineStockId(null); }} />
                          <button onClick={() => saveInlineStock(p.id)} className="text-green-400 text-xs hover:text-green-300">✓</button>
                          <button onClick={() => setInlineStockId(null)} className="text-xs" style={{ color: tk.textMuted }}>✕</button>
                        </div>
                      ) : (
                        <button onClick={() => { setInlineStockId(p.id); setInlineStockVal(p.stock); }} className="flex items-center gap-1.5 group" title="Click to edit stock">
                          <Badge label={p.stock === 0 ? 'Out of Stock' : `${p.stock} in stock`} color={p.stock === 0 ? 'red' : p.stock <= 3 ? 'orange' : 'green'} />
                          <Edit2 size={10} style={{ color: tk.textMuted }} />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {p.is_new_arrival && <Badge label="New" color="green" />}
                        {p.is_best_seller && <Badge label="Best" color="gold" />}
                        {p.is_featured && <Badge label="Featured" color="blue" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                          style={{ color: tk.textMuted }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = tk.textPrimary; (e.currentTarget as HTMLButtonElement).style.background = tk.cardBgHover; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = tk.textMuted; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(p)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                          style={{ color: tk.textMuted }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = tk.textMuted; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <Modal title={editProduct ? `Edit: ${editProduct.name}` : 'Add New Product'} onClose={() => setModalOpen(false)} wide
          footer={<><AdminBtn variant="secondary" onClick={() => setModalOpen(false)}>Cancel</AdminBtn><AdminBtn loading={saving} onClick={handleSave}>{editProduct ? 'Save Changes' : 'Add Product'}</AdminBtn></>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div>
              <Field label="Product Name" required>
                <input className={inputCls} style={is} placeholder="e.g. Kanchipuram Royal Silk"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Category" required>
                  <select className={inputCls} style={is} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </Field>
                <Field label="Fabric" required>
                  <select className={inputCls} style={is} value={form.fabric} onChange={e => setForm(f => ({ ...f, fabric: e.target.value }))}>
                    {FABRICS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Original Price (₹)" required>
                  <input type="number" min={0} className={inputCls} style={is} placeholder="5000"
                    value={form.price || ''} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
                </Field>
                <Field label="Discounted Price (₹)" hint="Leave blank if no discount">
                  <input type="number" min={0} className={inputCls} style={is} placeholder="4200"
                    value={form.discount_price || ''} onChange={e => setForm(f => ({ ...f, discount_price: e.target.value ? Number(e.target.value) : null }))} />
                </Field>
              </div>
              <Field label="Stock Count" required>
                <input type="number" min={0} className={inputCls} style={is} placeholder="10"
                  value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} />
              </Field>
              <Field label="Description">
                <textarea rows={4} className={inputCls} style={{ ...is, resize: 'none' }} placeholder="Detailed description…"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </Field>
              <Field label="Colors">
                <ColorPicker colors={form.colors} onChange={colors => setForm(f => ({ ...f, colors }))} />
              </Field>
              <Field label="Tags">
                <div className="flex gap-3 flex-wrap">
                  {[
                    { key: 'is_new_arrival' as const, label: 'New Arrival' },
                    { key: 'is_best_seller' as const, label: 'Best Seller' },
                    { key: 'is_featured' as const, label: 'Featured' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${form[key] ? 'bg-brand-red border-brand-red' : ''}`}
                        style={{ borderColor: form[key] ? undefined : tk.borderMed }}
                        onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))} role="checkbox" aria-checked={form[key]} aria-label={label}>
                        {form[key] && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>{label}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>
            <div>
              <Field label="Product Images" hint="Upload 4 photos: main, side, detail, border" required>
                <MultiImageUploader values={form.images} onChange={(urls, files) => { setForm(f => ({ ...f, images: urls })); setPendingImages(files); }} />
              </Field>
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.12em', color: tk.textSecondary }}>
                  Specifications
                </p>
                <div className="space-y-3">
                  {[
                    { key: 'saree_fabric' as const, label: 'Saree Fabric', placeholder: 'Pure Mulberry Silk' },
                    { key: 'saree_length' as const, label: 'Saree Length', placeholder: '6.3 meters' },
                    { key: 'blouse_length' as const, label: 'Blouse Length', placeholder: '0.8 meters' },
                    { key: 'blouse_fabric' as const, label: 'Blouse Fabric', placeholder: 'Pure Silk' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key} className="flex items-center gap-3">
                      <label className="text-xs w-28 flex-shrink-0" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>{label}</label>
                      <input className={`${inputCls} flex-1`} style={is} placeholder={placeholder}
                        value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog title="Delete Product"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
      )}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
};

export default AdminProducts;