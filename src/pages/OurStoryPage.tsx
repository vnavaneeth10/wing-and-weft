// src/pages/OurStoryPage.tsx
import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePageMeta } from '../hooks/usePageMeta';
import SEO from '../components/SEO/SEO';
import { useInView } from '../hooks';

// ─────────────────────────────────────────────────────────────────────────────
// HERO THEME SWITCHER
// ─────────────────────────────────────────────────────────────────────────────
//
//  HOW TO SWITCH THEMES
//  ────────────────────
//  Change the value of ACTIVE_HERO_THEME (line below) to one of:
//    'silkDusk'       → A · deep charcoal → amber         (current / default)
//    'oceanIndigo'    → B · deep navy → teal
//    'sandalwoodDusk' → C · near-black → warm sandalwood  (most premium feel)
//    'roseSilk'       → D · midnight maroon → rose pink   (festive / bridal)
//    'mysoreViolet'   → E · midnight blue → violet        (regal / distinctive)
//
//  Keep this value in sync with ContactPage.tsx so both pages match.
//  That's it — nothing else needs to change.
// ─────────────────────────────────────────────────────────────────────────────

const ACTIVE_HERO_THEME = 'silkDusk'; // ← change this line to swap themes


// ─── Theme definitions ────────────────────────────────────────────────────────
//
//  Hero fields (same as before):
//    background / radialGlow / threadPrimary / threadAccent
//    eyebrow / h1 / tagline / diamond / rule
//
//  New page-wide fields:
//
//  threadColor1 / threadColor2
//    Used in ThreadDivider SVG (section dividers inside content area).
//    Replaces hardcoded crimson/gold so dividers match the active palette.
//
//  accentPrimary / accentSecondary
//    The two main accent colours for UI details — icon colours, eyebrow
//    label text, eyebrow rule line, corner-frame SVG strokes, orbit dots.
//
//  iconBg
//    CSS gradient for the value-card icon circle background.
//
//  iconHoverBg
//    CSS gradient applied on .os-value-card:hover to the icon circle.
//    Injected via CSS variable so the STYLES block can use it in a hover rule.
//
//  orbitColors
//    Array of { color, shadow } for the four orbiting dots around the logo.
//    Each entry maps to one dot (same order as the dots array below).
//
//  glowColor
//    radial-gradient string for the ambient glow behind the logo box.
//
//  ringBorderDark / ringBorderLight
//    Border colour for the three pulsing rings around the logo in dark/light mode.
//
//  cornerStroke
//    Colour of the corner-frame SVG lines inside the logo box.
//
//  eyebrowLine
//    Colour of the short horizontal rule to the left of the story eyebrow text.
//
//  eyebrowText
//    Colour of the "Woven from Tradition" eyebrow label in the story section.
//
//  storyDivider
//    Border colour for the thin rule above the signature in the story section.
//
//  cardIconColor
//    Colour of the unicode icon character inside each value card circle.

const HERO_THEMES = {

  // A · Silk Dusk — deep charcoal → burnt amber
  silkDusk: {
    // ── Hero ──
    background:    'linear-gradient(150deg, #140a06 0%, #2c1010 30%, #5c1f1a 60%, #8b3a1a 80%, #b5692a 100%)',
    radialGlow:    'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(180,90,30,0.22) 0%, transparent 70%)',
    threadPrimary: '#d4924a',
    threadAccent:  '#bc3d3e',
    eyebrow:       'rgba(212,160,96,0.92)',
    h1:            '#f5ead8',
    tagline:       'rgba(245,234,216,0.72)',
    diamond:       '#d4a060',
    rule:          'rgba(212,160,96,0.75)',
    // ── Page-wide ──
    threadColor1:  '#bc3d3e',
    threadColor2:  '#b6893c',
    accentPrimary: '#bc3d3e',
    accentSecondary: '#b6893c',
    iconBg:        'linear-gradient(135deg, rgba(188,61,62,0.12), rgba(182,137,60,0.12))',
    iconHoverBg:   'linear-gradient(135deg, rgba(188,61,62,0.20), rgba(182,137,60,0.20))',
    orbitColors: [
      { color: '#bc3d3e', shadow: '#bc3d3e' },
      { color: '#b6893c', shadow: '#b6893c' },
      { color: '#e69358', shadow: '#e69358' },
      { color: '#bc3d3e', shadow: '#bc3d3e' },
    ],
    glowColorDark:  'radial-gradient(circle, rgba(188,61,62,0.18) 0%, transparent 65%)',
    glowColorLight: 'radial-gradient(circle, rgba(188,61,62,0.10) 0%, transparent 65%)',
    ringBorderDark:  'rgba(188,61,62,0.10)',
    ringBorderLight: 'rgba(188,61,62,0.08)',
    cornerStroke:  '#b6893c',
    eyebrowLine:   '#bc3d3e',
    eyebrowText:   '#b6893c',
    storyDivider:  { dark: '#3a2e24', light: '#e9e3cb' },
    cardIconColor: '#b6893c',
  },

  // B · Ocean Indigo — deep navy → teal
  oceanIndigo: {
    // ── Hero ──
    background:    'linear-gradient(150deg, #0a0f14 0%, #0f2233 25%, #1a3d5c 55%, #1e5c72 78%, #1b7a7a 100%)',
    radialGlow:    'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(26,122,122,0.22) 0%, transparent 70%)',
    threadPrimary: '#4ab0c8',
    threadAccent:  '#2a7aaa',
    eyebrow:       'rgba(180,220,210,0.92)',
    h1:            '#e8f5f2',
    tagline:       'rgba(232,245,242,0.72)',
    diamond:       '#7ecec4',
    rule:          'rgba(126,206,196,0.75)',
    // ── Page-wide ──
    threadColor1:  '#2a7aaa',
    threadColor2:  '#4ab0c8',
    accentPrimary: '#2a7aaa',
    accentSecondary: '#4ab0c8',
    iconBg:        'linear-gradient(135deg, rgba(26,92,114,0.14), rgba(74,176,200,0.12))',
    iconHoverBg:   'linear-gradient(135deg, rgba(26,92,114,0.22), rgba(74,176,200,0.20))',
    orbitColors: [
      { color: '#2a7aaa', shadow: '#2a7aaa' },
      { color: '#4ab0c8', shadow: '#4ab0c8' },
      { color: '#7ecec4', shadow: '#7ecec4' },
      { color: '#2a7aaa', shadow: '#2a7aaa' },
    ],
    glowColorDark:  'radial-gradient(circle, rgba(26,122,122,0.18) 0%, transparent 65%)',
    glowColorLight: 'radial-gradient(circle, rgba(26,122,122,0.10) 0%, transparent 65%)',
    ringBorderDark:  'rgba(74,176,200,0.12)',
    ringBorderLight: 'rgba(74,176,200,0.09)',
    cornerStroke:  '#4ab0c8',
    eyebrowLine:   '#2a7aaa',
    eyebrowText:   '#4ab0c8',
    storyDivider:  { dark: '#1a2e3a', light: '#c8e8ee' },
    cardIconColor: '#4ab0c8',
  },

  // C · Sandalwood Dusk — near-black → warm sandalwood gold
  sandalwoodDusk: {
    // ── Hero ──
    background:    'linear-gradient(150deg, #0d0a06 0%, #1a1408 25%, #362410 50%, #5c3d1a 75%, #8c6030 100%)',
    radialGlow:    'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(92,61,26,0.18) 0%, transparent 70%)',
    threadPrimary: '#c8a86a',
    threadAccent:  '#8c6030',
    eyebrow:       'rgba(220,196,150,0.92)',
    h1:            '#f7efde',
    tagline:       'rgba(247,239,222,0.72)',
    diamond:       '#c8a86a',
    rule:          'rgba(200,168,106,0.75)',
    // ── Page-wide ──
    threadColor1:  '#8c6030',
    threadColor2:  '#c8a86a',
    accentPrimary: '#8c6030',
    accentSecondary: '#c8a86a',
    iconBg:        'linear-gradient(135deg, rgba(140,96,48,0.14), rgba(200,168,106,0.12))',
    iconHoverBg:   'linear-gradient(135deg, rgba(140,96,48,0.22), rgba(200,168,106,0.20))',
    orbitColors: [
      { color: '#8c6030', shadow: '#8c6030' },
      { color: '#c8a86a', shadow: '#c8a86a' },
      { color: '#e0c080', shadow: '#e0c080' },
      { color: '#8c6030', shadow: '#8c6030' },
    ],
    glowColorDark:  'radial-gradient(circle, rgba(140,96,48,0.18) 0%, transparent 65%)',
    glowColorLight: 'radial-gradient(circle, rgba(140,96,48,0.10) 0%, transparent 65%)',
    ringBorderDark:  'rgba(200,168,106,0.12)',
    ringBorderLight: 'rgba(200,168,106,0.09)',
    cornerStroke:  '#c8a86a',
    eyebrowLine:   '#8c6030',
    eyebrowText:   '#c8a86a',
    storyDivider:  { dark: '#2e2410', light: '#e8d8b0' },
    cardIconColor: '#c8a86a',
  },

  // D · Rose Silk — midnight maroon → rose pink
  roseSilk: {
    // ── Hero ──
    background:    'linear-gradient(150deg, #10060a 0%, #280a18 25%, #520a30 50%, #8c1a4a 75%, #b52260 100%)',
    radialGlow:    'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(140,26,74,0.22) 0%, transparent 70%)',
    threadPrimary: '#f0a0bc',
    threadAccent:  '#b52260',
    eyebrow:       'rgba(255,192,210,0.92)',
    h1:            '#fdeef4',
    tagline:       'rgba(253,238,244,0.72)',
    diamond:       '#f0a0bc',
    rule:          'rgba(240,160,188,0.75)',
    // ── Page-wide ──
    threadColor1:  '#b52260',
    threadColor2:  '#f0a0bc',
    accentPrimary: '#b52260',
    accentSecondary: '#d06090',
    iconBg:        'linear-gradient(135deg, rgba(140,26,74,0.14), rgba(240,160,188,0.12))',
    iconHoverBg:   'linear-gradient(135deg, rgba(140,26,74,0.22), rgba(240,160,188,0.20))',
    orbitColors: [
      { color: '#b52260', shadow: '#b52260' },
      { color: '#f0a0bc', shadow: '#f0a0bc' },
      { color: '#e86090', shadow: '#e86090' },
      { color: '#b52260', shadow: '#b52260' },
    ],
    glowColorDark:  'radial-gradient(circle, rgba(140,26,74,0.18) 0%, transparent 65%)',
    glowColorLight: 'radial-gradient(circle, rgba(140,26,74,0.10) 0%, transparent 65%)',
    ringBorderDark:  'rgba(240,160,188,0.12)',
    ringBorderLight: 'rgba(240,160,188,0.09)',
    cornerStroke:  '#f0a0bc',
    eyebrowLine:   '#b52260',
    eyebrowText:   '#d06090',
    storyDivider:  { dark: '#3a1428', light: '#f0c8d8' },
    cardIconColor: '#d06090',
  },

  // E · Mysore Violet — midnight blue → rich violet
  mysoreViolet: {
    // ── Hero ──
    background:    'linear-gradient(150deg, #080810 0%, #0e0e28 25%, #1a1a52 50%, #2e2a7c 75%, #4a3aaa 100%)',
    radialGlow:    'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(46,42,124,0.26) 0%, transparent 70%)',
    threadPrimary: '#a090e0',
    threadAccent:  '#6050b8',
    eyebrow:       'rgba(196,188,255,0.92)',
    h1:            '#f0eeff',
    tagline:       'rgba(240,238,255,0.72)',
    diamond:       '#a090e0',
    rule:          'rgba(160,144,224,0.75)',
    // ── Page-wide ──
    threadColor1:  '#6050b8',
    threadColor2:  '#a090e0',
    accentPrimary: '#6050b8',
    accentSecondary: '#9080d0',
    iconBg:        'linear-gradient(135deg, rgba(46,42,124,0.16), rgba(160,144,224,0.12))',
    iconHoverBg:   'linear-gradient(135deg, rgba(46,42,124,0.24), rgba(160,144,224,0.20))',
    orbitColors: [
      { color: '#6050b8', shadow: '#6050b8' },
      { color: '#a090e0', shadow: '#a090e0' },
      { color: '#c0b0ff', shadow: '#c0b0ff' },
      { color: '#6050b8', shadow: '#6050b8' },
    ],
    glowColorDark:  'radial-gradient(circle, rgba(46,42,124,0.22) 0%, transparent 65%)',
    glowColorLight: 'radial-gradient(circle, rgba(46,42,124,0.12) 0%, transparent 65%)',
    ringBorderDark:  'rgba(160,144,224,0.12)',
    ringBorderLight: 'rgba(160,144,224,0.09)',
    cornerStroke:  '#a090e0',
    eyebrowLine:   '#6050b8',
    eyebrowText:   '#9080d0',
    storyDivider:  { dark: '#1e1a40', light: '#d0c8f0' },
    cardIconColor: '#9080d0',
  },

} as const;

// Active theme — resolved from the key above.
const theme = HERO_THEMES[ACTIVE_HERO_THEME];

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const VALUES = [
  { icon: '✦', title: 'Authenticity',  description: 'Every saree in our collection is sourced directly from master weavers, ensuring genuine craftsmanship and fair trade.' },
  { icon: '♡', title: 'Craftsmanship', description: 'We believe in preserving centuries-old weaving traditions by supporting artisan communities across India.' },
  { icon: '❧', title: 'Sustainability', description: 'Handloom weaving uses minimal electricity and supports eco-friendly, slow fashion principles.' },
  { icon: '◆', title: 'Quality',       description: 'Each saree undergoes rigorous quality checks before reaching you — because you deserve only the finest.' },
];

// ─── Unique ID counter for ThreadDivider gradients ────────────────────────────
let _threadDividerCount = 0;

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
//
//  .os-value-icon hover background is theme-controlled via the CSS custom
//  property --os-icon-hover-bg, injected at runtime in OurStoryPage's useEffect.
//  This avoids having to move the hover rule into an inline onMouseEnter handler.

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
    0%,100% { transform: translate(-50%,-50%) scale(1);    opacity: 0.12; }
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
    0%,100% { transform: rotate(45deg) scale(1);    }
    50%     { transform: rotate(45deg) scale(1.35); }
  }
  @keyframes os-thread-draw {
    from { stroke-dashoffset: 500; opacity: 0; }
    to   { stroke-dashoffset: 0;   opacity: 1; }
  }
  @keyframes os-line-grow {
    from { transform: scaleX(0); opacity: 0; }
    to   { transform: scaleX(1); opacity: 1; }
  }
  @keyframes os-scroll-dot {
    0%   { transform: translateY(0);   opacity: 1; }
    100% { transform: translateY(7px); opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }

  @media (hover: hover) {
    .os-value-card:hover {
      transform: translateY(-8px) scale(1.02);
    }
    .os-logo-container:hover .os-logo-box {
      transform: scale(1.04);
    }
    /* Icon hover background comes from the CSS variable set at runtime */
    .os-value-card:hover .os-value-icon {
      transform: scale(1.2) rotate(8deg);
      background: var(--os-icon-hover-bg) !important;
    }
  }

  .os-logo-container {
    position: relative;
    cursor: pointer;
    overflow: hidden;
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
  @media (max-width: 640px) {
    .os-orbit-dot  { display: none; }
    .os-ring-pulse { display: none; }
  }

  .os-value-card {
    transition: transform 0.4s cubic-bezier(0.22,1,0.36,1),
                box-shadow 0.4s ease, border-color 0.3s ease;
  }
  .os-value-icon {
    transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), background 0.3s ease;
  }
`;

// ─── Animated thread SVG ──────────────────────────────────────────────────────
//  Now accepts theme colours so section dividers match the active palette.
const ThreadDivider: React.FC<{ color1: string; color2: string }> = ({ color1, color2 }) => {
  const id  = useRef(`td-${++_threadDividerCount}`).current;
  const g1  = `${id}-g1`;
  const g2  = `${id}-g2`;

  return (
    <svg
      viewBox="0 0 500 60"
      fill="none"
      style={{ width: '100%', maxWidth: '460px', height: '40px', overflow: 'visible', margin: '0 auto', display: 'block' }}
      aria-hidden="true"
    >
      <path
        d="M0,30 C60,8 100,52 160,28 C220,4 260,48 320,24 C380,0 430,44 500,28"
        stroke={`url(#${g1})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="400"
        style={{ animation: 'os-thread-draw 1.8s ease 0.3s both' }}
      />
      <path
        d="M0,38 C70,16 115,56 175,36 C235,16 265,52 325,32 C385,12 440,50 500,36"
        stroke={`url(#${g2})`}
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeDasharray="400"
        opacity="0.5"
        style={{ animation: 'os-thread-draw 1.8s ease 0.6s both' }}
      />
      <defs>
        <linearGradient id={g1} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={color1} stopOpacity="0" />
          <stop offset="35%"  stopColor={color1} />
          <stop offset="65%"  stopColor={color2} />
          <stop offset="100%" stopColor={color2} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={g2} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={color2} stopOpacity="0" />
          <stop offset="50%"  stopColor={color2} />
          <stop offset="100%" stopColor={color1} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// ─── Logo section ─────────────────────────────────────────────────────────────
const LogoDisplay: React.FC<{ isDark: boolean; visible: boolean }> = ({ isDark, visible }) => {
  const styleRef = useRef(false);

  useEffect(() => {
    if (styleRef.current) return;

    // Shared animation styles
    const tag = document.createElement('style');
    tag.textContent = STYLES;
    document.head.appendChild(tag);
    styleRef.current = true;

    // Theme-specific CSS custom property for the icon hover background.
    // Needed because pseudo-element/hover backgrounds can't reference JS vars.
    const vars = document.createElement('style');
    vars.id = 'os-theme-vars';
    const existing = document.getElementById('os-theme-vars');
    if (existing) existing.remove();
    vars.textContent = `:root { --os-icon-hover-bg: ${theme.iconHoverBg}; }`;
    document.head.appendChild(vars);
  }, []);

  // Orbit dot config — pulls colours from the active theme
  const ORBIT_DOTS = [
    { size: 8, ...theme.orbitColors[0], r: 155, dur: '5s',   delay: '0s',    cw: true  },
    { size: 5, ...theme.orbitColors[1], r: 175, dur: '7.5s', delay: '-3s',   cw: false },
    { size: 6, ...theme.orbitColors[2], r: 140, dur: '4.2s', delay: '-1.5s', cw: true  },
    { size: 3, ...theme.orbitColors[3], r: 190, dur: '9s',   delay: '-4s',   cw: false },
  ];

  return (
    <div
      className="flex justify-center"
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-40px)',
        transition: 'opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <div className="os-logo-container">

        {/* Pulsing rings — theme-coloured border */}
        {[240, 320, 400].map((s, i) => (
          <div
            key={s}
            className="os-ring-pulse"
            style={{
              position: 'absolute', top: '50%', left: '50%',
              width: s, height: s, borderRadius: '50%',
              border: `1px solid ${isDark ? theme.ringBorderDark : theme.ringBorderLight}`,
              animation: `os-ring-breathe ${8 + i * 2}s ease-in-out ${i * 1.8}s infinite`,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Ambient glow — theme-coloured */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '340px', height: '340px', borderRadius: '50%',
          background: isDark ? theme.glowColorDark : theme.glowColorLight,
          animation: 'os-glow-pulse 5s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* Orbiting dots — theme-coloured */}
        {ORBIT_DOTS.map((d, i) => (
          <div
            key={i}
            className="os-orbit-dot"
            style={{
              width: d.size, height: d.size,
              background: d.color, opacity: 0.75,
              marginLeft: -d.size / 2, marginTop: -d.size / 2,
              ['--r' as string]:     `${d.r}px`,
              ['--anim' as string]:  d.cw ? 'os-orbit-cw' : 'os-orbit-ccw',
              ['--dur' as string]:   d.dur,
              ['--delay' as string]: d.delay,
              boxShadow: `0 0 ${d.size * 2}px ${d.shadow}`,
            }}
          />
        ))}

        {/* Main logo box */}
        <div
          className="os-logo-box"
          style={{
            position: 'relative',
            width:  'clamp(280px, 40vw, 380px)',
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
          {/* Corner frame — theme-coloured strokes */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              pointerEvents: 'none', overflow: 'visible',
              opacity: 0,
              animation: 'os-corner-draw 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s forwards',
            }}
            aria-hidden="true"
          >
            {/* Top-left */}
            <line x1="4"  y1="4"  x2="14" y2="4"  stroke={theme.cornerStroke} strokeWidth="0.5" strokeLinecap="round" opacity="0.8" />
            <line x1="4"  y1="4"  x2="4"  y2="14" stroke={theme.cornerStroke} strokeWidth="0.5" strokeLinecap="round" opacity="0.8" />
            {/* Top-right */}
            <line x1="96" y1="4"  x2="86" y2="4"  stroke={theme.cornerStroke} strokeWidth="0.5" strokeLinecap="round" opacity="0.8" />
            <line x1="96" y1="4"  x2="96" y2="14" stroke={theme.cornerStroke} strokeWidth="0.5" strokeLinecap="round" opacity="0.8" />
            {/* Bottom-left */}
            <line x1="4"  y1="96" x2="14" y2="96" stroke={theme.cornerStroke} strokeWidth="0.5" strokeLinecap="round" opacity="0.8" />
            <line x1="4"  y1="96" x2="4"  y2="86" stroke={theme.cornerStroke} strokeWidth="0.5" strokeLinecap="round" opacity="0.8" />
            {/* Bottom-right */}
            <line x1="96" y1="96" x2="86" y2="96" stroke={theme.cornerStroke} strokeWidth="0.5" strokeLinecap="round" opacity="0.8" />
            <line x1="96" y1="96" x2="96" y2="86" stroke={theme.cornerStroke} strokeWidth="0.5" strokeLinecap="round" opacity="0.8" />
            {/* Corner dots */}
            <circle cx="4"  cy="4"  r="0.8" fill={theme.cornerStroke} opacity="0.6" />
            <circle cx="96" cy="4"  r="0.8" fill={theme.cornerStroke} opacity="0.6" />
            <circle cx="4"  cy="96" r="0.8" fill={theme.cornerStroke} opacity="0.6" />
            <circle cx="96" cy="96" r="0.8" fill={theme.cornerStroke} opacity="0.6" />
          </svg>

          {/* Logo image */}
          <div className="os-logo-shimmer">
            <picture>
              <source srcSet="/logo@2x.webp 2x, /logo@1x.webp 1x" type="image/webp" />
              <source srcSet="/logo@2x.png 2x, /logo@1x.png 1x"   type="image/png"  />
              <img
                src="/logo@1x.png"
                alt="Wing & Weft logo — authentic handloom sarees from Indian master weavers"
                loading="eager"
                decoding="async"
                width={320}
                height={180}
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

// ─── Story text ───────────────────────────────────────────────────────────────
const StoryText: React.FC<{ isDark: boolean; visible: boolean }> = ({ isDark, visible }) => {
  const textPrimary = isDark ? '#f0e8d6' : '#1a1410';
  const textMuted   = isDark ? 'rgba(240,232,214,0.75)' : 'rgba(26,20,16,0.72)';

  // Story divider border — theme-controlled so the rule above the signature
  // matches the active palette rather than always being the same warm brown.
  const dividerColor = isDark ? theme.storyDivider.dark : theme.storyDivider.light;

  const paras = [
    'What began as a friendship in college has continued to grow over the years. One day, while reminiscing and sharing ideas, our conversation turned to entrepreneurship — and today, we are proud to announce the beginning of our own clothing startup.',
    'Cheers to new beginnings. We believe that every hue tells a story, and through Wing and Weft, we hope to create meaningful stories together with all of you.',
    'We sincerely appreciate the support and prayers from everyone as we begin this journey.',
    'A heartfelt thank you to our friends and family for standing by us.',
  ];

  return (
    <div
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(40px)',
        transition: 'opacity 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s',
      }}
    >
      {/* Eyebrow — theme-coloured rule and label */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px',
        opacity:   visible ? 1 : 0,
        transform: visible ? 'scaleX(1)' : 'scaleX(0)',
        transformOrigin: 'left',
        transition: 'opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s',
      }}>
        {/* Short rule — theme-coloured */}
        <div style={{ width: '28px', height: '1px', background: theme.eyebrowLine }} />
        {/* Label — theme-coloured */}
        <p style={{
          color: theme.eyebrowText,
          fontSize: '0.6rem', letterSpacing: '0.38em', textTransform: 'uppercase',
          fontFamily: '"Raleway",sans-serif', fontWeight: 700, margin: 0,
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
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.7s ease 0.4s, transform 0.7s ease 0.4s',
      }}>
        Where Every Thread Tells a Story
      </h2>

      {/* Paragraphs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
        {paras.map((p, i) => (
          <p
            key={i}
            style={{
              fontSize: '0.9rem', lineHeight: 1.8,
              fontFamily: '"Raleway",sans-serif', fontWeight: 300,
              color: textMuted, margin: 0,
              opacity:   visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(16px)',
              transition: `opacity 0.6s ease ${0.5 + i * 0.12}s, transform 0.6s ease ${0.5 + i * 0.12}s`,
            }}
          >
            {p}
          </p>
        ))}
      </div>

      {/* Thread divider — theme-coloured */}
      <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease 1s' }}>
        <ThreadDivider color1={theme.threadColor1} color2={theme.threadColor2} />
      </div>

      {/* Signature — theme-coloured divider border */}
      <div style={{
        marginTop: '16px', paddingTop: '20px',
        borderTop: `1px solid ${dividerColor}`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease 1.1s',
      }}>
        <p style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: '1.2rem', fontStyle: 'italic',
          color: textMuted, margin: 0,
        }}>
          — The Wing &amp; Weft Family
        </p>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const OurStoryPage: React.FC = () => {
  const { isDark } = useTheme();
  const { ref: heroRef,   inView: heroVisible }   = useInView();
  const { ref: valuesRef, inView: valuesVisible } = useInView();

  const bg          = isDark ? 'bg-dark-bg'     : 'bg-stone-50';
  const textPrimary = isDark ? 'text-dark-text'  : 'text-stone-800';
  const textMuted   = isDark ? 'text-dark-muted' : 'text-stone-600';
  const card        = isDark
    ? 'bg-dark-card border-dark-border'
    : 'bg-white border-stone-200';

  return (
    <div className={`min-h-screen ${bg} pt-20`}>
      <SEO
        title="Our Story — Wing & Weft Handloom Sarees"
        description="Wing & Weft was born from a friendship and a love for Indian handloom traditions. Meet the founders and the master weavers behind every saree."
        canonical={`${import.meta.env.VITE_SITE_URL ?? 'https://wingandweft.vercel.app'}/our-story`}
      />

      {/* JSON-LD Organisation schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Wing & Weft',
            url: 'https://wingandweft.vercel.app',
            logo: 'https://wingandweft.vercel.app/logo@1x.png',
            description: 'Handloom sarees sourced directly from master weavers across India.',
            foundingDate: '2024',
            areaServed: 'India',
          }),
        }}
      />

      {/* ── Hero banner ──────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          minHeight: 'clamp(320px, 35vw, 420px)',
          background: theme.background,
        }}
      >
        {/* Woven texture overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `
              repeating-linear-gradient(45deg,  rgba(212,160,96,0.055) 0, rgba(212,160,96,0.055) 1px, transparent 0, transparent 50%),
              repeating-linear-gradient(-45deg, rgba(212,160,96,0.055) 0, rgba(212,160,96,0.055) 1px, transparent 0, transparent 50%)
            `,
            backgroundSize: '12px 12px',
          }}
        />

        {/* Radial glow */}
        <div
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: theme.radialGlow }}
        />

        {/* Animated thread SVG */}
        <svg
          aria-hidden="true"
          viewBox="0 0 800 320"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <defs>
            <linearGradient id="hero-thread-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={theme.threadPrimary} stopOpacity="0" />
              <stop offset="40%"  stopColor={theme.threadPrimary} />
              <stop offset="70%"  stopColor={theme.threadPrimary} stopOpacity="0.7" />
              <stop offset="100%" stopColor={theme.threadPrimary} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="hero-thread-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={theme.threadAccent} stopOpacity="0" />
              <stop offset="50%"  stopColor={theme.threadAccent} />
              <stop offset="100%" stopColor={theme.threadAccent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M80,160 C180,120 280,200 380,145 C480,90 560,180 680,145"
            stroke="url(#hero-thread-1)"
            strokeWidth="1" fill="none" strokeLinecap="round" strokeDasharray="500"
            style={{ animation: 'os-thread-draw 2s ease 0.4s both' }}
          />
          <path
            d="M80,175 C190,145 290,210 390,160 C490,110 570,190 680,160"
            stroke="url(#hero-thread-2)"
            strokeWidth="0.6" fill="none" strokeLinecap="round" strokeDasharray="500"
            opacity="0.5"
            style={{ animation: 'os-thread-draw 2s ease 0.8s both' }}
          />
          {/* Bottom border rule — theme-coloured */}
          <line
            x1="0" y1="319" x2="800" y2="319"
            stroke={theme.rule}
            strokeWidth="1"
          />
        </svg>

        {/* Animated rings (hero level) */}
        {[200, 300, 420].map((s, i) => (
          <div key={s} style={{
            position: 'absolute', top: '50%', left: '50%',
            width: s, height: s, borderRadius: '50%',
            border: `1px solid ${isDark ? theme.ringBorderDark : theme.ringBorderLight}`,
            transform: 'translate(-50%,-50%)',
            animation: `os-ring-breathe ${8 + i * 2}s ease-in-out ${i * 1.8}s infinite`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Hero text */}
        <div
          className="relative flex flex-col items-center justify-center text-center px-6"
          style={{ minHeight: 'clamp(320px, 35vw, 420px)' }}
        >
          <p className="font-body uppercase" style={{
            fontSize: '0.6rem', letterSpacing: '0.42em',
            color: theme.eyebrow,
            marginBottom: '14px', marginTop: 0,
            animation: 'os-slide-up 0.6s ease 0.2s both',
          }}>
            Wing &amp; Weft
          </p>

          <h1 style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 600, color: theme.h1,
            lineHeight: 1.1, marginBottom: '20px', marginTop: 0,
            letterSpacing: '-0.01em',
            animation: 'os-slide-up 0.7s ease 0.35s both',
          }}>
            About Us
          </h1>

          {/* Diamond rule */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', animation: 'os-slide-up 0.6s ease 0.55s both' }}>
            <div style={{
              height: '1px', width: '48px',
              background: `linear-gradient(to right, transparent, ${theme.rule})`,
              transformOrigin: 'right',
              animation: 'os-line-grow 0.5s ease 0.85s both',
            }} />
            <div style={{
              width: '6px', height: '6px',
              background: theme.diamond,
              transform: 'rotate(45deg)',
              animation: 'os-diamond-spin 3s ease-in-out 1.2s infinite',
            }} />
            <div style={{
              height: '1px', width: '48px',
              background: `linear-gradient(to left, transparent, ${theme.rule})`,
              transformOrigin: 'left',
              animation: 'os-line-grow 0.5s ease 0.85s both',
            }} />
          </div>

          <p className="font-body uppercase" style={{
            fontSize: '0.6rem', letterSpacing: '0.22em',
            color: theme.tagline,
            marginTop: '18px', marginBottom: 0,
            animation: 'os-slide-up 0.6s ease 0.7s both',
          }}>
            Woven from tradition
          </p>

          {/* Scroll indicator */}
          <div style={{ marginTop: '32px', animation: 'os-slide-up 0.6s ease 1s both' }}>
            <svg viewBox="0 0 16 26" width="14" aria-hidden="true" style={{ opacity: 0.45, display: 'block', margin: '0 auto' }}>
              <rect x="5" y="0" width="6" height="16" rx="3" fill="none" stroke={theme.diamond} strokeWidth="1.2" />
              <circle cx="8" cy="6" r="2" fill={theme.diamond} style={{ animation: 'os-scroll-dot 1.6s ease-in-out infinite' }} />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">

        {/* Story section */}
        <div
          ref={heroRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center mb-24"
        >
          <LogoDisplay isDark={isDark} visible={heroVisible} />
          <StoryText   isDark={isDark} visible={heroVisible} />
        </div>

        {/* Values section */}
        <div ref={valuesRef}>
          {/* Section header */}
          <div
            className="text-center mb-12"
            style={{
              opacity:   valuesVisible ? 1 : 0,
              transform: valuesVisible ? 'translateY(0)' : 'translateY(28px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            {/* "Our Promise" label — theme-coloured */}
            <p
              className="text-xs uppercase font-body"
              style={{
                letterSpacing: '0.35em', marginBottom: '12px',
                color: theme.accentSecondary,
              }}
            >
              Our Promise
            </p>
            <h2
              className={textPrimary}
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: 600 }}
            >
              Our Values
            </h2>
            {/* Thread divider — theme-coloured */}
            <div style={{ marginTop: '16px', opacity: valuesVisible ? 1 : 0, transition: 'opacity 0.8s ease 0.3s' }}>
              <ThreadDivider color1={theme.threadColor1} color2={theme.threadColor2} />
            </div>
          </div>

          {/* Value cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {VALUES.map((value, i) => (
              <div
                key={value.title}
                className={`os-value-card rounded-2xl border p-6 text-center ${card}`}
                style={{
                  opacity:   valuesVisible ? 1 : 0,
                  transform: valuesVisible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.95)',
                  transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s`,
                  boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(26,20,16,0.06)',
                }}
              >
                {/* Icon circle — theme-coloured gradient background and icon colour */}
                <div
                  className="os-value-icon w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  aria-hidden="true"
                  style={{
                    background: theme.iconBg,
                    fontSize: '1.5rem',
                    color: theme.cardIconColor,
                  }}
                >
                  {value.icon}
                </div>
                <h3
                  className={`mb-2 ${textPrimary}`}
                  style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.3rem', fontWeight: 600 }}
                >
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