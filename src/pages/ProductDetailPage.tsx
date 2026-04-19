// src/pages/ProductDetailPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Instagram, Facebook, MessageCircle, X, ZoomIn, Truck, ShieldCheck, Gem } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import SEO from '../components/SEO/SEO';
import { StarRating } from '../components/Products/ProductCard';
import { useProduct } from '../hooks/useProducts';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../admin/lib/supabase';
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
  @keyframes pdp-shimmer {
    from { background-position: -200% center; }
    to   { background-position:  200% center; }
  }
  @keyframes pdp-glow-pulse {
    0%, 100% { opacity: 0.4; transform: scale(1);    }
    50%       { opacity: 0.7; transform: scale(1.06); }
  }
  @keyframes pdp-badge-in {
    from { opacity: 0; transform: scale(0.85) translateY(4px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes pdp-lightbox-in {
    from { opacity: 0; transform: scale(0.95); }
    to   { opacity: 1; transform: scale(1); }
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

  /* ── Image zoom ── */
  .pdp-main-image-wrap {
    overflow: hidden;
    cursor: zoom-in;
    position: relative;
  }
  .pdp-main-img {
    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
    transform-origin: center center;
    will-change: transform;
    animation: pdp-fade-in 0.35s ease both;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .pdp-main-image-wrap.zoomed .pdp-main-img {
    transform: scale(1.08);
  }
  .pdp-zoom-hint {
    position: absolute;
    bottom: 48px;
    right: 12px;
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(0,0,0,0.55);
    color: #fff;
    font-size: 0.67rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 5px 10px;
    border-radius: 20px;
    backdrop-filter: blur(6px);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .pdp-main-image-wrap.zoomed .pdp-zoom-hint {
    opacity: 1;
  }

  /* ── Lightbox ── */
  .pdp-lightbox-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0,0,0,0.92);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: pdp-fade-in 0.25s ease;
    cursor: zoom-out;
  }
  .pdp-lightbox-img {
    max-width: 92vw;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 6px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.7);
    animation: pdp-lightbox-in 0.3s cubic-bezier(0.22,1,0.36,1);
    cursor: default;
  }
  .pdp-lightbox-close {
    position: fixed;
    top: 18px;
    right: 20px;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;
    z-index: 10000;
    backdrop-filter: blur(4px);
  }
  .pdp-lightbox-close:hover {
    background: rgba(255,255,255,0.22);
    transform: scale(1.08);
  }
  .pdp-lightbox-counter {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    color: rgba(255,255,255,0.55);
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    font-weight: 600;
    font-family: "Raleway", sans-serif;
  }
  .pdp-lightbox-nav {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s ease;
    z-index: 10000;
    backdrop-filter: blur(4px);
  }
  .pdp-lightbox-nav:hover { background: rgba(255,255,255,0.22); }
  .pdp-lightbox-nav.prev { left: 16px; }
  .pdp-lightbox-nav.next { right: 16px; }

  /* ── Trust badges ── */
  .pdp-trust-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex: 1;
    padding: 12px 8px;
    border-radius: 12px;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .pdp-trust-badge:hover {
    transform: translateY(-2px);
  }
  .pdp-trust-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }
`;

// ─── Data fetching ─────────────────────────────────────────────────────────────
const fetchSettings = async (): Promise<Record<string, string>> => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/settings?select=key,value`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    if (!res.ok) return {};
    const rows: { key: string; value: string }[] = await res.json();
    const map: Record<string, string> = {};
    rows.forEach(r => { if (r.key) map[r.key] = r.value; });
    return map;
  } catch { return {}; }
};

// ─── Thread divider ───────────────────────────────────────────────────────────
const ThreadDivider: React.FC = () => (
  <svg
    viewBox="0 0 400 40" fill="none"
    style={{ width: '100%', maxWidth: '360px', height: '28px', overflow: 'visible' }}
    aria-hidden="true"
  >
    <path
      d="M0,20 C50,5 80,35 130,18 C180,1 210,34 260,16 C310,-1 345,30 400,18"
      stroke={`url(#pdp-tg)`} strokeWidth="1.4" strokeLinecap="round" strokeDasharray="400"
      style={{ animation: 'pdp-thread-draw 1.5s ease 0.2s both' }}
    />
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

// ─── Lightbox ────────────────────────────────────────────────────────────────
interface LightboxProps {
  images: string[];
  initialIndex: number;
  productName: string;
  onClose: () => void;
}
const Lightbox: React.FC<LightboxProps> = ({ images, initialIndex, productName, onClose }) => {
  const [current, setCurrent] = useState(initialIndex);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent(i => (i - 1 + images.length) % images.length);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent(i => (i + 1) % images.length);
  };

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
    <div className="pdp-lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Image viewer">
      <button className="pdp-lightbox-close" onClick={onClose} aria-label="Close image viewer">
        <X size={20} />
      </button>

      <img
        key={current}
        src={images[current]}
        alt={`${productName} — full size image ${current + 1}`}
        className="pdp-lightbox-img"
        onClick={e => e.stopPropagation()}
        loading="eager"
      />

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
interface TrustBadgesProps { isDark: boolean; }
const TrustBadges: React.FC<TrustBadgesProps> = ({ isDark }) => {
  const badges = [
    {
      icon: <Truck size={18} />,
      label: 'Fast Delivery',
      sub: '3–5 business days',
      iconBg: isDark ? 'rgba(34,197,94,0.15)' : '#dcfce7',
      iconColor: '#16a34a',
    },
    {
      icon: <ShieldCheck size={18} />,
      label: 'Quality Approved',
      sub: 'Artisan certified',
      iconBg: isDark ? 'rgba(59,130,246,0.15)' : '#dbeafe',
      iconColor: '#2563eb',
    },
    {
      icon: <Gem size={18} />,
      label: 'Premium Material',
      sub: 'Finest handwoven',
      iconBg: isDark ? 'rgba(168,85,247,0.15)' : '#f3e8ff',
      iconColor: '#9333ea',
    },
  ];

  const wrapBg    = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAF8';
  const wrapBdr   = isDark ? 'rgba(255,255,255,0.08)' : '#EDE8DF';
  const labelClr  = isDark ? '#e5e7eb' : '#1c1917';
  const subClr    = isDark ? '#9ca3af' : '#78716c';

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        background: wrapBg,
        border: `1px solid ${wrapBdr}`,
        borderRadius: '14px',
        padding: '10px 6px',
        marginBottom: '28px',
      }}
    >
      {badges.map((b, i) => (
        <div key={i} className="pdp-trust-badge">
          <div className="pdp-trust-icon" style={{ background: b.iconBg, color: b.iconColor }}>
            {b.icon}
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontSize: '0.7rem', fontWeight: 800,
              fontFamily: '"Raleway", sans-serif', letterSpacing: '0.04em',
              color: labelClr, lineHeight: 1.2, marginBottom: '2px',
            }}>
              {b.label}
            </p>
            <p style={{ fontSize: '0.6rem', fontFamily: '"DM Sans", sans-serif', color: subClr, lineHeight: 1.2 }}>
              {b.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Not Found ────────────────────────────────────────────────────────────────
const NotFound: React.FC<{ bg: string; textPrimary: string }> = ({ bg, textPrimary }) => (
  <div className={`min-h-screen ${bg} pt-24 flex items-center justify-center`}>
    <div className="text-center">
      <p className="text-6xl mb-4">🕊️</p>
      <h2 className={textPrimary} style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem', fontWeight: 400 }}>
        Product Not Found
      </h2>
      <Link
        to="/"
        className="text-sm font-body mt-2 block transition-colors"
        style={{ color: theme.productLinkHover }}
        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '0.75'}
        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '1'}
      >
        Back to Home
      </Link>
    </div>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const ProductDetailPage: React.FC = () => {
  const { productId }   = useParams<{ productId: string }>();
  const { isDark }      = useTheme();
  const { product, loading } = useProduct(productId ?? '');
  const styleRef = useRef(false);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>('description');
  const [settings, setSettings]           = useState<Record<string, string>>({});
  const [lightboxOpen, setLightboxOpen]   = useState(false);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { whatsapp_number, instagram_url, facebook_url } = useSettings();

  const bgStyle   = isDark ? undefined : { backgroundColor: '#FDFAF6' };
  const bg        = isDark ? 'bg-dark-bg' : '';
  const card      = isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-stone-100';
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
    fetchSettings().then(setSettings);
  }, []);

  const [animKey, setAnimKey] = useState(0);

  const startAutoSlide = useCallback(() => {
    if (!product || product.images.length <= 1) return;
    autoRef.current = setInterval(() => {
      setSelectedImage(prev => {
        setAnimKey(k => k + 1);
        return (prev + 1) % product.images.length;
      });
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
    stopAutoSlide();
    setIsImageHovered(false);
    setAnimKey(k => k + 1);
    setSelectedImage(i);
  };
  const handleMainImageClick = () => { stopAutoSlide(); setLightboxOpen(true); };

  usePageMeta({
    title: product
      ? `${product.name} — ${product.category.replace(/-/g,' ')}`
      : 'Product',
    description: product
      ? `${product.name} — ${(product as any).fabric} saree. ₹${product.discount_price || product.price}. ${(product as any).description?.slice(0, 100) || 'Authentic handwoven saree from Wing & Weft.'}`
      : 'Authentic handwoven saree from Wing & Weft.',
  });

  const seoTitle       = (product as any)?.name ?? 'Product';
  const seoDescription = product
    ? `${(product as any).name} — ${(product as any).fabric} saree. ₹${product.discount_price || product.price}. Handwoven by artisans.`
    : 'Browse handwoven sarees at Wing & Weft.';
  const seoImage = product?.images?.[0];

  if (!productId) return <NotFound bg={bg} textPrimary={textPrimary} />;

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} pt-20`} style={bgStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <div className="space-y-3">
              <div className="shimmer rounded-2xl w-full" style={{ height: '500px' }} />
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

  // ── Compute values from DB fields ─────────────────────────────────────────
  // Cast to any only once here so the rest of the JSX stays clean
  const p = product as any;

  // Discount % — always whole number
  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  // ── Rating: must be explicitly enabled by admin AND have real values ───────
  const globalRatingsOn = settings['show_ratings'] !== 'false';
  const showRating = (
    globalRatingsOn &&
    p.show_rating === true &&          // admin toggled ON
    p.rating > 0 &&                    // has a star value
    p.review_count > 0                 // has at least 1 review count
  );

  // ── Colours: must be explicitly enabled by admin ──────────────────────────
  const activeColors = (p.colors || []).filter((c: string) => c && c.trim() !== '');
  const hasColors    = p.show_colors !== false && activeColors.length > 0;

  // Specifications
  interface SpecRow { key: string; value: string; }
  const specRows: SpecRow[] = (p.specifications || []).filter(
    (s: SpecRow) => s.key?.trim() && s.value?.trim()
  );
  const hasSpecs = specRows.length > 0;
  const specDividerColor = isDark ? theme.specRowDivider.dark : theme.specRowDivider.light;

  const whatsappText    = `Hi! I'm interested in:\n*${p.name}*...`;
  const whatsappLink    = `https://wa.me/${whatsapp_number}?text=${encodeURIComponent(whatsappText)}`;
  const facebookShareLink = facebook_url && facebook_url !== '#'
    ? facebook_url
    : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
  const instagramLink   = instagram_url || 'https://www.instagram.com/';

  const accordions = [
    {
      id: 'description',
      title: 'Detailed Description',
      content: (
        <p className={`text-sm font-body leading-relaxed ${textMuted}`} style={{ lineHeight: 1.8 }}>
          {p.description || 'No description available.'}
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
          {(p.policy_points?.length
            ? p.policy_points
            : [
                'Exchange accepted within 7 days of delivery.',
                'Product must be unused and in original packaging.',
                'Cancellation allowed within 12 hours of order placement.',
                'Refunds processed within 5–7 business days.',
                'Free shipping on orders above ₹2000.',
              ]
          ).filter(Boolean).map((item: string, i: number) => (
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
        title={seoTitle}
        description={seoDescription}
        canonical={`https://wingandweft.vercel.app/product/${productId}`}
        image={seoImage}
        type="product"
      />

      {lightboxOpen && (
        <Lightbox
          images={product.images}
          initialIndex={selectedImage}
          productName={p.name}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <nav className="flex items-center gap-2 text-xs font-body" aria-label="Breadcrumb">
          <Link to="/" className={`transition-colors ${textMuted}`}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = theme.productLinkHover}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = ''}>
            Home
          </Link>
          <ChevronRight size={12} className={textMuted} aria-hidden="true" />
          <Link to={`/category/${p.category}`}
            className={`transition-colors capitalize ${textMuted}`}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = theme.productLinkHover}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = ''}>
            {p.category.replace(/-/g,' ')}
          </Link>
          <ChevronRight size={12} className={textMuted} aria-hidden="true" />
          <span style={{ color: theme.accentPrimary, fontWeight: 600 }} className="truncate max-w-[180px]">{p.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Left: Images ── */}
          <div style={{ animation: 'pdp-slide-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both' }}>
            <div
              className={`pdp-main-image-wrap rounded-2xl mb-3 ${card} border relative${isImageHovered ? ' zoomed' : ''}`}
              style={{ height: '500px' }}
              onMouseEnter={() => setIsImageHovered(true)}
              onMouseLeave={() => setIsImageHovered(false)}
              onPointerUp={e => { if (e.button === 0) handleMainImageClick(); }}
              role="button" tabIndex={0} aria-label="Click to view full size image"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleMainImageClick(); }}
            >
              <img
                key={`img-${selectedImage}-${animKey}`}
                src={product.images[selectedImage]}
                alt={`${p.name} — image ${selectedImage + 1}`}
                className="w-full h-full object-cover pdp-main-img"
                loading="eager"
              />

              <div className="pdp-zoom-hint">
                <ZoomIn size={11} />
                Click to zoom
              </div>

              {product.images.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={e => e.stopPropagation()}
                      onPointerUp={e => { e.stopPropagation(); handleThumbClick(i); }}
                      className="transition-all duration-300 rounded-full"
                      style={{
                        width:  i === selectedImage ? '20px' : '6px',
                        height: '6px',
                        background: i === selectedImage ? theme.productDotActive : 'rgba(255,255,255,0.5)',
                      }}
                      aria-label={`View image ${i + 1}`}
                      aria-pressed={i === selectedImage}
                    />
                  ))}
                </div>
              )}

              {discount > 0 && (
                <div className="absolute top-4 left-4" style={{ zIndex: 2 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    background: 'linear-gradient(135deg, #e05c1a, #c94a10)',
                    color: '#fff', fontSize: '0.95rem', fontWeight: 900,
                    letterSpacing: '0.02em', padding: '6px 14px', borderRadius: '8px',
                    boxShadow: '0 3px 14px rgba(0,0,0,0.4)', fontFamily: '"Raleway", sans-serif',
                    lineHeight: 1, animation: 'pdp-badge-in 0.5s cubic-bezier(0.22,1,0.36,1) 0.3s both',
                  }}>
                    {discount}% OFF
                  </span>
                </div>
              )}

              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                  <span className="text-white font-semibold font-body text-lg">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i} onClick={() => handleThumbClick(i)}
                  className="pdp-thumb rounded-xl overflow-hidden border-2"
                  style={{
                    height: '72px',
                    borderColor: i === selectedImage ? theme.accentPrimary : 'transparent',
                    borderWidth: '2px',
                  }}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={i === selectedImage}
                >
                  <img src={img} alt={`${p.name} thumbnail ${i + 1}`}
                    className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>

            {product.images.length > 1 && (
              <p className={`text-xs text-center mt-2 font-body ${textMuted}`} style={{ opacity: 0.6 }}>
                Auto-cycling · click thumbnail to pause · click main image to zoom
              </p>
            )}
          </div>

          {/* ── Right: Details ── */}
          <div style={{ animation: 'pdp-slide-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.22s both' }}>

            <p className="font-label mb-2" style={{
              letterSpacing: '0.26em', color: theme.accentSecondary,
              fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase',
            }}>
              {p.fabric} · {p.category.replace(/-/g,' ')}
            </p>

            <h1 className={`mb-3 leading-tight ${textPrimary}`} style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(2rem, 3.5vw, 2.9rem)', fontWeight: 600, lineHeight: 1.08,
            }}>
              {p.name}
            </h1>

            <div style={{ marginBottom: '16px' }}>
              <ThreadDivider />
            </div>

            {/* Product ID */}
            <p className="font-body mb-4" style={{ fontSize: '0.82rem', opacity: 0.85 }}>
              <span style={{ fontWeight: 700, color: productIdColor, letterSpacing: '0.03em', fontSize: '0.78rem' }}>
                Product ID:
              </span>{' '}
              <span style={{ fontFamily: '"DM Mono", "Courier New", monospace', fontWeight: 600, fontSize: '0.82rem', letterSpacing: '0.12em', color: productIdColor }}>
                {product.id}
              </span>
            </p>

            {/* ── Star rating — only rendered when admin set show_rating = true ── */}
            {showRating && (
              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={p.rating} size={16} />
                <span className={`text-sm font-body font-semibold ${textMuted}`}>
                  {p.rating} ({p.review_count} {p.review_count === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            {/* Price block */}
            <div className="flex items-end gap-4 mb-2">
              {product.discount_price ? (
                <>
                  <span style={{
                    fontFamily: '"Raleway", sans-serif', fontSize: '2.2rem', fontWeight: 900,
                    color: '#bc3d3e', letterSpacing: '-0.02em', lineHeight: 1,
                  }}>
                    ₹{product.discount_price.toLocaleString()}
                  </span>
                  <span className="font-body line-through" style={{ fontSize: '1.1rem', fontWeight: 500, color: isDark ? '#64748b' : '#a8a29e', marginBottom: '3px' }}>
                    ₹{product.price.toLocaleString()}
                  </span>
                </>
              ) : (
                <span style={{
                  fontFamily: '"Raleway", sans-serif', fontSize: '2.2rem', fontWeight: 900,
                  color: '#bc3d3e', letterSpacing: '-0.02em', lineHeight: 1,
                }}>
                  ₹{product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Savings callout — discount % always whole number */}
            {product.discount_price && discount > 0 && (
              <p className="mb-4 font-body" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a', letterSpacing: '0.02em' }}>
                You save ₹{(product.price - product.discount_price).toLocaleString()} ({discount}% off)
              </p>
            )}

            {/* Stock status */}
            <p className="font-body mb-5" style={{
              fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.04em',
              color: product.stock === 0 ? '#ef4444' : product.stock <= 5 ? '#f97316' : '#16a34a',
            }}>
              {product.stock === 0 ? '✗  Out of Stock' : product.stock <= 5 ? `⚠  Only ${product.stock} left in stock!` : '✓  In Stock'}
            </p>

            {/* ── Colour swatches — only rendered when admin set show_colors = true ── */}
            {hasColors && (
              <div className="mb-6">
                <p className={`font-body mb-2 ${textPrimary}`} style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Colour
                </p>
                <div className="flex gap-2">
                  {activeColors.map((color: string, i: number) => (
                    <button
                      key={color} onClick={() => setSelectedColor(i)}
                      className="w-8 h-8 rounded-full transition-all hover:scale-110"
                      style={{
                        background: color,
                        border: `2px solid ${i === selectedColor ? theme.accentPrimary : 'transparent'}`,
                        transform: i === selectedColor ? 'scale(1.12)' : 'scale(1)',
                        boxShadow: i === selectedColor ? `0 0 0 3px ${theme.accentPrimary}30` : 'none',
                      }}
                      aria-label={`Select colour ${i + 1}`}
                      aria-pressed={i === selectedColor}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* WhatsApp CTA */}
            <div className="mb-4">
              <a
                href={whatsappLink} target="_blank" rel="noopener noreferrer"
                className={`pdp-wa-btn w-full flex items-center justify-center gap-3 py-4 rounded-full font-body ${product.stock === 0 ? 'disabled' : ''}`}
                style={{
                  background: '#25D366', color: '#fff', boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
                  letterSpacing: '0.18em', fontSize: '0.78rem', fontWeight: 900,
                  textTransform: 'uppercase',
                  pointerEvents: product.stock === 0 ? 'none' : 'auto',
                  opacity: product.stock === 0 ? 0.5 : 1, textDecoration: 'none',
                }}
              >
                <MessageCircle size={20} />
                {product.stock === 0 ? 'Out of Stock' : 'Order via WhatsApp'}
              </a>
            </div>

            <TrustBadges isDark={isDark} />

            {/* Accordions */}
            <div className="space-y-2 mb-6">
              {accordions.map(acc => (
                <div key={acc.id} className={`rounded-xl border overflow-hidden ${card}`}>
                  <button
                    className={`pdp-accordion-btn w-full flex items-center justify-between px-5 py-4 text-left ${textPrimary}`}
                    onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}
                    aria-expanded={openAccordion === acc.id}
                    aria-controls={`accordion-${acc.id}`}
                    style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: '"Raleway", sans-serif' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = theme.accordionHover}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = ''}
                  >
                    {acc.title}
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 flex-shrink-0 ${openAccordion === acc.id ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                      style={{ color: openAccordion === acc.id ? theme.accentPrimary : '' }}
                    />
                  </button>
                  {openAccordion === acc.id && (
                    <div
                      id={`accordion-${acc.id}`}
                      className={`px-5 pb-4 border-t ${isDark ? 'border-dark-border' : 'border-brand-cream-dark'}`}
                      style={{ animation: 'pdp-slide-up 0.3s cubic-bezier(0.22,1,0.36,1)' }}
                    >
                      <div className="pt-3">{acc.content}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Share */}
            <div>
              <p className={`mb-3 font-body ${textPrimary}`} style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                Share this product
              </p>
              <div className="flex gap-3">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="pdp-share-icon w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: '#25D366', boxShadow: '0 2px 10px rgba(37,211,102,0.4)' }}
                  aria-label="Share on WhatsApp">
                  <MessageCircle size={18} color="white" />
                </a>
                <a href={instagramLink} target="_blank" rel="noopener noreferrer"
                  className="pdp-share-icon w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', boxShadow: '0 2px 10px rgba(220,39,67,0.35)' }}
                  aria-label="Follow us on Instagram">
                  <Instagram size={18} color="white" />
                </a>
                <a href={facebookShareLink} target="_blank" rel="noopener noreferrer"
                  className="pdp-share-icon w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: '#1877F2', boxShadow: '0 2px 10px rgba(24,119,242,0.35)' }}
                  aria-label="Share on Facebook">
                  <Facebook size={18} color="white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;