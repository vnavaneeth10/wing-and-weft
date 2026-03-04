// src/components/Category/CategorySection.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useInView } from '../../hooks';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../admin/lib/supabase';

// ─── Type ─────────────────────────────────────────────────────────────────────
interface Category {
  id:          string;
  name:        string;
  image:       string;
  description: string;
  count:       number;
  sort_order:  number;
  is_active:   boolean;
}

// ─── Fetch live categories ────────────────────────────────────────────────────
const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/categories?is_active=eq.true&order=sort_order.asc`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
};

// ─── Fallback while loading ───────────────────────────────────────────────────
const FALLBACK: Category[] = [
  { id: 'silk-sarees',      name: 'Silk Sarees',      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop', description: '', count: 0, sort_order: 1, is_active: true },
  { id: 'cotton-sarees',    name: 'Cotton Sarees',    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=600&fit=crop', description: '', count: 0, sort_order: 2, is_active: true },
  { id: 'georgette-sarees', name: 'Georgette Sarees', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=600&fit=crop', description: '', count: 0, sort_order: 3, is_active: true },
  { id: 'linen-sarees',     name: 'Linen Sarees',     image: 'https://images.unsplash.com/photo-1631947430066-48c30d57b943?w=400&h=600&fit=crop', description: '', count: 0, sort_order: 4, is_active: true },
  { id: 'chiffon-sarees',   name: 'Chiffon Sarees',   image: 'https://images.unsplash.com/photo-1617627143233-a6699d9f3d2a?w=400&h=600&fit=crop', description: '', count: 0, sort_order: 5, is_active: true },
];

// ─── CategorySection ──────────────────────────────────────────────────────────
const CategorySection: React.FC = () => {
  const { isDark } = useTheme();
  const { ref, inView } = useInView();
  const [categories, setCategories] = useState<Category[]>(FALLBACK);
  const [loaded, setLoaded]         = useState(false);

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        if (data.length > 0) setCategories(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  return (
    <section
      ref={ref}
      className={`py-16 md:py-24 transition-all duration-700 ${isDark ? 'bg-dark-bg' : 'bg-white'}`}
      aria-label="Browse saree categories"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <p
            className="text-brand-gold text-xs uppercase tracking-widest mb-2 font-body"
            style={{ letterSpacing: '0.3em' }}
          >
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

        {/* Skeleton while fetching */}
        {!loaded ? (
          <div className="flex gap-5 overflow-hidden py-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-shrink-0 rounded-2xl overflow-hidden" style={{ width: '220px', height: '320px' }}>
                <div className="shimmer w-full h-full" />
              </div>
            ))}
          </div>
        ) : (
          /* Auto-scroll container */
          <div className="relative overflow-hidden">
            {/* Fade edges */}
            <div
              className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
              style={{ background: isDark ? 'linear-gradient(to right, #1a1410, transparent)' : 'linear-gradient(to right, white, transparent)' }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
              style={{ background: isDark ? 'linear-gradient(to left, #1a1410, transparent)' : 'linear-gradient(to left, white, transparent)' }}
            />
            <div className="auto-scroll-container gap-5 py-4">
              {[...categories, ...categories].map((cat, i) => (
                <CategoryCard key={`${cat.id}-${i}`} category={cat} isDark={isDark} />
              ))}
            </div>
          </div>
        )}

        {/* View all link — links to first category */}
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
interface CategoryCardProps {
  category: Category;
  isDark:   boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, isDark }) => (
  <Link
    to={`/category/${category.id}`}
    className="flex-shrink-0 group relative overflow-hidden rounded-2xl cursor-pointer"
    style={{ width: '220px', height: '320px' }}
    aria-label={`Browse ${category.name}`}
  >
    <img
      src={category.image}
      alt={category.name}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      loading="lazy"
    />

    {/* Overlay */}
    <div
      className="absolute inset-0 transition-all duration-300"
      style={{ background: 'linear-gradient(to top, rgba(26,20,16,0.85) 40%, rgba(26,20,16,0.2) 80%, transparent 100%)' }}
    />

    {/* Hover border glow */}
    <div
      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{ boxShadow: 'inset 0 0 0 2px #bc3d3e' }}
    />

    {/* Text */}
    <div className="absolute bottom-0 left-0 right-0 p-5">
      <h3
        style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.25rem', fontWeight: 600 }}
        className="text-brand-cream mb-1"
      >
        {category.name}
      </h3>
      {category.count > 0 && (
        <p className="text-brand-orange text-xs font-body" style={{ letterSpacing: '0.1em' }}>
          {category.count} Sarees
        </p>
      )}
      <div
        className="mt-2 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded"
        style={{ background: 'linear-gradient(90deg, #bc3d3e, #b6893c)' }}
      />
    </div>
  </Link>
);

export default CategorySection;