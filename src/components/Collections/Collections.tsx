// src/components/Collections/Collections.tsx
import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useInView } from '../../hooks';
import ProductCard from '../Products/ProductCard';
import { useFeaturedProducts } from '../../hooks/useProducts'; // ✅ live from Supabase

type Tab = 'new' | 'best' | 'featured';

const Collections: React.FC = () => {
  const { isDark } = useTheme();
  const { ref, inView } = useInView();
  const [activeTab, setActiveTab] = useState<Tab>('new');

  // ✅ CHANGED: fetch live from Supabase instead of static getters
  const { newArrivals, bestSellers, featured, loading } = useFeaturedProducts();

  const tabs: { key: Tab; label: string }[] = [
    { key: 'new', label: 'New Arrivals' },
    { key: 'best', label: 'Best Selling' },
    { key: 'featured', label: 'Featured' },
  ];

  const products =
    activeTab === 'new' ? newArrivals :
    activeTab === 'best' ? bestSellers :
    featured;

  return (
    <section
      ref={ref}
      className={`py-16 md:py-24 ${isDark ? 'bg-dark-card' : 'bg-brand-cream/20'}`}
      aria-label="Our saree collections"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div
          className={`text-center mb-10 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <p className="text-brand-gold text-xs uppercase tracking-widest mb-2 font-body" style={{ letterSpacing: '0.3em' }}>
            Hand-picked for you
          </p>
          <h2
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600 }}
            className={isDark ? 'text-brand-cream' : 'text-stone-800'}
          >
            Our Collections
          </h2>
          <div className="saree-divider w-32 mx-auto mt-4 mb-8" />

          {/* Tabs */}
          <div
            className={`inline-flex rounded-full p-1 gap-1 ${
              isDark ? 'bg-dark-bg border border-dark-border' : 'bg-white border border-stone-200 shadow-sm'
            }`}
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-full text-sm font-semibold font-body transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'text-white shadow-md'
                    : isDark
                    ? 'text-dark-muted hover:text-dark-text'
                    : 'text-stone-600 hover:text-stone-800'
                }`}
                style={activeTab === tab.key ? { background: 'linear-gradient(135deg, #bc3d3e, #b6893c)' } : {}}
                aria-pressed={activeTab === tab.key}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="flex gap-5 overflow-hidden py-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 rounded-xl overflow-hidden"
                style={{ width: '200px' }}
              >
                <div className="shimmer w-full" style={{ height: '280px' }} />
                <div className="p-3 space-y-2">
                  <div className="shimmer h-3 rounded w-3/4" />
                  <div className="shimmer h-3 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className={`text-sm font-body ${isDark ? 'text-dark-muted' : 'text-stone-400'}`}>
              No products in this collection yet. Add some from the admin panel!
            </p>
          </div>
        ) : (
          /* Scrollable products */
          <div className="relative overflow-hidden">
            <div
              className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
              style={{ background: isDark ? 'linear-gradient(to right, #231d17, transparent)' : 'linear-gradient(to right, #faf5eb, transparent)' }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
              style={{ background: isDark ? 'linear-gradient(to left, #231d17, transparent)' : 'linear-gradient(to left, #faf5eb, transparent)' }}
            />
            <div className="auto-scroll-container gap-5 py-4">
              {[...products, ...products].map((product, i) => (
                <ProductCard key={`${product.id}-${i}`} product={product} compact />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Collections;