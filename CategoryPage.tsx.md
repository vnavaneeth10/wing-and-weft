// src/pages/CategoryPage.tsx
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { CATEGORIES } from '../data/products'; // ← still used for category meta (name, image, description)
import { useTheme } from '../context/ThemeContext';
import ProductCard from '../components/Products/ProductCard';
import { useProductsByCategory } from '../hooks/useProducts'; 
//import { useProductsByCategory } from '../hooks/useProducts'; 

// ✅ NEW: fetch from Supabase

type SortOption = 'featured' | 'rating' | 'az' | 'za' | 'low-high' | 'high-low';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { isDark } = useTheme();
  const category = CATEGORIES.find((c) => c.id === categoryId);

  // ✅ CHANGED: fetch live products from Supabase instead of filtering static PRODUCTS array
  const { products: allProducts, loading } = useProductsByCategory(categoryId || '');

  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [filterTag, setFilterTag] = useState('All');
  const [filterFabrics, setFilterFabrics] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  // ✅ CHANGED: derive unique fabrics from live products instead of getAllFabrics()
  const allFabrics = useMemo(
    () => [...new Set(allProducts.map((p) => p.fabric))],
    [allProducts]
  );

  const filtered = useMemo(() => {
    let products = [...allProducts];

    // Tag — ✅ CHANGED: use DB field names (is_new_arrival, is_best_seller, is_featured)
    if (filterTag === 'Best Sellers') products = products.filter((p) => p.is_best_seller);
    else if (filterTag === 'New Arrivals') products = products.filter((p) => p.is_new_arrival);
    else if (filterTag === 'Featured') products = products.filter((p) => p.is_featured);

    // Fabric
    if (filterFabrics.length > 0) products = products.filter((p) => filterFabrics.includes(p.fabric));

    // Price — ✅ CHANGED: use discount_price (snake_case)
    products = products.filter((p) => {
      const price = p.discount_price || p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      products = products.filter(
        (p) => p.name.toLowerCase().includes(q) || p.fabric.toLowerCase().includes(q)
      );
    }

    // Sort — ✅ CHANGED: use discount_price (snake_case)
    switch (sortBy) {
      case 'rating': return [...products].sort((a, b) => b.rating - a.rating);
      case 'az':     return [...products].sort((a, b) => a.name.localeCompare(b.name));
      case 'za':     return [...products].sort((a, b) => b.name.localeCompare(a.name));
      case 'low-high': return [...products].sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
      case 'high-low': return [...products].sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
      default: return products;
    }
  }, [allProducts, sortBy, filterTag, filterFabrics, priceRange, searchQuery]);

  const toggleFabric = (fabric: string) => {
    setFilterFabrics((prev) =>
      prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
    );
  };

  const bg = isDark ? 'bg-dark-bg' : 'bg-stone-50';
  const card = isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-stone-200';
  const textPrimary = isDark ? 'text-dark-text' : 'text-stone-800';
  const textMuted = isDark ? 'text-dark-muted' : 'text-stone-500';

  return (
    <div className={`min-h-screen ${bg} pt-20`}>
      {/* Hero */}
      {category && (
        <div
          className="relative h-48 md:h-64 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #bc3d3e, #b6893c)' }}
        >
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover opacity-30"
            loading="eager"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <p
              className="text-brand-cream/70 text-xs uppercase tracking-widest mb-2 font-body"
              style={{ letterSpacing: '0.3em' }}
            >
              Browse
            </p>
            <h1
              className="text-brand-cream"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 600 }}
            >
              {category.name}
            </h1>
            <p className="text-brand-cream/80 text-sm mt-1 font-body">{category.description}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
            <input
              type="text"
              placeholder="Search in this category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-body outline-none focus:ring-2 focus:ring-brand-red/30 ${card} ${textPrimary}`}
              aria-label="Search products"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={`px-4 py-2.5 rounded-xl border text-sm font-body outline-none cursor-pointer ${card} ${textPrimary}`}
            aria-label="Sort products"
          >
            <option value="featured">Featured</option>
            <option value="rating">Top Rated</option>
            <option value="az">A to Z</option>
            <option value="za">Z to A</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>

          {/* Filter toggle */}
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold font-body transition-colors ${
              filterOpen ? 'bg-brand-red text-white border-brand-red' : `${card} ${textPrimary}`
            }`}
            aria-expanded={filterOpen}
          >
            <SlidersHorizontal size={16} />
            Filters
            {(filterTag !== 'All' || filterFabrics.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-brand-gold" />
            )}
          </button>
        </div>

        {/* Filters panel */}
        {filterOpen && (
          <div className={`rounded-2xl border p-5 mb-6 ${card}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tags */}
              <div>
                <h3 className={`text-sm font-semibold mb-3 font-body ${textPrimary}`}>Filter by</h3>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Best Sellers', 'New Arrivals', 'Featured'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setFilterTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold font-body border transition-all ${
                        filterTag === tag
                          ? 'bg-brand-red text-white border-brand-red'
                          : isDark
                          ? 'border-dark-border text-dark-muted hover:border-brand-red hover:text-brand-red'
                          : 'border-stone-300 text-stone-600 hover:border-brand-red hover:text-brand-red'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabric */}
              <div>
                <h3 className={`text-sm font-semibold mb-3 font-body ${textPrimary}`}>Fabric</h3>
                <div className="flex flex-wrap gap-2">
                  {allFabrics.map((fabric) => (
                    <button
                      key={fabric}
                      onClick={() => toggleFabric(fabric)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold font-body border transition-all ${
                        filterFabrics.includes(fabric)
                          ? 'bg-brand-gold text-white border-brand-gold'
                          : isDark
                          ? 'border-dark-border text-dark-muted hover:border-brand-gold hover:text-brand-gold'
                          : 'border-stone-300 text-stone-600 hover:border-brand-gold hover:text-brand-gold'
                      }`}
                    >
                      {fabric}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <h3 className={`text-sm font-semibold mb-3 font-body ${textPrimary}`}>
                  Price Range: ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
                </h3>
                <input
                  type="range"
                  min={0}
                  max={20000}
                  step={500}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full"
                  aria-label="Maximum price filter"
                  style={{ '--val': `${(priceRange[1] / 20000) * 100}%` } as React.CSSProperties}
                />
                <div className={`flex justify-between text-xs font-body mt-1 ${textMuted}`}>
                  <span>₹0</span><span>₹20,000</span>
                </div>
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => { setFilterTag('All'); setFilterFabrics([]); setPriceRange([0, 20000]); }}
              className="mt-4 flex items-center gap-1.5 text-xs font-body text-brand-red hover:underline"
            >
              <X size={12} /> Reset Filters
            </button>
          </div>
        )}

        {/* Results count */}
        <p className={`text-sm mb-6 font-body ${textMuted}`}>
          {loading
            ? 'Loading products…'
            : `Showing ${filtered.length} ${filtered.length === 1 ? 'product' : 'products'}`}
        </p>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`rounded-2xl border overflow-hidden ${card}`}>
                <div className="shimmer w-full" style={{ height: '280px' }} />
                <div className="p-3 space-y-2">
                  <div className="shimmer h-3 rounded w-3/4" />
                  <div className="shimmer h-3 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 animate-float" role="img" aria-label="Empty">🕊️</div>
            <h3
              className={`mb-2 ${textPrimary}`}
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem' }}
            >
              Coming Soon
            </h3>
            <p className={`text-sm font-body ${textMuted}`}>
              We're crafting something beautiful for this category. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;