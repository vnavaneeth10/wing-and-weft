// src/admin/pages/AdminCategories.tsx
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import {
  AdminBtn, Field, inputCls, useAdminInputStyle,
  SingleImageUploader, Spinner, Toast, Badge, ConfirmDialog, useAdminTk,
} from '../components/AdminUI';
import { useAdminTheme } from '../lib/AdminThemeContext';
import { useCategories, DBCategory } from '../hooks/useAdminData';

type ToastState = { msg: string; type: 'success' | 'error' } | null;

const emptyForm = (): Omit<DBCategory, 'created_at'> => ({
  id: '', name: '', image: '', description: '', count: 0, sort_order: 1, is_active: true,
});

interface FormModalProps {
  initial: Omit<DBCategory, 'created_at'>;
  isEdit: boolean;
  saving: boolean;
  onSave: (data: Omit<DBCategory, 'created_at'>, file: File | null) => void;
  onClose: () => void;
}

const FormModal: React.FC<FormModalProps> = ({ initial, isEdit, saving, onSave, onClose }) => {
  const tk = useAdminTk();
  const is = useAdminInputStyle();
  const { isDarkAdmin } = useAdminTheme();
  const [form, setForm] = useState({ ...initial });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [urlMode, setUrlMode] = useState(!initial.image.startsWith('blob:'));
  const set = (key: keyof typeof form, val: unknown) => setForm(p => ({ ...p, [key]: val }));
  const handleImage = (_url: string, file?: File) => { if (file) { setImageFile(file); set('image', URL.createObjectURL(file)); } };
  const valid = form.name.trim() && form.id.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden transition-colors duration-300"
        style={{ background: tk.modalBg, border: `1px solid ${tk.borderMed}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: tk.border }}>
          <h2 className="font-semibold text-lg" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>
            {isEdit ? 'Edit Category' : 'New Category'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: tk.textMuted }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Image toggle */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.12em', color: tk.textLabel }}>
                Category Image
              </label>
              <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${tk.borderMed}` }}>
                {['Upload File', 'Paste URL'].map((label, i) => {
                  const active = i === 0 ? !urlMode : urlMode;
                  return (
                    <button key={label} onClick={() => setUrlMode(i === 1)}
                      className="px-3 py-1.5 text-xs font-semibold transition-all"
                      style={{
                        background: active ? 'rgba(188,61,62,0.3)' : 'transparent',
                        color: active ? '#fff' : tk.textMuted,
                        fontFamily: '"Raleway", sans-serif',
                      }}>{label}</button>
                  );
                })}
              </div>
            </div>
            {urlMode ? (
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <input className={inputCls} style={is} placeholder="https://your-image-url.com/image.jpg"
                    value={form.image} onChange={e => { set('image', e.target.value); setImageFile(null); }} />
                </div>
                {form.image && (
                  <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0" style={{ border: `1px solid ${tk.border}` }}>
                    <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ) : (
              <div style={{ maxWidth: '240px' }}>
                <SingleImageUploader value={form.image} onChange={handleImage} label="Category Image" aspectRatio="3/4" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category Name" required>
              <input className={inputCls} style={is} placeholder="e.g. Silk Sarees" value={form.name}
                onChange={e => { set('name', e.target.value); if (!isEdit) set('id', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')); }} />
            </Field>
            <Field label="Category ID (URL slug)" required hint="Used in the URL — e.g. 'silk-sarees'">
              <input className={inputCls} style={is} placeholder="silk-sarees" value={form.id} disabled={isEdit}
                onChange={e => set('id', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))} />
            </Field>
          </div>

          <Field label="Description">
            <textarea rows={2} className={inputCls} style={{ ...is, resize: 'none' }}
              placeholder="e.g. Pure and blended silk sarees with intricate weaves"
              value={form.description} onChange={e => set('description', e.target.value)} />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Saree Count" hint="Shown on the category card">
              <input type="number" min={0} className={inputCls} style={is} placeholder="0"
                value={form.count} onChange={e => set('count', Number(e.target.value))} />
            </Field>
            <Field label="Sort Order" hint="Lower = shown first">
              <input type="number" min={1} className={inputCls} style={is} placeholder="1"
                value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))} />
            </Field>
            <Field label="Visible on Website">
              <button onClick={() => set('is_active', !form.is_active)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: form.is_active ? 'rgba(34,197,94,0.1)' : isDarkAdmin ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${form.is_active ? 'rgba(34,197,94,0.3)' : tk.border}`,
                  color: form.is_active ? '#4ade80' : tk.textMuted,
                  fontFamily: '"Raleway", sans-serif',
                }}>
                {form.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                {form.is_active ? 'Visible' : 'Hidden'}
              </button>
            </Field>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-end gap-3 flex-shrink-0" style={{ borderColor: tk.border }}>
          <AdminBtn variant="secondary" onClick={onClose}>Cancel</AdminBtn>
          <AdminBtn icon={<Save size={14} />} loading={saving} disabled={!valid} onClick={() => onSave(form, imageFile)}>
            {isEdit ? 'Save Changes' : 'Create Category'}
          </AdminBtn>
        </div>
      </div>
    </div>
  );
};

const AdminCategories: React.FC = () => {
  const tk = useAdminTk();
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<DBCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DBCategory | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = (msg: string, type: 'success' | 'error') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleSave = async (data: Omit<DBCategory, 'created_at'>, file: File | null) => {
    setSaving(true);
    try {
      if (editTarget) { await updateCategory(editTarget.id, data, file); showToast('Category updated!', 'success'); }
      else { await addCategory(data, file); showToast('Category created!', 'success'); }
      setShowForm(false); setEditTarget(null);
    } catch (e) { showToast(e instanceof Error ? e.message : 'Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    try { await deleteCategory(confirmDelete.id); showToast('Category deleted', 'success'); }
    catch { showToast('Failed to delete category', 'error'); }
    finally { setDeletingId(null); setConfirmDelete(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>Categories</h1>
          <p className="text-sm mt-0.5" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>
            Manage the saree categories shown on the homepage and navigation
          </p>
        </div>
        <AdminBtn icon={<Plus size={16} />} onClick={() => { setEditTarget(null); setShowForm(true); }}>Add Category</AdminBtn>
      </div>

      <div className="flex items-start gap-3 px-5 py-4 rounded-xl" style={{ background: 'rgba(182,137,60,0.08)', border: '1px solid rgba(182,137,60,0.2)' }}>
        <p className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>
          <span className="text-brand-gold font-semibold">Tip:</span> The Category ID becomes the URL slug (e.g. <code className="text-brand-orange">silk-sarees</code> → <code className="text-brand-orange">/category/silk-sarees</code>). Keep it lowercase with hyphens. Once created, the ID cannot be changed.
        </p>
      </div>

      {loading ? <Spinner /> : (
        <div className="rounded-2xl overflow-hidden transition-colors duration-300" style={{ background: tk.cardBg, border: `1px solid ${tk.border}` }}>
          {/* Table header */}
          <div className="grid gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider"
            style={{ gridTemplateColumns: '56px 1fr 1fr 80px 80px 80px 100px', fontFamily: '"Raleway", sans-serif', borderColor: tk.border, color: tk.textMuted }}>
            <span>Image</span><span>Name</span><span>Description</span>
            <span>Count</span><span>Order</span><span>Status</span><span>Actions</span>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>
                No categories yet. Click "Add Category" to create your first one.
              </p>
            </div>
          ) : (
            <div>
              {categories.map(cat => (
                <div key={cat.id}
                  className="grid gap-4 px-5 py-4 items-center border-b transition-colors"
                  style={{ gridTemplateColumns: '56px 1fr 1fr 80px 80px 80px 100px', borderColor: tk.border }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = tk.cardBgHover}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
                  <div className="w-12 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ border: `1px solid ${tk.border}` }}>
                    {cat.image
                      ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center" style={{ background: tk.inputBg }}>
                          <span className="text-xs" style={{ color: tk.textMuted }}>No img</span>
                        </div>
                    }
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>{cat.name}</p>
                    <p className="text-xs mt-0.5" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>{cat.id}</p>
                  </div>
                  <p className="text-xs line-clamp-2" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>{cat.description || '—'}</p>
                  <span className="text-sm font-semibold text-center" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>{cat.count}</span>
                  <span className="text-sm text-center" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>{cat.sort_order}</span>
                  <div><Badge label={cat.is_active ? 'Visible' : 'Hidden'} color={cat.is_active ? 'green' : 'gray'} /></div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditTarget(cat); setShowForm(true); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ color: tk.textMuted }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = tk.textPrimary; (e.currentTarget as HTMLButtonElement).style.background = tk.cardBgHover; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = tk.textMuted; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setConfirmDelete(cat)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ color: tk.textMuted }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = tk.textMuted; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="px-5 py-4 border-t" style={{ borderColor: tk.border }}>
            <button onClick={() => { setEditTarget(null); setShowForm(true); }}
              className="flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>
              <Plus size={14} /> Add Category
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <FormModal initial={editTarget ? { ...editTarget } : emptyForm()} isEdit={!!editTarget}
          saving={saving} onSave={handleSave} onClose={() => { setShowForm(false); setEditTarget(null); }} />
      )}
      {confirmDelete && (
        <ConfirmDialog title={`Delete "${confirmDelete.name}"?`}
          message="This will remove the category from the website. Products in this category will not be deleted."
          onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} loading={deletingId === confirmDelete.id} />
      )}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
};

export default AdminCategories;