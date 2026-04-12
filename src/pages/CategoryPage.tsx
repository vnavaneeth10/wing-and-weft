// src/pages/CategoryPage.tsx
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, Search, LayoutGrid, Grid, Columns } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { usePageMeta } from '../hooks/usePageMeta';
import SEO from '../components/SEO/SEO';
import ProductCard from '../components/Products/ProductCard';
import { useProductsByCategory } from '../hooks/useProducts';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../admin/lib/supabase';

type SortOption = 'featured' | 'rating' | 'az' | 'za' | 'low-high' | 'high-low';
type ViewMode   = '2col' | '3col' | '4col';

// FIX 7: Added image to CategoryMeta so we can pass it to og:image
interface CategoryMeta {
  id:          string;
  name:        string;
  description: string;
  image?:      string;
}

// FIX 7: Also select image field for og:image
const fetchCategoryMeta = async (id: string): Promise<CategoryMeta | null> => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/categories?id=eq.${encodeURIComponent(id)}&select=id,name,description,image`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data[0] ?? null;
};

// ─── Coming Soon empty state ──────────────────────────────────────────────────
const ComingSoonEmpty: React.FC<{ categoryName: string; isDark: boolean }> = ({ categoryName, isDark }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
      <div style={{
        textAlign: 'center', maxWidth: '480px',
        opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 24px',
          background: isDark ? 'rgba(188,61,62,0.1)' : 'rgba(188,61,62,0.07)',
          border: '1px solid rgba(188,61,62,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
        }}>
          🪡
        </div>
        <p style={{ color: '#bc3d3e', fontSize: '0.6rem', letterSpacing: '0.35em', textTransform: 'uppercase', fontFamily: '"Raleway",sans-serif', fontWeight: 700, marginBottom: '12px' }}>
          {categoryName}
        </p>
        <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 300, color: isDark ? '#f0e8d6' : '#1a1410', marginBottom: '16px' }}>
          Coming Soon
        </h2>
        <p style={{ fontFamily: '"Raleway",sans-serif', fontSize: '0.875rem', fontWeight: 300, lineHeight: 1.8, color: isDark ? 'rgba(240,232,214,0.5)' : 'rgba(26,20,16,0.5)', marginBottom: '28px' }}>
          We're weaving something extraordinary for this collection. Check back soon.
        </p>
        <Link to="/categories" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px',
          background: 'linear-gradient(115deg,#bc3d3e,#b6893c)', color: '#e9e3cb',
          textDecoration: 'none', borderRadius: '2px', fontFamily: '"Raleway",sans-serif',
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>
          Explore Other Collections
        </Link>
      </div>
    </div>
  );
};

// ─── View toggle ──────────────────────────────────────────────────────────────
// FIX 4: Active state changed from maroon-brown gradient to amber family —
// consistent with the site's warm gold palette and the fix applied to CategorySection
const ViewBtn: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; isDark: boolean }> =
  ({ active, onClick, icon, label, isDark }) => (
  <button onClick={onClick} aria-label={label} title={label} aria-pressed={active}
    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
    style={{
      // FIX 4: was linear-gradient(135deg,#7A1F2E,#9C6F2E) — maroon clashed with palette
      background: active ? 'linear-gradient(135deg, #9C6F2E, #C49A4A)' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      color:  active ? '#FAF6EF' : isDark ? '#94a3b8' : '#78716c',
      border: active ? '1px solid transparent' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
      transform: active ? 'scale(1.05)' : 'scale(1)',
    }}>
    {icon}
  </button>
);

// ─── Smart Product Card ───────────────────────────────────────────────────────
const SmartProductCard: React.FC<{ product: Parameters<typeof ProductCard>[0]['product'] }> = ({ product }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasMultiple = product.images.length > 1;

  const isTouchDevice = useRef(
    typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  );

  useEffect(() => {
    if (!isTouchDevice.current || !hasMultiple) return;
    intervalRef.current = setInterval(() => {
      setImgIdx(prev => (prev + 1) % product.images.length);
    }, 2000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [product.images.length, hasMultiple]);

  const startHoverCycle = useCallback(() => {
    if (isTouchDevice.current || !hasMultiple) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setImgIdx(prev => (prev + 1) % product.images.length);
    }, 800);
  }, [product.images.length, hasMultiple]);

  const stopHoverCycle = useCallback(() => {
    if (isTouchDevice.current) return;
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setImgIdx(0);
  }, []);

  const displayProduct = imgIdx === 0 ? product : {
    ...product,
    images: [product.images[imgIdx], ...product.images.filter((_, i) => i !== imgIdx)],
  };

  return (
    <div onMouseEnter={startHoverCycle} onMouseLeave={stopHoverCycle} style={{ position: 'relative' }}>
      <ProductCard product={displayProduct} />
      {/* FIX 8: Dot indicator position changed from hardcoded bottom:72px to
          a percentage-based bottom so it doesn't break if ProductCard info height changes */}
      {hasMultiple && (
        <div style={{
          position: 'absolute',
          bottom: '22%',       // FIX 8: was '72px' — now relative so it scales with card height
          left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: '4px',
          pointerEvents: 'none',
        }}>
          {product.images.map((_, i) => (
            <div key={i} style={{
              width: i === imgIdx ? '16px' : '5px',
              height: '5px',
              borderRadius: '3px',
              background: i === imgIdx ? '#b6893c' : 'rgba(255,255,255,0.6)',
              transition: 'width 0.3s ease',
            }} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main CategoryPage ────────────────────────────────────────────────────────
const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { isDark } = useTheme();

  const [category, setCategory] = useState<CategoryMeta | null>(null);
  const [view, setView]         = useState<ViewMode>('4col');
  const { products: allProducts, loading } = useProductsByCategory(categoryId || '');

  const [sortBy, setSortBy]               = useState<SortOption>('featured');
  const [filterTag, setFilterTag]         = useState('All');
  const [filterFabrics, setFilterFabrics] = useState<string[]>([]);
  const [priceRange, setPriceRange]       = useState<[number, number]>([0, 20000]);
  const [searchQuery, setSearchQuery]     = useState('');
  const [filterOpen, setFilterOpen]       = useState(false);

  useEffect(() => {
    if (!categoryId) return;
    fetchCategoryMeta(categoryId).then(setCategory).catch(() => {});
  }, [categoryId]);

  const visibleProducts = useMemo(
    () => allProducts.filter(p => p.is_visible !== false),
    [allProducts]
  );

  const allFabrics = useMemo(
    () => [...new Set(visibleProducts.map(p => p.fabric))],
    [visibleProducts]
  );

  const filtered = useMemo(() => {
    let list = [...visibleProducts];
    if (filterTag === 'Best Sellers') list = list.filter(p => p.is_best_seller);
    else if (filterTag === 'New Arrivals') list = list.filter(p => p.is_new_arrival);
    else if (filterTag === 'Featured') list = list.filter(p => p.is_featured);
    if (filterFabrics.length > 0) list = list.filter(p => filterFabrics.includes(p.fabric));
    list = list.filter(p => {
      const price = p.discount_price || p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.fabric.toLowerCase().includes(q));
    }
    switch (sortBy) {
      case 'rating':   return [...list].sort((a, b) => b.rating - a.rating);
      case 'az':       return [...list].sort((a, b) => a.name.localeCompare(b.name));
      case 'za':       return [...list].sort((a, b) => b.name.localeCompare(a.name));
      case 'low-high': return [...list].sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
      case 'high-low': return [...list].sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
      default: return list;
    }
  }, [visibleProducts, sortBy, filterTag, filterFabrics, priceRange, searchQuery]);

  const toggleFabric = (fabric: string) =>
    setFilterFabrics(prev => prev.includes(fabric) ? prev.filter(f => f !== fabric) : [...prev, fabric]);

  const gridCols: Record<ViewMode, string> = {
    '2col': 'grid-cols-2',
    '3col': 'grid-cols-2 sm:grid-cols-3',
    '4col': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  const bg          = isDark ? 'bg-dark-bg'    : 'bg-brand-cream';
  const card        = isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-brand-cream-dark';
  const textPrimary = isDark ? 'text-dark-text'  : 'text-brand-ink';
  const textMuted   = isDark ? 'text-dark-muted' : 'text-brand-ink-muted';

  // FIX 5+6: categoryName now uses category.name from DB first,
  // then falls back to formatting the URL slug cleanly.
  // This matches the eyebrow fix pattern — no raw URL slugs shown to users.
  const categoryName = category?.name
    ?? (categoryId
      ? categoryId
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : '');

  // FIX 6: SEO description uses the category's actual DB description if available,
  // falls back to a generic template. No longer ignores the description field entirely.
  const seoDescription = category?.description?.trim()
    ? category.description
    : categoryName
      ? `Shop authentic handwoven ${categoryName} at Wing & Weft. Free shipping above ₹2000.`
      : 'Browse our curated collection of authentic handwoven sarees.';

  // FIX 5: Canonical URL updated — replace with your actual production domain.
  // Was hardcoded to wingandweft.vercel.app which is the Vercel preview, not production.
  const PRODUCTION_DOMAIN = 'https://www.wingandweft.com'; // ← update to your GoDaddy domain
  const canonicalUrl = `${PRODUCTION_DOMAIN}/category/${categoryId}`;

  usePageMeta({
    title: categoryName ? `${categoryName} Sarees` : 'Browse Collection',
    description: seoDescription,
  });

  return (
    <div className={`min-h-screen ${bg} pt-20`}>
      {/* FIX 5, 6, 7: canonical fixed, description uses DB field, og:image added */}
      <SEO
        title={categoryName || 'Collections'}
        description={seoDescription}
        canonical={canonicalUrl}
        // FIX 7: Pass category image as og:image if your SEO component supports it.
        // This improves link previews on WhatsApp, Twitter, Facebook significantly.
        // If your SEO component doesn't accept ogImage yet, add that prop to it.
        ogImage={category?.image}
      />

      {/* ── Page header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <nav className="flex items-center gap-2 text-xs font-body mb-6" aria-label="Breadcrumb">
          <Link to="/" className={`${textMuted} hover:text-brand-red transition-colors`}>Home</Link>
          <span className={textMuted} aria-hidden="true">›</span>
          <span className="text-brand-red font-medium capitalize">{categoryName}</span>
        </nav>

        <div className="flex items-end justify-between gap-4 flex-wrap mb-2">
          <div>
            <p className="text-brand-gold text-xs uppercase font-label mb-1" style={{ letterSpacing: '0.28em' }}>
              Browse Collection
            </p>
            <h1 className={textPrimary} style={{
              fontFamily: '"Cormorant Garamond",serif',
              fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 400, lineHeight: 1.1,
            }}>
              {categoryName}
            </h1>
          </div>
          <div className="flex items-center gap-1.5" role="group" aria-label="Grid view options">
            <ViewBtn active={view === '2col'} onClick={() => setView('2col')} icon={<Columns size={15} />} label="2 columns grid" isDark={isDark} />
            <ViewBtn active={view === '3col'} onClick={() => setView('3col')} icon={<LayoutGrid size={15} />} label="3 columns grid" isDark={isDark} />
            <ViewBtn active={view === '4col'} onClick={() => setView('4col')} icon={<Grid size={15} />} label="4 columns grid" isDark={isDark} />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-8" aria-hidden="true">
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to right,transparent,rgba(182,137,60,0.5))' }} />
          <div style={{ width: '5px', height: '5px', background: '#b6893c', transform: 'rotate(45deg)' }} />
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to left,transparent,rgba(182,137,60,0.5))' }} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} aria-hidden="true" />
            <input
              type="text"
              placeholder="Search in this category…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-body outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-colors ${card} ${textPrimary}`}
              aria-label="Search products in this category"
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
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
          <button
            onClick={() => setFilterOpen(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold font-body transition-colors ${filterOpen ? 'bg-brand-red text-white border-brand-red' : `${card} ${textPrimary}`}`}
            aria-expanded={filterOpen}
            aria-controls="filter-panel"
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
            Filters
            {(filterTag !== 'All' || filterFabrics.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-brand-gold" aria-label="Filters active" />
            )}
          </button>
        </div>

        {/* ── Filter panel ── */}
        {filterOpen && (
          <div id="filter-panel" className={`rounded-2xl border p-5 mb-6 ${card}`} role="region" aria-label="Filters">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className={`text-sm font-semibold mb-3 font-body ${textPrimary}`}>Filter by</h3>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Best Sellers', 'New Arrivals', 'Featured'].map(tag => (
                    <button key={tag} onClick={() => setFilterTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold font-body border transition-all ${filterTag === tag ? 'bg-brand-red text-white border-brand-red' : isDark ? 'border-dark-border text-dark-muted hover:border-brand-red hover:text-brand-red' : 'border-brand-cream-dark text-brand-ink-soft hover:border-brand-red hover:text-brand-red'}`}
                      aria-pressed={filterTag === tag}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className={`text-sm font-semibold mb-3 font-body ${textPrimary}`}>Fabric</h3>
                <div className="flex flex-wrap gap-2">
                  {allFabrics.map(fabric => (
                    <button key={fabric} onClick={() => toggleFabric(fabric)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold font-body border transition-all ${filterFabrics.includes(fabric) ? 'bg-brand-gold text-white border-brand-gold' : isDark ? 'border-dark-border text-dark-muted hover:border-brand-gold hover:text-brand-gold' : 'border-brand-cream-dark text-brand-ink-soft hover:border-brand-gold hover:text-brand-gold'}`}
                      aria-pressed={filterFabrics.includes(fabric)}>
                      {fabric}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                {/* Price range — label updates live as slider moves */}
                <h3 className={`text-sm font-semibold mb-3 font-body ${textPrimary}`}>
                  Price: ₹{priceRange[0].toLocaleString('en-IN')} – ₹{priceRange[1].toLocaleString('en-IN')}
                </h3>
                <input
                  type="range" min={0} max={20000} step={500} value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-brand-gold"
                  aria-label={`Maximum price ₹${priceRange[1]}`}
                  style={{
                    // FIX: Tint the range slider thumb to brand gold — browser default is jarring in dark mode
                    accentColor: '#b6893c',
                  }}
                />
                <div className={`flex justify-between text-xs font-body mt-1 ${textMuted}`}>
                  <span>₹0</span><span>₹20,000</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => { setFilterTag('All'); setFilterFabrics([]); setPriceRange([0, 20000]); }}
              className="mt-4 flex items-center gap-1.5 text-xs font-body text-brand-red hover:underline"
            >
              <X size={12} aria-hidden="true" /> Reset Filters
            </button>
          </div>
        )}

        {/* ── Results count ── */}
        <p className={`text-sm mb-6 font-body ${textMuted}`} aria-live="polite">
          {loading
            ? 'Loading products…'
            : `${filtered.length} ${filtered.length === 1 ? 'product' : 'products'}`}
        </p>

        {/* ── Product grid ── */}
        {loading ? (
          <div className={`grid ${gridCols[view]} gap-4 md:gap-5`} aria-busy="true" aria-label="Loading products">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`rounded-2xl border overflow-hidden ${card}`}>
                <div className="shimmer w-full" style={{ aspectRatio: '3/4' }} />
                <div className="p-3 space-y-2">
                  <div className="shimmer h-3 rounded w-3/4" />
                  <div className="shimmer h-3 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <ComingSoonEmpty categoryName={categoryName} isDark={isDark} />
        ) : (
          <div className={`grid ${gridCols[view]} gap-4 md:gap-5`}>
            {filtered.map(product => (
              <SmartProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;