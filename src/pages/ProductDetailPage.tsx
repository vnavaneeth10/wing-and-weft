// src/pages/ProductDetailPage.tsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { getWhatsAppLink, INSTAGRAM_URL } from '../data/products'; // ← keep WhatsApp helper
import { useTheme } from '../context/ThemeContext';
import { StarRating } from '../components/Products/ProductCard';
//import { useProduct } from '../hooks/useProducts'; // ✅ NEW: fetch from Supabase
import { WHATSAPP_NUMBER } from '../data/products';
import { useProduct } from '../hooks/useProducts';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { isDark } = useTheme();

  // ✅ CHANGED: fetch single product live from Supabase
  const { product, loading } = useProduct(productId || '');

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>('description');

  const bg = isDark ? 'bg-dark-bg' : 'bg-stone-50';
  const card = isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-stone-200';
  const textPrimary = isDark ? 'text-dark-text' : 'text-stone-800';
  const textMuted = isDark ? 'text-dark-muted' : 'text-stone-500';

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${bg} pt-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <div className="space-y-3">
              <div className="shimmer rounded-2xl w-full" style={{ height: '500px' }} />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="shimmer rounded-xl" style={{ height: '90px' }} />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="shimmer h-4 rounded w-1/3" />
              <div className="shimmer h-8 rounded w-3/4" />
              <div className="shimmer h-4 rounded w-1/4" />
              <div className="shimmer h-10 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!product) {
    return (
      <div className={`min-h-screen ${bg} pt-24 flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-6xl mb-4">🕊️</p>
          <h2
            className={textPrimary}
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem' }}
          >
            Product Not Found
          </h2>
          <Link to="/" className="text-brand-red hover:underline text-sm font-body mt-2 block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // ✅ CHANGED: use discount_price (snake_case) instead of discountPrice
  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  // ✅ CHANGED: build WhatsApp link directly using DB fields (no more product.specifications)
  const whatsappText = `Hi! I'm interested in:\n*${product.name}* (ID: ${product.id})\nCategory: ${product.category.replace('-', ' ')}\nPrice: ₹${product.discount_price || product.price}\nFabric: ${product.fabric}\n\nCould you please help me with this product?`;
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`;

  const accordions = [
    {
      id: 'description',
      title: 'Detailed Description',
      content: (
        <p className={`text-sm font-body leading-relaxed ${textMuted}`}>{product.description}</p>
      ),
    },
    {
      id: 'specifications',
      title: 'Saree Specifications',
      content: (
        <div className="space-y-2">
          {/* ✅ CHANGED: flat DB fields instead of product.specifications.sareeFabric etc. */}
          {Object.entries({
            'Saree Fabric': product.saree_fabric,
            'Saree Length': product.saree_length,
            'Blouse Length': product.blouse_length,
            'Blouse Fabric': product.blouse_fabric,
          }).map(([key, val]) => (
            <div
              key={key}
              className="flex justify-between py-2 border-b last:border-0"
              style={{ borderColor: isDark ? '#3a2e24' : '#f0ebe0' }}
            >
              <span className={`text-sm font-semibold font-body ${textPrimary}`}>{key}</span>
              <span className={`text-sm font-body ${textMuted}`}>{val || '—'}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'policy',
      title: 'Policy',
      content: (
        <ul className="space-y-2">
          {[
            'Exchange accepted within 7 days of delivery.',
            'Product must be unused and in original packaging.',
            'Cancellation allowed within 12 hours of order placement.',
            'Refunds processed within 5-7 business days.',
            'Free shipping on orders above ₹2000.',
          ].map((item, i) => (
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
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <nav className="flex items-center gap-2 text-xs font-body" aria-label="Breadcrumb">
          <Link to="/" className={`${textMuted} hover:text-brand-red transition-colors`}>Home</Link>
          <ChevronRight size={12} className={textMuted} />
          <Link
            to={`/category/${product.category}`}
            className={`${textMuted} hover:text-brand-red transition-colors capitalize`}
          >
            {product.category.replace(/-/g, ' ')}
          </Link>
          <ChevronRight size={12} className={textMuted} />
          <span className="text-brand-red truncate max-w-32">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left — images */}
          <div>
            <div
              className={`rounded-2xl overflow-hidden mb-3 ${card} border relative`}
              style={{ height: '500px' }}
            >
              <img
                src={product.images[selectedImage]}
                alt={`${product.name} - image ${selectedImage + 1}`}
                className="w-full h-full object-cover transition-all duration-300"
                loading="eager"
              />
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
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`rounded-xl overflow-hidden border-2 transition-all ${
                    i === selectedImage
                      ? 'border-brand-red'
                      : isDark ? 'border-dark-border' : 'border-transparent'
                  }`}
                  style={{ height: '90px' }}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={i === selectedImage}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right — details */}
          <div>
            {/* Category + fabric */}
            <p
              className="text-brand-gold text-xs uppercase tracking-widest mb-2 font-body"
              style={{ letterSpacing: '0.2em' }}
            >
              {product.fabric} · {product.category.replace(/-/g, ' ')}
            </p>

            {/* Name */}
            <h1
              className={`mb-3 leading-tight ${textPrimary}`}
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                fontWeight: 600,
              }}
            >
              {product.name}
            </h1>

            {/* ID */}
            <p className={`text-xs mb-4 font-body ${textMuted}`}>Product ID: {product.id}</p>

            {/* Rating — ✅ CHANGED: review_count (snake_case) */}
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={product.rating} size={16} />
              <span className={`text-sm font-body ${textMuted}`}>
                {product.rating} ({product.review_count} reviews)
              </span>
            </div>

            {/* Price — ✅ CHANGED: discount_price (snake_case) */}
            <div className="flex items-center gap-4 mb-4">
              {product.discount_price ? (
                <>
                  <span
                    className="font-bold text-brand-red"
                    style={{ fontSize: '1.8rem', fontFamily: '"Raleway", sans-serif' }}
                  >
                    ₹{product.discount_price.toLocaleString()}
                  </span>
                  <div>
                    <span className={`text-base line-through font-body ${textMuted}`}>
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="ml-2 text-sm font-semibold font-body text-green-500">
                      {discount}% off
                    </span>
                  </div>
                </>
              ) : (
                <span
                  className="font-bold text-brand-red"
                  style={{ fontSize: '1.8rem', fontFamily: '"Raleway", sans-serif' }}
                >
                  ₹{product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock */}
            <p
              className={`text-sm font-semibold mb-4 font-body ${
                product.stock === 0
                  ? 'text-red-500'
                  : product.stock <= 5
                  ? 'text-orange-500'
                  : 'text-green-500'
              }`}
            >
              {product.stock === 0
                ? '✗ Out of Stock'
                : product.stock <= 5
                ? `⚠ Only ${product.stock} left in stock!`
                : '✓ In Stock'}
            </p>

            {/* Colors */}
            <div className="mb-6">
              <p className={`text-sm font-semibold mb-2 font-body ${textPrimary}`}>Color</p>
              <div className="flex gap-2">
                {product.colors.map((color, i) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(i)}
                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                      i === selectedColor ? 'border-brand-red scale-110' : 'border-transparent'
                    }`}
                    style={{ background: color }}
                    aria-label={`Select color ${i + 1}`}
                    aria-pressed={i === selectedColor}
                  />
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mb-8">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-full font-bold font-body text-sm uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                  product.stock === 0 ? 'opacity-50 pointer-events-none' : ''
                }`}
                style={{
                  background: '#25D366',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
                  letterSpacing: '0.15em',
                }}
              >
                <MessageCircle size={18} />
                {product.stock === 0 ? 'Out of Stock' : 'Order via WhatsApp'}
              </a>
            </div>

            {/* Accordions */}
            <div className="space-y-2 mb-6">
              {accordions.map((acc) => (
                <div key={acc.id} className={`rounded-xl border overflow-hidden ${card}`}>
                  <button
                    className={`w-full flex items-center justify-between px-5 py-4 text-sm font-semibold font-body text-left transition-colors ${textPrimary} hover:text-brand-red`}
                    onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}
                    aria-expanded={openAccordion === acc.id}
                  >
                    {acc.title}
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 flex-shrink-0 ${
                        openAccordion === acc.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openAccordion === acc.id && (
                    <div
                      className={`px-5 pb-4 border-t ${
                        isDark ? 'border-dark-border' : 'border-stone-100'
                      }`}
                    >
                      <div className="pt-3">{acc.content}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Share links */}
            <div>
              <p className={`text-sm font-semibold mb-2 font-body ${textPrimary}`}>Share this product</p>
              <div className="flex gap-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: '#25D366' }}
                  aria-label="Share on WhatsApp"
                >
                  <MessageCircle size={16} color="white" />
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
                  aria-label="Share on Instagram"
                >
                  <Instagram size={16} color="white" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: '#1877F2' }}
                  aria-label="Share on Facebook"
                >
                  <Facebook size={16} color="white" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews skeleton */}
        <div className="mt-16">
          <h2
            className={`mb-6 ${textPrimary}`}
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem', fontWeight: 600 }}
          >
            Customer Reviews
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`rounded-xl border p-5 ${card}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 rounded shimmer w-3/4" />
                    <div className="h-2 rounded shimmer w-1/2" />
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, s) => (
                    <div key={s} className="w-3 h-3 rounded shimmer" />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-2.5 rounded shimmer" />
                  <div className="h-2.5 rounded shimmer w-5/6" />
                  <div className="h-2.5 rounded shimmer w-4/6" />
                </div>
              </div>
            ))}
          </div>
          <p className={`text-center text-sm font-body mt-6 ${textMuted}`}>
            Be the first to review this product! Contact us on WhatsApp to share your feedback.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;