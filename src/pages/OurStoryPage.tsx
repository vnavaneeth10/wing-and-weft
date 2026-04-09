// src/pages/OurStoryPage.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePageMeta } from '../hooks/usePageMeta';
import SEO from '../components/SEO/SEO';
import { useInView } from '../hooks';

const VALUES = [
  { icon: '✦', title: 'Authenticity', description: 'Every saree in our collection is sourced directly from master weavers, ensuring genuine craftsmanship and fair trade.' },
  { icon: '♡', title: 'Craftsmanship', description: 'We believe in preserving centuries-old weaving traditions by supporting artisan communities across India.' },
  { icon: '❧', title: 'Sustainability', description: 'Handloom weaving uses minimal electricity and supports eco-friendly, slow fashion principles.' },
  { icon: '◆', title: 'Quality', description: 'Each saree undergoes rigorous quality checks before reaching you — because you deserve only the finest.' },
];

const STYLES = `
  @keyframes os-shimmer {
    0%   { left: -80%; }
    100% { left: 130%; }
  }
  @keyframes os-float {
    0%,100% { transform: translateY(0px) rotate(-1deg); }
    50%     { transform: translateY(-12px) rotate(1deg); }
  }
  @keyframes os-orbit-cw {
    from { transform: rotate(0deg)   translateX(var(--r)) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(var(--r)) rotate(-360deg); }
  }
  @keyframes os-orbit-ccw {
    from { transform: rotate(0deg)    translateX(var(--r)) rotate(0deg); }
    to   { transform: rotate(-360deg) translateX(var(--r)) rotate(360deg); }
  }
  @keyframes os-ring-breathe {
    0%,100% { transform: translate(-50%,-50%) scale(1);   opacity: 0.12; }
    50%     { transform: translate(-50%,-50%) scale(1.08); opacity: 0.28; }
  }
  @keyframes os-glow-pulse {
    0%,100% { opacity: 0.3; transform: scale(1); }
    50%     { opacity: 0.6; transform: scale(1.08); }
  }
  @keyframes os-corner-draw {
    from { opacity: 0; transform: scale(0.4); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes os-slide-up {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes os-reveal-left {
    from { opacity: 0; transform: translateX(-32px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes os-reveal-right {
    from { opacity: 0; transform: translateX(32px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes os-card-in {
    from { opacity: 0; transform: translateY(28px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes os-diamond-spin {
    0%,100% { transform: rotate(45deg) scale(1);   box-shadow: 0 0 6px rgba(182,137,60,0.4); }
    50%     { transform: rotate(225deg) scale(1.3); box-shadow: 0 0 20px rgba(182,137,60,0.9); }
  }
  @keyframes os-thread-draw {
    from { stroke-dashoffset: 400; opacity: 0; }
    to   { stroke-dashoffset: 0;   opacity: 1; }
  }
  @keyframes os-line-grow {
    from { transform: scaleX(0); opacity: 0; }
    to   { transform: scaleX(1); opacity: 1; }
  }

  .os-logo-container {
    position: relative;
    cursor: pointer;
  }
  .os-logo-container:hover .os-logo-box {
    transform: scale(1.04);
    box-shadow: 0 24px 64px rgba(188,61,62,0.22), 0 8px 24px rgba(0,0,0,0.1);
  }
  .os-logo-box {
    transition: transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.5s ease;
  }
  .os-logo-shimmer {
    position: relative; overflow: hidden; display: block;
  }
  .os-logo-shimmer::after {
    content: '';
    position: absolute; top: 0; width: 55%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: os-shimmer 3s ease-in-out 0.5s infinite;
    pointer-events: none;
  }
  .os-orbit-dot {
    position: absolute; border-radius: 50%;
    top: 50%; left: 50%;
    animation: var(--anim) var(--dur) linear var(--delay) infinite;
  }


  .os-value-card {
    transition: transform 0.4s cubic-bezier(0.22,1,0.36,1),
                box-shadow 0.4s ease, border-color 0.3s ease;
  }
  .os-value-card:hover {
    transform: translateY(-8px) scale(1.02);
  }
  .os-value-icon {
    transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), background 0.3s ease;
  }
  .os-value-card:hover .os-value-icon {
    transform: scale(1.2) rotate(8deg);
    background: linear-gradient(135deg, rgba(188,61,62,0.18), rgba(182,137,60,0.18)) !important;
  }

  .os-text-para {
    opacity: 0; transform: translateY(16px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .os-text-para.visible {
    opacity: 1; transform: translateY(0);
  }
`;

// ─── Animated thread SVG decoration ──────────────────────────────────────────
const ThreadDivider: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <svg viewBox="0 0 500 60" fill="none"
    style={{ width: '100%', maxWidth: '460px', height: '40px', overflow: 'visible', margin: '0 auto', display: 'block' }}
    aria-hidden="true">
    <path d="M0,30 C60,8 100,52 160,28 C220,4 260,48 320,24 C380,0 430,44 500,28"
      stroke={isDark ? 'url(#tg-dark)' : 'url(#tg-light)'} strokeWidth="1.5"
      strokeLinecap="round" strokeDasharray="400"
      style={{ animation: 'os-thread-draw 1.8s ease 0.3s both' }} />
    <path d="M0,38 C70,16 115,56 175,36 C235,16 265,52 325,32 C385,12 440,50 500,36"
      stroke={isDark ? 'url(#tg-dark2)' : 'url(#tg-light2)'} strokeWidth="0.8"
      strokeLinecap="round" strokeDasharray="400" opacity="0.5"
      style={{ animation: 'os-thread-draw 1.8s ease 0.6s both' }} />
    <defs>
      <linearGradient id="tg-dark" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#bc3d3e" stopOpacity="0" />
        <stop offset="35%" stopColor="#bc3d3e" />
        <stop offset="65%" stopColor="#b6893c" />
        <stop offset="100%" stopColor="#b6893c" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="tg-dark2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#e69358" stopOpacity="0" />
        <stop offset="50%" stopColor="#e69358" />
        <stop offset="100%" stopColor="#bc3d3e" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="tg-light" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#bc3d3e" stopOpacity="0" />
        <stop offset="35%" stopColor="#bc3d3e" />
        <stop offset="65%" stopColor="#b6893c" />
        <stop offset="100%" stopColor="#b6893c" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="tg-light2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#e69358" stopOpacity="0" />
        <stop offset="50%" stopColor="#e69358" />
        <stop offset="100%" stopColor="#bc3d3e" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

// ─── Logo section with full animation suite ───────────────────────────────────
const LogoDisplay: React.FC<{ isDark: boolean; visible: boolean }> = ({ isDark, visible }) => {
  const styleRef = useRef(false);
  useEffect(() => {
    if (styleRef.current) return;
    const tag = document.createElement('style');
    tag.textContent = STYLES;
    document.head.appendChild(tag);
    styleRef.current = true;
  }, []);

  return (
    <div className="flex justify-center" style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(-40px)',
      transition: 'opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)',
    }}>
      <div className="os-logo-container">

        {/* Pulsing background rings */}
        {[240, 320, 400].map((s, i) => (
          <div key={s} style={{
            position: 'absolute', top: '50%', left: '50%',
            width: s, height: s,
            borderRadius: '50%',
            border: `1px solid ${isDark ? 'rgba(188,61,62,0.1)' : 'rgba(188,61,62,0.08)'}`,
            animation: `os-ring-breathe ${8 + i * 2}s ease-in-out ${i * 1.8}s infinite`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '340px', height: '340px', borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(188,61,62,0.18) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(188,61,62,0.1) 0%, transparent 65%)',
          animation: 'os-glow-pulse 5s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* Orbiting dots */}
        {[
          { size: 8, color: '#bc3d3e', r: 155, dur: '5s', delay: '0s', cw: true },
          { size: 5, color: '#b6893c', r: 175, dur: '7.5s', delay: '-3s', cw: false },
          { size: 6, color: '#e69358', r: 140, dur: '4.2s', delay: '-1.5s', cw: true },
          { size: 3, color: '#bc3d3e', r: 190, dur: '9s', delay: '-4s', cw: false },
        ].map((d, i) => (
          <div key={i} className="os-orbit-dot" style={{
            width: d.size, height: d.size,
            background: d.color, opacity: 0.75,
            marginLeft: -d.size / 2, marginTop: -d.size / 2,
            '--r': `${d.r}px`,
            '--anim': d.cw ? 'os-orbit-cw' : 'os-orbit-ccw',
            '--dur': d.dur, '--delay': d.delay,
            boxShadow: `0 0 ${d.size * 2}px ${d.color}`,
          } as React.CSSProperties} />
        ))}

        {/* Main logo box */}
        <div
          className="os-logo-box"
          style={{
            position: 'relative',
            width: 'clamp(280px, 40vw, 380px)',
            height: 'clamp(280px, 40vw, 380px)',
            borderRadius: '24px',
            background: isDark
              ? 'linear-gradient(135deg, rgba(22,15,10,0.9), rgba(30,22,14,0.75))'
              : 'linear-gradient(135deg, #fdf8f2, #f5ead8)',
            border: isDark
              ? '1px solid rgba(182,137,60,0.22)'
              : '1px solid rgba(182,137,60,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isDark
              ? '0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)'
              : '0 16px 48px rgba(26,20,16,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
            animation: 'os-float 7s ease-in-out infinite',
          }}
        >
          {/* Corner frame — single SVG, all 4 corners pixel-perfect */}
          <svg
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              pointerEvents: 'none', overflow: 'visible',
              opacity: 0,
              animation: 'os-corner-draw 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s forwards',
            }}
            aria-hidden="true"
          >
            {/* Top-left */}
            <line x1="14" y1="14" x2="46" y2="14" stroke="#b6893c" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
            <line x1="14" y1="14" x2="14" y2="46" stroke="#b6893c" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
            {/* Top-right */}
            <line x1="calc(100% - 14)" y1="14" x2="calc(100% - 46)" y2="14" stroke="#b6893c" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
            <line x1="calc(100% - 14)" y1="14" x2="calc(100% - 14)" y2="46" stroke="#b6893c" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
            {/* Bottom-left */}
            <line x1="14" y1="calc(100% - 14)" x2="46" y2="calc(100% - 14)" stroke="#b6893c" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
            <line x1="14" y1="calc(100% - 14)" x2="14" y2="calc(100% - 46)" stroke="#b6893c" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
            {/* Bottom-right */}
            <line x1="calc(100% - 14)" y1="calc(100% - 14)" x2="calc(100% - 46)" y2="calc(100% - 14)" stroke="#b6893c" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
            <line x1="calc(100% - 14)" y1="calc(100% - 14)" x2="calc(100% - 14)" y2="calc(100% - 46)" stroke="#b6893c" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
            {/* Inner corner dots */}
            <circle cx="14" cy="14" r="2" fill="#b6893c" opacity="0.6" />
            <circle cx="calc(100% - 14)" cy="14" r="2" fill="#b6893c" opacity="0.6" />
            <circle cx="14" cy="calc(100% - 14)" r="2" fill="#b6893c" opacity="0.6" />
            <circle cx="calc(100% - 14)" cy="calc(100% - 14)" r="2" fill="#b6893c" opacity="0.6" />
          </svg>

          {/* Logo image */}
          <div className="os-logo-shimmer">
            <picture>
              <source srcSet="/logo@2x.webp 2x, /logo@1x.webp 1x" type="image/webp" />
              <source srcSet="/logo@2x.png 2x, /logo@1x.png 1x" type="image/png" />
              <img
                src="/logo@1x.png"
                alt="Wing & Weft"
                loading="lazy"
                decoding="async"
                style={{
                  width: 'auto',
                  height: 'clamp(120px, 20vw, 180px)',
                  maxWidth: 'clamp(240px, 36vw, 320px)',
                  objectFit: 'contain',
                  padding: '8px',
                }}
              />
            </picture>
          </div>

        </div>

      </div>
    </div>
  );
};

// ─── Animated story text ──────────────────────────────────────────────────────
const StoryText: React.FC<{ isDark: boolean; visible: boolean }> = ({ isDark, visible }) => {
  const textPrimary = isDark ? '#f0e8d6' : '#1a1410';
  const textMuted = isDark ? 'rgba(240,232,214,0.6)' : 'rgba(26,20,16,0.6)';
  const borderColor = isDark ? '#3a2e24' : '#e9e3cb';

  const paras = [
    'What began as a friendship in college has continued to grow over the years. One day, while reminiscing and sharing ideas, our conversation turned to entrepreneurship — and today, we are proud to announce the beginning of our own clothing startup.',
    'Cheers to new beginnings. We believe that every hue tells a story, and through Wing and Weft, we hope to create meaningful stories together with all of you.',
    'We sincerely appreciate the support and prayers from everyone as we begin this journey.',
    'A heartfelt thank you to our friends and family for standing by us.',
  ];

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(40px)',
      transition: 'opacity 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s',
    }}>
      {/* Eyebrow */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '16px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scaleX(1)' : 'scaleX(0)',
        transformOrigin: 'left',
        transition: 'opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s',
      }}>
        <div style={{ width: '28px', height: '1px', background: '#bc3d3e' }} />
        <p style={{
          color: '#b6893c', fontSize: '0.6rem',
          letterSpacing: '0.38em', textTransform: 'uppercase',
          fontFamily: '"Raleway",sans-serif', fontWeight: 700,
        }}>
          Woven from Tradition
        </p>
      </div>

      {/* Headline */}
      <h2 style={{
        fontFamily: '"Cormorant Garamond", serif',
        fontSize: 'clamp(2rem, 3vw, 2.8rem)',
        fontWeight: 600, color: textPrimary,
        lineHeight: 1.15, marginBottom: '24px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.7s ease 0.4s, transform 0.7s ease 0.4s',
      }}>
        Where Every Thread Tells a Story
      </h2>

      {/* Paragraphs — each staggers in */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
        {paras.map((p, i) => (
          <p key={i} style={{
            fontSize: '0.9rem', lineHeight: 1.8,
            fontFamily: '"Raleway",sans-serif', fontWeight: 300,
            color: textMuted,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: `opacity 0.6s ease ${0.5 + i * 0.12}s, transform 0.6s ease ${0.5 + i * 0.12}s`,
          }}>
            {p}
          </p>
        ))}
      </div>

      {/* Thread divider */}
      <div style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease 1s',
      }}>
        <ThreadDivider isDark={isDark} />
      </div>

      {/* Signature */}
      <div style={{
        marginTop: '16px', paddingTop: '20px',
        borderTop: `1px solid ${borderColor}`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease 1.1s',
      }}>
        <p style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: '1.2rem', fontStyle: 'italic',
          color: textMuted,
        }}>
          — The Wing &amp; Weft Family
        </p>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const OurStoryPage: React.FC = () => {
  usePageMeta({ title: 'Our Story', description: 'Wing & Weft was born from a love for Indian handloom traditions. Learn about our journey and the master weavers behind every saree.' });
  const { isDark } = useTheme();
  const { ref: heroRef, inView: heroVisible } = useInView();
  const { ref: valuesRef, inView: valuesVisible } = useInView();

  const bg = isDark ? 'bg-dark-bg' : 'bg-stone-50';
  const textPrimary = isDark ? 'text-dark-text' : 'text-stone-800';
  const textMuted = isDark ? 'text-dark-muted' : 'text-stone-600';
  const card = isDark
    ? 'bg-dark-card border-dark-border'
    : 'bg-white border-stone-200';

  return (
    <div className={`min-h-screen ${bg} pt-20`}>
      <SEO
        title="Our Story"
        description="Learn about Wing & Weft — born from a love for Indian handloom weaving. Our mission to connect master artisans with modern saree lovers."
        canonical="https://wingandweft.vercel.app/our-story"
      />

      {/* ── Hero banner ── */}
      <div className="relative h-56 md:h-72 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2a1f1a, #bc3d3e)' }}>
        <div className="absolute inset-0 pattern-overlay opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <p className="text-brand-cream/60 text-xs uppercase tracking-widest mb-3 font-body"
              style={{ letterSpacing: '0.35em', animation: 'os-slide-up 0.6s ease 0.1s both' }}>
              Our Story
            </p>
            <h1 className="text-brand-cream"
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 600,
                animation: 'os-slide-up 0.7s ease 0.25s both',
              }}>
              About Us
            </h1>
            {/* Animated gold rule */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              justifyContent: 'center', marginTop: '16px',
              animation: 'os-slide-up 0.6s ease 0.45s both',
            }}>
              <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to right,transparent,rgba(182,137,60,0.7))', transformOrigin: 'left', animation: 'os-line-grow 0.5s ease 0.7s both' }} />
              <div style={{ width: '6px', height: '6px', background: '#b6893c', transform: 'rotate(45deg)', animation: 'os-diamond-spin 3s ease-in-out 1s infinite' }} />
              <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to left,transparent,rgba(182,137,60,0.7))', transformOrigin: 'right', animation: 'os-line-grow 0.5s ease 0.7s both' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">

        {/* Story section */}
        <div ref={heroRef} className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center mb-24">
          <LogoDisplay isDark={isDark} visible={heroVisible} />
          <StoryText isDark={isDark} visible={heroVisible} />
        </div>

        {/* Values section */}
        <div ref={valuesRef}>
          {/* Section header */}
          <div className="text-center mb-12" style={{
            opacity: valuesVisible ? 1 : 0,
            transform: valuesVisible ? 'translateY(0)' : 'translateY(28px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}>
            <p className="text-brand-gold text-xs uppercase tracking-widest mb-3 font-body"
              style={{ letterSpacing: '0.35em' }}>
              What We Stand For
            </p>
            <h2 className={textPrimary}
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: 600 }}>
              Our Values
            </h2>
            {/* Animated thread divider */}
            <div style={{ marginTop: '16px', opacity: valuesVisible ? 1 : 0, transition: 'opacity 0.8s ease 0.3s' }}>
              <ThreadDivider isDark={isDark} />
            </div>
          </div>

          {/* Value cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value, i) => (
              <div
                key={value.title}
                className={`os-value-card rounded-2xl border p-6 text-center ${card}`}
                style={{
                  opacity: valuesVisible ? 1 : 0,
                  transform: valuesVisible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.95)',
                  transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s`,
                  boxShadow: isDark
                    ? '0 4px 20px rgba(0,0,0,0.2)'
                    : '0 4px 20px rgba(26,20,16,0.06)',
                }}
              >
                <div
                  className="os-value-icon w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(188,61,62,0.12), rgba(182,137,60,0.12))',
                    fontSize: '1.5rem', color: '#b6893c',
                  }}
                >
                  {value.icon}
                </div>
                <h3 className={`mb-2 ${textPrimary}`}
                  style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.3rem', fontWeight: 600 }}>
                  {value.title}
                </h3>
                <p className={`text-sm font-body leading-relaxed ${textMuted}`}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurStoryPage;