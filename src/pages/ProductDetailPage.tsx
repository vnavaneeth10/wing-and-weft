// src/pages/ProductDetailPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Instagram, Facebook, MessageCircle, X, ZoomIn, Truck, ShieldCheck, Gem } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import SEO from '../components/SEO/SEO';
import { StarRating } from '../components/Products/ProductCard';
import { useProduct } from '../hooks/useProducts';
import { usePageMeta } from '../hooks/usePageMeta';
import { theme } from '../theme/heroThemes';
import { useSettings } from '../context/SettingsContext';

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @keyframes pdp-fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pdp-slide-up {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pdp-thread-draw {
    from { stroke-dashoffset: 500; opacity: 0; }
    to   { stroke-dashoffset: 0;   opacity: 1; }
  }
  @keyframes pdp-badge-in {
    from { opacity: 0; transform: scale(0.85) translateY(4px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes pdp-lightbox-in {
    from { opacity: 0; transform: scale(0.96); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer-wave {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }

  .pdp-wa-btn {
    position: relative; overflow: hidden;
    transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease;
  }
  .pdp-wa-btn::before {
    content: '';
    position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
    transition: left 0.5s ease;
  }
  @media (hover: hover) {
    .pdp-wa-btn:hover:not(.disabled) { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(37,211,102,0.5) !important; }
    .pdp-wa-btn:hover:not(.disabled)::before { left: 130%; }
  }

  .pdp-accordion-btn { transition: color 0.25s ease; }

  .pdp-thumb {
    transition: border-color 0.25s ease, transform 0.25s ease, opacity 0.25s ease;
  }
  .pdp-thumb:hover { transform: scale(1.05); opacity: 0.9; }

  .pdp-share-icon {
    transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease;
  }
  .pdp-share-icon:hover { transform: scale(1.12) rotate(4deg); box-shadow: 0 4px 16px rgba(0,0,0,0.25); }

  /* ── Main image wrap: zoom lens cursor, no overflow clip so lens shows ── */
  .pdp-main-image-wrap {
    cursor: zoom-in;
    position: relative;
    overflow: hidden;
  }
  .pdp-main-img {
    animation: pdp-fade-in 0.35s ease both;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* NO transform here — zoom is handled by the lens overlay */
  }

  /* ── Zoom lens (magnifier overlay) ── */
  .pdp-zoom-lens {
    position: absolute;
    border: 2px solid rgba(255,255,255,0.7);
    border-radius: 50%;
    width: 100px;
    height: 100px;
    pointer-events: none;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 10;
    /* background-image + background-size set via JS */
  }
  .pdp-main-image-wrap:hover .pdp-zoom-lens { opacity: 1; }

  /* Hint badge */
  .pdp-zoom-hint {
    position: absolute; bottom: 52px; right: 12px;
    display: flex; align-items: center; gap: 5px;
    background: rgba(0,0,0,0.55); color: #fff;
    font-size: 0.67rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; padding: 5px 10px; border-radius: 20px;
    backdrop-filter: blur(6px); pointer-events: none;
    opacity: 1; transition: opacity 0.3s ease;
    z-index: 5;
  }
  .pdp-main-image-wrap:hover .pdp-zoom-hint { opacity: 0; }

  /* ── LIGHTBOX — full natural size, no compression ── */
  .pdp-lightbox-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.94);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: pdp-fade-in 0.22s ease;
    cursor: zoom-out;
    /* allow scrolling if image is taller than viewport */
    overflow: auto;
  }
  .pdp-lightbox-inner {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    /* 3:4 aspect ratio, fills up to 90vh */
    max-height: 90vh;
    /* let width be determined by the image's natural aspect */
  }
  .pdp-lightbox-img {
    /* Show at natural size — never upscale past container */
    max-height: 90vh;
    /* maintain 3:4 aspect ratio column: width = 90vh * (3/4) = 67.5vh */
    width: auto;
    max-width: min(calc(90vh * 0.75), 92vw);
    object-fit: contain;
    border-radius: 6px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.7);
    animation: pdp-lightbox-in 0.28s cubic-bezier(0.22,1,0.36,1);
    cursor: default;
    display: block;
  }
  .pdp-lightbox-close {
    position: fixed; top: 18px; right: 20px;
    width: 42px; height: 42px; border-radius: 50%;
    background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    color: #fff; cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;
    z-index: 10000; backdrop-filter: blur(4px);
  }
  .pdp-lightbox-close:hover { background: rgba(255,255,255,0.22); transform: scale(1.08); }
  .pdp-lightbox-counter {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    color: rgba(255,255,255,0.55); font-size: 0.72rem;
    letter-spacing: 0.14em; font-weight: 600; font-family: "Raleway", sans-serif;
    pointer-events: none;
  }
  .pdp-lightbox-nav {
    position: fixed; top: 50%; transform: translateY(-50%);
    width: 44px; height: 44px; border-radius: 50%;
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18);
    display: flex; align-items: center; justify-content: center;
    color: #fff; cursor: pointer; transition: background 0.2s ease;
    z-index: 10000; backdrop-filter: blur(4px);
  }
  .pdp-lightbox-nav:hover { background: rgba(255,255,255,0.22); }
  .pdp-lightbox-nav.prev { left: 16px; }
  .pdp-lightbox-nav.next { right: 16px; }

  .pdp-trust-badge {
    display: flex; flex-direction: column; align-items: center;
    gap: 6px; flex: 1; padding: 12px 8px; border-radius: 12px;
    transition: transform 0.25s ease;
  }
  .pdp-trust-badge:hover { transform: translateY(-2px); }
  .pdp-trust-icon {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }

  /* ── Review skeleton shimmer ── */
  .review-shimmer {
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%);
    background-size: 600px 100%;
    animation: shimmer-wave 1.6s infinite linear;
  }
  .review-shimmer-light {
    background: linear-gradient(90deg, #f3f0eb 0%, #ede9e2 50%, #f3f0eb 100%);
    background-size: 600px 100%;
    animation: shimmer-wave 1.6s infinite linear;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }
`;

// ─── Thread divider ───────────────────────────────────────────────────────────
const ThreadDivider: React.FC = () => (
  <svg viewBox="0 0 400 40" fill="none"
    style={{ width: '100%', maxWidth: '360px', height: '28px', overflow: 'visible' }}
    aria-hidden="true">
    <path
      d="M0,20 C50,5 80,35 130,18 C180,1 210,34 260,16 C310,-1 345,30 400,18"
      stroke="url(#pdp-tg)" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="400"
      style={{ animation: 'pdp-thread-draw 1.5s ease 0.2s both' }} />
    <defs>
      <linearGradient id="pdp-tg" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor={theme.threadColor1} stopOpacity="0" />
        <stop offset="30%"  stopColor={theme.threadColor1} />
        <stop offset="70%"  stopColor={theme.threadColor2} />
        <stop offset="100%" stopColor={theme.threadColor2} stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

// ─── Lightbox — shows image at full natural size with 3:4 aspect ──────────────
const Lightbox: React.FC<{
  images: string[]; initialIndex: number; productName: string; onClose: () => void;
}> = ({ images, initialIndex, productName, onClose }) => {
  const [current, setCurrent] = useState(initialIndex);

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setCurrent(i => (i - 1 + images.length) % images.length); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setCurrent(i => (i + 1) % images.length); };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft')  setCurrent(i => (i - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') setCurrent(i => (i + 1) % images.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images.length, onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="pdp-lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Full size product image">
      <button className="pdp-lightbox-close" onClick={onClose} aria-label="Close lightbox"><X size={20} /></button>

      <div className="pdp-lightbox-inner" onClick={e => e.stopPropagation()}>
        <img
          key={current}
          src={images[current]}
          alt={`${productName} — image ${current + 1}`}
          className="pdp-lightbox-img"
          loading="eager"
        />
      </div>

      {images.length > 1 && (
        <>
          <button className="pdp-lightbox-nav prev" onClick={prev} aria-label="Previous image">
            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <button className="pdp-lightbox-nav next" onClick={next} aria-label="Next image">
            <ChevronRight size={20} />
          </button>
          <p className="pdp-lightbox-counter">{current + 1} / {images.length}</p>
        </>
      )}
    </div>
  );
};

// ─── Trust badges ─────────────────────────────────────────────────────────────
const TrustBadges: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const badges = [
    { icon: <Truck size={18} />, label: 'Fast Delivery', sub: '3–5 business days', iconBg: isDark ? 'rgba(34,197,94,0.15)' : '#dcfce7', iconColor: '#16a34a' },
    { icon: <ShieldCheck size={18} />, label: 'Quality Approved', sub: 'Artisan certified', iconBg: isDark ? 'rgba(59,130,246,0.15)' : '#dbeafe', iconColor: '#2563eb' },
    { icon: <Gem size={18} />, label: 'Premium Material', sub: 'Finest handwoven', iconBg: isDark ? 'rgba(168,85,247,0.15)' : '#f3e8ff', iconColor: '#9333ea' },
  ];
  return (
    <div style={{
      display: 'flex', gap: '8px',
      background: isDark ? 'rgba(255,255,255,0.04)' : '#FAFAF8',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#EDE8DF'}`,
      borderRadius: '14px', padding: '10px 6px', marginBottom: '28px',
    }}>
      {badges.map((b, i) => (
        <div key={i} className="pdp-trust-badge">
          <div className="pdp-trust-icon" style={{ background: b.iconBg, color: b.iconColor }}>{b.icon}</div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 800, fontFamily: '"Raleway",sans-serif', letterSpacing: '0.04em', color: isDark ? '#e5e7eb' : '#1c1917', lineHeight: 1.2, marginBottom: '2px' }}>{b.label}</p>
            <p style={{ fontSize: '0.6rem', fontFamily: '"DM Sans",sans-serif', color: isDark ? '#9ca3af' : '#78716c', lineHeight: 1.2 }}>{b.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Fake Reviews Skeleton Section ───────────────────────────────────────────
const FAKE_REVIEWS = [
  { initials: 'PR', name: 'Priya R.', location: 'Chennai', rating: 5, ago: '2 days ago', lines: [60, 90, 45] },
  { initials: 'AM', name: 'Ananya M.', location: 'Bengaluru', rating: 5, ago: '1 week ago', lines: [80, 55] },
  { initials: 'SN', name: 'Sunita N.', location: 'Mumbai', rating: 4, ago: '2 weeks ago', lines: [70, 88, 40] },
  { initials: 'DK', name: 'Deepa K.', location: 'Kochi', rating: 5, ago: '3 weeks ago', lines: [50, 75] },
];

const AVATAR_COLORS = ['#bc3d3e', '#b6893c', '#7c5c3a', '#4a6741'];

const ReviewSkeletonCard: React.FC<{
  review: typeof FAKE_REVIEWS[0];
  index: number;
  isDark: boolean;
}> = ({ review, index, isDark }) => {
  const shimmerClass = isDark ? 'review-shimmer' : 'review-shimmer-light';
  const shimmerBg = isDark ? 'rgba(255,255,255,0.06)' : '#ede9e2';
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAF8';
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : '#EDE8DF';

  return (
    <div style={{
      background: cardBg, border: `1px solid ${borderColor}`,
      borderRadius: '14px', padding: '18px 20px',
      animation: `pdp-slide-up 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 0.08}s both`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '50%',
          background: AVATAR_COLORS[index % AVATAR_COLORS.length],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.72rem', fontWeight: 800, color: '#fff',
          fontFamily: '"Raleway", sans-serif', flexShrink: 0,
        }}>{review.initials}</div>
        <div style={{ flex: 1 }}>
          <div className={shimmerClass} style={{ height: '10px', width: `${review.name.length * 7}px`, maxWidth: '120px', borderRadius: '6px', background: shimmerBg, marginBottom: '5px' }} />
          <div className={shimmerClass} style={{ height: '8px', width: '70px', borderRadius: '6px', background: shimmerBg }} />
        </div>
        <div className={shimmerClass} style={{ height: '8px', width: '60px', borderRadius: '6px', background: shimmerBg, flexShrink: 0 }} />
      </div>
      <div style={{ display: 'flex', gap: '3px', marginBottom: '10px' }}>
        {[1, 2, 3, 4, 5].map(s => (
          <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill={s <= review.rating ? '#b6893c' : 'none'} style={{ color: s <= review.rating ? '#b6893c' : '#d1c5a5' }}>
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {review.lines.map((w, i) => (
          <div key={i} className={shimmerClass} style={{ height: '9px', width: `${w}%`, borderRadius: '6px', background: shimmerBg }} />
        ))}
      </div>
      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div className={shimmerClass} style={{ height: '8px', width: '90px', borderRadius: '6px', background: shimmerBg }} />
      </div>
    </div>
  );
};

const ReviewsSkeleton: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#EDE8DF';
  const subTextColor = isDark ? '#9ca3af' : '#78716c';
  const headingColor = isDark ? '#f0e8d6' : '#1a1410';
  const shimmerBg = isDark ? 'rgba(255,255,255,0.06)' : '#ede9e2';
  const shimmerClass = isDark ? 'review-shimmer' : 'review-shimmer-light';

  return (
    <section aria-label="Customer reviews" style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '40px', marginTop: '40px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 600, color: headingColor, margin: 0 }}>
            Customer Reviews
          </h2>
          <span style={{ background: isDark ? 'rgba(182,137,60,0.15)' : 'rgba(182,137,60,0.12)', color: '#b6893c', fontSize: '0.72rem', fontWeight: 800, fontFamily: '"Raleway", sans-serif', letterSpacing: '0.06em', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(182,137,60,0.25)' }}>
            {FAKE_REVIEWS.length} reviews
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '3px' }}>
            {[1, 2, 3, 4, 5].map(s => (
              <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="#b6893c" style={{ color: '#b6893c' }}>
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ))}
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: '"Raleway", sans-serif', color: headingColor }}>4.9</span>
          <span style={{ fontSize: '0.78rem', fontFamily: '"DM Sans", sans-serif', color: subTextColor }}>out of 5</span>
        </div>
        <p style={{ fontSize: '0.75rem', fontFamily: '"DM Sans", sans-serif', color: subTextColor, marginTop: '6px' }}>
          Reviews are loading — check back soon for verified customer feedback.
        </p>
      </div>
      <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFAF8', border: `1px solid ${borderColor}`, borderRadius: '14px', padding: '16px 20px', marginBottom: '24px' }}>
        {[{ stars: 5, pct: 78 }, { stars: 4, pct: 15 }, { stars: 3, pct: 5 }, { stars: 2, pct: 2 }, { stars: 1, pct: 0 }].map(({ stars, pct }) => (
          <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: '"Raleway", sans-serif', color: subTextColor, width: '10px', textAlign: 'right', flexShrink: 0 }}>{stars}</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#b6893c" style={{ flexShrink: 0 }}>
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="#b6893c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ flex: 1, height: '7px', borderRadius: '4px', background: shimmerBg, overflow: 'hidden' }}>
              <div className={shimmerClass} style={{ height: '100%', width: `${pct}%`, borderRadius: '4px', background: pct > 50 ? (isDark ? 'rgba(182,137,60,0.5)' : 'rgba(182,137,60,0.45)') : shimmerBg, animation: pct > 0 ? undefined : 'none' }} />
            </div>
            <span style={{ fontSize: '0.68rem', fontFamily: '"DM Sans", sans-serif', color: subTextColor, width: '28px', textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
        {FAKE_REVIEWS.map((review, i) => <ReviewSkeletonCard key={i} review={review} index={i} isDark={isDark} />)}
      </div>
      <div style={{ textAlign: 'center', marginTop: '28px' }}>
        <div className={shimmerClass} style={{ display: 'inline-block', height: '40px', width: '160px', borderRadius: '20px', background: shimmerBg }} />
      </div>
    </section>
  );
};

// ─── Not Found ────────────────────────────────────────────────────────────────
const NotFound: React.FC<{ bg: string; textPrimary: string }> = ({ bg, textPrimary }) => (
  <div className={`min-h-screen ${bg} pt-24 flex items-center justify-center`}>
    <div className="text-center">
      <p className="text-6xl mb-4">🕊️</p>
      <h2 className={textPrimary} style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: '2rem', fontWeight: 400 }}>
        Product Not Found
      </h2>
      <Link to="/" className="text-sm font-body mt-2 block transition-colors" style={{ color: theme.productLinkHover }}>
        Back to Home
      </Link>
    </div>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const ProductDetailPage: React.FC = () => {
  const { productId }  = useParams<{ productId: string }>();
  const { isDark }     = useTheme();
  const { product, loading } = useProduct(productId ?? '');
  const styleRef = useRef(false);

  const [selectedImage, setSelectedImage]   = useState(0);
  const [selectedColor, setSelectedColor]   = useState(0);
  const [openAccordion, setOpenAccordion]   = useState<string | null>('description');
  const [lightboxOpen, setLightboxOpen]     = useState(false);
  const [animKey, setAnimKey]               = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Zoom lens refs ──
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const lensRef      = useRef<HTMLDivElement>(null);
  const imgRef       = useRef<HTMLImageElement>(null);

  const { whatsapp_number, instagram_url, facebook_url } = useSettings();

  const bgStyle     = isDark ? undefined : { backgroundColor: '#FDFAF6' };
  const bg          = isDark ? 'bg-dark-bg' : '';
  const card        = isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-stone-100';
  const textPrimary = isDark ? 'text-dark-text'  : 'text-brand-ink';
  const textMuted   = isDark ? 'text-dark-muted' : 'text-brand-ink-muted';
  const productIdColor = isDark ? '#c9a96e' : '#7c5c3a';

  useEffect(() => {
    if (!styleRef.current) {
      const tag = document.createElement('style');
      tag.textContent = STYLES;
      document.head.appendChild(tag);
      styleRef.current = true;
    }
  }, []);

  const startAutoSlide = useCallback(() => {
    if (!product || product.images.length <= 1) return;
    autoRef.current = setInterval(() => {
      setSelectedImage(prev => { setAnimKey(k => k + 1); return (prev + 1) % product.images.length; });
    }, 3000);
  }, [product]);

  const stopAutoSlide = useCallback(() => {
    if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null; }
  }, []);

  useEffect(() => {
    if (product && product.images.length > 1) startAutoSlide();
    return stopAutoSlide;
  }, [product, startAutoSlide, stopAutoSlide]);

  const handleThumbClick = (i: number) => {
    stopAutoSlide(); setAnimKey(k => k + 1); setSelectedImage(i);
  };

  // ── Zoom lens mouse logic ──────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const wrap = imageWrapRef.current;
    const lens = lensRef.current;
    const img  = imgRef.current;
    if (!wrap || !lens || !img) return;

    const rect      = wrap.getBoundingClientRect();
    const lensW     = lens.offsetWidth;
    const lensH     = lens.offsetHeight;

    // cursor position relative to wrap
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // clamp so lens never leaves the wrap edges
    x = Math.max(lensW / 2, Math.min(rect.width  - lensW / 2, x));
    y = Math.max(lensH / 2, Math.min(rect.height - lensH / 2, y));

    // position lens centred on cursor
    lens.style.left = `${x - lensW / 2}px`;
    lens.style.top  = `${y - lensH / 2}px`;

    // magnification factor (3× feels natural for product photography)
    const ZOOM = 3;
    const bgW  = rect.width  * ZOOM;
    const bgH  = rect.height * ZOOM;

    // offset so the zoomed region aligns with cursor
    const bgX = x * ZOOM - lensW / 2;
    const bgY = y * ZOOM - lensH / 2;

    lens.style.backgroundImage    = `url('${img.src}')`;
    lens.style.backgroundSize     = `${bgW}px ${bgH}px`;
    lens.style.backgroundPosition = `-${bgX}px -${bgY}px`;
    lens.style.backgroundRepeat   = 'no-repeat';
  }, []);

  usePageMeta({
    title: product ? `${product.name} — ${product.category.replace(/-/g,' ')}` : 'Product',
    description: product
      ? `${product.name} — ${product.fabric} saree. ₹${product.discount_price || product.price}.`
      : 'Authentic handwoven saree from Wing & Weft.',
  });

  if (!productId) return <NotFound bg={bg} textPrimary={textPrimary} />;

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} pt-20`} style={bgStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <div className="space-y-3">
              <div className="shimmer rounded-2xl w-full" style={{ aspectRatio: '3/4' }} />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_,i) => <div key={i} className="shimmer rounded-xl" style={{ height: '80px' }} />)}
              </div>
            </div>
            <div className="space-y-4">
              {[1/3, 3/4, 1/4, 1/2].map((w, i) => (
                <div key={i} className="shimmer h-6 rounded" style={{ width: `${w*100}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <NotFound bg={bg} textPrimary={textPrimary} />;

  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const showRating =
    product.show_rating === true &&
    product.rating > 0 &&
    product.review_count > 0;

  const activeColors = (product.colors || []).filter(c => c && c.trim() !== '');
  const hasColors    = product.show_colors !== false && activeColors.length > 0;

  interface SpecRow { key: string; value: string; }
  const specRows: SpecRow[] = (product.specifications || []).filter(
    (s: SpecRow) => s.key?.trim() && s.value?.trim()
  );
  const hasSpecs = specRows.length > 0;
  const specDividerColor = isDark ? theme.specRowDivider?.dark : theme.specRowDivider?.light;

  const whatsappText  = `Hi! I'm interested in:\n*${product.name}* (ID: ${product.id})\nCategory: ${product.category.replace(/-/g,' ')}\nPrice: ₹${product.discount_price || product.price}\nFabric: ${product.fabric}\n\nCould you please help me with this product?`;
  const whatsappLink  = `https://wa.me/${whatsapp_number}?text=${encodeURIComponent(whatsappText)}`;
  const instagramLink = instagram_url || 'https://www.instagram.com/';
  const facebookLink  = facebook_url && facebook_url !== '#'
    ? facebook_url
    : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;

  const accordions = [
    {
      id: 'description',
      title: 'Detailed Description',
      content: (
        <p className={`text-sm font-body leading-relaxed ${textMuted}`} style={{ lineHeight: 1.8 }}>
          {product.description || 'No description available.'}
        </p>
      ),
    },
    ...(hasSpecs ? [{
      id: 'specifications',
      title: 'Saree Specifications',
      content: (
        <div className="space-y-0">
          {specRows.map(({ key, value }) => (
            <div key={key} className="flex justify-between py-2.5 border-b last:border-0"
              style={{ borderColor: specDividerColor }}>
              <span className={`text-sm font-bold font-body ${textPrimary}`}>{key}</span>
              <span className={`text-sm font-body text-right ml-4 ${textMuted}`}>{value}</span>
            </div>
          ))}
        </div>
      ),
    }] : []),
    {
      id: 'policy',
      title: 'Policy',
      content: (
        <ul className="space-y-2">
          {(product.policy_points?.length ? product.policy_points : [
            'Exchange accepted within 7 days of delivery.',
            'Product must be unused and in original packaging.',
            'Cancellation allowed within 12 hours of order placement.',
            'Refunds processed within 5–7 business days.',
            'Free shipping on orders above ₹2000.',
          ]).filter(Boolean).map((item, i) => (
            <li key={i} className="flex gap-2 text-sm font-body">
              <span style={{ color: theme.accentSecondary }} className="mt-0.5 font-bold">•</span>
              <span className={textMuted}>{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div className={`min-h-screen ${bg} pt-20`} style={bgStyle}>
      <SEO
        title={product.name}
        description={`${product.name} — ${product.fabric} saree. ₹${product.discount_price || product.price}. Handwoven by artisans.`}
        canonical={`https://wingandweft.vercel.app/product/${productId}`}
        image={product.images?.[0]}
        type="product"
      />

      {lightboxOpen && (
        <Lightbox images={product.images} initialIndex={selectedImage}
          productName={product.name} onClose={() => setLightboxOpen(false)} />
      )}

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <nav className="flex items-center gap-2 text-xs font-body" aria-label="Breadcrumb">
          <Link to="/" className={`transition-colors ${textMuted}`}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = theme.productLinkHover}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = ''}>Home</Link>
          <ChevronRight size={12} className={textMuted} />
          <Link to={`/category/${product.category}`}
            className={`transition-colors capitalize ${textMuted}`}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = theme.productLinkHover}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = ''}>
            {product.category.replace(/-/g,' ')}
          </Link>
          <ChevronRight size={12} className={textMuted} />
          <span style={{ color: theme.accentPrimary, fontWeight: 600 }} className="truncate max-w-[180px]">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Left: Images ── */}
          <div style={{ animation: 'pdp-slide-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both' }}>

            {/* ── Main image: 3:4 aspect ratio, zoom-lens on hover ── */}
            <div
              ref={imageWrapRef}
              className={`pdp-main-image-wrap rounded-2xl mb-3 ${card} border relative`}
              style={{ aspectRatio: '3 / 4', width: '100%' }}
              onMouseMove={handleMouseMove}
              onPointerUp={e => { if (e.button === 0) { stopAutoSlide(); setLightboxOpen(true); } }}
              role="button"
              tabIndex={0}
              aria-label="Click to view full size"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { stopAutoSlide(); setLightboxOpen(true); } }}
            >
              <img
                ref={imgRef}
                key={`img-${selectedImage}-${animKey}`}
                src={product.images[selectedImage]}
                alt={`${product.name} — image ${selectedImage + 1}`}
                className="pdp-main-img"
                loading="eager"
              />

              {/* Zoom lens div — positioned by JS */}
              <div ref={lensRef} className="pdp-zoom-lens" aria-hidden="true" />

              {/* Hint shown when NOT hovering */}
              <div className="pdp-zoom-hint"><ZoomIn size={11} /> Hover to zoom · Click to enlarge</div>

              {/* Dot indicators */}
              {product.images.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5" style={{ zIndex: 4 }}>
                  {product.images.map((_, i) => (
                    <button key={i}
                      onClick={e => e.stopPropagation()}
                      onPointerUp={e => { e.stopPropagation(); handleThumbClick(i); }}
                      className="transition-all duration-300 rounded-full"
                      style={{
                        width: i === selectedImage ? '20px' : '6px', height: '6px',
                        background: i === selectedImage ? theme.productDotActive : 'rgba(255,255,255,0.5)',
                      }}
                      aria-label={`View image ${i + 1}`} aria-pressed={i === selectedImage} />
                  ))}
                </div>
              )}

              {/* Discount badge */}
              {discount > 0 && (
                <div className="absolute top-4 right-4" style={{ zIndex: 3 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    background: 'linear-gradient(135deg, #e05c1a, #c94a10)',
                    color: '#fff', fontSize: '0.95rem', fontWeight: 900,
                    letterSpacing: '0.02em', padding: '6px 14px', borderRadius: '8px',
                    boxShadow: '0 3px 14px rgba(0,0,0,0.4)', fontFamily: '"Raleway",sans-serif',
                    lineHeight: 1, animation: 'pdp-badge-in 0.5s cubic-bezier(0.22,1,0.36,1) 0.3s both',
                  }}>
                    {discount}% OFF
                  </span>
                </div>
              )}

              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl" style={{ zIndex: 5 }}>
                  <span className="text-white font-semibold font-body text-lg">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => handleThumbClick(i)}
                  className="pdp-thumb overflow-hidden border-2"
                  style={{
                    aspectRatio: '3 / 4',
                    borderRadius: '10px',
                    borderColor: i === selectedImage ? theme.accentPrimary : 'transparent',
                    display: 'block',
                    width: '100%',
                  }}
                  aria-label={`View image ${i + 1}`} aria-pressed={i === selectedImage}>
                  <img src={img} alt={`${product.name} thumbnail ${i + 1}`}
                    className="w-full h-full object-cover" loading="lazy"
                    style={{ display: 'block' }} />
                </button>
              ))}
            </div>

            {product.images.length > 1 && (
              <p className={`text-xs text-center mt-2 font-body ${textMuted}`} style={{ opacity: 0.6 }}>
                Auto-cycling · click thumbnail to pause · hover to zoom · click to enlarge
              </p>
            )}
          </div>

          {/* ── Right: Details ── */}
          <div style={{ animation: 'pdp-slide-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.22s both' }}>

            <p className="font-label mb-2" style={{
              letterSpacing: '0.26em', color: theme.accentSecondary,
              fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase',
            }}>
              {product.fabric} · {product.category.replace(/-/g,' ')}
            </p>

            <h1 className={`mb-3 leading-tight ${textPrimary}`} style={{
              fontFamily: '"Cormorant Garamond",serif',
              fontSize: 'clamp(2rem, 3.5vw, 2.9rem)', fontWeight: 600, lineHeight: 1.08,
            }}>
              {product.name}
            </h1>

            <div style={{ marginBottom: '16px' }}><ThreadDivider /></div>

            <p className="font-body mb-4" style={{ fontSize: '0.82rem', opacity: 0.95 }}>
              <span style={{ fontWeight: 800, color: productIdColor, letterSpacing: '0.04em', fontSize: '0.78rem' }}>
                Product ID:
              </span>{' '}
              <span style={{ fontFamily: '"DM Mono","Courier New",monospace', fontWeight: 800, fontSize: '0.84rem', letterSpacing: '0.14em', color: productIdColor }}>
                {product.id}
              </span>
            </p>

            {showRating && (
              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={product.rating} size={16} />
                <span className={`text-sm font-body font-semibold ${textMuted}`}>
                  {product.rating} ({product.review_count} {product.review_count === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            <div className="flex items-end gap-4 mb-2">
              {product.discount_price ? (
                <>
                  <span style={{ fontFamily: '"Raleway",sans-serif', fontSize: '2.2rem', fontWeight: 900, color: '#bc3d3e', letterSpacing: '-0.02em', lineHeight: 1 }}>
                    ₹{product.discount_price.toLocaleString()}
                  </span>
                  <span className="font-body line-through" style={{ fontSize: '1.1rem', fontWeight: 500, color: isDark ? '#64748b' : '#a8a29e', marginBottom: '3px' }}>
                    ₹{product.price.toLocaleString()}
                  </span>
                </>
              ) : (
                <span style={{ fontFamily: '"Raleway",sans-serif', fontSize: '2.2rem', fontWeight: 900, color: '#bc3d3e', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  ₹{product.price.toLocaleString()}
                </span>
              )}
            </div>

            {product.discount_price && discount > 0 && (
              <p className="mb-4 font-body" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a', letterSpacing: '0.02em' }}>
                You save ₹{(product.price - product.discount_price).toLocaleString()} ({discount}% off)
              </p>
            )}

            <p className="font-body mb-5" style={{
              fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.04em',
              color: product.stock === 0 ? '#ef4444' : product.stock <= 5 ? '#f97316' : '#16a34a',
            }}>
              {product.stock === 0 ? '✗  Out of Stock' : product.stock <= 5 ? `⚠  Only ${product.stock} left in stock!` : '✓  In Stock'}
            </p>

            {hasColors && (
              <div className="mb-6">
                <p className={`font-body mb-2 ${textPrimary}`} style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Colour
                </p>
                <div className="flex gap-2">
                  {activeColors.map((color, i) => (
                    <button key={color} onClick={() => setSelectedColor(i)}
                      className="w-8 h-8 rounded-full transition-all hover:scale-110"
                      style={{
                        background: color,
                        border: `2px solid ${i === selectedColor ? theme.accentPrimary : 'transparent'}`,
                        transform: i === selectedColor ? 'scale(1.12)' : 'scale(1)',
                        boxShadow: i === selectedColor ? `0 0 0 3px ${theme.accentPrimary}30` : 'none',
                      }}
                      aria-label={`Select colour ${i + 1}`} aria-pressed={i === selectedColor} />
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                className={`pdp-wa-btn w-full flex items-center justify-center gap-3 py-4 rounded-full font-body ${product.stock === 0 ? 'disabled' : ''}`}
                style={{
                  background: '#25D366', color: '#fff', boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
                  letterSpacing: '0.18em', fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase',
                  pointerEvents: product.stock === 0 ? 'none' : 'auto',
                  opacity: product.stock === 0 ? 0.5 : 1, textDecoration: 'none',
                }}>
                <MessageCircle size={20} />
                {product.stock === 0 ? 'Out of Stock' : 'Order via WhatsApp'}
              </a>
            </div>

            <TrustBadges isDark={isDark} />

            <div className="space-y-2 mb-6">
              {accordions.map(acc => (
                <div key={acc.id} className={`rounded-xl border overflow-hidden ${card}`}>
                  <button
                    className={`pdp-accordion-btn w-full flex items-center justify-between px-5 py-4 text-left ${textPrimary}`}
                    onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}
                    aria-expanded={openAccordion === acc.id}
                    style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: '"Raleway",sans-serif' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = theme.accordionHover}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = ''}
                  >
                    {acc.title}
                    <ChevronDown size={16} aria-hidden="true"
                      className={`transition-transform duration-200 flex-shrink-0 ${openAccordion === acc.id ? 'rotate-180' : ''}`}
                      style={{ color: openAccordion === acc.id ? theme.accentPrimary : '' }} />
                  </button>
                  {openAccordion === acc.id && (
                    <div className={`px-5 pb-4 border-t ${isDark ? 'border-dark-border' : 'border-brand-cream-dark'}`}
                      style={{ animation: 'pdp-slide-up 0.3s cubic-bezier(0.22,1,0.36,1)' }}>
                      <div className="pt-3">{acc.content}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div>
              <p className={`mb-3 font-body ${textPrimary}`} style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                Share this product
              </p>
              <div className="flex gap-3">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="pdp-share-icon w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: '#25D366', boxShadow: '0 2px 10px rgba(37,211,102,0.4)' }}
                  aria-label="Share on WhatsApp"><MessageCircle size={18} color="white" /></a>
                <a href={instagramLink} target="_blank" rel="noopener noreferrer"
                  className="pdp-share-icon w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', boxShadow: '0 2px 10px rgba(220,39,67,0.35)' }}
                  aria-label="Follow on Instagram"><Instagram size={18} color="white" /></a>
                <a href={facebookLink} target="_blank" rel="noopener noreferrer"
                  className="pdp-share-icon w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: '#1877F2', boxShadow: '0 2px 10px rgba(24,119,242,0.35)' }}
                  aria-label="Share on Facebook"><Facebook size={18} color="white" /></a>
              </div>
            </div>
          </div>
        </div>

        <ReviewsSkeleton isDark={isDark} />
      </div>
    </div>
  );
};

export default ProductDetailPage;