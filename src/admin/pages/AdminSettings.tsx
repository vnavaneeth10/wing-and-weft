// src/admin/pages/AdminSettings.tsx
import React, { useState, useEffect } from 'react';
import { Save, Settings, Phone, Instagram, Facebook, Clock, MessageCircle, AlignLeft, Plus, Trash2, Image as ImageIcon, type LucideIcon } from 'lucide-react';
import { AdminBtn, Field, inputCls, useAdminInputStyle, Toast, Spinner, useAdminTk } from '../components/AdminUI';
import { useSettings } from '../hooks/useAdminData';

type ToastState = { msg: string; type: 'success' | 'error' } | null;
interface SettingField { key: string; label: string; placeholder: string; icon: LucideIcon; hint?: string; type?: 'text' | 'tel' | 'url' | 'textarea'; }
interface InstagramPost { id: string; image: string; link: string; caption: string; }
interface Reel { id: string; thumbnail: string; name: string; price: number; link: string; }

const SETTING_FIELDS: SettingField[] = [
  { key: 'whatsapp_number',  label: 'WhatsApp Business Number',    placeholder: '919999999999',                          icon: MessageCircle, hint: 'Include country code, no + or spaces.', type: 'tel' },
  { key: 'contact_phone',    label: 'Contact Phone (Display)',      placeholder: '+91 99999 99999',                       icon: Phone },
  { key: 'contact_email',    label: 'Support Email',                placeholder: 'support@wingandweft.com',               icon: MessageCircle },
  { key: 'business_hours',   label: 'Business Hours',               placeholder: 'Mon–Sat: 10AM – 7PM',                   icon: Clock, hint: 'Shown on the Contact page' },
  { key: 'instagram_url',    label: 'Instagram Profile URL',        placeholder: 'https://www.instagram.com/wingandweft/', icon: Instagram, type: 'url' },
  { key: 'instagram_handle', label: 'Instagram Handle (Display)',   placeholder: '@wingandweft',                          icon: Instagram, hint: 'Shown as link text on Contact page' },
  { key: 'facebook_url',     label: 'Facebook Page URL',            placeholder: 'https://www.facebook.com/wingandweft',  icon: Facebook, type: 'url' },
  { key: 'facebook_name',    label: 'Facebook Page Name (Display)', placeholder: 'Wing & Weft',                           icon: Facebook, hint: 'Shown as link text on Contact page' },
  { key: 'ribbon_text',      label: 'Ribbon Scrolling Text',        placeholder: 'Timeless sarees...',                    icon: AlignLeft, hint: 'Scrolls below the homepage banner — use the toggle to show/hide', type: 'textarea' },
  { key: 'ribbon_visible',   label: 'Ribbon Visibility',            placeholder: 'true',                                  icon: AlignLeft, hint: 'Set to "true" to show ribbon, "false" to hide it' },
];

const parseJson = <T,>(val: string, fallback: T[]): T[] => {
  try { const p = JSON.parse(val); return Array.isArray(p) ? p : fallback; } catch { return fallback; }
};
const newId = () => Date.now().toString();

// ─── PostRow ──────────────────────────────────────────────────────────────────
const PostRow: React.FC<{ post: InstagramPost; onChange: (p: InstagramPost) => void; onDelete: () => void }> = ({ post, onChange, onDelete }) => {
  const tk = useAdminTk();
  const is = useAdminInputStyle();
  return (
    <div className="rounded-xl p-4 space-y-3 transition-colors duration-300" style={{ background: tk.inputBg, border: `1px solid ${tk.border}` }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'Image URL', field: 'image' as const, placeholder: 'https://...' },
          { label: 'Instagram Post Link', field: 'link' as const, placeholder: 'https://www.instagram.com/p/...' },
          { label: 'Caption', field: 'caption' as const, placeholder: 'e.g. Kanchipuram Elegance' },
        ].map(({ label, field, placeholder }) => (
          <div key={field}>
            <label className="text-xs mb-1 block" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>{label}</label>
            <input className={inputCls} style={is} placeholder={placeholder} value={post[field]}
              onChange={e => onChange({ ...post, [field]: e.target.value })} />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        {post.image && <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ border: `1px solid ${tk.border}` }}>
          <img src={post.image} alt={post.caption} className="w-full h-full object-cover" /></div>}
        <button onClick={onDelete} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontFamily: '"Raleway", sans-serif' }}>
          <Trash2 size={12} /> Remove
        </button>
      </div>
    </div>
  );
};

// ─── ReelRow ──────────────────────────────────────────────────────────────────
const ReelRow: React.FC<{ reel: Reel; onChange: (r: Reel) => void; onDelete: () => void }> = ({ reel, onChange, onDelete }) => {
  const tk = useAdminTk();
  const is = useAdminInputStyle();
  return (
    <div className="rounded-xl p-4 space-y-3 transition-colors duration-300" style={{ background: tk.inputBg, border: `1px solid ${tk.border}` }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Thumbnail URL', field: 'thumbnail' as const, placeholder: 'https://...' },
          { label: 'Product Name', field: 'name' as const, placeholder: 'e.g. Kanchipuram Draping' },
          { label: 'Link', field: 'link' as const, placeholder: 'https://www.instagram.com/p/...' },
        ].map(({ label, field, placeholder }) => (
          <div key={field}>
            <label className="text-xs mb-1 block" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>{label}</label>
            <input className={inputCls} style={is} placeholder={placeholder} value={reel[field] as string}
              onChange={e => onChange({ ...reel, [field]: e.target.value })} />
          </div>
        ))}
        <div>
          <label className="text-xs mb-1 block" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>Price (₹)</label>
          <input type="number" min={0} className={inputCls} style={is} placeholder="5000" value={reel.price || ''}
            onChange={e => onChange({ ...reel, price: Number(e.target.value) })} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        {reel.thumbnail && <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ border: `1px solid ${tk.border}` }}>
          <img src={reel.thumbnail} alt={reel.name} className="w-full h-full object-cover" /></div>}
        <button onClick={onDelete} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontFamily: '"Raleway", sans-serif' }}>
          <Trash2 size={12} /> Remove
        </button>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const AdminSettings: React.FC = () => {
  const tk = useAdminTk();
  const is = useAdminInputStyle();
  const { settings, loading, saveSetting } = useSettings();
  const [values, setValues]         = useState<Record<string, string>>({});
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState<ToastState>(null);
  const [changed, setChanged]       = useState<Set<string>>(new Set());
  const [posts, setPosts]           = useState<InstagramPost[]>([]);
  const [postsChanged, setPC]       = useState(false);
  const [reels, setReels]           = useState<Reel[]>([]);
  const [reelsChanged, setRC]       = useState(false);

  useEffect(() => {
    setValues({ ...settings });
    if (settings['instagram_posts']) setPosts(parseJson<InstagramPost>(settings['instagram_posts'], []));
    if (settings['watch_shop_reels']) setReels(parseJson<Reel>(settings['watch_shop_reels'], []));
  }, [settings]);

  const showToast = (msg: string, type: 'success' | 'error') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const handleChange = (key: string, value: string) => { setValues(p => ({ ...p, [key]: value })); setChanged(p => new Set([...p, key])); };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const saves: Promise<void>[] = [...changed].map(key => saveSetting(key, values[key] || ''));
      if (postsChanged)  saves.push(saveSetting('instagram_posts', JSON.stringify(posts)));
      if (reelsChanged)  saves.push(saveSetting('watch_shop_reels', JSON.stringify(reels)));
      await Promise.all(saves);
      setChanged(new Set()); setPC(false); setRC(false);
      showToast('All settings saved successfully', 'success');
    } catch { showToast('Failed to save settings', 'error'); }
    finally { setSaving(false); }
  };

  const hasAnyChanges = changed.size > 0 || postsChanged || reelsChanged;

  const cardStyle = { background: tk.cardBg, border: `1px solid ${tk.border}` };
  const sectionHeaderStyle = { borderColor: tk.border };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>Settings</h1>
          <p className="text-sm mt-0.5" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>
            Manage brand links, contact info, Instagram posts and Watch & Shop reels
          </p>
        </div>
        {hasAnyChanges && <AdminBtn icon={<Save size={16} />} loading={saving} onClick={handleSaveAll}>Save Changes</AdminBtn>}
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* Brand & Social */}
          <div className="rounded-2xl overflow-hidden transition-colors duration-300" style={cardStyle}>
            <div className="px-6 py-4 border-b flex items-center gap-2" style={sectionHeaderStyle}>
              <Settings size={16} className="text-brand-gold" />
              <h2 className="font-semibold text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>Brand & Social Links</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
              {/* Ribbon visibility toggle — standalone visual control */}
              <div className="md:col-span-2 mb-2">
                <div className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: tk.cardBgHover, border: `1px solid ${tk.border}` }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ fontFamily:'"Raleway",sans-serif', color:tk.textPrimary }}>
                      Ribbon Banner Visibility
                    </p>
                    <p className="text-xs mt-0.5" style={{ fontFamily:'"Raleway",sans-serif', color:tk.textMuted }}>
                      Show or hide the scrolling ribbon below the homepage banner
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const current = values['ribbon_visible'];
                      const next = (current === 'false') ? 'true' : 'false';
                      handleChange('ribbon_visible', next);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: values['ribbon_visible'] === 'false' ? 'rgba(120,113,108,0.12)' : 'rgba(34,197,94,0.12)',
                      border: `1px solid ${values['ribbon_visible'] === 'false' ? tk.border : 'rgba(34,197,94,0.3)'}`,
                      color: values['ribbon_visible'] === 'false' ? tk.textMuted : '#4ade80',
                      fontFamily: '"Raleway",sans-serif',
                    }}>
                    {values['ribbon_visible'] === 'false' ? '🚫 Hidden' : '👁 Visible'}
                  </button>
                </div>
              </div>

              {SETTING_FIELDS.map(({ key, label, placeholder, icon: Icon, hint, type = 'text' }) => (
                <div key={key} className={type === 'textarea' ? 'md:col-span-2' : ''}>
                  <Field label={label} hint={hint}>
                    <div className="relative">
                      <Icon size={15} className="absolute left-3.5 top-3 text-brand-gold" style={{ opacity: 0.6 }} />
                      {type === 'textarea' ? (
                        <textarea rows={3} className={`${inputCls} pl-10`} style={{ ...is, resize: 'none' }}
                          placeholder={placeholder} value={values[key] || ''} onChange={e => handleChange(key, e.target.value)} />
                      ) : (
                        <input type={type} className={`${inputCls} pl-10`}
                          style={{ ...is, ...(changed.has(key) ? { borderColor: 'rgba(188,61,62,0.4)' } : {}) }}
                          placeholder={placeholder} value={values[key] || ''} onChange={e => handleChange(key, e.target.value)} />
                      )}
                      {changed.has(key) && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-orange" style={{ fontFamily: '"Raleway", sans-serif' }}>unsaved</span>
                      )}
                    </div>
                  </Field>
                </div>
              ))}
            </div>
          </div>

          {/* Instagram Posts */}
          <div className="rounded-2xl overflow-hidden transition-colors duration-300"
            style={{ ...cardStyle, border: `1px solid ${postsChanged ? 'rgba(188,61,62,0.4)' : tk.border}` }}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={sectionHeaderStyle}>
              <div className="flex items-center gap-2">
                <Instagram size={16} className="text-brand-gold" />
                <h2 className="font-semibold text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>Instagram Section Posts</h2>
                <span className="text-xs" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>({posts.length} posts)</span>
                {postsChanged && <span className="text-xs text-brand-orange" style={{ fontFamily: '"Raleway", sans-serif' }}>• unsaved</span>}
              </div>
              <button onClick={() => { setPosts(p => [...p, { id: newId(), image: '', link: 'https://www.instagram.com/wingandweft/', caption: '' }]); setPC(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: 'rgba(182,137,60,0.15)', border: '1px solid rgba(182,137,60,0.3)', color: '#fcd34d', fontFamily: '"Raleway", sans-serif' }}>
                <Plus size={12} /> Add Post
              </button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>These posts appear in the Instagram section on the homepage.</p>
              {posts.length === 0 ? (
                <div className="text-center py-8 rounded-xl" style={{ border: `1px dashed ${tk.borderMed}` }}>
                  <ImageIcon size={24} className="mx-auto mb-2" style={{ color: tk.textMuted }} />
                  <p className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>No posts yet. Click "Add Post" to add your first Instagram post.</p>
                </div>
              ) : posts.map((post, i) => (
                <PostRow key={post.id} post={post}
                  onChange={p => { setPosts(prev => prev.map((x, j) => j === i ? p : x)); setPC(true); }}
                  onDelete={() => { setPosts(prev => prev.filter((_, j) => j !== i)); setPC(true); }} />
              ))}
              <button onClick={() => { setPosts(p => [...p, { id: newId(), image: '', link: '', caption: '' }]); setPC(true); }}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80 flex items-center justify-center gap-2"
                style={{ border: `1px dashed ${tk.borderMed}`, color: tk.textMuted, fontFamily: '"Raleway", sans-serif' }}>
                <Plus size={14} /> Add Another Post
              </button>
            </div>
          </div>

          {/* Watch & Shop Reels */}
          <div className="rounded-2xl overflow-hidden transition-colors duration-300"
            style={{ ...cardStyle, border: `1px solid ${reelsChanged ? 'rgba(188,61,62,0.4)' : tk.border}` }}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={sectionHeaderStyle}>
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-brand-gold" />
                <h2 className="font-semibold text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>Watch & Shop Reels</h2>
                <span className="text-xs" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>({reels.length} reels)</span>
                {reelsChanged && <span className="text-xs text-brand-orange" style={{ fontFamily: '"Raleway", sans-serif' }}>• unsaved</span>}
              </div>
              <button onClick={() => { setReels(r => [...r, { id: newId(), thumbnail: '', name: '', price: 0, link: '' }]); setRC(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: 'rgba(182,137,60,0.15)', border: '1px solid rgba(182,137,60,0.3)', color: '#fcd34d', fontFamily: '"Raleway", sans-serif' }}>
                <Plus size={12} /> Add Reel
              </button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>These cards appear in the Watch & Shop section.</p>
              {reels.length === 0 ? (
                <div className="text-center py-8 rounded-xl" style={{ border: `1px dashed ${tk.borderMed}` }}>
                  <ImageIcon size={24} className="mx-auto mb-2" style={{ color: tk.textMuted }} />
                  <p className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>No reels yet. Click "Add Reel" to add your first Watch & Shop card.</p>
                </div>
              ) : reels.map((reel, i) => (
                <ReelRow key={reel.id} reel={reel}
                  onChange={r => { setReels(prev => prev.map((x, j) => j === i ? r : x)); setRC(true); }}
                  onDelete={() => { setReels(prev => prev.filter((_, j) => j !== i)); setRC(true); }} />
              ))}
              <button onClick={() => { setReels(r => [...r, { id: newId(), thumbnail: '', name: '', price: 0, link: '' }]); setRC(true); }}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80 flex items-center justify-center gap-2"
                style={{ border: `1px dashed ${tk.borderMed}`, color: tk.textMuted, fontFamily: '"Raleway", sans-serif' }}>
                <Plus size={14} /> Add Another Reel
              </button>
            </div>
          </div>

          {/* Admin Account */}
          <div className="rounded-2xl p-5 transition-colors duration-300" style={cardStyle}>
            <h2 className="font-semibold text-sm mb-3" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>Admin Account</h2>
            <p className="text-sm mb-4" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>
              To change your admin email or password, go directly to your Supabase dashboard:
            </p>
            <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: tk.cardBgHover, border: `1px solid ${tk.borderMed}`, color: tk.textSecondary, fontFamily: '"Raleway", sans-serif' }}>
              Open Supabase Dashboard ↗
            </a>
          </div>

          {/* Sticky save bar */}
          {hasAnyChanges && (
            <div className="sticky bottom-4 rounded-2xl px-6 py-4 flex items-center justify-between"
              style={{ background: tk.cardBg, border: '1px solid rgba(188,61,62,0.3)', backdropFilter: 'blur(12px)' }}>
              <p className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>You have unsaved changes</p>
              <AdminBtn icon={<Save size={16} />} loading={saving} onClick={handleSaveAll}>Save All Changes</AdminBtn>
            </div>
          )}
        </>
      )}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
};

export default AdminSettings;