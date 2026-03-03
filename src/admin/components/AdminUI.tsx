// src/admin/components/AdminUI.tsx
import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Image as ImageIcon, Loader2, Check, AlertTriangle, Trash2, GripVertical } from 'lucide-react';

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, sub, icon, accent = '#bc3d3e' }) => (
  <div
    className="rounded-2xl p-5 flex items-start gap-4"
    style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.07)' }}
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${accent}20`, border: `1px solid ${accent}30` }}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-slate-400 text-xs mb-1" style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {title}
      </p>
      <p className="text-white text-2xl font-bold" style={{ fontFamily: '"Raleway", sans-serif' }}>
        {value}
      </p>
      {sub && (
        <p className="text-slate-500 text-xs mt-0.5" style={{ fontFamily: '"Raleway", sans-serif' }}>
          {sub}
        </p>
      )}
    </div>
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children, wide = false, footer }) => {
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={handleBackdrop}
    >
      <div
        className={`w-full ${wide ? 'max-w-4xl' : 'max-w-2xl'} max-h-[90vh] flex flex-col rounded-2xl overflow-hidden`}
        style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-white font-semibold text-lg" style={{ fontFamily: '"Raleway", sans-serif' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-white/10 flex-shrink-0 flex items-center justify-end gap-3">
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

export const Field: React.FC<FieldProps> = ({ label, required, children, hint }) => (
  <div className="mb-5">
    <label className="block text-slate-300 text-xs font-semibold mb-2 uppercase tracking-wider" style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.12em' }}>
      {label} {required && <span className="text-brand-red">*</span>}
    </label>
    {children}
    {hint && <p className="text-slate-500 text-xs mt-1" style={{ fontFamily: '"Raleway", sans-serif' }}>{hint}</p>}
  </div>
);

// ─── Input styles ─────────────────────────────────────────────────────────────
export const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red/60 font-body";
export const inputStyle = { background: '#0f1117', border: '1px solid rgba(255,255,255,0.1)', fontFamily: '"Raleway", sans-serif' };

// ─── Admin Button ─────────────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const AdminBtn: React.FC<BtnProps> = ({
  children, variant = 'primary', loading = false, icon, className = '', ...props
}) => {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: 'linear-gradient(135deg, #bc3d3e, #9e3233)', color: '#e9e3cb' },
    secondary: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#e0e0e0' },
    danger: { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' },
    ghost: { color: '#94a3b8' },
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
interface BadgeProps {
  label: string;
  color?: 'green' | 'red' | 'orange' | 'gold' | 'blue' | 'gray';
}

const BADGE_COLORS: Record<string, string> = {
  green: 'rgba(34,197,94,0.15)',
  red: 'rgba(188,61,62,0.2)',
  orange: 'rgba(230,147,88,0.2)',
  gold: 'rgba(182,137,60,0.2)',
  blue: 'rgba(59,130,246,0.15)',
  gray: 'rgba(255,255,255,0.08)',
};
const BADGE_TEXT: Record<string, string> = {
  green: '#86efac', red: '#fca5a5', orange: '#fdba74', gold: '#fcd34d', blue: '#93c5fd', gray: '#94a3b8',
};

export const Badge: React.FC<BadgeProps> = ({ label, color = 'gray' }) => (
  <span
    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
    style={{ background: BADGE_COLORS[color], color: BADGE_TEXT[color], fontFamily: '"Raleway", sans-serif' }}
  >
    {label}
  </span>
);

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
interface ConfirmProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmProps> = ({ title, message, onConfirm, onCancel, loading }) => (
  <div
    className="fixed inset-0 z-60 flex items-center justify-center p-4"
    style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
  >
    <div
      className="w-full max-w-sm rounded-2xl p-6"
      style={{ background: '#1a1b2e', border: '1px solid rgba(239,68,68,0.3)' }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.15)' }}>
          <AlertTriangle size={18} color="#fca5a5" />
        </div>
        <div>
          <h3 className="text-white font-semibold mb-1" style={{ fontFamily: '"Raleway", sans-serif' }}>{title}</h3>
          <p className="text-slate-400 text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>{message}</p>
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <AdminBtn variant="secondary" onClick={onCancel}>Cancel</AdminBtn>
        <AdminBtn variant="danger" onClick={onConfirm} loading={loading}>
          <Trash2 size={14} /> Delete
        </AdminBtn>
      </div>
    </div>
  </div>
);

// ─── Image Uploader ───────────────────────────────────────────────────────────
interface ImageUploaderProps {
  value: string;
  onChange: (url: string, file?: File) => void;
  label?: string;
  aspectRatio?: string;
}

export const SingleImageUploader: React.FC<ImageUploaderProps> = ({
  value, onChange, label = 'Image', aspectRatio = '4/3'
}) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const localUrl = URL.createObjectURL(file);
    onChange(localUrl, file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  }, []);

  return (
    <div>
      <div
        className={`relative rounded-xl overflow-hidden border-2 border-dashed transition-all cursor-pointer ${dragging ? 'border-brand-red bg-brand-red/10' : 'border-white/20 hover:border-white/40'}`}
        style={{ aspectRatio }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
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
            <ImageIcon size={32} className="text-slate-600 mb-2" />
            <p className="text-slate-400 text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>Click or drag to upload</p>
            <p className="text-slate-600 text-xs mt-1" style={{ fontFamily: '"Raleway", sans-serif' }}>JPG, PNG, WebP</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
};

// ─── Multi Image Uploader (product — 4 images) ────────────────────────────────
interface MultiImageUploaderProps {
  values: string[];
  onChange: (urls: string[], files: (File | null)[]) => void;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({ values, onChange }) => {
  const slots = [0, 1, 2, 3];
  const fileRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const pendingFiles = useRef<(File | null)[]>([null, null, null, null]);

  const handleFile = (index: number, file: File) => {
    const localUrl = URL.createObjectURL(file);
    const newUrls = [...values];
    while (newUrls.length < 4) newUrls.push('');
    newUrls[index] = localUrl;
    pendingFiles.current[index] = file;
    onChange(newUrls, [...pendingFiles.current]);
  };

  const removeImage = (index: number) => {
    const newUrls = [...values];
    newUrls[index] = '';
    pendingFiles.current[index] = null;
    onChange(newUrls, [...pendingFiles.current]);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {slots.map((i) => (
        <div key={i} className="relative">
          <div
            className={`rounded-xl overflow-hidden border-2 border-dashed transition-all cursor-pointer ${values[i] ? 'border-transparent' : 'border-white/20 hover:border-white/40'}`}
            style={{ aspectRatio: '3/4' }}
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
                <ImageIcon size={20} className="text-slate-600 mb-1" />
                <p className="text-slate-500 text-xs" style={{ fontFamily: '"Raleway", sans-serif' }}>
                  {i === 0 ? 'Main photo' : `Photo ${i + 1}`}
                </p>
              </div>
            )}
          </div>
          {values[i] && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeImage(i); }}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.8)' }}
              aria-label={`Remove image ${i + 1}`}
            >
              <X size={12} color="white" />
            </button>
          )}
          <input
            ref={fileRefs[i]}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(i, f); }}
          />
        </div>
      ))}
    </div>
  );
};

// ─── Color Picker Row ─────────────────────────────────────────────────────────
interface ColorPickerProps {
  colors: string[];
  onChange: (colors: string[]) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ colors, onChange }) => {
  const add = () => onChange([...colors, '#bc3d3e']);
  const remove = (i: number) => onChange(colors.filter((_, idx) => idx !== i));
  const update = (i: number, val: string) => {
    const next = [...colors];
    next[i] = val;
    onChange(next);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {colors.map((c, i) => (
        <div key={i} className="flex items-center gap-1 rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
          <input
            type="color"
            value={c}
            onChange={(e) => update(i, e.target.value)}
            className="w-8 h-8 cursor-pointer border-0 p-0"
            style={{ background: 'transparent' }}
            title={`Color ${i + 1}`}
          />
          <button type="button" onClick={() => remove(i)} className="px-1.5 text-slate-400 hover:text-red-400 transition-colors" aria-label={`Remove color ${i + 1}`}>
            <X size={12} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
        style={{ border: '1px dashed rgba(255,255,255,0.2)' }}
      >
        + Add Color
      </button>
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
export const EmptyState: React.FC<{ message: string; icon?: React.ReactNode }> = ({ message, icon }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="text-4xl mb-3 opacity-30">{icon || '📦'}</div>
    <p className="text-slate-500 text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>{message}</p>
  </div>
);

// ─── Loading spinner ──────────────────────────────────────────────────────────
export const Spinner: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <div className="flex items-center justify-center py-12">
    <Loader2 size={size} className="animate-spin text-brand-red" />
  </div>
);

// ─── Toast notification ───────────────────────────────────────────────────────
interface ToastProps { message: string; type: 'success' | 'error' }

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
