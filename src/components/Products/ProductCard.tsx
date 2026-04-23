// src/components/Products/ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';

export interface Product {
  id:             string;
  name:           string;
  category:       string;
  fabric:         string;
  price:          number;
  discount_price: number | null;
  stock:          number;
  colors:         string[];
  images:         string[];
  description:    string;
  saree_fabric:   string;
  saree_length:   string;
  blouse_length:  string;
  blouse_fabric:  string;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_featured:    boolean;
  show_rating:    boolean;
  show_colors:    boolean;
  is_visible?:    boolean;
  rating:         number;
  review_count:   number;
  created_at?:    string;
}

interface Props {
  product: Product;
  compact?: boolean;
}

export const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 12 }) => (
  <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map(s => (
      <Star
        key={s}
        size={size}
        fill={s <= Math.round(rating) ? '#b6893c' : 'none'}
        style={{ color: s <= Math.round(rating) ? '#b6893c' : '#d1c5a5' }}
      />
    ))}
  </div>
);

const ProductCard: React.FC<Props> = ({ product, compact = false }) => {
  const { isDark } = useTheme();
  const { whatsapp_number } = useSettings();

  const buildWhatsAppLink = () => {
    const text = `Hi! I'm interested in:\n*${product.name}* (ID: ${product.id})\nCategory: ${product.category.replace(/-/g, ' ')}\nPrice: ₹${product.discount_price || product.price}\nFabric: ${product.fabric}\n\nCould you please help me with this product?`;
    return `https://wa.me/${whatsapp_number}?text=${encodeURIComponent(text)}`;
  };

  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(buildWhatsAppLink(), '_blank', 'noopener,noreferrer');
  };

  const shouldShowRating =
    product.show_rating === true &&
    product.rating > 0 &&
    product.review_count > 0;

  const activeColors = (product.colors || []).filter(c => c && c.trim() !== '');
  const shouldShowColors =
    product.show_colors !== false &&
    activeColors.length > 0;

  // ── Compact card ──────────────────────────────────────────────────────────
  if (compact) {
    return (
      <Link
        to={`/product/${product.id}`}
        className="flex-shrink-0 group block rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        style={{ width: '200px' }}
        aria-label={`View ${product.name}`}
      >
        <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
          <img src={product.images[0]} alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy" />
          {product.is_new_arrival && (
            <span className="absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full font-body font-semibold"
              style={{ background: '#bc3d3e', color: '#e9e3cb' }}>New</span>
          )}
          {discount > 0 && (
            <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-body font-semibold"
              style={{ background: '#b6893c', color: '#e9e3cb' }}>-{discount}%</span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold font-body text-sm">Out of Stock</span>
            </div>
          )}
        </div>
        <div className={`p-3 ${isDark ? 'bg-dark-card' : 'bg-white'}`}>
          <p className="text-xs mb-0.5 font-body text-brand-gold" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {product.category.replace(/-/g, ' ')}
          </p>
          <h3 className={`text-sm font-semibold mb-1 line-clamp-2 leading-tight ${isDark ? 'text-dark-text' : 'text-stone-800'}`}
            style={{ fontFamily: '"Raleway", sans-serif' }}>
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {product.discount_price ? (
              <>
                <span className="font-bold text-brand-red font-body text-sm">₹{product.discount_price.toLocaleString()}</span>
                <span className={`text-xs line-through font-body ${isDark ? 'text-dark-muted' : 'text-stone-400'}`}>₹{product.price.toLocaleString()}</span>
              </>
            ) : (
              <span className="font-bold text-brand-red font-body text-sm">₹{product.price.toLocaleString()}</span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // ── Full card ─────────────────────────────────────────────────────────────
  return (
    <div className={`product-card group rounded-xl overflow-hidden border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-stone-100'}`}>

      {/* ── Image section ── */}
      <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`}>
        <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1" style={{ zIndex: 2 }}>
            {product.is_new_arrival && (
              <span className="font-body font-bold" style={{
                fontSize: '0.62rem', letterSpacing: '0.08em',
                padding: '3px 9px', borderRadius: '20px',
                background: '#bc3d3e', color: '#faf6ef',
              }}>NEW</span>
            )}
            {product.is_best_seller && (
              <span className="font-body font-bold" style={{
                fontSize: '0.62rem', letterSpacing: '0.08em',
                padding: '3px 9px', borderRadius: '20px',
                background: '#b6893c', color: '#faf6ef',
              }}>BEST SELLER</span>
            )}
          </div>

          {/* Discount badge — TOP RIGHT */}
          {discount > 0 && (
            <div className="absolute top-3 right-3" style={{ zIndex: 2 }}>
              <span className="font-body" style={{
                display: 'inline-flex', alignItems: 'center',
                background: 'linear-gradient(135deg, #e05c1a 0%, #c94a10 100%)',
                color: '#fff', fontSize: '0.72rem', fontWeight: 900,
                letterSpacing: '0.03em', padding: '4px 8px',
                borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                lineHeight: 1,
              }}>
                {discount}% OFF
              </span>
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 3 }}>
              <span className="text-white font-semibold font-body">Out of Stock</span>
            </div>
          )}

          {/* ── Desktop: WhatsApp hover button (bottom-right of image) ── */}
          {product.stock !== 0 && (
            <a
              href={buildWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="hidden md:flex absolute bottom-3 right-3 items-center gap-1.5 rounded-lg font-body
                         opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
                         transition-all duration-200"
              style={{
                background: '#25D366', color: '#fff', fontSize: '0.68rem',
                fontWeight: 900, letterSpacing: '0.07em', padding: '7px 12px',
                boxShadow: '0 2px 12px rgba(37,211,102,0.5)', zIndex: 2,
                textDecoration: 'none',
              }}
              aria-label={`Buy ${product.name} on WhatsApp`}
            >
              <MessageCircle size={13} />
              BUY
            </a>
          )}

          {/* ── Mobile: WhatsApp button always visible at bottom center ── */}
          {product.stock !== 0 && (
            <a
              href={buildWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full font-body"
              style={{
                background: '#25D366', color: '#fff', fontSize: '0.65rem',
                fontWeight: 900, letterSpacing: '0.06em', padding: '6px 14px',
                boxShadow: '0 2px 10px rgba(37,211,102,0.5)', zIndex: 2,
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}
              aria-label={`Buy ${product.name} on WhatsApp`}
            >
              <MessageCircle size={12} />
              BUY
            </a>
          )}
        </div>
      </Link>

      {/* ── Card info ── */}
      <div className="p-3 md:p-4">

        {/* ── MOBILE: Minimal — just name + price ── */}
        <div className="md:hidden">
          <Link to={`/product/${product.id}`}>
            <h3
              className={`font-semibold mb-1.5 leading-tight ${isDark ? 'text-dark-text' : 'text-stone-800'}`}
              style={{
                fontFamily: '"Raleway", sans-serif',
                fontSize: '0.82rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {product.name}
            </h3>
          </Link>
          <div className="flex items-baseline gap-1.5">
            {product.discount_price ? (
              <>
                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#bc3d3e', fontFamily: '"Raleway", sans-serif' }}>
                  ₹{product.discount_price.toLocaleString()}
                </span>
                <span className={`text-xs line-through font-body ${isDark ? 'text-dark-muted' : 'text-stone-400'}`}>
                  ₹{product.price.toLocaleString()}
                </span>
              </>
            ) : (
              <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#bc3d3e', fontFamily: '"Raleway", sans-serif' }}>
                ₹{product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* ── DESKTOP: Full details ── */}
        <div className="hidden md:block">
          <p className="font-body mb-1.5" style={{
            fontSize: '0.58rem', letterSpacing: '0.2em',
            fontWeight: 700, textTransform: 'uppercase', color: '#b6893c',
          }}>
            {product.fabric}
          </p>

          {shouldShowRating && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <StarRating rating={product.rating} />
              <span className={`font-body ${isDark ? 'text-dark-muted' : 'text-stone-500'}`}
                style={{ fontSize: '0.68rem' }}>
                ({product.review_count})
              </span>
            </div>
          )}

          {shouldShowColors && (
            <div className="flex gap-1.5 mb-2">
              {activeColors.map(c => (
                <div key={c} className="w-4 h-4 rounded-full"
                  style={{ background: c, border: '1.5px solid rgba(0,0,0,0.15)', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
                  aria-label={`Color: ${c}`} />
              ))}
            </div>
          )}

          <Link to={`/product/${product.id}`}>
            <h3
              className="mb-2 transition-colors"
              style={{
                fontFamily: '"Raleway", sans-serif', fontSize: '0.9rem',
                fontWeight: 800, lineHeight: 1.35,
                color: isDark ? '#f0e8d6' : '#1a1410',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#bc3d3e'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = isDark ? '#f0e8d6' : '#1a1410'}
            >
              {product.name}
            </h3>
          </Link>

          {/* Price row — desktop shows price + stock only (BUY is on hover over image) */}
          <div>
            {product.discount_price ? (
              <div className="flex items-baseline gap-2">
                <span className="font-body" style={{ fontSize: '1.05rem', fontWeight: 900, color: '#bc3d3e', letterSpacing: '-0.01em' }}>
                  ₹{product.discount_price.toLocaleString()}
                </span>
                <span className="font-body line-through" style={{ fontSize: '0.76rem', fontWeight: 500, color: isDark ? '#64748b' : '#a8a29e' }}>
                  ₹{product.price.toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="font-body" style={{ fontSize: '1.05rem', fontWeight: 900, color: '#bc3d3e', letterSpacing: '-0.01em' }}>
                ₹{product.price.toLocaleString()}
              </span>
            )}
            <p className="font-body mt-0.5" style={{
              fontSize: '0.68rem', fontWeight: 600,
              color: product.stock === 0 ? '#ef4444' : product.stock <= 5 ? '#f97316' : isDark ? '#6b7280' : '#9ca3af',
            }}>
              {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;