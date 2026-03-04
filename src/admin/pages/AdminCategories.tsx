// src/admin/pages/AdminCategories.tsx
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, GripVertical, Eye, EyeOff } from 'lucide-react';
import {
  AdminBtn, Field, inputCls, inputStyle,
  SingleImageUploader, Spinner, Toast, Badge, ConfirmDialog,
} from '../components/AdminUI';
import { useCategories, DBCategory } from '../hooks/useAdminData';

type ToastState = { msg: string; type: 'success' | 'error' } | null;

// ─── Empty form ───────────────────────────────────────────────────────────────
const emptyForm = (): Omit<DBCategory, 'created_at'> => ({
  id:          '',
  name:        '',
  image:       '',
  description: '',
  count:       0,
  sort_order:  1,
  is_active:   true,
});

// ─── Category Form Modal ──────────────────────────────────────────────────────
interface FormModalProps {
  initial:   Omit<DBCategory, 'created_at'>;
  isEdit:    boolean;
  saving:    boolean;
  onSave:    (data: Omit<DBCategory, 'created_at'>, file: File | null) => void;
  onClose:   () => void;
}

const FormModal: React.FC<FormModalProps> = ({ initial, isEdit, saving, onSave, onClose }) => {
  const [form, setForm]         = useState({ ...initial });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [urlMode, setUrlMode]   = useState(!initial.image.startsWith('blob:'));

  const set = (key: keyof typeof form, val: unknown) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleImage = (_url: string, file?: File) => {
    if (file) { setImageFile(file); set('image', URL.createObjectURL(file)); }
  };

  const valid = form.name.trim() && form.id.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-white font-semibold text-lg" style={{ fontFamily: '"Raleway", sans-serif' }}>
            {isEdit ? 'Edit Category' : 'New Category'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Image */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.12em' }}>
                Category Image
              </label>
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  onClick={() => setUrlMode(false)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-all ${!urlMode ? 'text-white' : 'text-slate-500'}`}
                  style={{ background: !urlMode ? 'rgba(188,61,62,0.3)' : 'transparent', fontFamily: '"Raleway", sans-serif' }}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setUrlMode(true)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-all ${urlMode ? 'text-white' : 'text-slate-500'}`}
                  style={{ background: urlMode ? 'rgba(188,61,62,0.3)' : 'transparent', fontFamily: '"Raleway", sans-serif' }}
                >
                  Paste URL
                </button>
              </div>
            </div>

            {urlMode ? (
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    className={inputCls}
                    style={inputStyle}
                    placeholder="https://your-image-url.com/image.jpg"
                    value={form.image}
                    onChange={(e) => { set('image', e.target.value); setImageFile(null); }}
                  />
                </div>
                {form.image && (
                  <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ) : (
              <div style={{ maxWidth: '240px' }}>
                <SingleImageUploader
                  value={form.image}
                  onChange={handleImage}
                  label="Category Image"
                  aspectRatio="3/4"
                />
              </div>
            )}
          </div>

          {/* Name + ID */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category Name" required>
              <input
                className={inputCls}
                style={inputStyle}
                placeholder="e.g. Silk Sarees"
                value={form.name}
                onChange={(e) => {
                  set('name', e.target.value);
                  // Auto-generate ID from name if creating new
                  if (!isEdit) {
                    set('id', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                  }
                }}
              />
            </Field>
            <Field label="Category ID (URL slug)" required hint="Used in the URL — e.g. 'silk-sarees'">
              <input
                className={inputCls}
                style={inputStyle}
                placeholder="silk-sarees"
                value={form.id}
                onChange={(e) => set('id', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                disabled={isEdit} // Don't allow changing ID on edit (would break URLs)
              />
            </Field>
          </div>

          {/* Description */}
          <Field label="Description">
            <textarea
              rows={2}
              className={inputCls}
              style={{ ...inputStyle, resize: 'none' }}
              placeholder="e.g. Pure and blended silk sarees with intricate weaves"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </Field>

          {/* Count + Sort order + Active */}
          <div className="grid grid-cols-3 gap-4">
            <Field label="Saree Count" hint="Shown on the category card">
              <input
                type="number"
                min={0}
                className={inputCls}
                style={inputStyle}
                placeholder="0"
                value={form.count}
                onChange={(e) => set('count', Number(e.target.value))}
              />
            </Field>
            <Field label="Sort Order" hint="Lower = shown first">
              <input
                type="number"
                min={1}
                className={inputCls}
                style={inputStyle}
                placeholder="1"
                value={form.sort_order}
                onChange={(e) => set('sort_order', Number(e.target.value))}
              />
            </Field>
            <Field label="Visible on Website">
              <button
                onClick={() => set('is_active', !form.is_active)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  form.is_active ? 'text-green-400' : 'text-slate-500'
                }`}
                style={{
                  background: form.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${form.is_active ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  fontFamily: '"Raleway", sans-serif',
                }}
              >
                {form.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                {form.is_active ? 'Visible' : 'Hidden'}
              </button>
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3 flex-shrink-0">
          <AdminBtn variant="secondary" onClick={onClose}>Cancel</AdminBtn>
          <AdminBtn
            icon={<Save size={14} />}
            loading={saving}
            disabled={!valid}
            onClick={() => onSave(form, imageFile)}
          >
            {isEdit ? 'Save Changes' : 'Create Category'}
          </AdminBtn>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminCategories: React.FC = () => {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories();
  const [showForm, setShowForm]         = useState(false);
  const [editTarget, setEditTarget]     = useState<DBCategory | null>(null);
  const [saving, setSaving]             = useState(false);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DBCategory | null>(null);
  const [toast, setToast]               = useState<ToastState>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (data: Omit<DBCategory, 'created_at'>, file: File | null) => {
    setSaving(true);
    try {
      if (editTarget) {
        await updateCategory(editTarget.id, data, file);
        showToast('Category updated!', 'success');
      } else {
        await addCategory(data, file);
        showToast('Category created!', 'success');
      }
      setShowForm(false);
      setEditTarget(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    try {
      await deleteCategory(confirmDelete.id);
      showToast('Category deleted', 'success');
    } catch {
      showToast('Failed to delete category', 'error');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const openEdit = (cat: DBCategory) => {
    setEditTarget(cat);
    setShowForm(true);
  };

  const openNew = () => {
    setEditTarget(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold" style={{ fontFamily: '"Raleway", sans-serif' }}>
            Categories
          </h1>
          <p className="text-slate-500 text-sm mt-0.5" style={{ fontFamily: '"Raleway", sans-serif' }}>
            Manage the saree categories shown on the homepage and navigation
          </p>
        </div>
        <AdminBtn icon={<Plus size={16} />} onClick={openNew}>
          Add Category
        </AdminBtn>
      </div>

      {/* Info note */}
      <div
        className="flex items-start gap-3 px-5 py-4 rounded-xl"
        style={{ background: 'rgba(182,137,60,0.08)', border: '1px solid rgba(182,137,60,0.2)' }}
      >
        <p className="text-slate-400 text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>
          <span className="text-brand-gold font-semibold">Tip:</span> The Category ID becomes the URL slug (e.g. <code className="text-brand-orange">silk-sarees</code> → <code className="text-brand-orange">/category/silk-sarees</code>). Keep it lowercase with hyphens. Once created, the ID cannot be changed.
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Table header */}
          <div
            className="grid gap-4 px-5 py-3 border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-500"
            style={{ gridTemplateColumns: '56px 1fr 1fr 80px 80px 80px 100px', fontFamily: '"Raleway", sans-serif' }}
          >
            <span>Image</span>
            <span>Name</span>
            <span>Description</span>
            <span>Count</span>
            <span>Order</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500 text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>
                No categories yet. Click "Add Category" to create your first one.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="grid gap-4 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors"
                  style={{ gridTemplateColumns: '56px 1fr 1fr 80px 80px 80px 100px' }}
                >
                  {/* Image */}
                  <div className="w-12 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: '#0f1117' }}>
                        <span className="text-slate-600 text-xs">No img</span>
                      </div>
                    )}
                  </div>

                  {/* Name + ID */}
                  <div>
                    <p className="text-slate-200 text-sm font-semibold" style={{ fontFamily: '"Raleway", sans-serif' }}>{cat.name}</p>
                    <p className="text-slate-600 text-xs mt-0.5" style={{ fontFamily: '"Raleway", sans-serif' }}>{cat.id}</p>
                  </div>

                  {/* Description */}
                  <p className="text-slate-400 text-xs line-clamp-2" style={{ fontFamily: '"Raleway", sans-serif' }}>
                    {cat.description || '—'}
                  </p>

                  {/* Count */}
                  <span className="text-slate-300 text-sm font-semibold text-center" style={{ fontFamily: '"Raleway", sans-serif' }}>
                    {cat.count}
                  </span>

                  {/* Sort order */}
                  <span className="text-slate-500 text-sm text-center" style={{ fontFamily: '"Raleway", sans-serif' }}>
                    {cat.sort_order}
                  </span>

                  {/* Status */}
                  <div>
                    <Badge
                      label={cat.is_active ? 'Visible' : 'Hidden'}
                      color={cat.is_active ? 'green' : 'gray'}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(cat)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      aria-label={`Edit ${cat.name}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(cat)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      aria-label={`Delete ${cat.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer: add button */}
          <div className="px-5 py-4 border-t border-white/10">
            <button
              onClick={openNew}
              className="flex items-center gap-2 text-sm font-semibold transition-colors hover:text-white text-slate-500"
              style={{ fontFamily: '"Raleway", sans-serif' }}
            >
              <Plus size={14} /> Add Category
            </button>
          </div>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <FormModal
          initial={editTarget ? { ...editTarget } : emptyForm()}
          isEdit={!!editTarget}
          saving={saving}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <ConfirmDialog
          title={`Delete "${confirmDelete.name}"?`}
          message="This will remove the category from the website. Products in this category will not be deleted."
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
          loading={deletingId === confirmDelete.id}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
};

export default AdminCategories;