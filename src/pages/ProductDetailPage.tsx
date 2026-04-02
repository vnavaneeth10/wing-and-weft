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

const ProductDetailPage: React.FC = () => {
  const { productId }   = useParams<{ productId: string }>();
  const { isDark }      = useTheme();
  const { product, loading } = useProduct(productId || '');

  const [selectedImage, setSelectedImage]   = useState(0);
  const [selectedColor, setSelectedColor]   = useState(0);
  const [openAccordion, setOpenAccordion]   = useState<string | null>('description');
  const [settings, setSettings]             = useState<Record<string, string>>({});
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { fetchSettings().then(setSettings); }, []);

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

  const handleThumbClick = (i: number) => {
    stopAutoSlide();
    setSelectedImage(i);
  };

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
  const seoImage       = product?.images?.[0];

  const bg          = isDark ? 'bg-dark-bg'    : 'bg-brand-cream';
  const card        = isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-brand-cream-dark';
  const textPrimary = isDark ? 'text-dark-text'  : 'text-brand-ink';
  const textMuted   = isDark ? 'text-dark-muted' : 'text-brand-ink-muted';

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
              {[1/3, 3/4, 1/4, 1/2].map((w,i) => (
                <div key={i} className="shimmer h-6 rounded" style={{ width: `${w*100}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`min-h-screen ${bg} pt-24 flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-6xl mb-4">🕊️</p>
          <h2 className={textPrimary} style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem', fontWeight: 400 }}>
            Product Not Found
          </h2>
          <Link to="/" className="text-brand-red hover:underline text-sm font-body mt-2 block">Back to Home</Link>
        </div>
      </div>
    );
  }

  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const whatsappText = `Hi! I'm interested in:\n*${product.name}* (ID: ${product.id})\nCategory: ${product.category.replace(/-/g,' ')}\nPrice: ₹${product.discount_price || product.price}\nFabric: ${product.fabric}\n\nCould you please help me with this product?`;
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`;

  // ── Derived guards ──────────────────────────────────────────────────────────

  // Colours — only render when colours are set AND admin has enabled show_colors
  const activeColors = (product.colors || []).filter(c => c && c.trim() !== '');
  const hasColors    = (product as any).show_colors !== false && activeColors.length > 0;

  // Star rating — per-product toggle AND must have a rating value AND review count
  const globalRatingsOn = settings['show_ratings'] !== 'false';
  const showRating = (
    globalRatingsOn &&
    (product as any).show_rating === true &&
    product.rating > 0 &&
    product.review_count > 0
  );

  // Free-form specifications — rows where both key and value are filled
  interface SpecRow { key: string; value: string; }
  const specRows: SpecRow[] = ((product as any).specifications || []).filter(
    (s: SpecRow) => s.key?.trim() && s.value?.trim()
  );
  const hasSpecs = specRows.length > 0;

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
    // Specifications accordion — only present when admin has added spec rows
    ...(hasSpecs ? [{
      id: 'specifications',
      title: 'Saree Specifications',
      content: (
        <div className="space-y-0">
          {specRows.map(({ key, value }) => (
            <div key={key} className="flex justify-between py-2.5 border-b last:border-0"
              style={{ borderColor: isDark ? '#3a2e24' : '#EDE5D4' }}>
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
              <span className="text-brand-gold mt-0.5">•</span>
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

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <nav className="flex items-center gap-2 text-xs font-body" aria-label="Breadcrumb">
          <Link to="/" className={`${textMuted} hover:text-brand-red transition-colors`}>Home</Link>
          <ChevronRight size={12} className={textMuted} aria-hidden="true" />
          <Link to={`/category/${product.category}`}
            className={`${textMuted} hover:text-brand-red transition-colors capitalize`}>
            {product.category.replace(/-/g,' ')}
          </Link>
          <ChevronRight size={12} className={textMuted} aria-hidden="true" />
          <span className="text-brand-red truncate max-w-[180px]">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Left: Images ── */}
          <div>
            <div className={`rounded-2xl overflow-hidden mb-3 ${card} border relative`}
              style={{ height: '500px' }}>
              <img
                key={selectedImage}
                src={product.images[selectedImage]}
                alt={`${product.name} — image ${selectedImage + 1}`}
                className="w-full h-full object-cover transition-opacity duration-500"
                style={{ opacity: 1, animation: 'fadeIn 0.4s ease' }}
                loading="eager"
              />
              {product.images.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {product.images.map((_, i) => (
                    <button key={i} onClick={() => handleThumbClick(i)}
                      className="transition-all duration-300 rounded-full"
                      style={{
                        width: i === selectedImage ? '20px' : '6px',
                        height: '6px',
                        background: i === selectedImage
                          ? 'linear-gradient(90deg, #bc3d3e, #b6893c)'
                          : 'rgba(255,255,255,0.5)',
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

            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => handleThumbClick(i)}
                  className={`rounded-xl overflow-hidden border-2 transition-all ${
                    i === selectedImage ? 'border-brand-red' : isDark ? 'border-dark-border' : 'border-transparent'
                  }`}
                  style={{ height: '90px' }}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={i === selectedImage}>
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
          <div>
            <p className="text-brand-gold text-xs uppercase font-label mb-2" style={{ letterSpacing: '0.22em' }}>
              {product.fabric} · {product.category.replace(/-/g,' ')}
            </p>

            <h1 className={`mb-3 leading-tight ${textPrimary}`}
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 400, lineHeight: 1.1 }}>
              {product.name}
            </h1>

            <p className={`text-xs mb-4 font-body ${textMuted}`}>
              Product ID: <span className="font-mono tracking-wider">{product.id}</span>
            </p>

            {/* ── Star rating — shown only when admin enabled it for this product ── */}
            {showRating && (
              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={product.rating} size={16} />
                <span className={`text-sm font-body ${textMuted}`}>
                  {product.rating} ({product.review_count} {product.review_count === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-4 mb-4">
              {product.discount_price ? (
                <>
                  <span className="font-bold text-brand-gold"
                    style={{ fontSize: '1.8rem', fontFamily: '"DM Sans", system-ui, sans-serif' }}>
                    ₹{product.discount_price.toLocaleString()}
                  </span>
                  <div>
                    <span className={`text-base line-through font-body ${textMuted}`}>
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="ml-2 text-sm font-semibold font-body text-brand-gold-light">
                      {discount}% off
                    </span>
                  </div>
                </>
              ) : (
                <span className="font-bold text-brand-gold"
                  style={{ fontSize: '1.8rem', fontFamily: '"DM Sans", system-ui, sans-serif' }}>
                  ₹{product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock */}
            <p className={`text-sm font-semibold mb-4 font-body ${
              product.stock === 0 ? 'text-brand-red'
              : product.stock <= 5 ? 'text-brand-orange'
              : 'text-green-600'
            }`}>
              {product.stock === 0 ? '✗ Out of Stock'
               : product.stock <= 5 ? `⚠ Only ${product.stock} left in stock!`
               : '✓ In Stock'}
            </p>

            {/* ── Colours — only shown when admin has enabled show_colors ── */}
            {hasColors && (
              <div className="mb-6">
                <p className={`text-sm font-semibold mb-2 font-body ${textPrimary}`}>Colour</p>
                <div className="flex gap-2">
                  {activeColors.map((color, i) => (
                    <button key={color} onClick={() => setSelectedColor(i)}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                        i === selectedColor ? 'border-brand-red scale-110' : 'border-transparent'
                      }`}
                      style={{ background: color }}
                      aria-label={`Select colour ${i + 1}`}
                      aria-pressed={i === selectedColor} />
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mb-8">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-full font-bold font-body text-sm uppercase transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                  product.stock === 0 ? 'opacity-50 pointer-events-none' : ''
                }`}
                style={{ background: '#25D366', color: '#fff', boxShadow: '0 4px 20px rgba(37,211,102,0.4)', letterSpacing: '0.15em' }}>
                <MessageCircle size={18} />
                {product.stock === 0 ? 'Out of Stock' : 'Order via WhatsApp'}
              </a>
            </div>

            {/* Accordions */}
            <div className="space-y-2 mb-6">
              {accordions.map(acc => (
                <div key={acc.id} className={`rounded-xl border overflow-hidden ${card}`}>
                  <button
                    className={`w-full flex items-center justify-between px-5 py-4 text-sm font-semibold font-body text-left transition-colors ${textPrimary} hover:text-brand-red`}
                    onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}
                    aria-expanded={openAccordion === acc.id}
                    aria-controls={`accordion-${acc.id}`}>
                    {acc.title}
                    <ChevronDown size={16}
                      className={`transition-transform duration-200 flex-shrink-0 ${openAccordion === acc.id ? 'rotate-180' : ''}`}
                      aria-hidden="true" />
                  </button>
                  {openAccordion === acc.id && (
                    <div id={`accordion-${acc.id}`} className={`px-5 pb-4 border-t ${isDark ? 'border-dark-border' : 'border-brand-cream-dark'}`}>
                      <div className="pt-3">{acc.content}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Share */}
            <div>
              <p className={`text-sm font-semibold mb-2 font-body ${textPrimary}`}>Share this product</p>
              <div className="flex gap-3">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: '#25D366' }} aria-label="Share on WhatsApp">
                  <MessageCircle size={16} color="white" />
                </a>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}
                  aria-label="Share on Instagram">
                  <Instagram size={16} color="white" />
                </a>
                <a href="#"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: '#1877F2' }} aria-label="Share on Facebook">
                  <Facebook size={16} color="white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;