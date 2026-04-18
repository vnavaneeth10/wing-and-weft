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
  // ✅ whatsapp_number comes from SettingsContext — reflects admin dashboard value
  const { whatsapp_number } = useSettings();

  const buildWhatsAppLink = () => {
    const text = `Hi! I'm interested in:\n*${product.name}* (ID: ${product.id})\nCategory: ${product.category.replace(/-/g, ' ')}\nPrice: ₹${product.discount_price || product.price}\nFabric: ${product.fabric}\n\nCould you please help me with this product?`;
    return `https://wa.me/${whatsapp_number}?text=${encodeURIComponent(text)}`;
  };

  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  // ✅ handleShare uses buildWhatsAppLink() which reads from context — hover icon works correctly
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
        {/* Strict 3:4 image box */}
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
        {/* Strict 3:4 aspect ratio container with absolute-positioned image */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.is_new_arrival && (
              <span className="text-xs px-2 py-0.5 rounded-full font-body font-semibold" style={{ background: '#bc3d3e', color: '#e9e3cb' }}>
                New Arrival
              </span>
            )}
            {product.is_best_seller && (
              <span className="text-xs px-2 py-0.5 rounded-full font-body font-semibold" style={{ background: '#b6893c', color: '#e9e3cb' }}>
                Best Seller
              </span>
            )}
          </div>

          {discount > 0 && (
            <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-body font-semibold" style={{ background: '#e69358', color: '#fff' }}>
              -{discount}%
            </span>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold font-body">Out of Stock</span>
            </div>
          )}

          {/* ✅ Hover WhatsApp share button — uses handleShare → buildWhatsAppLink() → context number */}
          <button
            onClick={handleShare}
            className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0"
            style={{ background: '#25D366', color: '#fff' }}
            aria-label={`Share ${product.name} on WhatsApp`}
          >
            <MessageCircle size={14} />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <p className="text-xs mb-1 font-body uppercase tracking-wide text-brand-gold">{product.fabric}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className={`font-semibold mb-2 line-clamp-2 font-body hover:text-brand-red transition-colors ${isDark ? 'text-dark-text' : 'text-stone-800'}`}>
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <StarRating rating={product.rating} />
          <span className={`text-xs font-body ${isDark ? 'text-dark-muted' : 'text-stone-500'}`}>({product.review_count})</span>
        </div>

        {/* Colors — only render if colors exist and have actual values */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1 mb-3">
            {product.colors.map((c) => (
              <div key={c} className="w-4 h-4 rounded-full border border-white/20" style={{ background: c }} aria-label={`Color: ${c}`} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            {product.discount_price ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-brand-red font-body">₹{product.discount_price.toLocaleString()}</span>
                <span className={`text-xs line-through font-body ${isDark ? 'text-dark-muted' : 'text-stone-400'}`}>₹{product.price.toLocaleString()}</span>
              </div>
            ) : (
              <span className="font-bold text-brand-red font-body">₹{product.price.toLocaleString()}</span>
            )}
            <p className={`text-xs mt-0.5 font-body ${product.stock === 0 ? 'text-red-500' : product.stock <= 5 ? 'text-orange-500' : isDark ? 'text-dark-muted' : 'text-stone-500'}`}>
              {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock'}
            </p>
          </div>

          {/* ✅ Buy button — uses buildWhatsAppLink() → context number */}
          <a
            href={buildWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold font-body transition-all hover:scale-105"
            style={{ background: '#25D366', color: '#fff' }}
            aria-label={`Buy ${product.name} on WhatsApp`}
          >
            <MessageCircle size={12} />
            Buy
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;