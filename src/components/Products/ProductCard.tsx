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
  rating:         number;
  review_count:   number;
  created_at?:    string;
  is_visible?:    boolean;
}

interface Props {
  product: Product;
  compact?: boolean;
}

export const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 12 }) => (
  <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={size}
        className={s <= Math.round(rating) ? 'star-filled' : 'star-empty'}
        fill={s <= Math.round(rating) ? '#b6893c' : 'none'}
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
          <img
            src={product.images[0]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {product.is_new_arrival && (
            <span
              className="absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full font-body font-semibold"
              style={{ background: '#bc3d3e', color: '#e9e3cb' }}
            >
              New
            </span>
          )}
          {discount > 0 && (
            <span
              className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-body font-semibold"
              style={{ background: '#b6893c', color: '#e9e3cb' }}
            >
              -{discount}%
            </span>
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
      <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`}>
        <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Top-left: New Arrival / Best Seller badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1" style={{ zIndex: 2 }}>
            {product.is_new_arrival && (
              <span
                className="font-body font-bold"
                style={{
                  fontSize:      '0.62rem',
                  letterSpacing: '0.08em',
                  padding:       '3px 9px',
                  borderRadius:  '20px',
                  background:    '#bc3d3e',
                  color:         '#faf6ef',
                }}
              >
                NEW ARRIVAL
              </span>
            )}
            {product.is_best_seller && (
              <span
                className="font-body font-bold"
                style={{
                  fontSize:      '0.62rem',
                  letterSpacing: '0.08em',
                  padding:       '3px 9px',
                  borderRadius:  '20px',
                  background:    '#b6893c',
                  color:         '#faf6ef',
                }}
              >
                BEST SELLER
              </span>
            )}
          </div>

          {/* ✅ Discount badge — bottom-left of image, large + bold for easy customer catch.
              Moved away from top-right (cluttered with badges) to stand alone prominently. */}
          {discount > 0 && (
            <div className="absolute bottom-3 left-3" style={{ zIndex: 2 }}>
              <span
                className="font-body"
                style={{
                  display:       'inline-flex',
                  alignItems:    'center',
                  background:    'linear-gradient(135deg, #e05c1a 0%, #c94a10 100%)',
                  color:         '#fff',
                  fontSize:      '0.8rem',
                  fontWeight:    900,
                  letterSpacing: '0.03em',
                  padding:       '5px 10px',
                  borderRadius:  '6px',
                  boxShadow:     '0 2px 10px rgba(0,0,0,0.4)',
                  lineHeight:    1,
                }}
              >
                {discount}% OFF
              </span>
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 3 }}>
              <span className="text-white font-semibold font-body">Out of Stock</span>
            </div>
          )}

          {/* ✅ WhatsApp hover button — bottom-right, clear of discount badge */}
          <button
            onClick={handleShare}
            className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0"
            style={{
              background: '#25D366',
              color:      '#fff',
              boxShadow:  '0 2px 10px rgba(37,211,102,0.5)',
              zIndex:     2,
            }}
            aria-label={`Share ${product.name} on WhatsApp`}
          >
            <MessageCircle size={15} />
          </button>
        </div>
      </Link>

      {/* ── Card info ── */}
      <div className="p-4">
        {/* Fabric label — small, golden, spaced caps */}
        <p
          className="font-body mb-1"
          style={{
            fontSize:      '0.58rem',
            letterSpacing: '0.2em',
            fontWeight:    700,
            textTransform: 'uppercase',
            color:         '#b6893c',
          }}
        >
          {product.fabric}
        </p>

        {/* ✅ Product name — notably bolder + slightly larger for readability */}
        <Link to={`/product/${product.id}`}>
          <h3
            className="mb-2 line-clamp-2 transition-colors"
            style={{
              fontFamily:  '"Raleway", sans-serif',
              fontSize:    '0.9rem',
              fontWeight:  800,
              lineHeight:  1.35,
              color:       isDark ? '#f0e8d6' : '#1a1410',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#bc3d3e'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = isDark ? '#f0e8d6' : '#1a1410'}
          >
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <StarRating rating={product.rating} />
          <span className={`font-body ${isDark ? 'text-dark-muted' : 'text-stone-500'}`}
            style={{ fontSize: '0.7rem' }}>
            ({product.review_count})
          </span>
        </div>

        {/* Color swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1.5 mb-3">
            {product.colors.map((c) => (
              <div
                key={c}
                className="w-4 h-4 rounded-full"
                style={{ background: c, border: '1.5px solid rgba(0,0,0,0.15)', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
                aria-label={`Color: ${c}`}
              />
            ))}
          </div>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between mt-1">
          <div>
            {product.discount_price ? (
              <div className="flex items-baseline gap-2">
                {/* ✅ Sale price — larger, heavier weight */}
                <span
                  className="font-body"
                  style={{ fontSize: '1.05rem', fontWeight: 900, color: '#bc3d3e', letterSpacing: '-0.01em' }}
                >
                  ₹{product.discount_price.toLocaleString()}
                </span>
                {/* Original — struck through, clearly muted */}
                <span
                  className="font-body line-through"
                  style={{ fontSize: '0.76rem', fontWeight: 500, color: isDark ? '#64748b' : '#a8a29e' }}
                >
                  ₹{product.price.toLocaleString()}
                </span>
              </div>
            ) : (
              <span
                className="font-body"
                style={{ fontSize: '1.05rem', fontWeight: 900, color: '#bc3d3e', letterSpacing: '-0.01em' }}
              >
                ₹{product.price.toLocaleString()}
              </span>
            )}
            {/* Stock status */}
            <p
              className="font-body mt-0.5"
              style={{
                fontSize:   '0.68rem',
                fontWeight: 600,
                color: product.stock === 0
                  ? '#ef4444'
                  : product.stock <= 5
                    ? '#f97316'
                    : isDark ? '#6b7280' : '#9ca3af',
              }}
            >
              {product.stock === 0
                ? 'Out of Stock'
                : product.stock <= 5
                  ? `Only ${product.stock} left`
                  : 'In Stock'}
            </p>
          </div>

          {/* ✅ Buy button — bolder text, slightly larger tap target */}
          <a
            href={buildWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg font-body transition-all hover:scale-105 active:scale-95"
            style={{
              background:    '#25D366',
              color:         '#fff',
              fontSize:      '0.7rem',
              fontWeight:    900,
              letterSpacing: '0.07em',
              padding:       '8px 14px',
              boxShadow:     '0 2px 8px rgba(37,211,102,0.4)',
            }}
            aria-label={`Buy ${product.name} on WhatsApp`}
          >
            <MessageCircle size={13} />
            BUY
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;