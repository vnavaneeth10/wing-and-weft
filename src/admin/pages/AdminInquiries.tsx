// src/admin/pages/AdminInquiries.tsx
import React, { useState } from 'react';
import { MessageSquare, ExternalLink, CheckCheck, Eye, Filter } from 'lucide-react';
import { Badge, Spinner, EmptyState, AdminBtn, Toast } from '../components/AdminUI';
import { useInquiries } from '../hooks/useAdminData';
import { WHATSAPP_NUMBER } from '../../data/products';

type ToastState = { msg: string; type: 'success' | 'error' } | null;

const AdminInquiries: React.FC = () => {
  const { inquiries, loading, markSeen, markReplied } = useInquiries();
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'seen' | 'replied'>('all');
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = inquiries.filter((i) => statusFilter === 'all' || i.status === statusFilter);

  const STATUS_COLORS = { new: 'red', seen: 'orange', replied: 'green' } as const;
  const STATUS_LABELS = { new: 'New', seen: 'Seen', replied: 'Replied' };

  const openWhatsApp = (phone: string, productName?: string | null) => {
    const text = productName
      ? `Hi! We saw your inquiry about ${productName}. How can we help?`
      : `Hi! Thank you for reaching out to Wing & Weft. How can we help you?`;
    const num = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold" style={{ fontFamily: '"Raleway", sans-serif' }}>
          Inquiries
        </h1>
        <p className="text-slate-500 text-sm mt-0.5" style={{ fontFamily: '"Raleway", sans-serif' }}>
          Customer messages sent via the Contact form (forwarded to WhatsApp)
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'new', 'seen', 'replied'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${
              statusFilter === s ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            style={{
              background: statusFilter === s ? 'linear-gradient(135deg, #bc3d3e, #9e3233)' : 'rgba(255,255,255,0.05)',
              fontFamily: '"Raleway", sans-serif',
            }}
          >
            {s === 'all' ? `All (${inquiries.length})` : `${STATUS_LABELS[s]} (${inquiries.filter((i) => i.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState message="No inquiries found." icon="📭" />
      ) : (
        <div className="space-y-3">
          {filtered.map((inq) => (
            <div
              key={inq.id}
              className="rounded-2xl p-5"
              style={{
                background: inq.status === 'new' ? 'rgba(188,61,62,0.06)' : '#1a1b2e',
                border: `1px solid ${inq.status === 'new' ? 'rgba(188,61,62,0.25)' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-white font-semibold text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>
                      {inq.customer_name}
                    </span>
                    <Badge label={STATUS_LABELS[inq.status]} color={STATUS_COLORS[inq.status]} />
                    {inq.product_name && (
                      <span className="text-brand-gold text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(182,137,60,0.15)', fontFamily: '"Raleway", sans-serif' }}>
                        Re: {inq.product_name}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3" style={{ fontFamily: '"Raleway", sans-serif' }}>
                    {inq.message}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500" style={{ fontFamily: '"Raleway", sans-serif' }}>
                    <span>📱 {inq.customer_phone}</span>
                    <span>🕐 {new Date(inq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => openWhatsApp(inq.customer_phone, inq.product_name)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                    style={{ background: '#25D366', color: '#fff', fontFamily: '"Raleway", sans-serif' }}
                  >
                    <ExternalLink size={12} /> Reply on WhatsApp
                  </button>

                  <div className="flex gap-1">
                    {inq.status === 'new' && (
                      <button
                        onClick={async () => { await markSeen(inq.id); showToast('Marked as seen', 'success'); }}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-all text-slate-400 hover:text-white hover:bg-white/10"
                        style={{ fontFamily: '"Raleway", sans-serif' }}
                        title="Mark as seen"
                      >
                        <Eye size={12} /> Seen
                      </button>
                    )}
                    {inq.status !== 'replied' && (
                      <button
                        onClick={async () => { await markReplied(inq.id); showToast('Marked as replied', 'success'); }}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-all text-slate-400 hover:text-green-400 hover:bg-green-400/10"
                        style={{ fontFamily: '"Raleway", sans-serif' }}
                        title="Mark as replied"
                      >
                        <CheckCheck size={12} /> Replied
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
};

export default AdminInquiries;
