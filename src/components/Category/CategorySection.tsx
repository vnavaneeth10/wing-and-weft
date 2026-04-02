// src/components/Category/CategorySection.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutGrid, Grid, AlignJustify } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useInView } from '../../hooks';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../admin/lib/supabase';

interface Category {
  id:          string;
  name:        string;
  image:       string;
  description: string;
  count:       number;
  sort_order:  number;
  is_active:   boolean;
}

type ViewMode = 'scroll' | 'two' | 'three';

const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/categories?is_active=eq.true&order=sort_order.asc`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  );
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
};

const FALLBACK: Category[] = [
  { id: 'silk-sarees',      name: 'Silk Sarees',      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop', description: '', count: 0, sort_order: 1, is_active: true },
  { id: 'cotton-sarees',    name: 'Cotton Sarees',    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=600&fit=crop', description: '', count: 0, sort_order: 2, is_active: true },
  { id: 'georgette-sarees', name: 'Georgette Sarees', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=600&fit=crop', description: '', count: 0, sort_order: 3, is_active: true },
  { id: 'linen-sarees',     name: 'Linen Sarees',     image: 'https://images.unsplash.com/photo-1631947430066-48c30d57b943?w=400&h=600&fit=crop', description: '', count: 0, sort_order: 4, is_active: true },
  { id: 'chiffon-sarees',   name: 'Chiffon Sarees',   image: 'https://images.unsplash.com/photo-1617627143233-a6699d9f3d2a?w=400&h=600&fit=crop', description: '', count: 0, sort_order: 5, is_active: true },
  { id: 'banarasi-sarees',  name: 'Banarasi Sarees',  image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop&q=70', description: '', count: 0, sort_order: 6, is_active: true },
];

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
    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
    style={{
      background: active
        ? 'linear-gradient(135deg, #bc3d3e, #b6893c)'
        : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      color: active ? '#e9e3cb' : isDark ? '#94a3b8' : '#78716c',
      border: active ? '1px solid transparent' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
      transform: active ? 'scale(1.05)' : 'scale(1)',
    }}
  >
    {icon}
  </button>
);

const CategorySection: React.FC = () => {
  const { isDark } = useTheme();
  const { ref, inView } = useInView();
  const [categories, setCategories] = useState<Category[]>(FALLBACK);
  const [loaded, setLoaded]         = useState(false);
  const [view, setView]             = useState<ViewMode>('three');
  const [animKey, setAnimKey]       = useState(0);

  useEffect(() => {
    fetchCategories()
      .then((data) => { if (data.length > 0) setCategories(data); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const switchView = (v: ViewMode) => {
    if (v === view) return;
    setAnimKey((k) => k + 1);
    setView(v);
  };

  return (
    <section
      ref={ref}
      className={`py-16 md:py-24 transition-all duration-700 ${isDark ? 'bg-dark-bg' : 'bg-white'}`}
      aria-label="Browse saree categories"
    >
      <style>{`
        @keyframes catFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cat-card-anim { animation: catFadeUp 0.35s ease both; }

        /* Horizontal scroll mode */
        .cat-scroll-track {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 12px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: #b6893c40 transparent;
        }
        .cat-scroll-track::-webkit-scrollbar { height: 4px; }
        .cat-scroll-track::-webkit-scrollbar-track { background: transparent; }
        .cat-scroll-track::-webkit-scrollbar-thumb { background: #b6893c60; border-radius: 4px; }
        .cat-scroll-item {
          flex-shrink: 0;
          /* Portrait card: fixed width, height driven by aspect-ratio */
          width: clamp(140px, 30vw, 200px);
          scroll-snap-align: start;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Heading ── */}
        <div className={`text-center mb-8 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-brand-gold text-xs uppercase tracking-widest mb-2 font-body" style={{ letterSpacing: '0.3em' }}>
            Explore by Category
          </p>
          <h2
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600 }}
            className={isDark ? 'text-brand-cream' : 'text-stone-800'}
          >
            Our Collections
          </h2>
          <div className="saree-divider w-32 mx-auto mt-4" />
        </div>

        {/* ── View Toggle ── */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <ToggleBtn active={view === 'scroll'} onClick={() => switchView('scroll')} icon={<AlignJustify size={16} />} label="Single row scroll" isDark={isDark} />
          <ToggleBtn active={view === 'two'}    onClick={() => switchView('two')}    icon={<LayoutGrid size={16} />}  label="2 columns grid"    isDark={isDark} />
          <ToggleBtn active={view === 'three'}  onClick={() => switchView('three')}  icon={<Grid size={16} />}        label="3 columns grid"    isDark={isDark} />
        </div>

        {/* ── Skeleton ── */}
        {!loaded ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
                <div className="shimmer w-full h-full" />
              </div>
            ))}
          </div>
        ) : view === 'scroll' ? (
          <div className="cat-scroll-track" key={`scroll-${animKey}`}>
            {categories.map((cat, i) => (
              <div key={cat.id} className="cat-scroll-item cat-card-anim" style={{ animationDelay: `${i * 40}ms` }}>
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
              <div key={cat.id} className="cat-card-anim" style={{ animationDelay: `${i * 50}ms` }}>
                <CategoryCard category={cat} isDark={isDark} />
              </div>
            ))}
          </div>
        )}

        {/* ── View all ── */}
        <div className="text-center mt-10">
          <Link
            to={`/category/${categories[0]?.id ?? 'silk-sarees'}`}
            className="inline-flex items-center gap-2 text-sm font-semibold font-body uppercase tracking-widest transition-all hover:gap-4"
            style={{ color: '#bc3d3e', letterSpacing: '0.15em' }}
          >
            View All Categories
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

// ─── Category Card ────────────────────────────────────────────────────────────
// Always portrait 3:4 — image fills without cropping its edges.
// object-cover ensures the image fills the space and is centred.
const CategoryCard: React.FC<{
  category: Category;
  isDark:   boolean;
}> = ({ category, isDark }) => (
  <Link
    to={`/category/${category.id}`}
    className="group relative overflow-hidden rounded-2xl cursor-pointer block w-full"
    style={{ aspectRatio: '3/4', display: 'block' }}
    aria-label={`Browse ${category.name}`}
  >
    {category.image ? (
      <img
        src={category.image}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
    ) : (
      // Placeholder when no image is set
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
      {category.count > 0 && (
        <p style={{ fontSize: '0.7rem', color: 'rgba(240,232,214,0.6)', fontFamily: '"Raleway",sans-serif', marginTop: '4px', letterSpacing: '0.08em' }}>
          {category.count} sarees
        </p>
      )}
    </div>
  </Link>
);

export default CategorySection;