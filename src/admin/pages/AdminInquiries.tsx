// src/admin/pages/AdminInquiries.tsx
import React, { useState } from 'react';
import {
  MessageSquare, ExternalLink, CheckCheck, Eye, X,
  Mail, Phone, Clock, Tag, ArrowLeft, Trash2, Download, FileDown,
} from 'lucide-react';
import { AdminBtn, Badge, Spinner, Toast, useAdminTk } from '../components/AdminUI';
import { exportToExcel, exportToPDF } from '../lib/adminExport';
import { useInquiries, DBInquiry } from '../hooks/useAdminData';

type ToastState = { msg: string; type: 'success' | 'error' } | null;
type SourceType  = 'newsletter' | 'launch' | 'product' | 'contact';

const STATUS_COLOR = { new: 'red', seen: 'orange', replied: 'green' } as const;
const STATUS_LABEL = { new: 'New', seen: 'Seen', replied: 'Replied' };

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const getSource = (msg: string): { label: string; color: string; type: SourceType } => {
  if (msg.includes('newsletter') || msg.includes('Subscribed'))
    return { label: '📧 Newsletter',      color: 'rgba(99,102,241,0.15)',  type: 'newsletter' };
  if (msg.includes('Coming Soon') || msg.includes('launch'))
    return { label: '🚀 Launch Alert',    color: 'rgba(245,158,11,0.15)',  type: 'launch'     };
  if (msg.includes('product') || msg.includes('Re:'))
    return { label: '🛍 Product Inquiry', color: 'rgba(16,185,129,0.15)',  type: 'product'    };
  return   { label: '✉️ Contact Form',   color: 'rgba(59,130,246,0.15)',  type: 'contact'    };
};

// ─── Four fully distinct email templates ─────────────────────────────────────
const buildEmail = (
  name: string,
  type: SourceType,
  productName?: string | null,
): { subject: string; body: string } => {

  // ── 1. Newsletter subscriber ──────────────────────────────────────────────
  if (type === 'newsletter') {
    return {
      subject: 'Hello from Wing & Weft 🌿',
      body:
`Hi ${name},

Thank you for subscribing to our newsletter — it means a lot to us!

We are Wing & Weft, a small saree brand that brings together traditional weaves and everyday elegance. Every piece we carry is chosen with care — for the fabric, the craft, and the woman who wears it.

We would love for you to take a look at what we have for you:
🌐 Website: www.wingandweft.com

You can also reach us directly on WhatsApp — whether it is a question about a saree, help with sizing, or placing an order, we are just a message away:
💬 WhatsApp: +91 8137877446

Feel free to reply to this email too — we read every message.

Hope to see you soon!

Warm regards,
The Wing & Weft Team
www.wingandweft.com
+91 8137877446`,
    };
  }

  // ── 2. Launch-alert sign-up ───────────────────────────────────────────────
  if (type === 'launch') {
    return {
      subject: 'You are on the list — Wing & Weft 🚀',
      body:
`Hi ${name},

You are officially on the list — and we could not be more excited to have you!

We are Wing & Weft, a small saree brand built around traditional weaves and the women who wear them. Our upcoming collection has been months in the making, and you will be among the very first to know when it goes live.

While you wait, feel free to browse what we already have:
🌐 Website: www.wingandweft.com

Have questions or want a sneak peek? Drop us a message on WhatsApp — we love talking sarees:
💬 WhatsApp: +91 8137877446

Or simply reply to this email — we are always here.

See you at launch!

Warm regards,
The Wing & Weft Team
www.wingandweft.com
+91 8137877446`,
    };
  }

  // ── 3. Product inquiry ────────────────────────────────────────────────────
  if (type === 'product') {
    const about = productName ? `the ${productName}` : 'one of our pieces';
    return {
      subject: `Re: Your inquiry at Wing & Weft 🛍`,
      body:
`Hi ${name},

Thank you for your interest in ${about} — we are so glad you reached out!

At Wing & Weft we handpick every saree for its weave, its story, and the woman it is meant for. We would love to help you find exactly what you are looking for.

Here are a few ways we can help right now:
🌐 Browse the full collection: www.wingandweft.com
💬 Chat with us on WhatsApp for fabric details, sizing, or to place an order: +91 8137877446

We are happy to share more photos, answer any questions, or set a piece aside for you — just say the word.

Looking forward to hearing from you!

Warm regards,
The Wing & Weft Team
www.wingandweft.com
+91 8137877446`,
    };
  }

  // ── 4. General contact form (default) ─────────────────────────────────────
  return {
    subject: 'Hello from Wing & Weft 🌿',
    body:
`Hi ${name},

Thank you for getting in touch — we truly appreciate you taking the time to write to us!

We are Wing & Weft, a small saree brand that brings together traditional weaves and everyday elegance. Whatever brought you here, we are happy you reached out and we will do our best to help.

You can also connect with us here:
🌐 Website: www.wingandweft.com
💬 WhatsApp: +91 8137877446

Feel free to reply directly to this email as well — we read and respond to every message personally.

Hope to hear from you soon!

Warm regards,
The Wing & Weft Team
www.wingandweft.com
+91 8137877446`,
  };
};

// ─── Inquiry Row ──────────────────────────────────────────────────────────────
const InquiryRow: React.FC<{
  inq: DBInquiry; selected: boolean; onClick: () => void;
}> = ({ inq, selected, onClick }) => {
  const tk  = useAdminTk();
  const src = getSource(inq.message);
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-4 transition-all border-b"
      style={{
        background:  selected ? 'rgba(188,61,62,0.12)' : inq.status === 'new' ? 'rgba(188,61,62,0.04)' : 'transparent',
        borderColor: tk.border,
        borderLeft:  selected ? '3px solid #bc3d3e' : '3px solid transparent',
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          {inq.status === 'new' && (
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#bc3d3e' }} />
          )}
          <span
            className="font-semibold text-sm truncate"
            style={{ color: inq.status === 'new' ? tk.textPrimary : tk.textSecondary, fontFamily: '"Raleway", sans-serif' }}
          >
            {inq.customer_name}
          </span>
        </div>
        <span className="text-xs flex-shrink-0" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>
          {new Date(inq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
      </div>
      <p className="text-xs truncate mb-2" style={{ color: tk.textMuted, fontFamily: '"Raleway", sans-serif' }}>
        {inq.message}
      </p>
      <div className="flex items-center gap-2">
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: src.color, color: tk.textSecondary, fontFamily: '"Raleway", sans-serif' }}
        >
          {src.label}
        </span>
        <Badge label={STATUS_LABEL[inq.status]} color={STATUS_COLOR[inq.status]} />
      </div>
    </button>
  );
};

// ─── Delete confirmation modal ────────────────────────────────────────────────
const DeleteModal: React.FC<{
  name: string; onConfirm: () => void; onCancel: () => void;
}> = ({ name, onConfirm, onCancel }) => {
  const tk = useAdminTk();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl"
        style={{ background: tk.cardBg, border: `1px solid ${tk.border}` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <Trash2 size={18} style={{ color: '#fca5a5' }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>
              Remove inquiry?
            </p>
            <p className="text-xs mt-0.5" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>
              From <span style={{ color: tk.textSecondary }}>{name}</span> — it will be hidden from this view.
            </p>
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: tk.cardBgHover, border: `1px solid ${tk.border}`,
              color: tk.textSecondary, fontFamily: '"Raleway", sans-serif',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
            style={{ background: '#dc2626', color: '#fff', fontFamily: '"Raleway", sans-serif' }}
          >
            Yes, Remove
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Detail Panel ─────────────────────────────────────────────────────────────
const DetailPanel: React.FC<{
  inq: DBInquiry;
  onClose: () => void;
  onMarkSeen: () => void;
  onMarkReplied: () => void;
  onDelete: () => void;
  isMobile: boolean;
}> = ({ inq, onClose, onMarkSeen, onMarkReplied, onDelete, isMobile }) => {
  const tk  = useAdminTk();
  const src = getSource(inq.message);

  const openWhatsApp = () => {
    const text = inq.product_name
      ? `Hi ${inq.customer_name}! We saw your inquiry about ${inq.product_name}. How can we help?`
      : `Hi ${inq.customer_name}! Thank you for reaching out to Wing & Weft. How can we help you?`;
    const num = inq.customer_phone.replace(/\D/g, '');
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  const emailMatch  = inq.message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const parsedEmail = (inq as any).customer_email || (emailMatch ? emailMatch[0] : null);
  const hasPhone    = inq.customer_phone && inq.customer_phone !== 'N/A';

  const openEmail = () => {
    if (!parsedEmail) return;
    const { subject, body } = buildEmail(inq.customer_name, src.type, inq.product_name);
    window.open(
      `mailto:${parsedEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      '_blank',
    );
  };

  const sectionStyle = { background: tk.cardBgHover, border: `1px solid ${tk.border}` };

  return (
    <div className="flex flex-col h-full transition-colors duration-300" style={{ background: tk.cardBg }}>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: tk.border }}>
        <div className="flex items-center gap-3">
          {isMobile && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ color: tk.textMuted }}>
              <ArrowLeft size={16} />
            </button>
          )}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #bc3d3e, #b6893c)', color: '#e9e3cb', fontFamily: '"Raleway", sans-serif' }}
          >
            {inq.customer_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>
              {inq.customer_name}
            </p>
            <p className="text-xs" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>
              {fmt(inq.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge label={STATUS_LABEL[inq.status]} color={STATUS_COLOR[inq.status]} />
          {!isMobile && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ color: tk.textMuted }}>
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <span
          className="inline-block text-xs px-3 py-1 rounded-full"
          style={{ background: src.color, color: tk.textSecondary, fontFamily: '"Raleway", sans-serif' }}
        >
          {src.label}
        </span>

        {/* Contact details */}
        <div className="rounded-xl p-4 space-y-3" style={sectionStyle}>
          <p className="text-xs uppercase tracking-widest font-semibold"
            style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.15em', color: tk.textMuted }}>
            Contact Details
          </p>
          <div className="space-y-2.5">
            {hasPhone && (
              <div className="flex items-center gap-3">
                <Phone size={14} className="text-brand-gold flex-shrink-0" />
                <span className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>
                  {inq.customer_phone}
                </span>
              </div>
            )}
            {parsedEmail && (
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-brand-gold flex-shrink-0" />
                <span className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>
                  {parsedEmail}
                </span>
              </div>
            )}
            {inq.product_name && (
              <div className="flex items-center gap-3">
                <Tag size={14} className="text-brand-gold flex-shrink-0" />
                <span className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>
                  Re: {inq.product_name}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Clock size={14} className="text-brand-gold flex-shrink-0" />
              <span className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>
                {fmt(inq.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="rounded-xl p-4" style={sectionStyle}>
          <p className="text-xs uppercase tracking-widest font-semibold mb-3"
            style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.15em', color: tk.textMuted }}>
            Message
          </p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>
            {inq.message}
          </p>
        </div>

        {/* Status progress */}
        <div className="rounded-xl p-4" style={sectionStyle}>
          <p className="text-xs uppercase tracking-widest font-semibold mb-3"
            style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.15em', color: tk.textMuted }}>
            Status
          </p>
          <div className="flex items-center gap-3">
            {(['new', 'seen', 'replied'] as const).map((s, i) => {
              const order    = ['new', 'seen', 'replied'];
              const reached  = order.indexOf(inq.status) >= order.indexOf(s);
              const dotColor = s === 'new' ? '#bc3d3e' : s === 'seen' ? '#f59e0b' : '#22c55e';
              return (
                <React.Fragment key={s}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full"
                      style={{ background: reached ? dotColor : tk.border }} />
                    <span className="text-xs font-semibold capitalize"
                      style={{ color: reached ? tk.textPrimary : tk.textMuted, fontFamily: '"Raleway", sans-serif' }}>
                      {STATUS_LABEL[s]}
                    </span>
                  </div>
                  {i < 2 && (
                    <div className="flex-1 h-px"
                      style={{ background: order.indexOf(inq.status) > i ? 'rgba(182,137,60,0.4)' : tk.border }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="px-6 py-4 border-t space-y-2 flex-shrink-0" style={{ borderColor: tk.border }}>
        <div className="flex gap-2">
          {hasPhone && (
            <button
              onClick={openWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: '#25D366', color: '#fff', fontFamily: '"Raleway", sans-serif' }}
            >
              <ExternalLink size={13} /> WhatsApp
            </button>
          )}
          {parsedEmail && (
            <button
              onClick={openEmail}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
              style={{
                background: 'rgba(59,130,246,0.2)',
                border: '1px solid rgba(59,130,246,0.3)',
                color: '#93c5fd',
                fontFamily: '"Raleway", sans-serif',
              }}
            >
              <Mail size={13} /> Email
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {inq.status === 'new' && (
            <button
              onClick={onMarkSeen}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: tk.cardBgHover, border: `1px solid ${tk.border}`,
                color: tk.textSecondary, fontFamily: '"Raleway", sans-serif',
              }}
            >
              <Eye size={12} /> Mark Seen
            </button>
          )}
          {inq.status !== 'replied' && (
            <button
              onClick={onMarkReplied}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-green-400/10"
              style={{
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.2)',
                color: '#86efac',
                fontFamily: '"Raleway", sans-serif',
              }}
            >
              <CheckCheck size={12} /> Mark Replied
            </button>
          )}
          <button
            onClick={onDelete}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-red-400/10"
            style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.15)',
              color: '#fca5a5',
            }}
            title="Remove inquiry"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminInquiries: React.FC = () => {
  const tk = useAdminTk();
  const { inquiries: rawInquiries, loading, markSeen, markReplied } = useInquiries();

  // ── Local copy: lets us hide/remove rows instantly without a refetch ──────
  const [localInquiries, setLocalInquiries] = useState<DBInquiry[] | null>(null);
  const inquiries = localInquiries ?? rawInquiries;

  // Seed local copy once the initial fetch completes
  React.useEffect(() => {
    if (!loading && localInquiries === null) setLocalInquiries(rawInquiries);
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const [filter,       setFilter]       = useState<'all' | 'new' | 'seen' | 'replied'>('all');
  const [selected,     setSelected]     = useState<DBInquiry | null>(null);
  const [toast,        setToast]        = useState<ToastState>(null);
  const [deleteTarget, setDeleteTarget] = useState<DBInquiry | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const patchLocal = (id: string, patch: Partial<DBInquiry>) =>
    setLocalInquiries(prev => prev ? prev.map(i => i.id === id ? { ...i, ...patch } : i) : prev);

  const filtered       = inquiries.filter(i => filter === 'all' || i.status === filter);
  const syncedSelected = selected ? (inquiries.find(i => i.id === selected.id) ?? selected) : null;

  const handleSelect = async (inq: DBInquiry) => {
    setSelected(inq);
    if (inq.status === 'new') {
      await markSeen(inq.id);
      patchLocal(inq.id, { status: 'seen' });
    }
  };

  const handleMarkSeen = async () => {
    if (!selected) return;
    await markSeen(selected.id);
    patchLocal(selected.id, { status: 'seen' });
    setSelected(prev => prev ? { ...prev, status: 'seen' } : null);
  };

  const handleMarkReplied = async () => {
    if (!selected) return;
    await markReplied(selected.id);
    patchLocal(selected.id, { status: 'replied' });
    setSelected(prev => prev ? { ...prev, status: 'replied' } : null);
    showToast('Marked as replied', 'success');
  };

  // ── Delete: filter out of local state only — no API call ──────────────────
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setLocalInquiries(prev => prev ? prev.filter(i => i.id !== deleteTarget.id) : prev);
    if (selected?.id === deleteTarget.id) setSelected(null);
    setDeleteTarget(null);
    showToast('Inquiry removed', 'success');
  };

  return (
    <>
      <div className="space-y-4">

        {/* Page header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>
              Inquiries
            </h1>
            <p className="text-sm mt-0.5" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>
              {inquiries.filter(i => i.status === 'new').length > 0
                ? `${inquiries.filter(i => i.status === 'new').length} unread message${inquiries.filter(i => i.status === 'new').length > 1 ? 's' : ''}`
                : 'All caught up!'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AdminBtn
              variant="secondary" icon={<Download size={14} />}
              onClick={() => exportToExcel(
                inquiries.map(i => ({
                  Name: i.customer_name, Phone: i.customer_phone,
                  Email: (i as any).customer_email ?? '', Message: i.message,
                  Status: i.status, Date: i.created_at,
                })),
                'inquiries',
              )}
              className="text-xs py-2 px-3"
            >
              Excel
            </AdminBtn>
            <AdminBtn
              variant="secondary" icon={<FileDown size={14} />}
              onClick={() => exportToPDF(
                'Inquiries',
                ['Name', 'Phone', 'Status', 'Date'],
                inquiries.map(i => [
                  i.customer_name, i.customer_phone, i.status,
                  new Date(i.created_at).toLocaleDateString('en-IN'),
                ]),
                'inquiries',
              )}
              className="text-xs py-2 px-3"
            >
              PDF
            </AdminBtn>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'new', 'seen', 'replied'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize"
              style={{
                background: filter === s ? 'linear-gradient(135deg, #bc3d3e, #9e3233)' : tk.cardBgHover,
                color:      filter === s ? '#fff' : tk.textMuted,
                border:     `1px solid ${filter === s ? 'transparent' : tk.border}`,
                fontFamily: '"Raleway", sans-serif',
              }}
            >
              {s === 'all'
                ? `All (${inquiries.length})`
                : `${STATUS_LABEL[s]} (${inquiries.filter(i => i.status === s).length})`}
            </button>
          ))}
        </div>

        {/* Main panel */}
        {loading ? <Spinner /> : (
          <div
            className="rounded-2xl overflow-hidden flex transition-colors duration-300"
            style={{
              background: tk.inputBg, border: `1px solid ${tk.border}`,
              height: 'calc(100vh - 220px)', minHeight: '500px',
            }}
          >
            {/* List panel */}
            <div
              className={`flex-shrink-0 border-r flex flex-col ${syncedSelected ? 'hidden md:flex' : 'flex'}`}
              style={{ width: '320px', borderColor: tk.border }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: tk.border }}>
                <p className="text-xs uppercase tracking-widest font-semibold"
                  style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.15em', color: tk.textMuted }}>
                  {filtered.length} message{filtered.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12">
                    <MessageSquare size={32} className="mb-3" style={{ color: tk.textMuted }} />
                    <p className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>
                      No messages
                    </p>
                  </div>
                ) : (
                  filtered.map(inq => (
                    <InquiryRow
                      key={inq.id}
                      inq={inq}
                      selected={syncedSelected?.id === inq.id}
                      onClick={() => handleSelect(inq)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Detail panel */}
            <div className={`flex-1 min-w-0 ${syncedSelected ? 'flex' : 'hidden md:flex'} flex-col`}>
              {syncedSelected ? (
                <DetailPanel
                  inq={syncedSelected}
                  onClose={() => setSelected(null)}
                  onMarkSeen={handleMarkSeen}
                  onMarkReplied={handleMarkReplied}
                  onDelete={() => setDeleteTarget(syncedSelected)}
                  isMobile={false}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(188,61,62,0.1)', border: '1px solid rgba(188,61,62,0.2)' }}
                  >
                    <MessageSquare size={28} className="text-brand-red" />
                  </div>
                  <p className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>
                    Select a message to read
                  </p>
                  <p className="text-xs" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>
                    Click any inquiry from the list on the left
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.customer_name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </>
  );
};

export default AdminInquiries;