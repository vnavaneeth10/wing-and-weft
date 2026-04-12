// src/pages/ContactPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Phone, Mail, Clock, Instagram, Facebook, MessageCircle, Send, Check, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { usePageMeta } from '../hooks/usePageMeta';
import SEO from '../components/SEO/SEO';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../admin/lib/supabase';

// ─────────────────────────────────────────────────────────────────────────────
// HERO THEME SWITCHER
// ─────────────────────────────────────────────────────────────────────────────
//
//  HOW TO SWITCH THEMES
//  ────────────────────
//  Change the value of ACTIVE_HERO_THEME (line below) to one of:
//    'silkDusk'       → A · deep charcoal → amber         (default)
//    'oceanIndigo'    → B · deep navy → teal
//    'sandalwoodDusk' → C · near-black → warm sandalwood
//    'roseSilk'       → D · midnight maroon → rose pink
//    'mysoreViolet'   → E · midnight blue → violet
//
//  Keep this value in sync with OurStoryPage.tsx so both pages match.
//  That's it — nothing else needs to change.
// ─────────────────────────────────────────────────────────────────────────────

const ACTIVE_HERO_THEME = 'mysoreViolet'; // ← change this line to swap themes

// ─── Theme definitions ────────────────────────────────────────────────────────
// Each theme controls:
//   background     — CSS gradient string for the hero banner
//   radialGlow     — inner ambient glow colour
//   threadPrimary  — colour of the primary animated SVG thread
//   threadAccent   — colour of the secondary SVG thread
//   eyebrow        — small ALL-CAPS label above the h1  (≥ 0.85 opacity for WCAG AA)
//   h1             — main page heading colour
//   tagline        — tagline/subtext below the diamond rule (≥ 0.70 for WCAG AA)
//   diamond        — the rotating ◆ divider element + scroll indicator
//   rule           — the short horizontal lines flanking the diamond

const HERO_THEMES = {

  // A · Silk Dusk — deep charcoal → burnt amber
  // Bold, dramatic, classic "heritage craft" feel.
  silkDusk: {
    background:    'linear-gradient(135deg, #2a1f1a 0%, #bc3d3e 55%, #b6893c 100%)',
    radialGlow:    'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(180,90,30,0.22) 0%, transparent 70%)',
    threadPrimary: '#d4924a',
    threadAccent:  '#bc3d3e',
    eyebrow:       'rgba(233,227,203,0.92)',
    h1:            '#f5ead8',
    tagline:       'rgba(245,234,216,0.72)',
    diamond:       '#b6893c',
    rule:          'rgba(182,137,60,0.80)',
    ringColor:     'rgba(233,227,203,0.10)',
  },

  // B · Ocean Indigo — deep navy → teal
  // Cooler, modern luxury. Inspired by traditional indigo dyeing.
  oceanIndigo: {
    background:    'linear-gradient(135deg, #0a1628 0%, #1a5c72 55%, #1b7a7a 100%)',
    radialGlow:    'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(26,122,122,0.22) 0%, transparent 70%)',
    threadPrimary: '#4ab0c8',
    threadAccent:  '#2a7aaa',
    eyebrow:       'rgba(180,220,210,0.92)',
    h1:            '#e8f5f2',
    tagline:       'rgba(232,245,242,0.72)',
    diamond:       '#7ecec4',
    rule:          'rgba(126,206,196,0.80)',
    ringColor:     'rgba(180,220,210,0.10)',
  },

  // C · Sandalwood Dusk — near-black → warm sandalwood gold
  // Quieter, understated, very premium. Great for high-end positioning.
  sandalwoodDusk: {
    background:    'linear-gradient(135deg, #0d0a06 0%, #5c3d1a 55%, #8c6030 100%)',
    radialGlow:    'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(92,61,26,0.18) 0%, transparent 70%)',
    threadPrimary: '#c8a86a',
    threadAccent:  '#8c6030',
    eyebrow:       'rgba(220,196,150,0.92)',
    h1:            '#f7efde',
    tagline:       'rgba(247,239,222,0.72)',
    diamond:       '#c8a86a',
    rule:          'rgba(200,168,106,0.80)',
    ringColor:     'rgba(220,196,150,0.10)',
  },

  // D · Rose Silk — midnight maroon → rose pink
  // Feminine, festive, Banarasi-inspired. Great for bridal / gifting.
  roseSilk: {
    background:    'linear-gradient(135deg, #280a18 0%, #8c1a4a 55%, #b52260 100%)',
    radialGlow:    'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(140,26,74,0.22) 0%, transparent 70%)',
    threadPrimary: '#f0a0bc',
    threadAccent:  '#b52260',
    eyebrow:       'rgba(255,192,210,0.92)',
    h1:            '#fdeef4',
    tagline:       'rgba(253,238,244,0.72)',
    diamond:       '#f0a0bc',
    rule:          'rgba(240,160,188,0.80)',
    ringColor:     'rgba(255,192,210,0.10)',
  },

  // E · Mysore Violet — midnight blue → rich violet
  // Regal and distinctive. Inspired by Mysore silk heritage.
  mysoreViolet: {
    background:    'linear-gradient(135deg, #0e0e28 0%, #2e2a7c 55%, #4a3aaa 100%)',
    radialGlow:    'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(46,42,124,0.26) 0%, transparent 70%)',
    threadPrimary: '#a090e0',
    threadAccent:  '#6050b8',
    eyebrow:       'rgba(196,188,255,0.92)',
    h1:            '#f0eeff',
    tagline:       'rgba(240,238,255,0.72)',
    diamond:       '#a090e0',
    rule:          'rgba(160,144,224,0.80)',
    ringColor:     'rgba(196,188,255,0.10)',
  },

} as const;

// Active theme — resolved from the key above.
// All hero banner references use `theme.*` so swapping the key is the only edit needed.
const theme = HERO_THEMES[ACTIVE_HERO_THEME];

// ─────────────────────────────────────────────────────────────────────────────
// Everything below this line is unchanged design logic.
// You should not need to edit anything below to change the hero colours.
// ─────────────────────────────────────────────────────────────────────────────

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
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/settings?select=key,value`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  );
  if (!res.ok) throw new Error('Failed');
  const rows: { key: string; value: string }[] = await res.json();
  const map: Record<string, string> = {};
  rows.forEach(r => { if (r.key && r.value) map[r.key] = r.value; });
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
    body: JSON.stringify({ ...data, customer_phone: data.customer_phone || 'N/A', status: 'new' }),
  });
  if (!res.ok) throw new Error('Failed');
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @keyframes cp-slide-up   { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cp-slide-left { from{opacity:0;transform:translateX(-32px)} to{opacity:1;transform:translateX(0)} }
  @keyframes cp-slide-right{ from{opacity:0;transform:translateX(32px)} to{opacity:1;transform:translateX(0)} }
  @keyframes cp-fade       { from{opacity:0} to{opacity:1} }
  @keyframes cp-line-grow  { from{transform:scaleX(0);opacity:0} to{transform:scaleX(1);opacity:1} }
  @keyframes cp-diamond    { 0%,100%{transform:rotate(45deg) scale(1);box-shadow:0 0 6px rgba(182,137,60,0.4)} 50%{transform:rotate(225deg) scale(1.3);box-shadow:0 0 18px rgba(182,137,60,0.9)} }
  @keyframes cp-thread     { from{stroke-dashoffset:400;opacity:0} to{stroke-dashoffset:0;opacity:1} }
  @keyframes cp-row-in     { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
  @keyframes cp-pulse-glow { 0%,100%{box-shadow:0 6px 28px rgba(37,211,102,0.3)} 50%{box-shadow:0 8px 40px rgba(37,211,102,0.55),0 0 60px rgba(37,211,102,0.15)} }
  @keyframes cp-btn-shimmer { 0%{left:-100%} 100%{left:120%} }
  @keyframes cp-success-pop { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
  @keyframes cp-input-focus { from{width:0} to{width:100%} }

  .cp-card-left  { opacity:0; animation: cp-slide-left  0.8s cubic-bezier(0.22,1,0.36,1) 0.1s forwards; }
  .cp-card-right { opacity:0; animation: cp-slide-right 0.8s cubic-bezier(0.22,1,0.36,1) 0.25s forwards; }

  .cp-info-row {
    opacity:0;
    animation: cp-row-in 0.6s cubic-bezier(0.22,1,0.36,1) forwards;
    transition: background 0.3s ease, transform 0.3s ease;
    border-radius: 12px;
    padding: 10px 12px;
    margin: 0 -12px;
  }

  /* FIX: hover lift only on pointer devices — prevents stuck state on mobile tap */
  @media (hover: hover) {
    .cp-info-row:hover { transform: translateX(4px); }
    .cp-info-row:hover .cp-icon-wrap {
      transform: scale(1.15) rotate(5deg);
    }
    .cp-submit-btn:hover:not(:disabled) {
      transform: translateY(-3px);
      letter-spacing: 0.22em;
      box-shadow: 0 12px 36px rgba(188,61,62,0.45);
    }
    .cp-submit-btn:hover:not(:disabled)::before { left: 130%; }
    .cp-wa-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 36px rgba(37,211,102,0.45);
      animation: cp-pulse-glow 2s ease-in-out infinite;
    }
    .cp-wa-btn:hover::before { left: 130%; }
  }

  .cp-icon-wrap {
    transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease;
  }

  /* Input underline focus effect */
  .cp-input-wrap { position: relative; }
  .cp-input-wrap::after {
    content: '';
    position: absolute; bottom: 0; left: 0;
    height: 2px; width: 0;
    background: linear-gradient(90deg, #bc3d3e, #b6893c);
    border-radius: 2px;
    transition: width 0.35s cubic-bezier(0.22,1,0.36,1);
  }
  .cp-input-wrap:focus-within::after { width: 100%; }

  /* Submit button */
  .cp-submit-btn {
    position: relative; overflow: hidden;
    transition: transform 0.35s cubic-bezier(0.22,1,0.36,1),
                box-shadow 0.35s ease, letter-spacing 0.3s ease;
  }
  .cp-submit-btn::before {
    content: '';
    position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
    transition: left 0.55s ease;
  }
  .cp-submit-btn:active:not(:disabled) { transform: translateY(-1px) scale(0.98); }

  /* WhatsApp button */
  .cp-wa-btn {
    position: relative; overflow: hidden;
    transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease;
  }
  .cp-wa-btn::before {
    content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
    transition: left 0.55s ease;
  }

  .cp-success-msg { animation: cp-success-pop 0.5s cubic-bezier(0.22,1,0.36,1) forwards; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }
`;

// ─── Scroll-triggered hook ────────────────────────────────────────────────────
function useVisible(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, vis };
}

// ─── Animated thread SVG ──────────────────────────────────────────────────────
// Thread colours are fixed to the brand crimson/gold — these sit inside the
// content cards (not the hero) so they don't need to change per theme.
const ThreadLine: React.FC = () => (
  <svg viewBox="0 0 460 50" fill="none"
    style={{ width:'100%', maxWidth:'420px', height:'32px', overflow:'visible', margin:'0 auto', display:'block' }}
    aria-hidden="true">
    <path d="M0,25 C55,6 90,44 150,22 C210,0 240,42 300,20 C360,-2 400,38 460,22"
      stroke="url(#cp-tg)" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="400"
      style={{ animation:'cp-thread 1.6s ease 0.4s both' }}/>
    <defs>
      <linearGradient id="cp-tg" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor="#bc3d3e" stopOpacity="0"/>
        <stop offset="30%"  stopColor="#bc3d3e"/>
        <stop offset="70%"  stopColor="#b6893c"/>
        <stop offset="100%" stopColor="#b6893c" stopOpacity="0"/>
      </linearGradient>
    </defs>
  </svg>
);

// ─── Main component ───────────────────────────────────────────────────────────
const ContactPage: React.FC = () => {
  const { isDark } = useTheme();
  usePageMeta({ title: 'Contact Us', description: 'Get in touch with Wing & Weft. Reach us via WhatsApp, email, or our contact form. We respond within 24 hours.' });
  const styleRef   = useRef(false);
  const [form, setForm]     = useState({ name:'', email:'', whatsapp:'', message:'' });
  const [status, setStatus] = useState<'idle'|'saving'|'success'|'error'>('idle');
  const [info, setInfo]     = useState<ContactSettings>(DEFAULTS);
  const heroVis  = useVisible(0.05);
  const gridVis  = useVisible(0.06);

  useEffect(() => {
    if (!styleRef.current) {
      const tag = document.createElement('style');
      tag.textContent = STYLES;
      document.head.appendChild(tag);
      styleRef.current = true;
    }
    fetchContactSettings().then(setInfo).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    setStatus('saving');
    try {
      await saveInquiry({ customer_name: form.name, customer_email: form.email, customer_phone: form.whatsapp, message: form.message });
      setStatus('success');
      setForm({ name:'', email:'', whatsapp:'', message:'' });
      const text = `*New Contact Form Message*\n\nName: ${form.name}\nEmail: ${form.email}\nWhatsApp: ${form.whatsapp}\nMessage: ${form.message}`;
      window.open(`https://wa.me/${info.whatsapp_number}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
      setTimeout(() => setStatus('idle'), 4000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const bg         = isDark ? 'bg-dark-bg'     : 'bg-stone-50';
  const textP      = isDark ? 'text-dark-text'  : 'text-stone-800';
  const textM      = isDark ? 'text-dark-muted' : 'text-stone-600';
  const cardStyle: React.CSSProperties = {
    background:   isDark ? 'rgba(26,18,12,0.9)' : '#ffffff',
    border:       `1px solid ${isDark ? 'rgba(182,137,60,0.18)' : 'rgba(182,137,60,0.2)'}`,
    borderRadius: '20px',
    boxShadow:    isDark
      ? '0 16px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)'
      : '0 8px 40px rgba(26,20,16,0.08)',
    padding: 'clamp(24px,4vw,40px)',
  };
  const inputCls = `w-full px-4 py-3 rounded-xl border text-sm font-body outline-none transition-all ${
    isDark
      ? 'bg-dark-bg border-dark-border text-dark-text placeholder-dark-muted focus:border-brand-red'
      : 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400 focus:border-brand-red'
  }`;

  const DETAILS = [
    { icon: Phone,     label: 'Phone',         value: info.contact_phone,    href: `tel:${info.contact_phone.replace(/\s+/g,'')}` },
    { icon: Mail,      label: 'Email',          value: info.contact_email,    href: `mailto:${info.contact_email}` },
    { icon: Clock,     label: 'Business Hours', value: info.business_hours,   href: null },
    { icon: Instagram, label: 'Instagram',      value: info.instagram_handle, href: info.instagram_url },
    { icon: Facebook,  label: 'Facebook',       value: info.facebook_name,    href: info.facebook_url !== '#' ? info.facebook_url : null },
  ];

  return (
    <div className={`min-h-screen ${bg} pt-20`}>
      <SEO
        title="Contact Us"
        description="Get in touch with Wing & Weft. Call, WhatsApp, or email us for saree inquiries. Mon–Sat 10AM–7PM."
        canonical="https://wingandweft.vercel.app/contact"
      />

      {/* ── Hero banner ──────────────────────────────────────────────────────── */}
      {/* All colours below come from `theme.*` — change ACTIVE_HERO_THEME at    */}
      {/* the very top of this file and every hero colour updates automatically.  */}
      <div
        className="relative overflow-hidden"
        style={{
          minHeight: 'clamp(200px, 25vw, 260px)',
          background: theme.background, // ← theme-controlled
        }}
      >
        {/* Woven texture overlay — same as OurStoryPage for visual consistency */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `
              repeating-linear-gradient(45deg,  rgba(212,160,96,0.05) 0, rgba(212,160,96,0.05) 1px, transparent 0, transparent 50%),
              repeating-linear-gradient(-45deg, rgba(212,160,96,0.05) 0, rgba(212,160,96,0.05) 1px, transparent 0, transparent 50%)
            `,
            backgroundSize: '12px 12px',
          }}
        />

        {/* Radial centre glow — theme-controlled */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: theme.radialGlow, // ← theme-controlled
          }}
        />

        {/* Animated thread SVG lines — colours are theme-controlled */}
        <svg
          aria-hidden="true"
          viewBox="0 0 800 260"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <defs>
            <linearGradient id="cp-hero-thread-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={theme.threadPrimary} stopOpacity="0" />
              <stop offset="40%"  stopColor={theme.threadPrimary} />
              <stop offset="70%"  stopColor={theme.threadPrimary} stopOpacity="0.7" />
              <stop offset="100%" stopColor={theme.threadPrimary} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="cp-hero-thread-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={theme.threadAccent} stopOpacity="0" />
              <stop offset="50%"  stopColor={theme.threadAccent} />
              <stop offset="100%" stopColor={theme.threadAccent} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Primary thread */}
          <path
            d="M80,130 C180,95 280,165 380,118 C480,72 560,148 680,118"
            stroke="url(#cp-hero-thread-1)"
            strokeWidth="1" fill="none" strokeLinecap="round" strokeDasharray="500"
            style={{ animation: 'cp-thread 2s ease 0.4s both' }}
          />
          {/* Secondary thread */}
          <path
            d="M80,145 C190,118 290,172 390,130 C490,90 570,155 680,130"
            stroke="url(#cp-hero-thread-2)"
            strokeWidth="0.6" fill="none" strokeLinecap="round" strokeDasharray="500"
            opacity="0.5"
            style={{ animation: 'cp-thread 2s ease 0.8s both' }}
          />
          {/* Bottom border rule */}
          <line x1="0" y1="259" x2="800" y2="259" stroke="rgba(212,160,96,0.25)" strokeWidth="1" />
        </svg>

        {/* Animated rings — colour is theme-controlled */}
        {[200, 300, 420].map((s, i) => (
          <div key={s} style={{
            position: 'absolute', top: '50%', left: '50%',
            width: s, height: s, borderRadius: '50%',
            border: `1px solid ${theme.ringColor}`, // ← theme-controlled
            transform: 'translate(-50%,-50%)',
            animation: `cp-fade 0.6s ease ${0.1 + i * 0.15}s both`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Hero text content */}
        <div
          className="absolute inset-0 flex items-center justify-center text-center px-4"
          ref={heroVis.ref}
        >
          <div>
            {/* Eyebrow — theme-controlled colour (≥ 0.85 opacity for WCAG AA) */}
            <p
              className="font-body uppercase"
              style={{
                fontSize: '0.6rem', letterSpacing: '0.38em',
                color: theme.eyebrow, // ← theme-controlled
                marginBottom: '12px', marginTop: 0,
                opacity:   heroVis.vis ? 1 : 0,
                transform: heroVis.vis ? 'translateY(0)' : 'translateY(16px)',
                transition: 'all 0.6s ease 0.1s',
              }}
            >
              Get in Touch
            </p>

            {/* H1 — theme-controlled colour */}
            <h1
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
                fontWeight: 600,
                color: theme.h1, // ← theme-controlled
                lineHeight: 1.1,
                margin: 0,
                opacity:   heroVis.vis ? 1 : 0,
                transform: heroVis.vis ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.7s ease 0.25s',
              }}
            >
              Contact Us
            </h1>

            {/* Diamond rule — theme-controlled colours */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '10px', marginTop: '14px',
              opacity: heroVis.vis ? 1 : 0,
              transition: 'opacity 0.6s ease 0.5s',
            }}>
              <div style={{
                width: '36px', height: '1px',
                background: `linear-gradient(to right, transparent, ${theme.rule})`, // ← theme-controlled
                transformOrigin: 'right',
                animation: heroVis.vis ? 'cp-line-grow 0.5s ease 0.6s both' : 'none',
              }} />
              <div style={{
                width: '6px', height: '6px',
                background: theme.diamond, // ← theme-controlled
                transform: 'rotate(45deg)',
                animation: 'cp-diamond 3s ease-in-out 0.8s infinite',
              }} />
              <div style={{
                width: '36px', height: '1px',
                background: `linear-gradient(to left, transparent, ${theme.rule})`, // ← theme-controlled
                transformOrigin: 'left',
                animation: heroVis.vis ? 'cp-line-grow 0.5s ease 0.6s both' : 'none',
              }} />
            </div>

            {/* Optional tagline — theme-controlled colour */}
            <p
              className="font-body uppercase"
              style={{
                fontSize: '0.6rem', letterSpacing: '0.22em',
                color: theme.tagline, // ← theme-controlled (≥ 0.70 opacity for WCAG AA)
                marginTop: '12px', marginBottom: 0,
                opacity:   heroVis.vis ? 1 : 0,
                transform: heroVis.vis ? 'translateY(0)' : 'translateY(10px)',
                transition: 'all 0.6s ease 0.65s',
              }}
            >
              We respond within 24 hours
            </p>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div ref={gridVis.ref} className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* ── Left: Contact info ── */}
          <div className={`cp-card-left ${gridVis.vis ? '' : 'opacity-0'}`} style={cardStyle}>

            <div style={{ marginBottom: '28px' }}>
              <h2 className={textP} style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: '1.9rem', fontWeight: 600, marginBottom: '6px' }}>
                Contact Information
              </h2>
              <div style={{ opacity: gridVis.vis ? 1 : 0, transition: 'opacity 0.5s ease 0.4s' }}>
                <ThreadLine />
              </div>
            </div>

            {/* Detail rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {DETAILS.map(({ icon: Icon, label, value, href }, i) => (
                <div
                  key={label}
                  className="cp-info-row"
                  style={{ animationDelay: `${0.3 + i * 0.1}s`, background: 'transparent' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.background = isDark
                      ? 'rgba(182,137,60,0.06)' : 'rgba(182,137,60,0.05)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div
                      className="cp-icon-wrap"
                      style={{
                        background: 'linear-gradient(135deg, rgba(188,61,62,0.1), rgba(182,137,60,0.1))',
                        border: '1px solid rgba(182,137,60,0.22)',
                        width: '40px', height: '40px', borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}
                    >
                      <Icon size={17} style={{ color: '#b6893c' }} />
                    </div>
                    <div>
                      <p className={`text-xs uppercase font-semibold font-body ${textM}`}
                        style={{ letterSpacing: '0.18em', marginBottom: '3px' }}>
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          className={`text-sm font-body transition-colors ${textP}`}
                          style={{ textDecoration: 'none' }}
                          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#bc3d3e'}
                          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = ''}
                        >
                          {value}
                        </a>
                      ) : (
                        <p className={`text-sm font-body ${textP}`}>{value}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: `1px solid ${isDark ? 'rgba(182,137,60,0.15)' : 'rgba(182,137,60,0.15)'}` }}>
              <a
                href={`https://wa.me/${info.whatsapp_number}?text=${encodeURIComponent('Hi! I need help with Wing & Weft.')}`}
                target="_blank" rel="noopener noreferrer"
                className="cp-wa-btn"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '10px', width: '100%', padding: '14px',
                  background: '#25D366', color: '#fff',
                  borderRadius: '100px',
                  fontFamily: '"Raleway",sans-serif', fontWeight: 700,
                  fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                  textDecoration: 'none',
                  boxShadow: '0 6px 28px rgba(37,211,102,0.3)',
                }}
              >
                <MessageCircle size={17} />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div className={`cp-card-right ${gridVis.vis ? '' : 'opacity-0'}`} style={cardStyle}>

            <div style={{ marginBottom: '28px' }}>
              <h2 className={textP} style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: '1.9rem', fontWeight: 600, marginBottom: '6px' }}>
                Send Us a Message
              </h2>
              <div style={{ opacity: gridVis.vis ? 1 : 0, transition: 'opacity 0.5s ease 0.5s' }}>
                <ThreadLine />
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} noValidate>

              {/* Name */}
              <div style={{ opacity: gridVis.vis ? 1:0, transform: gridVis.vis ? 'translateY(0)':'translateY(12px)', transition: 'all 0.5s ease 0.35s' }}>
                <label className={`block text-xs font-semibold font-body uppercase tracking-wide mb-1.5 ${textM}`} style={{ letterSpacing: '0.15em' }}>Name *</label>
                <div className="cp-input-wrap">
                  <input type="text" name="name" required value={form.name} onChange={handleChange}
                    placeholder="Your full name" className={inputCls} />
                </div>
              </div>

              {/* Email */}
              <div style={{ opacity: gridVis.vis ? 1:0, transform: gridVis.vis ? 'translateY(0)':'translateY(12px)', transition: 'all 0.5s ease 0.45s' }}>
                <label className={`block text-xs font-semibold font-body uppercase tracking-wide mb-1.5 ${textM}`} style={{ letterSpacing: '0.15em' }}>Email *</label>
                <div className="cp-input-wrap">
                  <input type="email" name="email" required value={form.email} onChange={handleChange}
                    placeholder="your@email.com" className={inputCls} />
                </div>
              </div>

              {/* WhatsApp */}
              <div style={{ opacity: gridVis.vis ? 1:0, transform: gridVis.vis ? 'translateY(0)':'translateY(12px)', transition: 'all 0.5s ease 0.55s' }}>
                <label className={`block text-xs font-semibold font-body uppercase tracking-wide mb-1.5 ${textM}`} style={{ letterSpacing: '0.15em' }}>WhatsApp Number</label>
                <div className="cp-input-wrap">
                  <input type="tel" name="whatsapp" value={form.whatsapp} onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX" className={inputCls} />
                </div>
              </div>

              {/* Message */}
              <div style={{ opacity: gridVis.vis ? 1:0, transform: gridVis.vis ? 'translateY(0)':'translateY(12px)', transition: 'all 0.5s ease 0.65s' }}>
                <label className={`block text-xs font-semibold font-body uppercase tracking-wide mb-1.5 ${textM}`} style={{ letterSpacing: '0.15em' }}>Message *</label>
                <div className="cp-input-wrap">
                  <textarea name="message" required rows={5} value={form.message} onChange={handleChange}
                    placeholder="How can we help you?" className={`${inputCls} resize-none`} />
                </div>
              </div>

              {/* Status messages */}
              {status === 'success' && (
                <div className="cp-success-msg flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-body"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>
                  <Check size={16} /> Message saved! WhatsApp is opening…
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-body"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                  <AlertCircle size={16} /> Something went wrong. Please try again.
                </div>
              )}

              {/* Submit */}
              <div style={{ opacity: gridVis.vis ? 1:0, transform: gridVis.vis ? 'translateY(0)':'translateY(12px)', transition: 'all 0.5s ease 0.75s' }}>
                <button
                  type="submit"
                  disabled={status === 'saving'}
                  className="cp-submit-btn w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold font-body text-sm uppercase"
                  style={{
                    background: 'linear-gradient(115deg, #bc3d3e 0%, #a8322f 40%, #b6893c 100%)',
                    color: '#e9e3cb',
                    letterSpacing: '0.18em',
                    boxShadow: '0 6px 28px rgba(188,61,62,0.35)',
                    opacity: status === 'saving' ? 0.65 : 1,
                    cursor: status === 'saving' ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Send size={15} />
                  {status === 'saving' ? 'Sending…' : 'Send Message'}
                </button>
                <p className={`text-xs text-center font-body mt-2 ${textM}`}>
                  Your message will be saved and WhatsApp will open for a quick reply
                </p>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;