// src/admin/pages/AdminBanners.tsx
import React, { useState } from 'react';
import { Image, Eye, EyeOff, Save } from 'lucide-react';
import {
  AdminBtn, Field, inputCls, inputStyle,
  SingleImageUploader, Spinner, Toast, Badge,
} from '../components/AdminUI';
import { useBanners, DBBanner } from '../hooks/useAdminData';

type ToastState = { msg: string; type: 'success' | 'error' } | null;

const AdminBanners: React.FC = () => {
  const { banners, loading, updateBanner, uploadBannerImage } = useBanners();
  const [editing, setEditing] = useState<Record<string, Partial<DBBanner>>>({});
  const [pendingImages, setPendingImages] = useState<Record<string, File>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getField = (banner: DBBanner, field: keyof DBBanner) =>
    editing[banner.id]?.[field] !== undefined ? editing[banner.id][field] : banner[field];

  const setField = (id: string, field: keyof DBBanner, value: unknown) => {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleImageChange = (id: string, _url: string, file?: File) => {
    if (file) {
      setPendingImages((prev) => ({ ...prev, [id]: file }));
      setField(id, 'image_url', URL.createObjectURL(file));
    }
  };

  const handleSave = async (banner: DBBanner) => {
    setSaving(banner.id);
    try {
      const edits = { ...(editing[banner.id] || {}) };

      // ✅ FIX: correct argument order — uploadBannerImage(id, file)
      if (pendingImages[banner.id]) {
        const url = await uploadBannerImage(banner.id, pendingImages[banner.id]);
        edits.image_url = url;
        setPendingImages((prev) => {
          const next = { ...prev };
          delete next[banner.id];
          return next;
        });
      }

      if (Object.keys(edits).length > 0) {
        await updateBanner(banner.id, edits);
        setEditing((prev) => {
          const next = { ...prev };
          delete next[banner.id];
          return next;
        });
        showToast('Banner saved successfully', 'success');
      } else {
        showToast('No changes to save', 'error');
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to save banner', 'error');
    } finally {
      setSaving(null);
    }
  };

  const toggleActive = async (banner: DBBanner) => {
    try {
      await updateBanner(banner.id, { is_active: !banner.is_active });
      showToast(`Banner ${banner.is_active ? 'hidden' : 'shown'}`, 'success');
    } catch {
      showToast('Failed to update banner', 'error');
    }
  };

  const hasChanges = (id: string) =>
    Object.keys(editing[id] || {}).length > 0 || !!pendingImages[id];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold" style={{ fontFamily: '"Raleway", sans-serif' }}>
          Banners
        </h1>
        <p className="text-slate-500 text-sm mt-0.5" style={{ fontFamily: '"Raleway", sans-serif' }}>
          Manage the homepage hero carousel — 3 slides supported
        </p>
      </div>

      {/* Image spec note */}
      <div
        className="flex items-start gap-3 px-5 py-4 rounded-xl"
        style={{ background: 'rgba(182,137,60,0.08)', border: '1px solid rgba(182,137,60,0.2)' }}
      >
        <Image size={18} className="text-brand-gold mt-0.5 flex-shrink-0" />
        <p className="text-slate-400 text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>
          <span className="text-brand-gold font-semibold">Image dimensions: 1440 × 700 px</span>{' '}
          (16:5 aspect ratio). JPG or WebP recommended. Max 300 KB per image.
          Keep the main subject slightly left-center to allow for text overlay on the right.
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          {banners.map((banner, idx) => (
            <div
              key={banner.id}
              className="rounded-2xl overflow-hidden"
              style={{
                background: '#1a1b2e',
                border: `1px solid ${hasChanges(banner.id) ? 'rgba(188,61,62,0.4)' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              {/* Banner header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #bc3d3e, #b6893c)', color: '#e9e3cb', fontFamily: '"Raleway", sans-serif' }}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-slate-300 text-sm font-semibold" style={{ fontFamily: '"Raleway", sans-serif' }}>
                    Slide {idx + 1}
                  </span>
                  {hasChanges(banner.id) && <Badge label="Unsaved changes" color="orange" />}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(banner)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      banner.is_active
                        ? 'text-green-400 hover:bg-green-400/10'
                        : 'text-slate-500 hover:bg-white/5'
                    }`}
                    style={{ fontFamily: '"Raleway", sans-serif' }}
                  >
                    {banner.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                    {banner.is_active ? 'Visible' : 'Hidden'}
                  </button>
                  <AdminBtn
                    icon={<Save size={14} />}
                    loading={saving === banner.id}
                    onClick={() => handleSave(banner)}
                    disabled={!hasChanges(banner.id)}
                    variant={hasChanges(banner.id) ? 'primary' : 'secondary'}
                  >
                    Save
                  </AdminBtn>
                </div>
              </div>

              {/* Banner content */}
              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image upload */}
                <div>
                  <p
                    className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.12em' }}
                  >
                    Banner Image
                  </p>
                  <SingleImageUploader
                    value={String(getField(banner, 'image_url') || '')}
                    onChange={(url, file) => handleImageChange(banner.id, url, file)}
                    label={`Banner ${idx + 1}`}
                    aspectRatio="16/7"
                  />
                </div>

                {/* Text fields */}
                <div>
                  <Field label="Headline" required>
                    <input
                      className={inputCls}
                      style={inputStyle}
                      placeholder="e.g. Threads of Tradition"
                      value={String(getField(banner, 'title') || '')}
                      onChange={(e) => setField(banner.id, 'title', e.target.value)}
                    />
                  </Field>
                  <Field label="Subtitle">
                    <input
                      className={inputCls}
                      style={inputStyle}
                      placeholder="e.g. Discover our exquisite silk collection"
                      value={String(getField(banner, 'subtitle') || '')}
                      onChange={(e) => setField(banner.id, 'subtitle', e.target.value)}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Button Text">
                      <input
                        className={inputCls}
                        style={inputStyle}
                        placeholder="e.g. Explore Silk"
                        value={String(getField(banner, 'cta_text') || '')}
                        onChange={(e) => setField(banner.id, 'cta_text', e.target.value)}
                      />
                    </Field>
                    <Field label="Button Link">
                      <input
                        className={inputCls}
                        style={inputStyle}
                        placeholder="/category/silk-sarees"
                        value={String(getField(banner, 'cta_link') || '')}
                        onChange={(e) => setField(banner.id, 'cta_link', e.target.value)}
                      />
                    </Field>
                  </div>

                  {/* Live text preview */}
                  <div
                    className="mt-4 p-4 rounded-xl relative overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <p className="text-slate-500 text-xs mb-2 uppercase tracking-wide" style={{ fontFamily: '"Raleway", sans-serif' }}>
                      Text Preview
                    </p>
                    <p className="text-brand-gold text-xs mb-1" style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.2em' }}>
                      WING & WEFT COLLECTION
                    </p>
                    <p className="text-white text-xl font-semibold mb-1" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
                      {String(getField(banner, 'title') || 'Headline Text')}
                    </p>
                    <p className="text-slate-300 text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>
                      {String(getField(banner, 'subtitle') || 'Subtitle text appears here')}
                    </p>
                    <div
                      className="inline-block mt-2 px-4 py-1.5 rounded-full text-xs"
                      style={{ background: 'linear-gradient(135deg, #bc3d3e, #b6893c)', color: '#e9e3cb', fontFamily: '"Raleway", sans-serif' }}
                    >
                      {String(getField(banner, 'cta_text') || 'Button Text')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {banners.length === 0 && (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: '#1a1b2e', border: '1px dashed rgba(255,255,255,0.1)' }}
            >
              <Image size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>
                No banners found. Make sure your Supabase <code>banners</code> table is set up with 3 rows.
              </p>
            </div>
          )}
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
};

export default AdminBanners;