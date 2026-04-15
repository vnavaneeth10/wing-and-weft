// src/pages/SearchPage.tsx
import React, { useMemo, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { useTheme } from '../context/ThemeContext';
import ProductCard from '../components/Products/ProductCard';
import SEO from '../components/SEO/SEO';
import { theme } from '../theme/heroThemes';

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @keyframes sp-slide-up {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes sp-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes sp-thread-draw {
    from { stroke-dashoffset: 500; opacity: 0; }
    to   { stroke-dashoffset: 0;   opacity: 1; }
  }
  @keyframes sp-float {
    0%, 100% { transform: translateY(0px);   }
    50%       { transform: translateY(-10px); }
  }
  @keyframes sp-glow-pulse {
    0%, 100% { opacity: 0.4; transform: scale(1);    }
    50%       { opacity: 0.7; transform: scale(1.06); }
  }
  @keyframes sp-line-grow {
    from { transform: scaleX(0); opacity: 0; }
    to   { transform: scaleX(1); opacity: 1; }
  }
  @keyframes sp-diamond-spin {
    0%, 100% { transform: rotate(45deg) scale(1);    }
    50%       { transform: rotate(45deg) scale(1.3); }
  }
  @keyframes sp-card-in {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
  @keyframes sp-ring-breathe {
    0%, 100% { transform: translate(-50%,-50%) scale(1);    opacity: 0.10; }
    50%       { transform: translate(-50%,-50%) scale(1.08); opacity: 0.22; }
  }

  .sp-result-card {
    animation: sp-card-in 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }
  .sp-back-btn {
    position: relative; overflow: hidden;
    transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease;
  }
  .sp-back-btn::before {
    content: '';
    position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s ease;
  }
  @media (hover: hover) {
    .sp-back-btn:hover { transform: translateY(-3px); }
    .sp-back-btn:hover::before { left: 130%; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }
`;

// ─── Thread SVG divider ───────────────────────────────────────────────────────
const ThreadDivider: React.FC = () => (
  <svg
    viewBox="0 0 500 60" fill="none"
    style={{ width: '100%', maxWidth: '420px', height: '36px', overflow: 'visible', margin: '0 auto', display: 'block' }}
    aria-hidden="true"
  >
    <path
      d="M0,30 C60,8 100,52 160,28 C220,4 260,48 320,24 C380,0 430,44 500,28"
      stroke={`url(#sp-tg1)`}
      strokeWidth="1.5" strokeLinecap="round" strokeDasharray="400"
      style={{ animation: 'sp-thread-draw 1.8s ease 0.2s both' }}
    />
    <path
      d="M0,38 C70,16 115,56 175,36 C235,16 265,52 325,32 C385,12 440,50 500,36"
      stroke={`url(#sp-tg2)`}
      strokeWidth="0.8" strokeLinecap="round" strokeDasharray="400" opacity="0.5"
      style={{ animation: 'sp-thread-draw 1.8s ease 0.5s both' }}
    />
    <defs>
      <linearGradient id="sp-tg1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor={theme.threadColor1} stopOpacity="0" />
        <stop offset="35%"  stopColor={theme.threadColor1} />
        <stop offset="65%"  stopColor={theme.threadColor2} />
        <stop offset="100%" stopColor={theme.threadColor2} stopOpacity="0" />
      </linearGradient>
      <linearGradient id="sp-tg2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor={theme.threadColor2} stopOpacity="0" />
        <stop offset="50%"  stopColor={theme.threadColor2} />
        <stop offset="100%" stopColor={theme.threadColor1} stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const SearchPage: React.FC = () => {
  const [params] = useSearchParams();
  const query    = params.get('q') || '';
  const { isDark } = useTheme();
  const styleRef   = useRef(false);

  useEffect(() => {
    if (styleRef.current) return;
    const tag = document.createElement('style');
    tag.textContent = STYLES;
    document.head.appendChild(tag);
    styleRef.current = true;
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [query]);

  const bg          = isDark ? 'bg-dark-bg'    : 'bg-stone-50';
  const textPrimary = isDark ? 'text-dark-text'  : 'text-stone-800';
  const textMuted   = isDark ? 'text-dark-muted' : 'text-stone-500';

  const hasQuery   = query.trim().length > 0;
  const hasResults = results.length > 0;

  return (
    <div className={`min-h-screen ${bg} pt-20`}>
      <SEO
        title={`Search: "${query}" — Wing & Weft`}
        description={`${results.length} result${results.length !== 1 ? 's' : ''} for "${query}" on Wing & Weft handloom sarees.`}
        noIndex={true}
      />

      {/* ── Hero banner ───────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          minHeight: 'clamp(200px, 22vw, 260px)',
          background: theme.background,
        }}
      >
        {/* Woven texture */}
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

        {/* Radial glow */}
        <div
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: theme.radialGlow }}
        />

        {/* Animated thread SVG */}
        <svg
          aria-hidden="true"
          viewBox="0 0 800 260"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <defs>
            <linearGradient id="sp-hero-t1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={theme.threadPrimary} stopOpacity="0" />
              <stop offset="40%"  stopColor={theme.threadPrimary} />
              <stop offset="70%"  stopColor={theme.threadPrimary} stopOpacity="0.7" />
              <stop offset="100%" stopColor={theme.threadPrimary} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sp-hero-t2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={theme.threadAccent} stopOpacity="0" />
              <stop offset="50%"  stopColor={theme.threadAccent} />
              <stop offset="100%" stopColor={theme.threadAccent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M80,130 C180,95 280,165 380,118 C480,72 560,148 680,118"
            stroke="url(#sp-hero-t1)" strokeWidth="1" fill="none" strokeLinecap="round" strokeDasharray="500"
            style={{ animation: 'sp-thread-draw 2s ease 0.3s both' }} />
          <path d="M80,145 C190,118 290,172 390,130 C490,90 570,155 680,130"
            stroke="url(#sp-hero-t2)" strokeWidth="0.6" fill="none" strokeLinecap="round" strokeDasharray="500"
            opacity="0.5" style={{ animation: 'sp-thread-draw 2s ease 0.7s both' }} />
          <line x1="0" y1="259" x2="800" y2="259" stroke={theme.rule} strokeWidth="1" />
        </svg>

        {/* Pulsing rings */}
        {[200, 300, 420].map((s, i) => (
          <div key={s} style={{
            position: 'absolute', top: '50%', left: '50%',
            width: s, height: s, borderRadius: '50%',
            border: `1px solid ${theme.ringColor}`,
            animation: `sp-ring-breathe ${8 + i * 2}s ease-in-out ${i * 1.8}s infinite`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Hero text */}
        <div
          className="relative flex flex-col items-center justify-center text-center px-6"
          style={{ minHeight: 'clamp(200px, 22vw, 260px)' }}
        >
          <p className="font-body uppercase" style={{
            fontSize: '0.6rem', letterSpacing: '0.42em',
            color: theme.eyebrow,
            marginBottom: '12px', marginTop: 0,
            animation: 'sp-slide-up 0.6s ease 0.2s both',
          }}>
            Wing &amp; Weft
          </p>

          {/* Search icon + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div
              style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: theme.searchAccentBg,
                border: `1px solid ${theme.iconBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'sp-slide-up 0.6s ease 0.3s both',
              }}
            >
              <Search size={18} style={{ color: theme.iconColor }} />
            </div>
            <h1 style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: 600, color: theme.h1,
              lineHeight: 1.1, margin: 0, letterSpacing: '-0.01em',
              animation: 'sp-slide-up 0.7s ease 0.35s both',
            }}>
              {hasQuery ? 'Search Results' : 'Search'}
            </h1>
          </div>

          {/* Diamond rule */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', animation: 'sp-slide-up 0.6s ease 0.55s both' }}>
            <div style={{
              height: '1px', width: '40px',
              background: `linear-gradient(to right, transparent, ${theme.rule})`,
              transformOrigin: 'right',
              animation: 'sp-line-grow 0.5s ease 0.8s both',
            }} />
            <div style={{
              width: '6px', height: '6px',
              background: theme.diamond,
              transform: 'rotate(45deg)',
              animation: 'sp-diamond-spin 3s ease-in-out 1s infinite',
            }} />
            <div style={{
              height: '1px', width: '40px',
              background: `linear-gradient(to left, transparent, ${theme.rule})`,
              transformOrigin: 'left',
              animation: 'sp-line-grow 0.5s ease 0.8s both',
            }} />
          </div>

          {/* Query display */}
          {hasQuery && (
            <p className="font-body" style={{
              fontSize: '0.75rem', letterSpacing: '0.1em',
              color: theme.tagline,
              marginTop: '14px', marginBottom: 0,
              animation: 'sp-slide-up 0.6s ease 0.7s both',
            }}>
              "{query}"
            </p>
          )}
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

        {/* Result count header */}
        {hasQuery && (
          <div
            className="mb-8"
            style={{ animation: 'sp-fade-in 0.5s ease 0.1s both' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              {/* Result count chip */}
              <div style={{
                background: theme.searchAccentBg,
                border: `1px solid ${theme.iconBorder}`,
                borderRadius: '100px',
                padding: '4px 14px',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}>
                <Search size={12} style={{ color: theme.iconColor }} />
                <span style={{
                  fontFamily: '"Raleway", sans-serif',
                  fontSize: '0.72rem', fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: theme.iconColor,
                }}>
                  {results.length} {results.length === 1 ? 'result' : 'results'}
                </span>
              </div>
              <p className={`text-sm font-body ${textMuted}`}>
                for{' '}
                <span style={{ color: theme.searchHighlight, fontWeight: 600 }}>
                  "{query}"
                </span>
              </p>
            </div>

            {/* Thread divider */}
            <ThreadDivider />
          </div>
        )}

        {/* No query state */}
        {!hasQuery && (
          <div
            className="text-center py-24"
            style={{ animation: 'sp-slide-up 0.7s ease 0.2s both' }}
          >
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: theme.searchAccentBg,
              border: `1px solid ${theme.iconBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
              animation: 'sp-float 5s ease-in-out infinite',
            }}>
              <Search size={28} style={{ color: theme.iconColor }} />
            </div>
            <h2 className={textPrimary} style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem', fontWeight: 400, marginBottom: '12px' }}>
              What are you looking for?
            </h2>
            <p className={`text-sm font-body ${textMuted}`}>
              Use the search bar above to find sarees by name, fabric, or category.
            </p>
          </div>
        )}

        {/* No results state */}
        {hasQuery && !hasResults && (
          <div
            className="text-center py-20"
            style={{ animation: 'sp-slide-up 0.7s ease 0.2s both', position: 'relative' }}
          >
            {/* Ambient glow behind empty state */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              width: '300px', height: '300px',
              transform: 'translate(-50%, -50%)',
              background: theme.searchEmptyGlow,
              borderRadius: '50%',
              animation: 'sp-glow-pulse 5s ease-in-out infinite',
              pointerEvents: 'none',
            }} />

            <p style={{ fontSize: '4rem', marginBottom: '16px', animation: 'sp-float 5s ease-in-out infinite' }}>🕊️</p>

            <h2 className={textPrimary} style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem', fontWeight: 400, marginBottom: '10px' }}>
              No results found
            </h2>

            {/* Diamond rule */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '1px', background: `linear-gradient(to right, transparent, ${theme.rule})` }} />
              <div style={{ width: '5px', height: '5px', background: theme.diamond, transform: 'rotate(45deg)' }} />
              <div style={{ width: '36px', height: '1px', background: `linear-gradient(to left, transparent, ${theme.rule})` }} />
            </div>

            <p className={`text-sm font-body mt-2 mb-8 ${textMuted}`} style={{ maxWidth: '320px', margin: '0 auto 32px', lineHeight: 1.8 }}>
              We couldn't find anything for "{query}". Try a different term or browse our full collection.
            </p>

            <Link
              to="/"
              className="sp-back-btn inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold font-body text-sm uppercase"
              style={{
                background: theme.ctaBg,
                color: theme.ctaText,
                boxShadow: `0 6px 28px ${theme.ctaShadow}`,
                letterSpacing: '0.18em',
                textDecoration: 'none',
              }}
            >
              Back to Home
            </Link>
          </div>
        )}

        {/* Results grid */}
        {hasQuery && hasResults && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {results.map((product, i) => (
              <div
                key={product.id}
                className="sp-result-card"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default SearchPage;