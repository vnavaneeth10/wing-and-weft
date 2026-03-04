// src/admin/pages/AdminSettings.tsx
import React, { useState, useEffect } from 'react';
import {
  Save, Settings, Phone, Instagram, Facebook,
  MessageCircle, AlignLeft, Plus, Trash2, Image as ImageIcon,
  type LucideIcon,
} from 'lucide-react';
import { AdminBtn, Field, inputCls, inputStyle, Toast, Spinner } from '../components/AdminUI';
import { useSettings } from '../hooks/useAdminData';

type ToastState = { msg: string; type: 'success' | 'error' } | null;

interface SettingField {
  key: string;
  label: string;
  placeholder: string;
  icon: LucideIcon;
  hint?: string;
  type?: 'text' | 'tel' | 'url' | 'textarea';
}

// ─── Instagram post type ──────────────────────────────────────────────────────
interface InstagramPost {
  id:      string;
  image:   string;
  link:    string;
  caption: string;
}

// ─── Watch & Shop reel type ───────────────────────────────────────────────────
interface Reel {
  id:        string;
  thumbnail: string;
  name:      string;
  price:     number;
  link:      string;
}

const SETTING_FIELDS: SettingField[] = [
  { key: 'whatsapp_number', label: 'WhatsApp Business Number', placeholder: '919999999999', icon: MessageCircle, hint: 'Include country code, no + or spaces. Example: 919876543210 for +91 98765 43210', type: 'tel' },
  { key: 'instagram_url', label: 'Instagram Profile URL', placeholder: 'https://www.instagram.com/wingandweft/', icon: Instagram, type: 'url' },
  { key: 'facebook_url', label: 'Facebook Page URL', placeholder: 'https://www.facebook.com/wingandweft', icon: Facebook, type: 'url' },
  { key: 'contact_phone', label: 'Contact Phone (Display)', placeholder: '+91 99999 99999', icon: Phone },
  { key: 'contact_email', label: 'Support Email', placeholder: 'support@wingandweft.com', icon: MessageCircle },
  { key: 'ribbon_text', label: 'Ribbon Scrolling Text', placeholder: 'Timeless sarees crafted with uncompromising quality...', icon: AlignLeft, hint: 'This text scrolls below the homepage banner', type: 'textarea' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parseJson = <T,>(val: string, fallback: T[]): T[] => {
  try { const p = JSON.parse(val); return Array.isArray(p) ? p : fallback; }
  catch { return fallback; }
};

const newId = () => Date.now().toString();

// ─── Sub-components ───────────────────────────────────────────────────────────

// Instagram post row
const PostRow: React.FC<{
  post: InstagramPost;
  onChange: (p: InstagramPost) => void;
  onDelete: () => void;
}> = ({ post, onChange, onDelete }) => (
  <div
    className="rounded-xl p-4 space-y-3"
    style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)' }}
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <label className="text-slate-500 text-xs mb-1 block" style={{ fontFamily: '"Raleway", sans-serif' }}>Image URL</label>
        <input
          className={inputCls}
          style={inputStyle}
          placeholder="https://..."
          value={post.image}
          onChange={(e) => onChange({ ...post, image: e.target.value })}
        />
      </div>
      <div>
        <label className="text-slate-500 text-xs mb-1 block" style={{ fontFamily: '"Raleway", sans-serif' }}>Instagram Post Link</label>
        <input
          className={inputCls}
          style={inputStyle}
          placeholder="https://www.instagram.com/p/..."
          value={post.link}
          onChange={(e) => onChange({ ...post, link: e.target.value })}
        />
      </div>
      <div>
        <label className="text-slate-500 text-xs mb-1 block" style={{ fontFamily: '"Raleway", sans-serif' }}>Caption</label>
        <input
          className={inputCls}
          style={inputStyle}
          placeholder="e.g. Kanchipuram Elegance"
          value={post.caption}
          onChange={(e) => onChange({ ...post, caption: e.target.value })}
        />
      </div>
    </div>

    <div className="flex items-center gap-3">
      {/* Preview thumbnail */}
      {post.image && (
        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          <img src={post.image} alt={post.caption} className="w-full h-full object-cover" />
        </div>
      )}
      <button
        onClick={onDelete}
        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontFamily: '"Raleway", sans-serif' }}
      >
        <Trash2 size={12} /> Remove
      </button>
    </div>
  </div>
);

// Reel row
const ReelRow: React.FC<{
  reel: Reel;
  onChange: (r: Reel) => void;
  onDelete: () => void;
}> = ({ reel, onChange, onDelete }) => (
  <div
    className="rounded-xl p-4 space-y-3"
    style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)' }}
  >
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <div>
        <label className="text-slate-500 text-xs mb-1 block" style={{ fontFamily: '"Raleway", sans-serif' }}>Thumbnail URL</label>
        <input
          className={inputCls}
          style={inputStyle}
          placeholder="https://..."
          value={reel.thumbnail}
          onChange={(e) => onChange({ ...reel, thumbnail: e.target.value })}
        />
      </div>
      <div>
        <label className="text-slate-500 text-xs mb-1 block" style={{ fontFamily: '"Raleway", sans-serif' }}>Product Name</label>
        <input
          className={inputCls}
          style={inputStyle}
          placeholder="e.g. Kanchipuram Draping Style"
          value={reel.name}
          onChange={(e) => onChange({ ...reel, name: e.target.value })}
        />
      </div>
      <div>
        <label className="text-slate-500 text-xs mb-1 block" style={{ fontFamily: '"Raleway", sans-serif' }}>Price (₹)</label>
        <input
          type="number"
          min={0}
          className={inputCls}
          style={inputStyle}
          placeholder="e.g. 5000"
          value={reel.price || ''}
          onChange={(e) => onChange({ ...reel, price: Number(e.target.value) })}
        />
      </div>
      <div>
        <label className="text-slate-500 text-xs mb-1 block" style={{ fontFamily: '"Raleway", sans-serif' }}>Instagram/Product Link</label>
        <input
          className={inputCls}
          style={inputStyle}
          placeholder="https://www.instagram.com/p/..."
          value={reel.link}
          onChange={(e) => onChange({ ...reel, link: e.target.value })}
        />
      </div>
    </div>

    <div className="flex items-center gap-3">
      {reel.thumbnail && (
        <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          <img src={reel.thumbnail} alt={reel.name} className="w-full h-full object-cover" />
        </div>
      )}
      <button
        onClick={onDelete}
        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontFamily: '"Raleway", sans-serif' }}
      >
        <Trash2 size={12} /> Remove
      </button>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminSettings: React.FC = () => {
  const { settings, loading, saveSetting } = useSettings();
  const [values, setValues]   = useState<Record<string, string>>({});
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState<ToastState>(null);
  const [changed, setChanged] = useState<Set<string>>(new Set());

  // Instagram posts state
  const [posts, setPosts]           = useState<InstagramPost[]>([]);
  const [postsChanged, setPostsChanged] = useState(false);

  // Watch & Shop reels state
  const [reels, setReels]           = useState<Reel[]>([]);
  const [reelsChanged, setReelsChanged] = useState(false);

  // Load settings into local state
  useEffect(() => {
    setValues({ ...settings });
    if (settings['instagram_posts']) {
      setPosts(parseJson<InstagramPost>(settings['instagram_posts'], []));
    }
    if (settings['watch_shop_reels']) {
      setReels(parseJson<Reel>(settings['watch_shop_reels'], []));
    }
  }, [settings]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setChanged((prev) => new Set([...prev, key]));
  };

  // ── Instagram post handlers ────────────────────────────────────────────────
  const updatePost = (index: number, post: InstagramPost) => {
    setPosts((prev) => prev.map((p, i) => i === index ? post : p));
    setPostsChanged(true);
  };
  const deletePost = (index: number) => {
    setPosts((prev) => prev.filter((_, i) => i !== index));
    setPostsChanged(true);
  };
  const addPost = () => {
    setPosts((prev) => [...prev, { id: newId(), image: '', link: 'https://www.instagram.com/wingandweft/', caption: '' }]);
    setPostsChanged(true);
  };

  // ── Reel handlers ──────────────────────────────────────────────────────────
  const updateReel = (index: number, reel: Reel) => {
    setReels((prev) => prev.map((r, i) => i === index ? reel : r));
    setReelsChanged(true);
  };
  const deleteReel = (index: number) => {
    setReels((prev) => prev.filter((_, i) => i !== index));
    setReelsChanged(true);
  };
  const addReel = () => {
    setReels((prev) => [...prev, { id: newId(), thumbnail: '', name: '', price: 0, link: 'https://www.instagram.com/wingandweft/' }]);
    setReelsChanged(true);
  };

  // ── Save all ───────────────────────────────────────────────────────────────
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const saves: Promise<void>[] = [];

      // Save basic settings
      saves.push(...[...changed].map((key) => saveSetting(key, values[key] || '')));

      // Save Instagram posts
      if (postsChanged) {
        saves.push(saveSetting('instagram_posts', JSON.stringify(posts)));
      }

      // Save reels
      if (reelsChanged) {
        saves.push(saveSetting('watch_shop_reels', JSON.stringify(reels)));
      }

      await Promise.all(saves);
      setChanged(new Set());
      setPostsChanged(false);
      setReelsChanged(false);
      showToast('All settings saved successfully', 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const hasAnyChanges = changed.size > 0 || postsChanged || reelsChanged;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold" style={{ fontFamily: '"Raleway", sans-serif' }}>Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5" style={{ fontFamily: '"Raleway", sans-serif' }}>
            Manage brand links, contact info, Instagram posts and Watch & Shop reels
          </p>
        </div>
        {hasAnyChanges && (
          <AdminBtn icon={<Save size={16} />} loading={saving} onClick={handleSaveAll}>
            Save Changes
          </AdminBtn>
        )}
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* ── Brand & Social ───────────────────────────────────────────── */}
          <div className="rounded-2xl overflow-hidden" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
              <Settings size={16} className="text-brand-gold" />
              <h2 className="text-white font-semibold text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>
                Brand & Social Links
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
              {SETTING_FIELDS.map(({ key, label, placeholder, icon: Icon, hint, type = 'text' }) => (
                <div key={key} className={type === 'textarea' ? 'md:col-span-2' : ''}>
                  <Field label={label} hint={hint}>
                    <div className="relative">
                      <Icon size={15} className="absolute left-3.5 top-3 text-slate-500" />
                      {type === 'textarea' ? (
                        <textarea
                          rows={3}
                          className={`${inputCls} pl-10`}
                          style={{ ...inputStyle, resize: 'none' }}
                          placeholder={placeholder}
                          value={values[key] || ''}
                          onChange={(e) => handleChange(key, e.target.value)}
                        />
                      ) : (
                        <input
                          type={type}
                          className={`${inputCls} pl-10`}
                          style={{ ...inputStyle, ...(changed.has(key) ? { borderColor: 'rgba(188,61,62,0.4)' } : {}) }}
                          placeholder={placeholder}
                          value={values[key] || ''}
                          onChange={(e) => handleChange(key, e.target.value)}
                        />
                      )}
                      {changed.has(key) && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-orange" style={{ fontFamily: '"Raleway", sans-serif' }}>
                          unsaved
                        </span>
                      )}
                    </div>
                  </Field>
                </div>
              ))}
            </div>
          </div>

          {/* ── Instagram Posts ──────────────────────────────────────────── */}
          <div className="rounded-2xl overflow-hidden" style={{ background: '#1a1b2e', border: `1px solid ${postsChanged ? 'rgba(188,61,62,0.4)' : 'rgba(255,255,255,0.07)'}` }}>
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Instagram size={16} className="text-brand-gold" />
                <h2 className="text-white font-semibold text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>
                  Instagram Section Posts
                </h2>
                <span className="text-slate-500 text-xs" style={{ fontFamily: '"Raleway", sans-serif' }}>
                  ({posts.length} posts)
                </span>
                {postsChanged && (
                  <span className="text-xs text-brand-orange" style={{ fontFamily: '"Raleway", sans-serif' }}>• unsaved</span>
                )}
              </div>
              <button
                onClick={addPost}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: 'rgba(182,137,60,0.15)', border: '1px solid rgba(182,137,60,0.3)', color: '#fcd34d', fontFamily: '"Raleway", sans-serif' }}
              >
                <Plus size={12} /> Add Post
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-slate-500 text-xs" style={{ fontFamily: '"Raleway", sans-serif' }}>
                These posts appear in the Instagram section on the homepage. Add the direct image URL and the link to the Instagram post.
              </p>

              {posts.length === 0 ? (
                <div className="text-center py-8 rounded-xl" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <ImageIcon size={24} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>
                    No posts yet. Click "Add Post" to add your first Instagram post.
                  </p>
                </div>
              ) : (
                posts.map((post, i) => (
                  <PostRow
                    key={post.id}
                    post={post}
                    onChange={(p) => updatePost(i, p)}
                    onDelete={() => deletePost(i)}
                  />
                ))
              )}

              <button
                onClick={addPost}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80 flex items-center justify-center gap-2"
                style={{ border: '1px dashed rgba(255,255,255,0.15)', color: '#64748b', fontFamily: '"Raleway", sans-serif' }}
              >
                <Plus size={14} /> Add Another Post
              </button>
            </div>
          </div>

          {/* ── Watch & Shop Reels ───────────────────────────────────────── */}
          <div className="rounded-2xl overflow-hidden" style={{ background: '#1a1b2e', border: `1px solid ${reelsChanged ? 'rgba(188,61,62,0.4)' : 'rgba(255,255,255,0.07)'}` }}>
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-brand-gold" />
                <h2 className="text-white font-semibold text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>
                  Watch & Shop Reels
                </h2>
                <span className="text-slate-500 text-xs" style={{ fontFamily: '"Raleway", sans-serif' }}>
                  ({reels.length} reels)
                </span>
                {reelsChanged && (
                  <span className="text-xs text-brand-orange" style={{ fontFamily: '"Raleway", sans-serif' }}>• unsaved</span>
                )}
              </div>
              <button
                onClick={addReel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: 'rgba(182,137,60,0.15)', border: '1px solid rgba(182,137,60,0.3)', color: '#fcd34d', fontFamily: '"Raleway", sans-serif' }}
              >
                <Plus size={12} /> Add Reel
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-slate-500 text-xs" style={{ fontFamily: '"Raleway", sans-serif' }}>
                These cards appear in the Watch & Shop section. Add a thumbnail image URL, product name, price and the link to the reel or product.
              </p>

              {reels.length === 0 ? (
                <div className="text-center py-8 rounded-xl" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <ImageIcon size={24} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>
                    No reels yet. Click "Add Reel" to add your first Watch & Shop card.
                  </p>
                </div>
              ) : (
                reels.map((reel, i) => (
                  <ReelRow
                    key={reel.id}
                    reel={reel}
                    onChange={(r) => updateReel(i, r)}
                    onDelete={() => deleteReel(i)}
                  />
                ))
              )}

              <button
                onClick={addReel}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80 flex items-center justify-center gap-2"
                style={{ border: '1px dashed rgba(255,255,255,0.15)', color: '#64748b', fontFamily: '"Raleway", sans-serif' }}
              >
                <Plus size={14} /> Add Another Reel
              </button>
            </div>
          </div>

          {/* ── Admin Account ────────────────────────────────────────────── */}
          <div className="rounded-2xl p-5" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-white font-semibold text-sm mb-3" style={{ fontFamily: '"Raleway", sans-serif' }}>Admin Account</h2>
            <p className="text-slate-400 text-sm mb-4" style={{ fontFamily: '"Raleway", sans-serif' }}>
              To change your admin email or password, go directly to your Supabase dashboard:
            </p>
            <a
              href="https://app.supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#e0e0e0', fontFamily: '"Raleway", sans-serif' }}
            >
              Open Supabase Dashboard ↗
            </a>
          </div>

          {/* ── Bottom save bar ──────────────────────────────────────────── */}
          {hasAnyChanges && (
            <div
              className="sticky bottom-4 rounded-2xl px-6 py-4 flex items-center justify-between"
              style={{ background: 'rgba(26,27,46,0.95)', border: '1px solid rgba(188,61,62,0.3)', backdropFilter: 'blur(12px)' }}
            >
              <p className="text-slate-300 text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>
                You have unsaved changes
              </p>
              <AdminBtn icon={<Save size={16} />} loading={saving} onClick={handleSaveAll}>
                Save All Changes
              </AdminBtn>
            </div>
          )}
        </>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
};

export default AdminSettings;