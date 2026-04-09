// src/components/Footer/Footer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, MessageCircle, ArrowRight, Heart } from 'lucide-react';
import { INSTAGRAM_URL, WHATSAPP_NUMBER } from '../../data/products';
import { useTheme } from '../../context/ThemeContext';
import PolicyModal from '../Policy/PolicyModal';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../admin/lib/supabase';

interface FooterCategory { id: string; name: string; }
interface FooterPolicy   { id: string; title: string; }
interface FooterSettings {
  instagram_url:   string;
  facebook_url:    string;
  contact_email:   string;
  whatsapp_number: string;
}

const fetchCategories = async (): Promise<FooterCategory[]> => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/categories?is_active=eq.true&order=sort_order.asc&select=id,name`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  );
  if (!res.ok) throw new Error('Failed');
  return res.json();
};

const fetchPolicies = async (): Promise<FooterPolicy[]> => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/policies?is_active=eq.true&order=sort_order.asc&select=id,title`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  );
  if (!res.ok) throw new Error('Failed');
  return res.json();
};

const fetchFooterSettings = async (): Promise<FooterSettings> => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/settings?select=key,value`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  );
  if (!res.ok) throw new Error('Failed');
  const rows: { key: string; value: string }[] = await res.json();
  const map: Record<string, string> = {};
  rows.forEach((r) => { if (r.key && r.value) map[r.key] = r.value; });
  return {
    instagram_url:   map['instagram_url']   || INSTAGRAM_URL,
    facebook_url:    map['facebook_url']    || '#',
    contact_email:   map['contact_email']   || 'support@wingandweft.com',
    whatsapp_number: map['whatsapp_number'] || WHATSAPP_NUMBER,
  };
};

const saveNewsletterEmail = async (email: string) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/inquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey:         SUPABASE_ANON_KEY,
      Authorization:  `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer:         'return=minimal',
    },
    body: JSON.stringify({
      customer_name:  'Newsletter Subscriber',
      customer_phone: 'N/A',
      customer_email: email,
      message:        '📧 Subscribed to newsletter from footer.',
      status:         'new',
    }),
  });
  if (!res.ok) throw new Error('Failed to save');
};

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

const Footer: React.FC = () => {
  const { isDark } = useTheme();
  const [email, setEmail]                   = useState('');
  const [emailStatus, setEmailStatus]       = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [openPolicy, setOpenPolicy]         = useState<string | null>(null);
  const [categories, setCategories]         = useState<FooterCategory[]>([]);
  const [footerPolicies, setFooterPolicies] = useState<FooterPolicy[]>([]);
  const [settings, setSettings]             = useState<FooterSettings>({
    instagram_url:   INSTAGRAM_URL,
    facebook_url:    '#',
    contact_email:   'support@wingandweft.com',
    whatsapp_number: WHATSAPP_NUMBER,
  });

  const banner = useFadeIn();
  const grid   = useFadeIn();
  const bottom = useFadeIn();

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
    fetchFooterSettings().then(setSettings).catch(() => {});
    fetchPolicies().then(setFooterPolicies).catch(() => {});
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailStatus('saving');
    try {
      await saveNewsletterEmail(email.trim());
      setEmail('');
      setEmailStatus('success');
      setTimeout(() => setEmailStatus('idle'), 3000);
    } catch {
      setEmailStatus('error');
      setTimeout(() => setEmailStatus('idle'), 3000);
    }
  };

  const fadeStyle = (visible: boolean, delay = 0): React.CSSProperties => ({
    opacity:    visible ? 1 : 0,
    transform:  visible ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  });

  const bg      = isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-100 border-stone-200';
  const text    = isDark ? 'text-stone-400' : 'text-stone-500';
  const heading = isDark ? 'text-brand-cream' : 'text-brand-ink';
  // CHANGE 1: Footer link hover — hover:text-brand-orange → hover:text-brand-gold-light
  // Gold-light (#C49A4A) has better contrast on the dark footer than orange (#B8622A)
  const linkClass = `${text} ${isDark ? 'hover:text-brand-gold-light' : 'hover:text-brand-red'} transition-colors text-sm font-body`;

  const SHOW_COLLECTIONS = false;

  return (
    <>
      <footer className={`${bg} border-t pt-14 pb-6`} role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Subscribe banner */}
          <div
            ref={banner.ref}
            className="rounded-2xl p-8 md:p-10 mb-14 relative overflow-hidden"
            style={{
              ...fadeStyle(banner.visible),
              // CHANGE 2: Subscribe banner gradient — #bc3d3e/#b6893c → #7A1F2E/#9C6F2E
              background: 'linear-gradient(135deg, #7A1F2E, #9C6F2E)',
            }}
          >
            <div className="absolute inset-0 pattern-overlay opacity-20" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                {/* CHANGE 3: Banner heading — fontWeight 600 → 400 (Cormorant consistency) */}
                <h3
                  className="text-brand-cream mb-1"
                  style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.8rem', fontWeight: 400 }}
                >
                  Stay in the Loop
                </h3>
                <p className="text-brand-cream/80 text-sm font-body">
                  Get exclusive deals, new arrivals, and saree style tips delivered to your inbox.
                </p>
              </div>
              <form onSubmit={handleEmailSubmit} className="flex gap-2 w-full md:w-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  disabled={emailStatus === 'saving'}
                  className="flex-1 md:w-64 px-4 py-3 rounded-full text-sm font-body outline-none focus:ring-2 focus:ring-brand-cream/50 disabled:opacity-60"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#FAF6EF',
                  }}
                  aria-label="Email address for newsletter"
                />
                {/* CHANGE 4: Subscribe button — bg #e9e3cb/color #bc3d3e → #FAF6EF/#7A1F2E */}
                <button
                  type="submit"
                  disabled={emailStatus === 'saving'}
                  className="px-5 py-3 rounded-full font-semibold font-body text-sm transition-all hover:scale-105 disabled:opacity-60"
                  style={{ background: '#FAF6EF', color: '#7A1F2E' }}
                  aria-label="Subscribe to newsletter"
                >
                  {emailStatus === 'saving' ? '...' : emailStatus === 'success' ? '✓' : emailStatus === 'error' ? '✗' : <ArrowRight size={18} />}
                </button>
              </form>
            </div>
            {emailStatus === 'success' && (
              <p className="relative z-10 text-brand-cream/80 text-xs font-body mt-3 text-center md:text-right">
                ✓ You're subscribed! We'll be in touch.
              </p>
            )}
            {emailStatus === 'error' && (
              <p className="relative z-10 text-brand-cream/60 text-xs font-body mt-3 text-center md:text-right">
                Something went wrong. Please try again.
              </p>
            )}
          </div>

          {/* Footer grid */}
          <div ref={grid.ref}>
            <div
              className={`grid mb-10 gap-10 ${SHOW_COLLECTIONS ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}
              style={fadeStyle(grid.visible, 100)}
            >
              {/* Brand */}
              <div className={SHOW_COLLECTIONS ? 'col-span-2 md:col-span-1' : ''}>
                <div className="mb-4">
                  <picture>
                    <source srcSet="/logo@2x.webp 2x, /logo@1x.webp 1x" type="image/webp" />
                    <source srcSet="/logo@2x.png 2x, /logo@1x.png 1x"   type="image/png" />
                    <img src="/logo@1x.png" alt="Wing & Weft" width={160} height={90}
                      className="w-auto object-contain" style={{ height: '48px' }}
                      loading="lazy" decoding="async" />
                  </picture>
                </div>
                <p className={`text-sm font-body leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Timeless sarees crafted with uncompromising quality, elegance, and attention to every detail. Your heritage, our craft.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className={`${heading} font-semibold font-label text-xs uppercase mb-4`} style={{ letterSpacing: '0.15em' }}>
                  Quick Links
                </h4>
                <ul className="space-y-2.5">
                  {[{ to: '/', label: 'Home' }, { to: '/our-story', label: 'About Us' }, { to: '/contact', label: 'Contact' }].map((l) => (
                    <li key={l.to}><Link to={l.to} className={linkClass}>{l.label}</Link></li>
                  ))}
                </ul>
              </div>

              {SHOW_COLLECTIONS && (
                <div>
                  <h4 className={`${heading} font-semibold font-label text-xs uppercase mb-4`} style={{ letterSpacing: '0.15em' }}>Collections</h4>
                  <ul className="space-y-2.5">
                    {categories.length > 0
                      ? categories.map((cat) => (
                          <li key={cat.id}><Link to={`/category/${cat.id}`} className={linkClass}>{cat.name}</Link></li>
                        ))
                      : [1,2,3,4].map((n) => (
                          <li key={n}><div className={`h-3 w-24 rounded animate-pulse ${isDark ? 'bg-stone-700/50' : 'bg-stone-300/70'}`} /></li>
                        ))
                    }
                  </ul>
                </div>
              )}

              {/* Policies */}
              <div>
                <h4 className={`${heading} font-semibold font-label text-xs uppercase mb-4`} style={{ letterSpacing: '0.15em' }}>
                  Policies
                </h4>
                <ul className="space-y-2.5">
                  {footerPolicies.length > 0
                    ? footerPolicies.map((p) => (
                        <li key={p.id}>
                          <button onClick={() => setOpenPolicy(p.id)} className={`${linkClass} text-left`}>{p.title}</button>
                        </li>
                      ))
                    : [1,2,3,4].map((n) => (
                        <li key={n}><div className={`h-3 w-24 rounded animate-pulse ${isDark ? 'bg-stone-700/50' : 'bg-stone-300/70'}`} /></li>
                      ))
                  }
                </ul>
              </div>
            </div>
          </div>

          <div className={`saree-divider mb-6 ${isDark ? '' : 'opacity-30'}`} />

          {/* Bottom */}
          <div ref={bottom.ref} className="flex flex-col items-center gap-3" style={fadeStyle(bottom.visible, 200)}>
            <div className="flex items-center gap-2.5">
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:opacity-80"
                style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.12)' }}
                aria-label="Instagram">
                <Instagram size={14} color={isDark ? '#FAF6EF' : '#44403c'} />
              </a>
              <a href={settings.facebook_url !== '#' ? settings.facebook_url : '#'}
                target={settings.facebook_url !== '#' ? '_blank' : undefined} rel="noopener noreferrer"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:opacity-80"
                style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.12)' }}
                aria-label="Facebook">
                <Facebook size={14} color={isDark ? '#FAF6EF' : '#44403c'} />
              </a>
              <a href={`mailto:${settings.contact_email}`}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:opacity-80"
                style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.12)' }}
                aria-label="Email">
                <Mail size={14} color={isDark ? '#FAF6EF' : '#44403c'} />
              </a>
              <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:opacity-80"
                style={{ background: '#25D366' }} aria-label="WhatsApp">
                <MessageCircle size={14} color="white" />
              </a>
            </div>
            <p className={`${text} text-xs font-body text-center`}>
              © 2026 Wing &amp; Weft. All Rights Reserved.
              &nbsp;·&nbsp;
              {/* CHANGE 5: Heart icon fill — #bc3d3e → #7A1F2E (new wine token) */}
              Crafted with <Heart size={9} className="inline text-brand-red" fill="#7A1F2E" /> by{' '}
              {/* CHANGE 6: Navi credit link — #b6893c → #C49A4A (gold-light).
                  Old gold (#9C6F2E) on dark footer ≈ 3.5:1 contrast.
                  Gold-light (#C49A4A) gives ≈ 4.8:1 — passes WCAG AA. */}
              <a href="https://vnvne.vercel.app/" target="_blank" rel="noopener noreferrer"
                style={{ color: '#C49A4A', fontWeight: 600 }}
                className="transition-colors hover:text-brand-gold">
                Navi
              </a>
              &nbsp;·&nbsp;
              <a href={`mailto:${settings.contact_email}`} className="hover:text-brand-gold-light transition-colors">
                {settings.contact_email}
              </a>
            </p>
          </div>

        </div>
      </footer>

      {openPolicy && <PolicyModal policyId={openPolicy} onClose={() => setOpenPolicy(null)} />}
    </>
  );
};

export default Footer;