// src/admin/pages/AdminBanners.tsx
import React, { useState } from 'react';
import { Image, Eye, EyeOff, Save } from 'lucide-react';
import {
  AdminBtn, Field, inputCls, useAdminInputStyle,
  SingleImageUploader, Spinner, Toast, Badge, useAdminTk,
} from '../components/AdminUI';
import { useBanners, DBBanner } from '../hooks/useAdminData';

type ToastState = { msg: string; type: 'success' | 'error' } | null;

const AdminBanners: React.FC = () => {
  const tk = useAdminTk();
  const is = useAdminInputStyle();
  const { banners, loading, updateBanner, uploadBannerImage } = useBanners();
  const [editing, setEditing] = useState<Record<string, Partial<DBBanner>>>({});
  const [pendingImages, setPendingImages] = useState<Record<string, File>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const getField = (banner: DBBanner, field: keyof DBBanner) =>
    editing[banner.id]?.[field] !== undefined ? editing[banner.id][field] : banner[field];

  const setField = (id: string, field: keyof DBBanner, value: unknown) =>
    setEditing((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const handleImageChange = (id: string, _url: string, file?: File) => {
    if (file) { setPendingImages((prev) => ({ ...prev, [id]: file })); setField(id, 'image_url', URL.createObjectURL(file)); }
  };

  const handleSave = async (banner: DBBanner) => {
    setSaving(banner.id);
    try {
      const edits = { ...(editing[banner.id] || {}) };
      if (pendingImages[banner.id]) {
        const url = await uploadBannerImage(banner.id, pendingImages[banner.id]);
        edits.image_url = url;
        setPendingImages((prev) => { const n = { ...prev }; delete n[banner.id]; return n; });
      }
      if (Object.keys(edits).length > 0) {
        await updateBanner(banner.id, edits);
        setEditing((prev) => { const n = { ...prev }; delete n[banner.id]; return n; });
        showToast('Banner saved successfully', 'success');
      } else { showToast('No changes to save', 'error'); }
    } catch (e) { showToast(e instanceof Error ? e.message : 'Failed to save banner', 'error'); }
    finally { setSaving(null); }
  };

  const toggleActive = async (banner: DBBanner) => {
    try { await updateBanner(banner.id, { is_active: !banner.is_active }); showToast(`Banner ${banner.is_active ? 'hidden' : 'shown'}`, 'success'); }
    catch { showToast('Failed to update banner', 'error'); }
  };

  const hasChanges = (id: string) => Object.keys(editing[id] || {}).length > 0 || !!pendingImages[id];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>Banners</h1>
        <p className="text-sm mt-0.5" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>
          Manage the homepage hero carousel — up to 3 slides supported
        </p>
      </div>

      {/* Spec note */}
      <div className="flex items-start gap-3 px-5 py-4 rounded-xl" style={{ background: 'rgba(182,137,60,0.08)', border: '1px solid rgba(182,137,60,0.2)' }}>
        <Image size={18} className="text-brand-gold mt-0.5 flex-shrink-0" />
        <div style={{ fontFamily: '"Raleway", sans-serif' }}>
          <p className="text-sm" style={{ color: tk.textSecondary }}>
            <span className="text-brand-gold font-semibold">Recommended size: 1440 × 900 px</span>{' '}(16:10 aspect ratio) — JPG or WebP, max 400 KB per image.
          </p>
          <ul className="text-xs mt-2 space-y-1" style={{ lineHeight: 1.6, color: tk.textMuted }}>
            <li>• Keep the main subject <span style={{ color: tk.textSecondary }}>centre or slightly left</span> — text overlays the bottom-left area</li>
            <li>• Avoid very bright or very busy images in the <span style={{ color: tk.textSecondary }}>lower 40%</span> — gradient darkens it for readability</li>
            <li>• Portrait-heavy images work better than wide landscape shots</li>
          </ul>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="space-y-6">
          {banners.map((banner, idx) => (
            <div key={banner.id} className="rounded-2xl overflow-hidden transition-colors duration-300"
              style={{ background: tk.cardBg, border: `1px solid ${hasChanges(banner.id) ? 'rgba(188,61,62,0.4)' : tk.border}` }}>

              {/* Banner header */}
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: tk.border }}>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #bc3d3e, #b6893c)', color: '#e9e3cb', fontFamily: '"Raleway", sans-serif' }}>
                    {idx + 1}
                  </span>
                  <span className="text-sm font-semibold" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>Slide {idx + 1}</span>
                  {hasChanges(banner.id) && <Badge label="Unsaved changes" color="orange" />}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(banner)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${banner.is_active ? 'text-green-400 hover:bg-green-400/10' : 'hover:bg-white/5'}`}
                    style={{ fontFamily: '"Raleway", sans-serif', color: banner.is_active ? undefined : tk.textMuted }}>
                    {banner.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                    {banner.is_active ? 'Visible' : 'Hidden'}
                  </button>
                  <AdminBtn icon={<Save size={14} />} loading={saving === banner.id} onClick={() => handleSave(banner)}
                    disabled={!hasChanges(banner.id)} variant={hasChanges(banner.id) ? 'primary' : 'secondary'}>Save</AdminBtn>
                </div>
              </div>

              {/* Banner content */}
              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.12em', color: tk.textSecondary }}>
                    Banner Image
                    <span className="normal-case font-normal ml-2" style={{ letterSpacing: '0', color: tk.textMuted }}>(1440 × 900 px recommended)</span>
                  </p>
                  <SingleImageUploader value={String(getField(banner, 'image_url') || '')}
                    onChange={(url, file) => handleImageChange(banner.id, url, file)}
                    label={`Banner ${idx + 1}`} aspectRatio="16/10" />
                </div>

                <div>
                  <Field label="Headline" required>
                    <input className={inputCls} style={is} placeholder="e.g. Threads of Tradition"
                      value={String(getField(banner, 'title') || '')} onChange={(e) => setField(banner.id, 'title', e.target.value)} />
                  </Field>
                  <Field label="Subtitle">
                    <input className={inputCls} style={is} placeholder="e.g. Handwoven silk sarees where every thread carries a story"
                      value={String(getField(banner, 'subtitle') || '')} onChange={(e) => setField(banner.id, 'subtitle', e.target.value)} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Button Text">
                      <input className={inputCls} style={is} placeholder="e.g. Explore Silk"
                        value={String(getField(banner, 'cta_text') || '')} onChange={(e) => setField(banner.id, 'cta_text', e.target.value)} />
                    </Field>
                    <Field label="Button Link">
                      <input className={inputCls} style={is} placeholder="/category/silk-sarees"
                        value={String(getField(banner, 'cta_link') || '')} onChange={(e) => setField(banner.id, 'cta_link', e.target.value)} />
                    </Field>
                  </div>

                  {/* Live preview — always dark (it's a banner preview) */}
                  <div className="mt-4 rounded-xl overflow-hidden relative"
                    style={{ background: 'linear-gradient(135deg, #0e0a07, #1a1208)', border: '1px solid rgba(182,137,60,0.15)', padding: '20px' }}>
                    <p className="text-xs mb-4 uppercase tracking-wide" style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.2em', color: '#475569' }}>Live Preview</p>
                    <div className="flex items-center gap-2 mb-3">
                      <div style={{ width: '20px', height: '1px', background: '#bc3d3e' }} />
                      <span style={{ fontFamily: '"Raleway", sans-serif', fontSize: '0.55rem', letterSpacing: '0.35em', color: '#bc3d3e', fontWeight: 700, textTransform: 'uppercase' }}>Wing &amp; Weft Collection</span>
                    </div>
                    <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem', fontWeight: 400, color: '#fff', lineHeight: 0.95, marginBottom: '10px', whiteSpace: 'pre-line' }}>
                      {String(getField(banner, 'title') || 'Headline\nText')}
                    </p>
                    <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to right, #b6893c, transparent)', marginBottom: '10px' }} />
                    <p style={{ fontFamily: '"Raleway", sans-serif', fontSize: '0.7rem', fontWeight: 300, color: 'rgba(233,227,203,0.55)', letterSpacing: '0.04em', lineHeight: 1.7, marginBottom: '14px' }}>
                      {String(getField(banner, 'subtitle') || 'Subtitle text appears here')}
                    </p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 20px', background: 'linear-gradient(115deg, #bc3d3e, #b6893c)', color: '#e9e3cb', fontFamily: '"Raleway", sans-serif', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', borderRadius: '1px' }}>
                      {String(getField(banner, 'cta_text') || 'Button Text')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {banners.length === 0 && (
            <div className="rounded-2xl p-8 text-center" style={{ background: tk.cardBg, border: `1px dashed ${tk.borderMed}` }}>
              <Image size={32} className="mx-auto mb-3" style={{ color: tk.textMuted }} />
              <p className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>
                No banners found. Make sure your Supabase <code>banners</code> table has rows set up.
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