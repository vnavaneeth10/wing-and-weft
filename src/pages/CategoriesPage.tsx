// src/pages/CategoriesPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Grid, AlignJustify } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { usePageMeta } from '../hooks/usePageMeta';
import SEO from '../components/SEO/SEO';
import { BreadcrumbJsonLd, ItemListJsonLd } from '../components/SEO/JsonLd';
import { getCategories, CachedCategory } from '../lib/categoriesCache';
import { SITE_URL } from '../lib/siteUrl';

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = 'scroll' | 'two' | 'three';

// ─── View toggle button ───────────────────────────────────────────────────────

const ToggleBtn: React.FC<{
  active:  boolean;
  onClick: () => void;
  icon:    React.ReactNode;
  label:   string;
  isDark:  boolean;
}> = ({ active, onClick, icon, label, isDark }) => (
  <button
    onClick={onClick}
    aria-label={label}
    title={label}
    aria-pressed={active}
    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-1"
    style={{
      background: active
        ? 'linear-gradient(135deg, #9C6F2E, #C49A4A)'
        : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      color:  active ? '#FAF6EF' : isDark ? '#94a3b8' : '#78716c',
      border: active
        ? '1px solid transparent'
        : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
      transform: active ? 'scale(1.05)' : 'scale(1)',
    }}
  >
    {icon}
  </button>
);

// ─── Category card ────────────────────────────────────────────────────────────

const CategoryCard: React.FC<{ category: CachedCategory; isDark: boolean }> = ({ category, isDark }) => (
  <Link
    to={`/category/${category.id}`}
    className="group relative overflow-hidden rounded-2xl cursor-pointer block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
    style={{ aspectRatio: '3/4', display: 'block' }}
    aria-label={`Browse ${category.name}`}
  >
    {category.image ? (
      <img
        src={category.image}
        alt={category.name}
        width={400}
        height={533}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
        decoding="async"
      />
    ) : (
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(188,61,62,0.12), rgba(182,137,60,0.08))'
            : 'linear-gradient(135deg, #f5ead8, #ede5d4)',
        }}
      />
    )}

    {/* Gradient overlay */}
    <div
      className="absolute inset-0 transition-all duration-300"
      style={{ background: 'linear-gradient(to top, rgba(26,20,16,0.88) 30%, rgba(26,20,16,0.15) 70%, transparent 100%)' }}
    />

    {/* Gold border on hover */}
    <div
      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{ boxShadow: 'inset 0 0 0 1.5px rgba(182,137,60,0.65)' }}
    />

    {/* Text */}
    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
      <h3
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 'clamp(0.95rem, 2.2vw, 1.35rem)',
          fontWeight: 600,
          lineHeight: 1.2,
          color: '#f0e8d6',
          margin: 0,
        }}
      >
        {category.name}
      </h3>
      {category.description && (
        <p
          style={{
            fontFamily: '"Raleway", sans-serif',
            // Minimum 0.75rem so it stays legible on narrow 375px screens
            fontSize: 'clamp(0.75rem, 1.8vw, 0.8rem)',
            fontWeight: 300,
            lineHeight: 1.6,
            color: 'rgba(240,232,214,0.65)',
            marginTop: '4px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {category.description}
        </p>
      )}
    </div>
  </Link>
);

// ─── Skeleton loader ──────────────────────────────────────────────────────────

const SkeletonGrid: React.FC<{ card: string }> = ({ card }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6" aria-busy="true" aria-label="Loading categories">
    {[...Array(6)].map((_, i) => (
      <div key={i} className={`rounded-2xl border overflow-hidden ${card}`}>
        <div className="shimmer w-full" style={{ aspectRatio: '3/4' }} />
      </div>
    ))}
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
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
        <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 300, color: isDark ? '#f0e8d6' : '#1a1410', marginBottom: '16px' }}>
          Collections Coming Soon
        </h2>
        <p style={{ fontFamily: '"Raleway",sans-serif', fontSize: '0.875rem', fontWeight: 300, lineHeight: 1.8, color: isDark ? 'rgba(240,232,214,0.5)' : 'rgba(26,20,16,0.5)', marginBottom: '28px' }}>
          We're curating something extraordinary. Check back soon.
        </p>
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px',
          background: 'linear-gradient(115deg,#bc3d3e,#b6893c)', color: '#e9e3cb',
          textDecoration: 'none', borderRadius: '2px', fontFamily: '"Raleway",sans-serif',
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

// ─── Main CategoriesPage ──────────────────────────────────────────────────────

const CategoriesPage: React.FC = () => {
  const { isDark } = useTheme();

  const [categories, setCategories] = useState<CachedCategory[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [animKey, setAnimKey]       = useState(0);

  // Default to scroll on mobile, 3-col grid on desktop — detected once on mount
  const [view, setView] = useState<ViewMode>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 'scroll' : 'three'
  );

  // ── Uses shared cache — no duplicate network call
  useEffect(() => {
    getCategories()
      .then(data => { setCategories(data); setLoading(false); })
      .catch(() => { setError('Could not load collections.'); setLoading(false); });
  }, []);

  const switchView = (v: ViewMode) => {
    if (v === view) return;
    setAnimKey(k => k + 1);
    setView(v);
  };

  usePageMeta({
    title: 'All Collections',
    description: 'Browse our full range of authentic handwoven saree collections at Wing & Weft.',
  });

  const bg          = isDark ? 'bg-dark-bg'    : 'bg-brand-cream';
  const card        = isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-brand-cream-dark';
  const textPrimary = isDark ? 'text-dark-text'  : 'text-brand-ink';
  const textMuted   = isDark ? 'text-dark-muted' : 'text-brand-ink-muted';

  return (
    <div className={`min-h-screen ${bg} pt-20`}>
      {/* ── SEO ── */}
      <SEO
        title="All Collections"
        description="Browse our full range of authentic handwoven saree collections at Wing & Weft. Free shipping above ₹2000."
        canonical={`${SITE_URL}/categories`}
      />

      {/* ── Structured data ── */}
      <BreadcrumbJsonLd items={[
        { name: 'Home',        url: SITE_URL },
        { name: 'Collections', url: `${SITE_URL}/categories` },
      ]} />
      {categories.length > 0 && (
        <ItemListJsonLd
          name="Saree Collections — Wing & Weft"
          items={categories.map(c => ({
            name:  c.name,
            url:   `${SITE_URL}/category/${c.id}`,
            image: c.image || undefined,
          }))}
        />
      )}

      {/* ── Page header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <nav className="flex items-center gap-2 text-xs font-body mb-6" aria-label="Breadcrumb">
          <Link to="/" className={`${textMuted} hover:text-brand-red transition-colors`}>Home</Link>
          <span className={textMuted} aria-hidden="true">›</span>
          <span className="text-brand-red font-medium">Collections</span>
        </nav>

        <div className="flex items-end justify-between gap-4 flex-wrap mb-2">
          <div>
            <p
              className="text-brand-gold text-xs uppercase font-label mb-1"
              style={{ letterSpacing: '0.28em' }}
            >
              Explore by Category
            </p>
            <h1
              className={textPrimary}
              style={{
                fontFamily: '"Cormorant Garamond",serif',
                fontSize: 'clamp(2rem,4vw,3rem)',
                fontWeight: 400,
                lineHeight: 1.1,
              }}
            >
              All Collections
            </h1>
          </div>

          <div className="flex items-center gap-1.5" role="group" aria-label="Grid view options">
            <ToggleBtn
              active={view === 'scroll'}
              onClick={() => switchView('scroll')}
              icon={<AlignJustify size={15} />}
              label="Single row scroll"
              isDark={isDark}
            />
            <ToggleBtn
              active={view === 'two'}
              onClick={() => switchView('two')}
              icon={<LayoutGrid size={15} />}
              label="2 columns grid"
              isDark={isDark}
            />
            <ToggleBtn
              active={view === 'three'}
              onClick={() => switchView('three')}
              icon={<Grid size={15} />}
              label="3 columns grid"
              isDark={isDark}
            />
          </div>
        </div>

        {/* Ornamental divider */}
        <div className="flex items-center gap-3 mb-8" aria-hidden="true">
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to right,transparent,rgba(182,137,60,0.5))' }} />
          <div style={{ width: '5px', height: '5px', background: '#b6893c', transform: 'rotate(45deg)' }} />
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to left,transparent,rgba(182,137,60,0.5))' }} />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <style>{`
          @keyframes catPageFadeUp {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .cat-page-anim { animation: catPageFadeUp 0.35s ease both; }

          .cat-page-scroll-track {
            display: flex;
            gap: 16px;
            overflow-x: auto;
            padding-bottom: 12px;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
            scrollbar-color: #b6893c40 transparent;
          }
          .cat-page-scroll-track::-webkit-scrollbar { height: 4px; }
          .cat-page-scroll-track::-webkit-scrollbar-track { background: transparent; }
          .cat-page-scroll-track::-webkit-scrollbar-thumb { background: #b6893c60; border-radius: 4px; }

          .cat-page-scroll-item {
            flex-shrink: 0;
            width: clamp(160px, 38vw, 210px);
            scroll-snap-align: start;
          }
        `}</style>

        {/* Results count */}
        {!loading && !error && categories.length > 0 && (
          <p className={`text-sm mb-6 font-body ${textMuted}`} aria-live="polite">
            {categories.length} {categories.length === 1 ? 'collection' : 'collections'}
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm mb-6 font-body text-brand-red" role="alert">{error}</p>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <SkeletonGrid card={card} />

        ) : categories.length === 0 ? (
          <EmptyState isDark={isDark} />

        ) : view === 'scroll' ? (
          <div className="cat-page-scroll-track" key={`scroll-${animKey}`}>
            {categories.map((cat, i) => (
              <div
                key={cat.id}
                className="cat-page-scroll-item cat-page-anim"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <CategoryCard category={cat} isDark={isDark} />
              </div>
            ))}
          </div>

        ) : (
          <div
            key={`grid-${animKey}`}
            className={`grid gap-4 md:gap-6 ${view === 'two' ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}
          >
            {categories.map((cat, i) => (
              <div
                key={cat.id}
                className="cat-page-anim"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <CategoryCard category={cat} isDark={isDark} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;