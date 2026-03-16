// src/components/Policy/PolicyModal.tsx
import React, { useEffect, useState } from 'react';
import { X, Mail, Phone, Instagram } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../admin/lib/supabase';

interface PolicyData {
  id:      string;
  title:   string;
  content: string[];
}

interface ContactInfo {
  phone:    string;
  email:    string;
  instagram_url:    string;
  instagram_handle: string;
}

// ─── Fetch single policy from Supabase ────────────────────────────────────────
const fetchPolicy = async (id: string): Promise<PolicyData | null> => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/policies?id=eq.${encodeURIComponent(id)}&is_active=eq.true&select=id,title,content`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.length) return null;
  const p = data[0];
  return {
    ...p,
    content: Array.isArray(p.content) ? p.content : JSON.parse(p.content),
  };
};

// ─── Fetch contact info from settings ────────────────────────────────────────
const fetchContact = async (): Promise<ContactInfo> => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/settings?select=key,value`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  );
  const DEFAULTS: ContactInfo = {
    phone:            '+91 99999 99999',
    email:            'support@wingandweft.com',
    instagram_url:    'https://www.instagram.com/wingandweft/',
    instagram_handle: '@wingandweft',
  };
  if (!res.ok) return DEFAULTS;
  const rows: { key: string; value: string }[] = await res.json();
  const map: Record<string, string> = {};
  rows.forEach(r => { if (r.key && r.value) map[r.key] = r.value; });
  return {
    phone:            map['contact_phone']    || DEFAULTS.phone,
    email:            map['contact_email']    || DEFAULTS.email,
    instagram_url:    map['instagram_url']    || DEFAULTS.instagram_url,
    instagram_handle: map['instagram_handle'] || DEFAULTS.instagram_handle,
  };
};

interface Props {
  policyId: string;
  onClose:  () => void;
}

const PolicyModal: React.FC<Props> = ({ policyId, onClose }) => {
  const { isDark } = useTheme();
  const [policy,  setPolicy]  = useState<PolicyData | null>(null);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPolicy(policyId), fetchContact()])
      .then(([p, c]) => { setPolicy(p); setContact(c); })
      .finally(() => setLoading(false));
  }, [policyId]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={policy?.title ?? 'Policy'}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className={`relative z-10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col ${
          isDark ? 'bg-dark-card border border-dark-border' : 'bg-white border border-stone-200'
        }`}
      >
        {/* Header — always brand gradient */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #bc3d3e, #b6893c)', borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <h2 className="text-brand-cream"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem', fontWeight: 600 }}>
            {loading ? 'Loading…' : (policy?.title ?? 'Policy')}
          </h2>
          <button onClick={onClose}
            className="p-1.5 rounded-lg transition-colors text-brand-cream/70 hover:text-brand-cream hover:bg-white/20"
            aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-brand-red/30 border-t-brand-red rounded-full animate-spin" />
            </div>
          )}

          {/* Not found */}
          {!loading && !policy && (
            <p className={`text-sm font-body text-center py-8 ${isDark ? 'text-dark-muted' : 'text-stone-500'}`}>
              Policy not available.
            </p>
          )}

          {/* Policy points */}
          {!loading && policy && (
            <>
              <ul className="space-y-3">
                {policy.content.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5"
                      style={{ background: '#bc3d3e' }}
                    />
                    <p className={`text-sm font-body leading-relaxed ${isDark ? 'text-dark-text' : 'text-stone-700'}`}>
                      {item}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Contact info — live from settings */}
              {contact && (
                <div className={`mt-8 p-4 rounded-xl ${
                  isDark ? 'bg-dark-bg border border-dark-border' : 'bg-brand-cream/30 border border-brand-cream'
                }`}>
                  <p className={`text-sm font-semibold mb-3 font-body ${isDark ? 'text-dark-text' : 'text-stone-800'}`}>
                    For any policy related queries:
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                      className="flex items-center gap-2 text-sm font-body text-brand-red hover:underline">
                      <Phone size={14} /> {contact.phone}
                    </a>
                    <a href={`mailto:${contact.email}`}
                      className="flex items-center gap-2 text-sm font-body text-brand-red hover:underline">
                      <Mail size={14} /> {contact.email}
                    </a>
                    <a href={contact.instagram_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-body text-brand-red hover:underline">
                      <Instagram size={14} /> {contact.instagram_handle}
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;