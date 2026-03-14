// src/pages/ContactPage.tsx
import React, { useState, useEffect } from 'react';
import { Phone, Mail, Clock, Instagram, Facebook, MessageCircle, Send, Check, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../admin/lib/supabase';

// ─── Fetch contact settings from Supabase ────────────────────────────────────

interface ContactSettings {
  contact_phone:    string;
  contact_email:    string;
  business_hours:   string;
  instagram_url:    string;
  instagram_handle: string;
  facebook_url:     string;
  facebook_name:    string;
  whatsapp_number:  string;
}

const DEFAULTS: ContactSettings = {
  contact_phone:    '+91 99999 99999',
  contact_email:    'support@wingandweft.com',
  business_hours:   'Mon–Sat: 10AM – 7PM',
  instagram_url:    'https://www.instagram.com/wingandweft/',
  instagram_handle: '@wingandweft',
  facebook_url:     '#',
  facebook_name:    'Wing & Weft',
  whatsapp_number:  '919999999999',
};

const fetchContactSettings = async (): Promise<ContactSettings> => {
  // Fetch ALL settings rows — simpler and more reliable than OR filter
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/settings?select=key,value`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  );
  if (!res.ok) throw new Error('Failed');
  const rows: { key: string; value: string }[] = await res.json();
  const map: Record<string, string> = {};
  rows.forEach((r) => { if (r.key && r.value) map[r.key] = r.value; });
  return {
    contact_phone:    map['contact_phone']    || DEFAULTS.contact_phone,
    contact_email:    map['contact_email']    || DEFAULTS.contact_email,
    business_hours:   map['business_hours']   || DEFAULTS.business_hours,
    instagram_url:    map['instagram_url']    || DEFAULTS.instagram_url,
    instagram_handle: map['instagram_handle'] || DEFAULTS.instagram_handle,
    facebook_url:     map['facebook_url']     || DEFAULTS.facebook_url,
    facebook_name:    map['facebook_name']    || DEFAULTS.facebook_name,
    whatsapp_number:  map['whatsapp_number']  || DEFAULTS.whatsapp_number,
  };
};

// ─── Save inquiry to Supabase ─────────────────────────────────────────────────
const saveInquiry = async (data: {
  customer_name:  string;
  customer_email: string;
  customer_phone: string;
  message:        string;
}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/inquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey:         SUPABASE_ANON_KEY,
      Authorization:  `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer:         'return=minimal',
    },
    body: JSON.stringify({
      customer_name:  data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone || 'N/A',
      message:        data.message,
      status:         'new',
    }),
  });
  if (!res.ok) throw new Error('Failed to save inquiry');
};

// ─── Component ────────────────────────────────────────────────────────────────
const ContactPage: React.FC = () => {
  const { isDark } = useTheme();
  const [form, setForm]         = useState({ name: '', email: '', whatsapp: '', message: '' });
  const [status, setStatus]     = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [info, setInfo]         = useState<ContactSettings>(DEFAULTS);

  // Fetch live settings on mount
  useEffect(() => {
    fetchContactSettings().then(setInfo).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    setStatus('saving');
    try {
      await saveInquiry({
        customer_name:  form.name,
        customer_email: form.email,
        customer_phone: form.whatsapp,
        message:        form.message,
      });
      setStatus('success');
      setForm({ name: '', email: '', whatsapp: '', message: '' });
      const text = `*New Contact Form Message*\n\nName: ${form.name}\nEmail: ${form.email}\nWhatsApp: ${form.whatsapp}\nMessage: ${form.message}`;
      window.open(
        `https://wa.me/${info.whatsapp_number}?text=${encodeURIComponent(text)}`,
        '_blank', 'noopener,noreferrer'
      );
      setTimeout(() => setStatus('idle'), 4000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const bg          = isDark ? 'bg-dark-bg'   : 'bg-stone-50';
  const textPrimary = isDark ? 'text-dark-text' : 'text-stone-800';
  const textMuted   = isDark ? 'text-dark-muted' : 'text-stone-600';
  const card        = isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-stone-200';
  const inputClass  = `w-full px-4 py-3 rounded-xl border text-sm font-body outline-none focus:ring-2 focus:ring-brand-red/30 transition-all ${
    isDark
      ? 'bg-dark-bg border-dark-border text-dark-text placeholder-dark-muted focus:border-brand-red'
      : 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400 focus:border-brand-red'
  }`;

  // Build contact details from live settings
  const CONTACT_DETAILS = [
    {
      icon: Phone,
      label: 'Phone',
      value: info.contact_phone,
      href: info.contact_phone !== DEFAULTS.contact_phone
        ? `tel:${info.contact_phone.replace(/\s+/g, '')}`
        : null,
    },
    {
      icon: Mail,
      label: 'Email',
      value: info.contact_email,
      href: `mailto:${info.contact_email}`,
    },
    {
      icon: Clock,
      label: 'Business Hours',
      value: info.business_hours,
      href: null,
    },
    {
      icon: Instagram,
      label: 'Instagram',
      value: info.instagram_handle,
      href: info.instagram_url,
    },
    {
      icon: Facebook,
      label: 'Facebook',
      value: info.facebook_name,
      href: info.facebook_url !== '#' ? info.facebook_url : null,
    },
  ];

  return (
    <div className={`min-h-screen ${bg} pt-20`}>
      {/* Hero */}
      <div className="relative h-48 overflow-hidden" style={{ background: 'linear-gradient(135deg, #bc3d3e, #b6893c)' }}>
        <div className="absolute inset-0 pattern-overlay opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div>
            <p className="text-brand-cream/60 text-xs uppercase tracking-widest mb-2 font-body" style={{ letterSpacing: '0.3em' }}>
              Get in Touch
            </p>
            <h1 className="text-brand-cream" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600 }}>
              Contact Us
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* ── Contact info (live from settings) ── */}
          <div className={`rounded-2xl border p-8 ${card}`}>
            <h2 className={`mb-6 ${textPrimary}`} style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.8rem', fontWeight: 600 }}>
              Contact Information
            </h2>
            <div className="space-y-5">
              {CONTACT_DETAILS.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #bc3d3e15, #b6893c15)', border: '1px solid #b6893c30' }}
                  >
                    <Icon size={18} className="text-brand-gold" />
                  </div>
                  <div>
                    <p className={`text-xs uppercase tracking-wide font-body font-semibold mb-0.5 ${textMuted}`} style={{ letterSpacing: '0.15em' }}>
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className={`text-sm font-body hover:text-brand-red transition-colors ${textPrimary}`}
                      >
                        {value}
                      </a>
                    ) : (
                      <p className={`text-sm font-body ${textPrimary}`}>{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <div className="mt-8 pt-6 border-t" style={{ borderColor: isDark ? '#3a2e24' : '#f0ebe0' }}>
              <a
                href={`https://wa.me/${info.whatsapp_number}?text=${encodeURIComponent('Hi! I need help with Wing & Weft.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-3.5 rounded-full font-bold font-body text-sm uppercase tracking-widest transition-all hover:scale-105"
                style={{ background: '#25D366', color: '#fff', letterSpacing: '0.15em' }}
              >
                <MessageCircle size={18} /> Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* ── Contact form ── */}
          <div className={`rounded-2xl border p-8 ${card}`}>
            <h2 className={`mb-6 ${textPrimary}`} style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.8rem', fontWeight: 600 }}>
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className={`block text-xs font-semibold font-body uppercase tracking-wide mb-1.5 ${textMuted}`} style={{ letterSpacing: '0.15em' }}>Name *</label>
                <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="Your full name" className={inputClass} />
              </div>
              <div>
                <label className={`block text-xs font-semibold font-body uppercase tracking-wide mb-1.5 ${textMuted}`} style={{ letterSpacing: '0.15em' }}>Email *</label>
                <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="your@email.com" className={inputClass} />
              </div>
              <div>
                <label className={`block text-xs font-semibold font-body uppercase tracking-wide mb-1.5 ${textMuted}`} style={{ letterSpacing: '0.15em' }}>WhatsApp Number</label>
                <input type="tel" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className={inputClass} />
              </div>
              <div>
                <label className={`block text-xs font-semibold font-body uppercase tracking-wide mb-1.5 ${textMuted}`} style={{ letterSpacing: '0.15em' }}>Message *</label>
                <textarea name="message" required rows={5} value={form.message} onChange={handleChange} placeholder="How can we help you?" className={`${inputClass} resize-none`} />
              </div>

              {status === 'success' && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-body" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac' }}>
                  <Check size={16} /> Message saved! WhatsApp is opening...
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-body" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                  <AlertCircle size={16} /> Something went wrong. Please try again.
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'saving'}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold font-body text-sm uppercase tracking-widest transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #bc3d3e, #b6893c)', color: '#e9e3cb', letterSpacing: '0.15em' }}
              >
                <Send size={16} />
                {status === 'saving' ? 'Sending...' : 'Send Message'}
              </button>
              <p className={`text-xs text-center font-body ${textMuted}`}>
                Your message will be saved and WhatsApp will open for a quick reply
              </p>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;