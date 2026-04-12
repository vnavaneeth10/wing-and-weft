// src/admin/pages/AdminBanners.tsx
import React, { useState } from 'react';
import { Image, Eye, EyeOff, Save, Download, FileDown } from 'lucide-react';
import {
  AdminBtn, Field, inputCls, useAdminInputStyle,
  SingleImageUploader, Spinner, Toast, Badge, useAdminTk,
} from '../components/AdminUI';
import { useBanners, DBBanner } from '../hooks/useAdminData';
import { exportToExcel, exportToPDF, downloadImage } from '../lib/adminExport';

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

      {/* Export */}
      <div className="flex items-center gap-2 justify-end">
        <AdminBtn variant="secondary" icon={<Download size={14} />}
          onClick={() => exportToExcel(banners.map(b => ({
            ID: b.id, Title: b.title, Eyebrow: b.eyebrow, Subtitle: b.subtitle,
            'CTA Text': b.cta_text, 'CTA Link': b.cta_link,
            'Image URL': b.image_url, Active: b.is_active ? 'Yes' : 'No',
          })), 'banners')}
          className="text-xs py-2 px-3">Excel</AdminBtn>
        <AdminBtn variant="secondary" icon={<FileDown size={14} />}
          onClick={() => exportToPDF('Banners', ['ID', 'Title', 'Active'],
            banners.map(b => [b.id, b.title, b.is_active ? 'Visible' : 'Hidden']),
            'banners')}
          className="text-xs py-2 px-3">PDF</AdminBtn>
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
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-widest"
                      style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.12em', color: tk.textSecondary }}>
                      Banner Image
                      <span className="normal-case font-normal ml-2" style={{ letterSpacing: '0', color: tk.textMuted }}>(1440 × 900 px recommended)</span>
                    </p>
                    {banner.image_url && (
                      <button onClick={() => downloadImage(banner.image_url, `banner-${idx + 1}.jpg`)}
                        className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-all"
                        style={{ background: 'rgba(182,137,60,0.1)', border: '1px solid rgba(182,137,60,0.25)', color: tk.textMuted, fontFamily: '"Raleway",sans-serif' }}>
                        <Download size={11} /> Download
                      </button>
                    )}
                  </div>
                  <SingleImageUploader value={String(getField(banner, 'image_url') || '')}
                    onChange={(url, file) => handleImageChange(banner.id, url, file)}
                    label={`Banner ${idx + 1}`} aspectRatio="16/10" />
                </div>

                <div>

                  {/* ── ADDED: Eyebrow label field ── */}
                  {/* This replaces the fragile cta_link parsing in Banner.tsx.            */}
                  {/* Shows as a small uppercase label above the title on the storefront.  */}
                  {/* Falls back to 'Featured' if left empty (handled in Banner.tsx).      */}
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider"
                      style={{ fontFamily: '"Raleway",sans-serif', letterSpacing: '0.12em', color: tk.textLabel }}>
                      Eyebrow Label
                      <span className="normal-case font-normal ml-2" style={{ letterSpacing: '0', color: tk.textMuted }}>
                        (small tag above headline)
                      </span>
                    </label>
                  </div>
                  <input
                    className={inputCls}
                    style={{ ...is, marginBottom: '16px' }}
                    placeholder="e.g. New Arrivals · Silk Collection · Limited Edition"
                    value={String(getField(banner, 'eyebrow') || '')}
                    onChange={e => setField(banner.id, 'eyebrow', e.target.value)}
                  />

                  {/* ── Headline with show/hide toggle ── */}
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: '"Raleway",sans-serif', letterSpacing: '0.12em', color: tk.textLabel }}>
                      Headline
                    </label>
                    <button type="button"
                      onClick={() => setField(banner.id, 'title', getField(banner, 'title') ? '' : 'Headline')}
                      className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-all"
                      style={{
                        background: getField(banner, 'title') ? 'rgba(34,197,94,0.1)' : 'rgba(120,113,108,0.12)',
                        color: getField(banner, 'title') ? '#4ade80' : tk.textMuted,
                        border: `1px solid ${getField(banner, 'title') ? 'rgba(34,197,94,0.25)' : tk.border}`,
                        fontFamily: '"Raleway",sans-serif',
                      }}>
                      {getField(banner, 'title') ? '👁 Visible' : '🚫 Hidden'}
                    </button>
                  </div>
                  <input className={inputCls} style={{ ...is, marginBottom: '16px', opacity: getField(banner, 'title') ? 1 : 0.4 }}
                    placeholder="e.g. Threads of Tradition"
                    value={String(getField(banner, 'title') || '')}
                    onChange={e => setField(banner.id, 'title', e.target.value)} />

                  {/* ── Subtitle with show/hide toggle ── */}
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: '"Raleway",sans-serif', letterSpacing: '0.12em', color: tk.textLabel }}>
                      Subtitle
                    </label>
                    <button type="button"
                      onClick={() => setField(banner.id, 'subtitle', getField(banner, 'subtitle') ? '' : 'Subtitle text')}
                      className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-all"
                      style={{
                        background: getField(banner, 'subtitle') ? 'rgba(34,197,94,0.1)' : 'rgba(120,113,108,0.12)',
                        color: getField(banner, 'subtitle') ? '#4ade80' : tk.textMuted,
                        border: `1px solid ${getField(banner, 'subtitle') ? 'rgba(34,197,94,0.25)' : tk.border}`,
                        fontFamily: '"Raleway",sans-serif',
                      }}>
                      {getField(banner, 'subtitle') ? '👁 Visible' : '🚫 Hidden'}
                    </button>
                  </div>
                  <input className={inputCls} style={{ ...is, marginBottom: '16px', opacity: getField(banner, 'subtitle') ? 1 : 0.4 }}
                    placeholder="e.g. Handwoven silk sarees where every thread carries a story"
                    value={String(getField(banner, 'subtitle') || '')}
                    onChange={e => setField(banner.id, 'subtitle', e.target.value)} />

                  {/* ── CTA (Button) with show/hide toggle ── */}
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: '"Raleway",sans-serif', letterSpacing: '0.12em', color: tk.textLabel }}>
                      Button (CTA)
                    </label>
                    <button type="button"
                      onClick={() => {
                        setField(banner.id, 'cta_text', getField(banner, 'cta_text') ? '' : 'Explore');
                        setField(banner.id, 'cta_link', getField(banner, 'cta_link') ? '' : '/');
                      }}
                      className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-all"
                      style={{
                        background: getField(banner, 'cta_text') ? 'rgba(34,197,94,0.1)' : 'rgba(120,113,108,0.12)',
                        color: getField(banner, 'cta_text') ? '#4ade80' : tk.textMuted,
                        border: `1px solid ${getField(banner, 'cta_text') ? 'rgba(34,197,94,0.25)' : tk.border}`,
                        fontFamily: '"Raleway",sans-serif',
                      }}>
                      {getField(banner, 'cta_text') ? '👁 Visible' : '🚫 Hidden'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4" style={{ opacity: getField(banner, 'cta_text') ? 1 : 0.4 }}>
                    <div>
                      <input className={inputCls} style={is} placeholder="e.g. Explore Silk"
                        value={String(getField(banner, 'cta_text') || '')}
                        onChange={e => setField(banner.id, 'cta_text', e.target.value)} />
                    </div>
                    <div>
                      <input className={inputCls} style={is} placeholder="/category/silk-sarees"
                        value={String(getField(banner, 'cta_link') || '')}
                        onChange={e => setField(banner.id, 'cta_link', e.target.value)} />
                    </div>
                  </div>

                  {/* Live preview */}
                  <div className="mt-4 rounded-xl overflow-hidden relative"
                    style={{ background: 'linear-gradient(135deg, #0e0a07, #1a1208)', border: '1px solid rgba(182,137,60,0.15)', padding: '20px' }}>
                    <p className="text-xs mb-4 uppercase tracking-wide" style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.2em', color: '#475569' }}>Live Preview</p>

                    {/* ADDED: Eyebrow preview — mirrors the storefront eyebrow style */}
                    <div className="flex items-center gap-2 mb-3">
                      <div style={{ width: '20px', height: '1px', background: '#c4855a' }} />
                      <span style={{ fontFamily: '"Raleway", sans-serif', fontSize: '0.55rem', letterSpacing: '0.35em', color: '#d4956a', fontWeight: 700, textTransform: 'uppercase' }}>
                        {String(getField(banner, 'eyebrow') || 'Eyebrow Label')}
                      </span>
                      <div style={{ width: '20px', height: '1px', background: '#c4855a' }} />
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