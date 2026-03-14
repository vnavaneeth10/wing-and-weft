// src/admin/components/AdminUI.tsx
import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Image as ImageIcon, Loader2, Check, AlertTriangle, Trash2 } from 'lucide-react';
import { useAdminTheme } from '../lib/AdminThemeContext';
import { adminTokens } from '../lib/adminTokens';

// ─── Token hook shortcut ──────────────────────────────────────────────────────
export const useAdminTk = () => {
  const { isDarkAdmin } = useAdminTheme();
  return isDarkAdmin ? adminTokens.dark : adminTokens.light;
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, sub, icon, accent = '#bc3d3e' }) => {
  const tk = useAdminTk();
  return (
    <div
      className="rounded-2xl p-5 flex items-start gap-4 transition-colors duration-300"
      style={{ background: tk.cardBg, border: `1px solid ${tk.border}` }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}20`, border: `1px solid ${accent}30` }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs mb-1 uppercase" style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.1em', color: tk.textMuted }}>
          {title}
        </p>
        <p className="text-2xl font-bold" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-0.5" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children, wide = false, footer }) => {
  const tk = useAdminTk();
  const { isDarkAdmin } = useAdminTheme();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full ${wide ? 'max-w-4xl' : 'max-w-2xl'} max-h-[90vh] flex flex-col rounded-2xl overflow-hidden transition-colors duration-300`}
        style={{ background: tk.modalBg, border: `1px solid ${tk.borderMed}` }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: tk.border }}>
          <h2 className="font-semibold text-lg" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: tk.textMuted }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDarkAdmin ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t flex-shrink-0 flex items-center justify-end gap-3" style={{ borderColor: tk.border }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Form Field ───────────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

export const Field: React.FC<FieldProps> = ({ label, required, children, hint }) => {
  const tk = useAdminTk();
  return (
    <div className="mb-5">
      <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.12em', color: tk.textLabel }}>
        {label} {required && <span style={{ color: '#bc3d3e' }}>*</span>}
      </label>
      {children}
      {hint && <p className="text-xs mt-1" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>{hint}</p>}
    </div>
  );
};

// ─── Input styles — now theme-aware via hook ──────────────────────────────────
export const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 font-body";

// Static fallback — use useAdminInputStyle() hook for theme-aware version
export const inputStyle = { background: '#0f1117', border: '1px solid rgba(255,255,255,0.1)', fontFamily: '"Raleway", sans-serif' };

// ✅ Theme-aware input style hook — use this in all pages
export const useAdminInputStyle = (): React.CSSProperties => {
  const tk = useAdminTk();
  return { background: tk.inputBg, border: `1px solid ${tk.borderInput}`, fontFamily: '"Raleway", sans-serif', color: tk.textPrimary };
};

// ─── Admin Button ─────────────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const AdminBtn: React.FC<BtnProps> = ({ children, variant = 'primary', loading = false, icon, className = '', ...props }) => {
  const { isDarkAdmin } = useAdminTheme();
  const styles: Record<string, React.CSSProperties> = {
    primary:   { background: 'linear-gradient(135deg, #bc3d3e, #9e3233)', color: '#e9e3cb' },
    secondary: isDarkAdmin
      ? { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#e0e0e0' }
      : { background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.15)', color: '#44403c' },
    danger:    { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' },
    ghost:     { color: isDarkAdmin ? '#94a3b8' : '#78716c' },
  };
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ fontFamily: '"Raleway", sans-serif', ...styles[variant] }}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  );
};

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps { label: string; color?: 'green' | 'red' | 'orange' | 'gold' | 'blue' | 'gray'; }
const BADGE_BG:   Record<string, string> = { green: 'rgba(34,197,94,0.15)', red: 'rgba(188,61,62,0.2)', orange: 'rgba(230,147,88,0.2)', gold: 'rgba(182,137,60,0.2)', blue: 'rgba(59,130,246,0.15)', gray: 'rgba(120,113,108,0.15)' };
const BADGE_TEXT: Record<string, string> = { green: '#86efac', red: '#fca5a5', orange: '#fdba74', gold: '#fcd34d', blue: '#93c5fd', gray: '#a8a29e' };

export const Badge: React.FC<BadgeProps> = ({ label, color = 'gray' }) => (
  <span
    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
    style={{ background: BADGE_BG[color], color: BADGE_TEXT[color], fontFamily: '"Raleway", sans-serif' }}
  >
    {label}
  </span>
);

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
interface ConfirmProps { title: string; message: string; onConfirm: () => void; onCancel: () => void; loading?: boolean; }

export const ConfirmDialog: React.FC<ConfirmProps> = ({ title, message, onConfirm, onCancel, loading }) => {
  const tk = useAdminTk();
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6 transition-colors duration-300" style={{ background: tk.modalBg, border: '1px solid rgba(239,68,68,0.3)' }}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.15)' }}>
            <AlertTriangle size={18} color="#fca5a5" />
          </div>
          <div>
            <h3 className="font-semibold mb-1" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>{title}</h3>
            <p className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <AdminBtn variant="secondary" onClick={onCancel}>Cancel</AdminBtn>
          <AdminBtn variant="danger" onClick={onConfirm} loading={loading}><Trash2 size={14} /> Delete</AdminBtn>
        </div>
      </div>
    </div>
  );
};

// ─── Image Uploader ───────────────────────────────────────────────────────────
interface ImageUploaderProps { value: string; onChange: (url: string, file?: File) => void; label?: string; aspectRatio?: string; }

export const SingleImageUploader: React.FC<ImageUploaderProps> = ({ value, onChange, label = 'Image', aspectRatio = '4/3' }) => {
  const tk = useAdminTk();
  const { isDarkAdmin } = useAdminTheme();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = (file: File) => onChange(URL.createObjectURL(file), file);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleFile(file);
  }, []);

  return (
    <div>
      <div
        className={`relative rounded-xl overflow-hidden border-2 border-dashed transition-all cursor-pointer`}
        style={{
          aspectRatio,
          borderColor: dragging ? '#bc3d3e' : tk.borderMed,
          background: dragging ? 'rgba(188,61,62,0.05)' : 'transparent',
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center group">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
                <Upload size={24} color="white" className="mx-auto mb-1" />
                <p className="text-white text-xs" style={{ fontFamily: '"Raleway", sans-serif' }}>Change image</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <ImageIcon size={32} className="mb-2" style={{ color: tk.textMuted }} />
            <p className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>Click or drag to upload</p>
            <p className="text-xs mt-1" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>JPG, PNG, WebP</p>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
    </div>
  );
};

// ─── Multi Image Uploader ─────────────────────────────────────────────────────
interface MultiImageUploaderProps { values: string[]; onChange: (urls: string[], files: (File | null)[]) => void; }

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({ values, onChange }) => {
  const tk = useAdminTk();
  const slots = [0, 1, 2, 3];
  const fileRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const pendingFiles = useRef<(File | null)[]>([null, null, null, null]);

  const handleFile = (index: number, file: File) => {
    const newUrls = [...values]; while (newUrls.length < 4) newUrls.push('');
    newUrls[index] = URL.createObjectURL(file);
    pendingFiles.current[index] = file;
    onChange(newUrls, [...pendingFiles.current]);
  };
  const removeImage = (index: number) => {
    const newUrls = [...values]; newUrls[index] = '';
    pendingFiles.current[index] = null;
    onChange(newUrls, [...pendingFiles.current]);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {slots.map(i => (
        <div key={i} className="relative">
          <div
            className="rounded-xl overflow-hidden border-2 border-dashed transition-all cursor-pointer"
            style={{ aspectRatio: '3/4', borderColor: values[i] ? 'transparent' : tk.borderMed }}
            onClick={() => fileRefs[i].current?.click()}
          >
            {values[i] ? (
              <>
                <img src={values[i]} alt={`Product image ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center group">
                  <Upload size={20} color="white" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-2">
                <ImageIcon size={20} className="mb-1" style={{ color: tk.textMuted }} />
                <p className="text-xs" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>
                  {i === 0 ? 'Main photo' : `Photo ${i + 1}`}
                </p>
              </div>
            )}
          </div>
          {values[i] && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); removeImage(i); }}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.8)' }}
              aria-label={`Remove image ${i + 1}`}
            >
              <X size={12} color="white" />
            </button>
          )}
          <input ref={fileRefs[i]} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(i, f); }} />
        </div>
      ))}
    </div>
  );
};

// ─── Color Picker Row ─────────────────────────────────────────────────────────
interface ColorPickerProps { colors: string[]; onChange: (colors: string[]) => void; }

export const ColorPicker: React.FC<ColorPickerProps> = ({ colors, onChange }) => {
  const tk = useAdminTk();
  const add    = () => onChange([...colors, '#bc3d3e']);
  const remove = (i: number) => onChange(colors.filter((_, idx) => idx !== i));
  const update = (i: number, val: string) => { const n = [...colors]; n[i] = val; onChange(n); };
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {colors.map((c, i) => (
        <div key={i} className="flex items-center gap-1 rounded-lg overflow-hidden" style={{ border: `1px solid ${tk.borderMed}` }}>
          <input type="color" value={c} onChange={e => update(i, e.target.value)} className="w-8 h-8 cursor-pointer border-0 p-0" style={{ background: 'transparent' }} />
          <button type="button" onClick={() => remove(i)} className="px-1.5 transition-colors" style={{ color: tk.textMuted }} aria-label={`Remove color ${i + 1}`}>
            <X size={12} />
          </button>
        </div>
      ))}
      <button
        type="button" onClick={add}
        className="px-3 py-1.5 rounded-lg text-xs transition-colors"
        style={{ border: `1px dashed ${tk.borderMed}`, color: tk.textMuted }}
      >
        + Add Color
      </button>
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
export const EmptyState: React.FC<{ message: string; icon?: React.ReactNode }> = ({ message, icon }) => {
  const tk = useAdminTk();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-4xl mb-3 opacity-30">{icon || '📦'}</div>
      <p className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>{message}</p>
    </div>
  );
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <div className="flex items-center justify-center py-12">
    <Loader2 size={size} className="animate-spin text-brand-red" />
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastProps { message: string; type: 'success' | 'error'; }

export const Toast: React.FC<ToastProps> = ({ message, type }) => (
  <div
    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm"
    style={{
      background: type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
      border: `1px solid ${type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
      color: type === 'success' ? '#86efac' : '#fca5a5',
      fontFamily: '"Raleway", sans-serif',
    }}
  >
    {type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
    {message}
  </div>
);