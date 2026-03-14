// src/admin/pages/AdminInquiries.tsx
import React, { useState } from 'react';
import { MessageSquare, ExternalLink, CheckCheck, Eye, X, Mail, Phone, Clock, Tag, ArrowLeft, Trash2 } from 'lucide-react';
import { Badge, Spinner, Toast, useAdminTk } from '../components/AdminUI';
import { useInquiries, DBInquiry } from '../hooks/useAdminData';

type ToastState = { msg: string; type: 'success' | 'error' } | null;

const STATUS_COLOR  = { new: 'red', seen: 'orange', replied: 'green' } as const;
const STATUS_LABEL  = { new: 'New', seen: 'Seen', replied: 'Replied' };

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const getSource = (msg: string): { label: string; color: string } => {
  if (msg.includes('newsletter') || msg.includes('Subscribed')) return { label: '📧 Newsletter', color: 'rgba(99,102,241,0.15)' };
  if (msg.includes('Coming Soon') || msg.includes('launch'))    return { label: '🚀 Launch Alert', color: 'rgba(245,158,11,0.15)' };
  if (msg.includes('product') || msg.includes('Re:'))           return { label: '🛍 Product Inquiry', color: 'rgba(16,185,129,0.15)' };
  return { label: '✉️ Contact Form', color: 'rgba(59,130,246,0.15)' };
};

// ─── Inquiry Row ──────────────────────────────────────────────────────────────
const InquiryRow: React.FC<{ inq: DBInquiry; selected: boolean; onClick: () => void }> = ({ inq, selected, onClick }) => {
  const tk = useAdminTk();
  const src = getSource(inq.message);
  return (
    <button onClick={onClick} className="w-full text-left px-4 py-4 transition-all border-b"
      style={{
        background: selected ? 'rgba(188,61,62,0.12)' : inq.status === 'new' ? 'rgba(188,61,62,0.04)' : 'transparent',
        borderColor: tk.border,
        borderLeft: selected ? '3px solid #bc3d3e' : '3px solid transparent',
      }}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          {inq.status === 'new' && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#bc3d3e' }} />}
          <span className="font-semibold text-sm truncate" style={{ color: inq.status === 'new' ? tk.textPrimary : tk.textSecondary, fontFamily: '"Raleway", sans-serif' }}>
            {inq.customer_name}
          </span>
        </div>
        <span className="text-xs flex-shrink-0" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>
          {new Date(inq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
      </div>
      <p className="text-xs truncate mb-2" style={{ color: tk.textMuted, fontFamily: '"Raleway", sans-serif' }}>{inq.message}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: src.color, color: tk.textSecondary, fontFamily: '"Raleway", sans-serif' }}>{src.label}</span>
        <Badge label={STATUS_LABEL[inq.status]} color={STATUS_COLOR[inq.status]} />
      </div>
    </button>
  );
};

// ─── Detail Panel ─────────────────────────────────────────────────────────────
const DetailPanel: React.FC<{
  inq: DBInquiry; onClose: () => void; onMarkSeen: () => void;
  onMarkReplied: () => void; onDelete: () => void; isMobile: boolean;
}> = ({ inq, onClose, onMarkSeen, onMarkReplied, onDelete, isMobile }) => {
  const tk = useAdminTk();
  const src = getSource(inq.message);

  const openWhatsApp = () => {
    const text = inq.product_name
      ? `Hi ${inq.customer_name}! We saw your inquiry about ${inq.product_name}. How can we help?`
      : `Hi ${inq.customer_name}! Thank you for reaching out to Wing & Weft. How can we help you?`;
    const num = inq.customer_phone.replace(/\D/g, '');
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  const emailMatch = inq.message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const parsedEmail = (inq as any).customer_email || (emailMatch ? emailMatch[0] : null);
  const hasPhone = inq.customer_phone && inq.customer_phone !== 'N/A';

  const openEmail = () => {
    if (!parsedEmail) return;
    const subject = encodeURIComponent('Re: Your inquiry at Wing & Weft');
    const body = encodeURIComponent(`Hi ${inq.customer_name},\n\nThank you for reaching out to Wing & Weft.\n\n`);
    window.open(`mailto:${parsedEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  const sectionStyle = { background: tk.cardBgHover, border: `1px solid ${tk.border}` };

  return (
    <div className="flex flex-col h-full transition-colors duration-300" style={{ background: tk.cardBg }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: tk.border }}>
        <div className="flex items-center gap-3">
          {isMobile && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: tk.textMuted }}><ArrowLeft size={16} /></button>
          )}
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #bc3d3e, #b6893c)', color: '#e9e3cb', fontFamily: '"Raleway", sans-serif' }}>
            {inq.customer_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>{inq.customer_name}</p>
            <p className="text-xs" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>{fmt(inq.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge label={STATUS_LABEL[inq.status]} color={STATUS_COLOR[inq.status]} />
          {!isMobile && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: tk.textMuted }}><X size={15} /></button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <span className="inline-block text-xs px-3 py-1 rounded-full" style={{ background: src.color, color: tk.textSecondary, fontFamily: '"Raleway", sans-serif' }}>
          {src.label}
        </span>

        {/* Contact details */}
        <div className="rounded-xl p-4 space-y-3" style={sectionStyle}>
          <p className="text-xs uppercase tracking-widest font-semibold" style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.15em', color: tk.textMuted }}>Contact Details</p>
          <div className="space-y-2.5">
            {hasPhone && (
              <div className="flex items-center gap-3">
                <Phone size={14} className="text-brand-gold flex-shrink-0" />
                <span className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>{inq.customer_phone}</span>
              </div>
            )}
            {parsedEmail && (
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-brand-gold flex-shrink-0" />
                <span className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>{parsedEmail}</span>
              </div>
            )}
            {inq.product_name && (
              <div className="flex items-center gap-3">
                <Tag size={14} className="text-brand-gold flex-shrink-0" />
                <span className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>Re: {inq.product_name}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Clock size={14} className="text-brand-gold flex-shrink-0" />
              <span className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>{fmt(inq.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="rounded-xl p-4" style={sectionStyle}>
          <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.15em', color: tk.textMuted }}>Message</p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>{inq.message}</p>
        </div>

        {/* Status progress */}
        <div className="rounded-xl p-4" style={sectionStyle}>
          <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.15em', color: tk.textMuted }}>Status</p>
          <div className="flex items-center gap-3">
            {(['new', 'seen', 'replied'] as const).map((s, i) => {
              const order = ['new', 'seen', 'replied'];
              const reached = order.indexOf(inq.status) >= order.indexOf(s);
              return (
                <React.Fragment key={s}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full"
                      style={{ background: reached ? (s === 'new' ? '#bc3d3e' : s === 'seen' ? '#f59e0b' : '#22c55e') : tk.border }} />
                    <span className="text-xs font-semibold capitalize"
                      style={{ color: reached ? tk.textPrimary : tk.textMuted, fontFamily: '"Raleway", sans-serif' }}>
                      {STATUS_LABEL[s]}
                    </span>
                  </div>
                  {i < 2 && <div className="flex-1 h-px" style={{ background: order.indexOf(inq.status) > i ? 'rgba(182,137,60,0.4)' : tk.border }} />}
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
            <button onClick={openWhatsApp} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: '#25D366', color: '#fff', fontFamily: '"Raleway", sans-serif' }}>
              <ExternalLink size={13} /> WhatsApp
            </button>
          )}
          {parsedEmail && (
            <button onClick={openEmail} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd', fontFamily: '"Raleway", sans-serif' }}>
              <Mail size={13} /> Email
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {inq.status === 'new' && (
            <button onClick={onMarkSeen} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: tk.cardBgHover, border: `1px solid ${tk.border}`, color: tk.textSecondary, fontFamily: '"Raleway", sans-serif' }}>
              <Eye size={12} /> Mark Seen
            </button>
          )}
          {inq.status !== 'replied' && (
            <button onClick={onMarkReplied} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-green-400/10"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#86efac', fontFamily: '"Raleway", sans-serif' }}>
              <CheckCheck size={12} /> Mark Replied
            </button>
          )}
          <button onClick={onDelete} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-red-400/10"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#fca5a5' }} title="Delete">
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
  const { inquiries, loading, markSeen, markReplied } = useInquiries();
  const [filter, setFilter]     = useState<'all' | 'new' | 'seen' | 'replied'>('all');
  const [selected, setSelected] = useState<DBInquiry | null>(null);
  const [toast, setToast]       = useState<ToastState>(null);

  const showToast = (msg: string, type: 'success' | 'error') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const filtered = inquiries.filter(i => filter === 'all' || i.status === filter);

  const handleSelect = async (inq: DBInquiry) => {
    setSelected(inq);
    if (inq.status === 'new') await markSeen(inq.id);
  };

  const handleMarkReplied = async () => {
    if (!selected) return;
    await markReplied(selected.id);
    setSelected(prev => prev ? { ...prev, status: 'replied' } : null);
    showToast('Marked as replied', 'success');
  };

  const handleMarkSeen = async () => {
    if (!selected) return;
    await markSeen(selected.id);
    setSelected(prev => prev ? { ...prev, status: 'seen' } : null);
  };

  const syncedSelected = selected ? (inquiries.find(i => i.id === selected.id) ?? selected) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textPrimary }}>Inquiries</h1>
          <p className="text-sm mt-0.5" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>
            {inquiries.filter(i => i.status === 'new').length > 0
              ? `${inquiries.filter(i => i.status === 'new').length} unread messages`
              : 'All caught up!'}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'new', 'seen', 'replied'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize"
            style={{
              background: filter === s ? 'linear-gradient(135deg, #bc3d3e, #9e3233)' : tk.cardBgHover,
              color: filter === s ? '#fff' : tk.textMuted,
              border: `1px solid ${filter === s ? 'transparent' : tk.border}`,
              fontFamily: '"Raleway", sans-serif',
            }}>
            {s === 'all' ? `All (${inquiries.length})` : `${STATUS_LABEL[s]} (${inquiries.filter(i => i.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div className="rounded-2xl overflow-hidden flex transition-colors duration-300"
          style={{ background: tk.inputBg, border: `1px solid ${tk.border}`, height: 'calc(100vh - 220px)', minHeight: '500px' }}>

          {/* List panel */}
          <div className={`flex-shrink-0 border-r flex flex-col ${syncedSelected ? 'hidden md:flex' : 'flex'}`}
            style={{ width: '320px', borderColor: tk.border }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: tk.border }}>
              <p className="text-xs uppercase tracking-widest font-semibold" style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.15em', color: tk.textMuted }}>
                {filtered.length} message{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <MessageSquare size={32} className="mb-3" style={{ color: tk.textMuted }} />
                  <p className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>No messages</p>
                </div>
              ) : (
                filtered.map(inq => (
                  <InquiryRow key={inq.id} inq={inq} selected={syncedSelected?.id === inq.id} onClick={() => handleSelect(inq)} />
                ))
              )}
            </div>
          </div>

          {/* Detail panel */}
          <div className={`flex-1 min-w-0 ${syncedSelected ? 'flex' : 'hidden md:flex'} flex-col`}>
            {syncedSelected ? (
              <DetailPanel inq={syncedSelected} onClose={() => setSelected(null)}
                onMarkSeen={handleMarkSeen} onMarkReplied={handleMarkReplied}
                onDelete={() => { setSelected(null); showToast('Inquiry closed', 'success'); }} isMobile={false} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(188,61,62,0.1)', border: '1px solid rgba(188,61,62,0.2)' }}>
                  <MessageSquare size={28} className="text-brand-red" />
                </div>
                <p className="text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>Select a message to read</p>
                <p className="text-xs" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>Click any inquiry from the list on the left</p>
              </div>
            )}
          </div>
        </div>
      )}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
};

export default AdminInquiries;