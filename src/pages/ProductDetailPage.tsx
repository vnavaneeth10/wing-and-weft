// src/pages/ProductDetailPage.tsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Instagram, Facebook, MessageCircle, Share2, Star } from 'lucide-react';
import { getProductById, getWhatsAppLink, INSTAGRAM_URL } from '../data/products';
import { useTheme } from '../context/ThemeContext';
import { StarRating } from '../components/Products/ProductCard';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { isDark } = useTheme();
  const product = getProductById(productId || '');

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>('description');

  const bg = isDark ? 'bg-dark-bg' : 'bg-stone-50';
  const card = isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-stone-200';
  const textPrimary = isDark ? 'text-dark-text' : 'text-stone-800';
  const textMuted = isDark ? 'text-dark-muted' : 'text-stone-500';

  if (!product) {
    return (
      <div className={`min-h-screen ${bg} pt-24 flex items-center justify-center`}>
        <div className="text-center">
          <p className={`text-6xl mb-4`}>🕊️</p>
          <h2 className={textPrimary} style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem' }}>
            Product Not Found
          </h2>
          <Link to="/" className="text-brand-red hover:underline text-sm font-body mt-2 block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

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
          {Object.entries({
            'Saree Fabric': product.specifications.sareeFabric,
            'Saree Length': product.specifications.sareeLength,
            'Blouse Length': product.specifications.blouseLength,
            'Blouse Fabric': product.specifications.blouseFabric,
          }).map(([key, val]) => (
            <div key={key} className="flex justify-between py-2 border-b last:border-0" style={{ borderColor: isDark ? '#3a2e24' : '#f0ebe0' }}>
              <span className={`text-sm font-semibold font-body ${textPrimary}`}>{key}</span>
              <span className={`text-sm font-body ${textMuted}`}>{val}</span>
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
          <Link to={`/category/${product.category}`} className={`${textMuted} hover:text-brand-red transition-colors capitalize`}>
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
            {/* Main image */}
            <div
              className={`rounded-2xl overflow-hidden mb-3 ${card} border relative`}
              style={{ height: '500px' }}
            >
              {/* Skeleton shimmer shown while loading */}
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

            {/* Thumbnail strip */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`rounded-xl overflow-hidden border-2 transition-all ${
                    i === selectedImage ? 'border-brand-red' : isDark ? 'border-dark-border' : 'border-transparent'
                  }`}
                  style={{ height: '90px' }}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={i === selectedImage}
                >
                  <img src={img} alt={`${product.name} thumbnail ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          {/* Right — details */}
          <div>
            {/* Category */}
            <p className="text-brand-gold text-xs uppercase tracking-widest mb-2 font-body" style={{ letterSpacing: '0.2em' }}>
              {product.fabric} · {product.category.replace(/-/g, ' ')}
            </p>

            {/* Name */}
            <h1
              className={`mb-3 leading-tight ${textPrimary}`}
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 600 }}
            >
              {product.name}
            </h1>

            {/* ID */}
            <p className={`text-xs mb-4 font-body ${textMuted}`}>Product ID: {product.id}</p>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={product.rating} size={16} />
              <span className={`text-sm font-body ${textMuted}`}>{product.rating} ({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-4">
              {product.discountPrice ? (
                <>
                  <span className="font-bold text-brand-red" style={{ fontSize: '1.8rem', fontFamily: '"Raleway", sans-serif' }}>
                    ₹{product.discountPrice.toLocaleString()}
                  </span>
                  <div>
                    <span className={`text-base line-through font-body ${textMuted}`}>₹{product.price.toLocaleString()}</span>
                    <span className="ml-2 text-sm font-semibold font-body text-green-500">
                      {discount}% off
                    </span>
                  </div>
                </>
              ) : (
                <span className="font-bold text-brand-red" style={{ fontSize: '1.8rem', fontFamily: '"Raleway", sans-serif' }}>
                  ₹{product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock */}
            <p className={`text-sm font-semibold mb-4 font-body ${
              product.stock === 0 ? 'text-red-500' : product.stock <= 5 ? 'text-orange-500' : 'text-green-500'
            }`}>
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
                href={getWhatsAppLink(product)}
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
                <div
                  key={acc.id}
                  className={`rounded-xl border overflow-hidden ${card}`}
                >
                  <button
                    className={`w-full flex items-center justify-between px-5 py-4 text-sm font-semibold font-body text-left transition-colors ${textPrimary} hover:text-brand-red`}
                    onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}
                    aria-expanded={openAccordion === acc.id}
                  >
                    {acc.title}
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 flex-shrink-0 ${openAccordion === acc.id ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openAccordion === acc.id && (
                    <div className={`px-5 pb-4 border-t ${isDark ? 'border-dark-border' : 'border-stone-100'}`}>
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
                <a href={getWhatsAppLink(product)} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: '#25D366' }} aria-label="Share on WhatsApp">
                  <MessageCircle size={16} color="white" />
                </a>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }} aria-label="Share on Instagram">
                  <Instagram size={16} color="white" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: '#1877F2' }} aria-label="Share on Facebook">
                  <Facebook size={16} color="white" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Customer reviews skeleton */}
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
                {/* Avatar + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 rounded shimmer w-3/4" />
                    <div className="h-2 rounded shimmer w-1/2" />
                  </div>
                </div>
                {/* Stars */}
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, s) => (
                    <div key={s} className="w-3 h-3 rounded shimmer" />
                  ))}
                </div>
                {/* Review text */}
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
