// src/components/Footer/Footer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, MessageCircle, Heart, PackageSearch } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import PolicyModal from '../Policy/PolicyModal';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../admin/lib/supabase';
import { theme } from '../../theme/heroThemes';
import { useSettings } from '../../context/SettingsContext';

// ✅ FIX: removed INSTAGRAM_URL, WHATSAPP_NUMBER imports — context is the source of truth now
// ✅ FIX: removed fetchFooterSettings and local FooterSettings state — replaced by useSettings()

const TRACK_ORDER_URL = 'https://trackcourier.io/';

interface FooterCategory { id: string; name: string; }
interface FooterPolicy   { id: string; title: string; }

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

  // ✅ FIX: all social/contact values now come from SettingsContext — single source of truth
  const {
    whatsapp_number,
    contact_email,
    instagram_url,
    facebook_url,
  } = useSettings();

  const [email, setEmail]             = useState('');
  const [agreed, setAgreed]           = useState(false);
  const [agreeError, setAgreeError]   = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [openPolicy, setOpenPolicy]   = useState<string | null>(null);
  const [categories, setCategories]   = useState<FooterCategory[]>([]);
  const [footerPolicies, setFooterPolicies] = useState<FooterPolicy[]>([]);

  const banner = useFadeIn();
  const grid   = useFadeIn();
  const bottom = useFadeIn();

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
    fetchPolicies().then(setFooterPolicies).catch(() => {});
    // ✅ FIX: fetchFooterSettings removed — SettingsContext handles it app-wide
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (!agreed) {
      setAgreeError(true);
      setTimeout(() => setAgreeError(false), 3500);
      return;
    }

    setEmailStatus('saving');
    try {
      await saveNewsletterEmail(email.trim());
      setEmail('');
      setAgreed(false);
      setEmailStatus('success');
      setTimeout(() => setEmailStatus('idle'), 3500);
    } catch {
      setEmailStatus('error');
      setTimeout(() => setEmailStatus('idle'), 3500);
    }
  };

  const fadeStyle = (vis: boolean, delay = 0): React.CSSProperties => ({
    opacity:    vis ? 1 : 0,
    transform:  vis ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  });

  const bg      = isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-100 border-stone-200';
  const text    = isDark ? 'text-stone-300' : 'text-stone-600';
  const heading = isDark ? 'text-brand-cream' : 'text-brand-ink';

  const linkHoverStyle = (e: React.MouseEvent, enter: boolean) => {
    (e.currentTarget as HTMLElement).style.color = enter
      ? (isDark ? theme.naviLinkColor : theme.accentPrimary)
      : '';
  };

  const SHOW_COLLECTIONS = false;

  return (
    <>
      {/* ── Scoped style: bright placeholder text inside the newsletter input ── */}
      <style>{`
        .ww-newsletter-input::placeholder {
          color: rgba(255, 255, 255, 0.82);
          opacity: 1;
        }
      `}</style>

      <footer className={`${bg} border-t pt-14 pb-6`} role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* ── Subscribe banner ── */}
          <div
            ref={banner.ref}
            className="rounded-2xl p-8 md:p-10 mb-14 relative overflow-hidden"
            style={{ ...fadeStyle(banner.visible), background: theme.footerBannerBg }}
          >
            <div className="absolute inset-0 pattern-overlay opacity-20" />

            {/* Thread decoration */}
            <svg
              aria-hidden="true"
              viewBox="0 0 800 160" preserveAspectRatio="none"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.25 }}
            >
              <defs>
                <linearGradient id="footer-banner-t" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor={theme.threadPrimary} stopOpacity="0" />
                  <stop offset="50%"  stopColor={theme.threadPrimary} />
                  <stop offset="100%" stopColor={theme.threadPrimary} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,80 C120,40 200,120 320,70 C440,20 540,110 680,70 C760,50 800,80 800,80"
                stroke="url(#footer-banner-t)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </svg>

            <div className="relative z-10 flex flex-col gap-5">

              {/* Heading */}
              <div>
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

              {/* ── Form ── */}
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3" noValidate>

                {/* Input + button row */}
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    disabled={emailStatus === 'saving' || emailStatus === 'success'}
                    className="ww-newsletter-input flex-1 px-4 py-3 rounded-full text-sm font-body outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-60"
                    style={{
                      background: 'rgba(255,255,255,0.18)',
                      border:     '1px solid rgba(255,255,255,0.55)',
                      color:      '#FFFFFF',
                    }}
                    aria-label="Email address for newsletter"
                  />

                  <button
                    type="submit"
                    disabled={emailStatus === 'saving' || emailStatus === 'success'}
                    className="px-6 py-3 rounded-full font-semibold font-body text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-60 whitespace-nowrap"
                    style={{
                      background: theme.footerButtonBg,
                      color:      theme.footerButtonText,
                      minWidth:   '160px',
                    }}
                    aria-label="Agree to promotional emails and subscribe"
                  >
                    {emailStatus === 'saving'
                      ? 'Subscribing…'
                      : emailStatus === 'success'
                      ? "✓ You're in!"
                      : emailStatus === 'error'
                      ? 'Try Again'
                      : 'Agree & Subscribe'}
                  </button>
                </div>

                <label
                  className="flex items-start gap-2.5 cursor-pointer select-none"
                  style={{ maxWidth: '560px' }}
                >
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      if (agreeError) setAgreeError(false);
                    }}
                    disabled={emailStatus === 'saving' || emailStatus === 'success'}
                    className="mt-0.5 flex-shrink-0 cursor-pointer"
                    style={{ accentColor: '#FAF6EF' }}
                    aria-label="I agree to receive promotional emails from Wing & Weft"
                  />
                  <span
                    className="text-xs font-body leading-relaxed"
                    style={{
                      color:      agreeError ? '#FCA5A5' : 'rgba(250,246,239,0.72)',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {agreeError
                      ? '⚠ Please check this box to continue — your consent is required.'
                      : 'By subscribing, I agree to receive promotional emails about new arrivals, exclusive offers, and style updates from Wing\u00a0&\u00a0Weft. You can unsubscribe at any time.'}
                  </span>
                </label>
              </form>

              {/* Status feedback */}
              {emailStatus === 'success' && (
                <p className="text-brand-cream/80 text-xs font-body">
                  ✓ Welcome aboard! Check your inbox for our latest updates.
                </p>
              )}
              {emailStatus === 'error' && (
                <p className="text-red-300 text-xs font-body">
                  Something went wrong. Please try again in a moment.
                </p>
              )}
            </div>
          </div>

          {/* ── Footer grid ── */}
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
                    <source srcSet="/logo@2x.png 2x, /logo@1x.png 1x" type="image/png" />
                    <img src="/logo@1x.png" alt="Wing & Weft" width={160} height={90}
                      className="w-auto object-contain" style={{ height: '48px' }}
                      loading="lazy" decoding="async" />
                  </picture>
                </div>
                <p className={`text-sm font-body leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Sarees crafted with uncompromising quality, elegance, and attention to every detail. Your heritage, our craft.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className={`${heading} font-semibold font-label text-xs uppercase mb-4`} style={{ letterSpacing: '0.15em' }}>
                  Quick Links
                </h4>
                <ul className="space-y-2.5">
                  {[
                    { to: '/',          label: 'Home'     },
                    { to: '/our-story', label: 'About Us' },
                    { to: '/faq',       label: 'FAQs'     },
                    { to: '/contact',   label: 'Contact'  },
                  ].map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className={`${text} text-sm font-body transition-colors`}
                        style={{ fontWeight: 500 }}
                        onMouseEnter={e => linkHoverStyle(e, true)}
                        onMouseLeave={e => linkHoverStyle(e, false)}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}

                  {/* Track your Order */}
                  <li>
                    <a
                      href={TRACK_ORDER_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 text-sm font-body transition-colors ${text}`}
                      style={{ fontWeight: 500 }}
                      onMouseEnter={e => linkHoverStyle(e, true)}
                      onMouseLeave={e => linkHoverStyle(e, false)}
                      aria-label="Track your courier order (opens in new tab)"
                      title="Track your courier order"
                    >
                      <PackageSearch size={13} aria-hidden="true" className="flex-shrink-0" />
                      Track Your Order
                    </a>
                  </li>
                </ul>
              </div>

              {SHOW_COLLECTIONS && (
                <div>
                  <h4 className={`${heading} font-semibold font-label text-xs uppercase mb-4`} style={{ letterSpacing: '0.15em' }}>
                    Collections
                  </h4>
                  <ul className="space-y-2.5">
                    {categories.length > 0
                      ? categories.map((cat) => (
                        <li key={cat.id}>
                          <Link
                            to={`/category/${cat.id}`}
                            className={`${text} text-sm font-body transition-colors`}
                            style={{ fontWeight: 500 }}
                            onMouseEnter={e => linkHoverStyle(e, true)}
                            onMouseLeave={e => linkHoverStyle(e, false)}
                          >
                            {cat.name}
                          </Link>
                        </li>
                      ))
                      : [1, 2, 3, 4].map((n) => (
                        <li key={n}>
                          <div className={`h-3 w-24 rounded animate-pulse ${isDark ? 'bg-stone-700/50' : 'bg-stone-300/70'}`} />
                        </li>
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
                        <button
                          onClick={() => setOpenPolicy(p.id)}
                          className={`${text} text-sm font-body text-left transition-colors`}
                          style={{ fontWeight: 500 }}
                          onMouseEnter={e => linkHoverStyle(e, true)}
                          onMouseLeave={e => linkHoverStyle(e, false)}
                        >
                          {p.title}
                        </button>
                      </li>
                    ))
                    : [1, 2, 3, 4].map((n) => (
                      <li key={n}>
                        <div className={`h-3 w-24 rounded animate-pulse ${isDark ? 'bg-stone-700/50' : 'bg-stone-300/70'}`} />
                      </li>
                    ))
                  }
                </ul>
              </div>
            </div>
          </div>

          <div className={`saree-divider mb-6 ${isDark ? '' : 'opacity-30'}`} />

          {/* ── Bottom bar ── */}
          <div ref={bottom.ref} className="flex flex-col items-center gap-3" style={fadeStyle(bottom.visible, 200)}>
            {/* Social icons — ✅ FIX: all values from SettingsContext, not local state */}
            <div className="flex items-center gap-2.5">
              {[
                {
                  href:  instagram_url || '#',
                  icon:  <Instagram size={14} color={isDark ? '#FAF6EF' : '#44403c'} />,
                  label: 'Instagram',
                  bg:    '',
                },
                {
                  href:  facebook_url && facebook_url !== '#' ? facebook_url : '#',
                  icon:  <Facebook size={14} color={isDark ? '#FAF6EF' : '#44403c'} />,
                  label: 'Facebook',
                  bg:    '',
                },
                {
                  href:  `mailto:${contact_email}`,
                  icon:  <Mail size={14} color={isDark ? '#FAF6EF' : '#44403c'} />,
                  label: 'Email',
                  bg:    '',
                },
                {
                  href:  `https://wa.me/${whatsapp_number}`,
                  icon:  <MessageCircle size={14} color="white" />,
                  label: 'WhatsApp',
                  bg:    '#25D366',
                },
              ].map(({ href, icon, label, bg }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:opacity-80"
                  style={{
                    background: bg || (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                    border: bg ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
                  }}
                  aria-label={label}
                >
                  {icon}
                </a>
              ))}
            </div>

            {/* Copyright line — ✅ FIX: contact_email from context */}
            <p className={`${text} text-xs font-body text-center`}>
              © 2026 Wing &amp; Weft. All Rights Reserved.
              &nbsp;·&nbsp;
              Crafted with{' '}
              <Heart size={9} className="inline" style={{ color: theme.accentPrimary, fill: theme.heartFill }} />
              {' '}by{' '}
              <a
                href="https://vnvne.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: theme.naviLinkColor, fontWeight: 600 }}
                className="transition-colors"
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = theme.accentSecondary}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = theme.naviLinkColor}
              >
                Navi
              </a>
              &nbsp;·&nbsp;
              <a
                href={`mailto:${contact_email}`}
                className="transition-colors"
                onMouseEnter={e => linkHoverStyle(e, true)}
                onMouseLeave={e => linkHoverStyle(e, false)}
              >
                {contact_email}
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