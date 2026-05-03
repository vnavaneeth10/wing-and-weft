// src/components/Category/CategorySection.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutGrid, Grid, AlignJustify } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useInView } from '../../hooks';
import { getCategories, CachedCategory } from '../../lib/categoriesCache';

type ViewMode = 'scroll' | 'two' | 'three';

const FALLBACK: CachedCategory[] = [
  { id: 'silk-sarees',      name: 'Silk Sarees',      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop',     description: '', count: 0, sort_order: 1, is_active: true },
  { id: 'cotton-sarees',    name: 'Cotton Sarees',    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=600&fit=crop',     description: '', count: 0, sort_order: 2, is_active: true },
  { id: 'georgette-sarees', name: 'Georgette Sarees', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=600&fit=crop',     description: '', count: 0, sort_order: 3, is_active: true },
  { id: 'linen-sarees',     name: 'Linen Sarees',     image: 'https://images.unsplash.com/photo-1631947430066-48c30d57b943?w=400&h=600&fit=crop',     description: '', count: 0, sort_order: 4, is_active: true },
  { id: 'chiffon-sarees',   name: 'Chiffon Sarees',   image: 'https://images.unsplash.com/photo-1617627143233-a6699d9f3d2a?w=400&h=600&fit=crop',     description: '', count: 0, sort_order: 5, is_active: true },
  { id: 'banarasi-sarees',  name: 'Banarasi Sarees',  image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop&q=70', description: '', count: 0, sort_order: 6, is_active: true },
];

// ─── Toggle button ────────────────────────────────────────────────────────────

const ToggleBtn: React.FC<{
  active: boolean; onClick: () => void;
  icon: React.ReactNode; label: string; isDark: boolean;
}> = ({ active, onClick, icon, label, isDark }) => (
  <button
    onClick={onClick} aria-label={label} title={label} aria-pressed={active}
    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
    style={{
      background: active ? 'linear-gradient(135deg, #9C6F2E, #C49A4A)' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      color: active ? '#FAF6EF' : isDark ? '#94a3b8' : '#78716c',
      border: active ? '1px solid transparent' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
      transform: active ? 'scale(1.05)' : 'scale(1)',
    }}
  >{icon}</button>
);

// ─── Main section ─────────────────────────────────────────────────────────────

const CategorySection: React.FC = () => {
  const { isDark } = useTheme();
  const { ref, inView } = useInView();
  const [categories, setCategories] = useState<CachedCategory[]>(FALLBACK);
  const [loaded, setLoaded]         = useState(false);
  const [view, setView]             = useState<ViewMode>('three');
  const [animKey, setAnimKey]       = useState(0);

  useEffect(() => {
    getCategories()
      .then(data => { if (data.length > 0) setCategories(data); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const switchView = (v: ViewMode) => {
    if (v === view) return;
    setAnimKey(k => k + 1);
    setView(v);
  };

  return (
    <section
      ref={ref}
      className={`py-16 md:py-24 transition-all duration-700 ${isDark ? 'bg-dark-bg' : 'bg-white'}`}
      aria-label="Browse saree categories"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');

        /* ── Card entrance stagger ── */
        @keyframes catRise {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cat-card-anim { animation: catRise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }

        /* ── Image zoom on hover ── */
        .cat-img { transition: transform 1.1s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .group:hover .cat-img { transform: scale(1.07); }

        /*
          ── Overlay ──
          AT REST  → subtle bottom-only gradient so name is always legible.
          ON HOVER → spreads upward to back the centred content block.
        */
        .cat-overlay {
          background: linear-gradient(
            to top,
            rgba(8,5,3,0.70) 0%,
            rgba(8,5,3,0.28) 28%,
            transparent 48%
          );
          transition: background 0.55s ease;
        }
        .group:hover .cat-overlay {
          background: linear-gradient(
            to top,
            rgba(8,5,3,0.80) 0%,
            rgba(8,5,3,0.60) 50%,
            rgba(8,5,3,0.15) 75%,
            transparent 92%
          );
        }

        /* ── Gold inset border on hover ── */
        .cat-border {
          box-shadow: inset 0 0 0 0 rgba(212,175,55,0);
          border-radius: inherit;
          transition: box-shadow 0.45s ease;
        }
        .group:hover .cat-border {
          box-shadow: inset 0 0 0 1.5px rgba(212,175,55,0.65);
        }

        /*
          ── Bottom content block ──
          AT REST  → pinned to the bottom (name visible at bottom edge).
          ON HOVER → entire block slides up via translateY so the name
                     lands at the visual centre of the card.
                     Ornament + explore pill then reveal naturally below the name.

          Note: translateY(-42%) shifts the block upward by 42% of its own
          rendered height. Adjust if card text or pill size changes significantly.
        */
        .cat-bottom {
          position: absolute;
          left: 0; right: 0;
          bottom: 0;
          padding: 0 12px 18px;
          text-align: center;
          z-index: 3;
          transition: transform 0.58s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .group:hover .cat-bottom {
          transform: translateY(-42%);
        }

        /* ── Name — always visible, Playfair Display Black ── */
        .cat-name-text {
          font-family: "Playfair Display", serif;
          font-weight: 900;
          letter-spacing: 0.01em;
          line-height: 1.1;
          color: #FFFFFF;
          text-shadow: 0 2px 14px rgba(0,0,0,0.65), 0 0 4px rgba(0,0,0,0.4);
          display: block;
          transition: color 0.4s ease, text-shadow 0.4s ease;
        }
        .group:hover .cat-name-text {
          color: #FFD700;
          text-shadow: 0 0 24px rgba(255,215,0,0.4), 0 2px 10px rgba(0,0,0,0.5);
        }

        /* ── Ornamental divider ◇ — hidden at rest, expands on hover ── */
        .cat-ornament {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          margin-top: 9px;
          margin-bottom: 10px;
          opacity: 0;
          transform: scaleX(0.3);
          transition:
            opacity 0.4s ease 0.12s,
            transform 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.12s;
        }
        .group:hover .cat-ornament { opacity: 1; transform: scaleX(1); }

        .orn-line { flex: 1; max-width: 32px; height: 1px; }
        .orn-line-l { background: linear-gradient(to right, transparent, rgba(212,175,55,0.85)); }
        .orn-line-r { background: linear-gradient(to left,  transparent, rgba(212,175,55,0.85)); }
        .orn-diamond {
          width: 6px; height: 6px;
          background: rgba(212,175,55,0.95);
          transform: rotate(45deg);
          flex-shrink: 0;
        }
        .orn-dot {
          width: 3px; height: 3px;
          border-radius: 50%;
          background: rgba(212,175,55,0.65);
          flex-shrink: 0;
        }

        /* ── Explore pill — hidden at rest, fades in on hover ── */
        .cat-explore-wrap {
          display: flex;
          justify-content: center;
          opacity: 0;
          transform: translateY(6px);
          transition:
            opacity 0.38s ease 0.20s,
            transform 0.42s cubic-bezier(0.22, 1, 0.36, 1) 0.20s;
        }
        .group:hover .cat-explore-wrap { opacity: 1; transform: translateY(0); }

        /* ── Animated gradient pill ── */
        @keyframes gradShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pillGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,200,60,0); }
          50%     { box-shadow: 0 0 14px 4px rgba(255,180,40,0.38); }
        }
        @keyframes arrowBounce {
          0%,100% { transform: translateX(0); }
          50%     { transform: translateX(4px); }
        }

        .cat-explore-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: "DM Sans", sans-serif;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 8px 20px;
          border-radius: 999px;
          color: #fff;
          background: linear-gradient(270deg, #D4A017, #C0392B, #E67E22, #D4A017);
          background-size: 300% 300%;
          animation: gradShift 3.5s ease infinite, pillGlow 2s ease-in-out infinite;
          border: 1px solid rgba(255,220,100,0.35);
          text-shadow: 0 1px 3px rgba(0,0,0,0.35);
          transition: transform 0.2s ease, filter 0.2s ease;
        }
        .cat-explore-pill:hover { transform: scale(1.06); filter: brightness(1.12); }

        .cat-pill-arrow {
          display: flex; align-items: center;
          animation: arrowBounce 1.2s ease-in-out infinite;
        }

        /* ── Scroll track ── */
        .cat-scroll-track {
          display: flex; gap: 16px; overflow-x: auto;
          padding-bottom: 12px; scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin; scrollbar-color: #b6893c40 transparent;
        }
        .cat-scroll-track::-webkit-scrollbar { height: 4px; }
        .cat-scroll-track::-webkit-scrollbar-track { background: transparent; }
        .cat-scroll-track::-webkit-scrollbar-thumb { background: #b6893c60; border-radius: 4px; }
        .cat-scroll-item { flex-shrink: 0; width: clamp(160px, 38vw, 210px); scroll-snap-align: start; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Heading ── */}
        <div className={`text-center mb-8 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-brand-gold text-xs uppercase mb-2 font-body" style={{ letterSpacing: '0.3em' }}>
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
          <ToggleBtn active={view === 'two'}    onClick={() => switchView('two')}    icon={<LayoutGrid size={16} />}   label="2 columns grid"    isDark={isDark} />
          <ToggleBtn active={view === 'three'}  onClick={() => switchView('three')}  icon={<Grid size={16} />}         label="3 columns grid"    isDark={isDark} />
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
              <div key={cat.id} className="cat-scroll-item cat-card-anim" style={{ animationDelay: `${i * 55}ms` }}>
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
              <div key={cat.id} className="cat-card-anim" style={{ animationDelay: `${i * 65}ms` }}>
                <CategoryCard category={cat} isDark={isDark} />
              </div>
            ))}
          </div>
        )}

        {/* ── View All ── */}
        <div className="text-center mt-10">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 text-sm font-semibold font-body uppercase tracking-widest transition-all hover:gap-4"
            style={{ color: '#9C6F2E', letterSpacing: '0.15em' }}
          >
            View All Collections
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

// ─── Category Card ────────────────────────────────────────────────────────────

const CategoryCard: React.FC<{ category: CachedCategory; isDark: boolean }> = ({ category }) => (
  <Link
    to={`/category/${category.id}`}
    className="group relative overflow-hidden rounded-2xl block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
    style={{ aspectRatio: '3/4' }}
    aria-label={`Browse ${category.name}`}
  >
    {/* ── Image ── */}
    {category.image ? (
      <img
        src={category.image}
        alt={category.name}
        width={400} height={533}
        className="cat-img absolute inset-0 w-full h-full object-cover"
        loading="lazy" decoding="async"
      />
    ) : (
      <div className="absolute inset-0" style={{ background: '#EDE5D4' }} />
    )}

    {/* ── Overlay ── */}
    <div className="cat-overlay absolute inset-0" />

    {/* ── Gold inset border ── */}
    <div className="cat-border absolute inset-0" />

    {/*
      ── Bottom content block ──
      AT REST  → name sits at the bottom of the card.
      ON HOVER → entire block slides up so name reaches visual centre.
                 Ornament + explore pill reveal naturally below the name.
    */}
    <div className="cat-bottom">

      {/* Name — always visible at bottom, slides to centre on hover */}
      <span
        className="cat-name-text"
        style={{ fontSize: 'clamp(1.05rem, 2.8vw, 1.55rem)' }}
      >
        {category.name}
      </span>

      {/* ◇ ornamental divider — reveals on hover */}
      <div className="cat-ornament" aria-hidden="true">
        <span className="orn-line orn-line-l" />
        <span className="orn-dot" />
        <span className="orn-diamond" />
        <span className="orn-dot" />
        <span className="orn-line orn-line-r" />
      </div>

      {/* Explore pill — reveals on hover */}
      <div className="cat-explore-wrap">
        <span className="cat-explore-pill">
          Explore
          <span className="cat-pill-arrow">
            <ArrowRight size={11} strokeWidth={2.5} />
          </span>
        </span>
      </div>

    </div>
  </Link>
);

export default CategorySection;