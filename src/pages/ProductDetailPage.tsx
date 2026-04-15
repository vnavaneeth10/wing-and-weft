// src/pages/ProductDetailPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { INSTAGRAM_URL } from '../data/products';
import { useTheme } from '../context/ThemeContext';
import SEO from '../components/SEO/SEO';
import { StarRating } from '../components/Products/ProductCard';
import { useProduct } from '../hooks/useProducts';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../admin/lib/supabase';
import { WHATSAPP_NUMBER } from '../data/products';
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
    from { opacity: 0; transform: scale(0.85); }
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
    .pdp-wa-btn:hover:not(.disabled) { transform: translateY(-3px); }
    .pdp-wa-btn:hover:not(.disabled)::before { left: 130%; }
  }

  .pdp-accordion-btn {
    transition: color 0.25s ease;
  }

  .pdp-thumb {
    transition: border-color 0.25s ease, transform 0.25s ease;
  }
  .pdp-thumb:hover { transform: scale(1.05); }

  .pdp-share-icon {
    transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  .pdp-share-icon:hover { transform: scale(1.12) rotate(4deg); }

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

// ─── Main page ────────────────────────────────────────────────────────────────
const ProductDetailPage: React.FC = () => {
  const { productId }   = useParams<{ productId: string }>();
  const { isDark }      = useTheme();
  const { product, loading } = useProduct(productId || '');
  const styleRef = useRef(false);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>('description');
  const [settings, setSettings]           = useState<Record<string, string>>({});
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { whatsapp_number } = useSettings();

  useEffect(() => {
    if (!styleRef.current) {
      const tag = document.createElement('style');
      tag.textContent = STYLES;
      document.head.appendChild(tag);
      styleRef.current = true;
    }
    fetchSettings().then(setSettings);
  }, []);

  const startAutoSlide = useCallback(() => {
    if (!product || product.images.length <= 1) return;
    autoRef.current = setInterval(() => {
      setSelectedImage(prev => (prev + 1) % product.images.length);
    }, 3000);
  }, [product]);

  const stopAutoSlide = useCallback(() => {
    if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null; }
  }, []);

  useEffect(() => {
    if (product && product.images.length > 1) startAutoSlide();
    return stopAutoSlide;
  }, [product, startAutoSlide, stopAutoSlide]);

  const handleThumbClick = (i: number) => { stopAutoSlide(); setSelectedImage(i); };

  usePageMeta({
    title: product
      ? `${product.name} — ${product.category.replace(/-/g,' ')}`
      : 'Product',
    description: product
      ? `${product.name} — ${product.fabric} saree. ₹${product.discount_price || product.price}. ${product.description?.slice(0, 100) || 'Authentic handwoven saree from Wing & Weft.'}`
      : 'Authentic handwoven saree from Wing & Weft.',
  });

  const seoTitle       = product?.name ?? 'Product';
  const seoDescription = product
    ? `${product.name} — ${product.fabric} saree. ₹${product.discount_price || product.price}. Handwoven by artisans. Free shipping above ₹2000.`
    : 'Browse handwoven sarees at Wing & Weft.';
  const seoImage = product?.images?.[0];

  const bg          = isDark ? 'bg-dark-bg'    : 'bg-brand-cream';
  const card        = isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-brand-cream-dark';
  const textPrimary = isDark ? 'text-dark-text'  : 'text-brand-ink';
  const textMuted   = isDark ? 'text-dark-muted' : 'text-brand-ink-muted';

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`min-h-screen ${bg} pt-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <div className="space-y-3">
              <div className="shimmer rounded-2xl w-full" style={{ height: '500px' }} />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_,i) => <div key={i} className="shimmer rounded-xl" style={{ height: '90px' }} />)}
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

  // ── Not found ───────────────────────────────────────────────────────────────
  if (!product) {
    return (
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
  }

  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

const whatsappText = `Hi! I'm interested in:\n*${product.name}*...`;
const whatsappLink = `https://wa.me/${whatsapp_number}?text=${encodeURIComponent(whatsappText)}`;

  // ── Derived guards ──────────────────────────────────────────────────────────
  const activeColors = (product.colors || []).filter(c => c && c.trim() !== '');
  const hasColors    = (product as any).show_colors !== false && activeColors.length > 0;

  const globalRatingsOn = settings['show_ratings'] !== 'false';
  const showRating = (
    globalRatingsOn &&
    (product as any).show_rating === true &&
    product.rating > 0 &&
    product.review_count > 0
  );

  interface SpecRow { key: string; value: string; }
  const specRows: SpecRow[] = ((product as any).specifications || []).filter(
    (s: SpecRow) => s.key?.trim() && s.value?.trim()
  );
  const hasSpecs = specRows.length > 0;

  // Spec row divider — theme-controlled
  const specDividerColor = isDark ? theme.specRowDivider.dark : theme.specRowDivider.light;

  const accordions = [
    {
      id: 'description',
      title: 'Detailed Description',
      content: (
        <p className={`text-sm font-body leading-relaxed ${textMuted}`}>
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
              <span className={`text-sm font-semibold font-body ${textPrimary}`}>{key}</span>
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
          {(product.policy_points?.length
            ? product.policy_points
            : [
                'Exchange accepted within 7 days of delivery.',
                'Product must be unused and in original packaging.',
                'Cancellation allowed within 12 hours of order placement.',
                'Refunds processed within 5–7 business days.',
                'Free shipping on orders above ₹2000.',
              ]
          ).filter(Boolean).map((item, i) => (
            <li key={i} className="flex gap-2 text-sm font-body">
              {/* Bullet — theme-coloured */}
              <span style={{ color: theme.accentSecondary }} className="mt-0.5">•</span>
              <span className={textMuted}>{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div className={`min-h-screen ${bg} pt-20`}>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={`https://wingandweft.vercel.app/product/${productId}`}
        image={seoImage}
        type="product"
      />

      {/* Breadcrumb — theme-coloured hover and active */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <nav className="flex items-center gap-2 text-xs font-body" aria-label="Breadcrumb">
          <Link
            to="/"
            className={`transition-colors ${textMuted}`}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = theme.productLinkHover}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = ''}
          >
            Home
          </Link>
          <ChevronRight size={12} className={textMuted} aria-hidden="true" />
          <Link
            to={`/category/${product.category}`}
            className={`transition-colors capitalize ${textMuted}`}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = theme.productLinkHover}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = ''}
          >
            {product.category.replace(/-/g,' ')}
          </Link>
          <ChevronRight size={12} className={textMuted} aria-hidden="true" />
          {/* Active crumb — theme-coloured */}
          <span style={{ color: theme.accentPrimary }} className="truncate max-w-[180px]">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Left: Images ── */}
          <div style={{ animation: 'pdp-slide-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both' }}>
            <div className={`rounded-2xl overflow-hidden mb-3 ${card} border relative`} style={{ height: '500px' }}>
              <img
                key={selectedImage}
                src={product.images[selectedImage]}
                alt={`${product.name} — image ${selectedImage + 1}`}
                className="w-full h-full object-cover"
                style={{ animation: 'pdp-fade-in 0.4s ease' }}
                loading="eager"
              />

              {/* Carousel dots — theme-coloured active dot */}
              {product.images.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {product.images.map((_, i) => (
                    <button
                      key={i} onClick={() => handleThumbClick(i)}
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

              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                  <span className="text-white font-semibold font-body text-lg">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Thumbnails — theme-coloured active border */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i} onClick={() => handleThumbClick(i)}
                  className={`pdp-thumb rounded-xl overflow-hidden border-2`}
                  style={{
                    height: '90px',
                    borderColor: i === selectedImage
                      ? theme.accentPrimary
                      : isDark ? 'transparent' : 'transparent',
                    borderWidth: '2px',
                  }}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={i === selectedImage}
                >
                  <img src={img} alt={`${product.name} thumbnail ${i + 1}`}
                    className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>

            {product.images.length > 1 && (
              <p className={`text-xs text-center mt-2 font-body ${textMuted}`} style={{ opacity: 0.6 }}>
                Auto-cycling images · click a thumbnail to pause
              </p>
            )}
          </div>

          {/* ── Right: Details ── */}
          <div style={{ animation: 'pdp-slide-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.22s both' }}>

            {/* Fabric / category badge — theme-coloured */}
            <p
              className="text-xs uppercase font-label mb-2"
              style={{ letterSpacing: '0.22em', color: theme.accentSecondary }}
            >
              {product.fabric} · {product.category.replace(/-/g,' ')}
            </p>

            <h1 className={`mb-3 leading-tight ${textPrimary}`} style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(1.8rem,3vw,2.6rem)',
              fontWeight: 400, lineHeight: 1.1,
            }}>
              {product.name}
            </h1>

            {/* Thread divider under title */}
            <div style={{ marginBottom: '16px' }}>
              <ThreadDivider />
            </div>

            <p className={`text-xs mb-4 font-body ${textMuted}`}>
              Product ID: <span className="font-mono tracking-wider">{product.id}</span>
            </p>

            {/* Star rating */}
            {showRating && (
              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={product.rating} size={16} />
                <span className={`text-sm font-body ${textMuted}`}>
                  {product.rating} ({product.review_count} {product.review_count === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            {/* Price + discount badge */}
            <div className="flex items-center gap-4 mb-4">
              {product.discount_price ? (
                <>
                  <span className="font-bold" style={{
                    fontSize: '1.8rem',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    color: theme.accentSecondary,
                  }}>
                    ₹{product.discount_price.toLocaleString()}
                  </span>
                  <div>
                    <span className={`text-base line-through font-body ${textMuted}`}>
                      ₹{product.price.toLocaleString()}
                    </span>
                    {/* Discount badge — theme-coloured pill */}
                    <span
                      className="ml-2 text-xs font-bold font-body px-2.5 py-1 rounded-full"
                      style={{
                        background: theme.productBadgeBg,
                        color: theme.productBadgeText,
                        animation: 'pdp-badge-in 0.5s cubic-bezier(0.22,1,0.36,1) 0.5s both',
                        display: 'inline-block',
                      }}
                    >
                      {discount}% off
                    </span>
                  </div>
                </>
              ) : (
                <span className="font-bold" style={{
                  fontSize: '1.8rem',
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  color: theme.accentSecondary,
                }}>
                  ₹{product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock status */}
            <p className={`text-sm font-semibold mb-4 font-body`} style={{
              color: product.stock === 0
                ? theme.accentPrimary
                : product.stock <= 5
                  ? '#d97706'   // amber — universal warning colour
                  : '#16a34a',  // green — universal in-stock colour
            }}>
              {product.stock === 0 ? '✗ Out of Stock'
               : product.stock <= 5 ? `⚠ Only ${product.stock} left in stock!`
               : '✓ In Stock'}
            </p>

            {/* Colour swatches */}
            {hasColors && (
              <div className="mb-6">
                <p className={`text-sm font-semibold mb-2 font-body ${textPrimary}`}>Colour</p>
                <div className="flex gap-2">
                  {activeColors.map((color, i) => (
                    <button
                      key={color} onClick={() => setSelectedColor(i)}
                      className="w-8 h-8 rounded-full transition-all hover:scale-110"
                      style={{
                        background: color,
                        border: `2px solid ${i === selectedColor ? theme.accentPrimary : 'transparent'}`,
                        transform: i === selectedColor ? 'scale(1.10)' : 'scale(1)',
                      }}
                      aria-label={`Select colour ${i + 1}`}
                      aria-pressed={i === selectedColor}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* CTA — WhatsApp (brand green, not theme) */}
            <div className="mb-8">
              <a
                href={whatsappLink} target="_blank" rel="noopener noreferrer"
                className={`pdp-wa-btn w-full flex items-center justify-center gap-3 py-4 rounded-full font-bold font-body text-sm uppercase ${product.stock === 0 ? 'disabled' : ''}`}
                style={{
                  background: '#25D366',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
                  letterSpacing: '0.15em',
                  pointerEvents: product.stock === 0 ? 'none' : 'auto',
                  opacity: product.stock === 0 ? 0.5 : 1,
                  textDecoration: 'none',
                }}
              >
                <MessageCircle size={18} />
                {product.stock === 0 ? 'Out of Stock' : 'Order via WhatsApp'}
              </a>
            </div>

            {/* Accordions */}
            <div className="space-y-2 mb-6">
              {accordions.map(acc => (
                <div key={acc.id} className={`rounded-xl border overflow-hidden ${card}`}>
                  <button
                    className={`pdp-accordion-btn w-full flex items-center justify-between px-5 py-4 text-sm font-semibold font-body text-left ${textPrimary}`}
                    onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}
                    aria-expanded={openAccordion === acc.id}
                    aria-controls={`accordion-${acc.id}`}
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

            {/* Share icons */}
            <div>
              <p className={`text-sm font-semibold mb-2 font-body ${textPrimary}`}>Share this product</p>
              <div className="flex gap-3">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="pdp-share-icon w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: '#25D366' }} aria-label="Share on WhatsApp">
                  <MessageCircle size={16} color="white" />
                </a>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                  className="pdp-share-icon w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}
                  aria-label="Share on Instagram">
                  <Instagram size={16} color="white" />
                </a>
                <a href="#"
                  className="pdp-share-icon w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: '#1877F2' }} aria-label="Share on Facebook">
                  <Facebook size={16} color="white" />
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