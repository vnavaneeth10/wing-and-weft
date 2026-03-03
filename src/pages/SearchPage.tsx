// src/pages/SearchPage.tsx
import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { useTheme } from '../context/ThemeContext';
import ProductCard from '../components/Products/ProductCard';

const SearchPage: React.FC = () => {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const { isDark } = useTheme();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [query]);

  const bg = isDark ? 'bg-dark-bg' : 'bg-stone-50';
  const textPrimary = isDark ? 'text-dark-text' : 'text-stone-800';
  const textMuted = isDark ? 'text-dark-muted' : 'text-stone-500';

  return (
    <div className={`min-h-screen ${bg} pt-24 px-4 sm:px-6 max-w-7xl mx-auto pb-16`}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Search size={20} className="text-brand-red" />
          <h1
            className={textPrimary}
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem', fontWeight: 600 }}
          >
            Search Results
          </h1>
        </div>
        <p className={`text-sm font-body ${textMuted}`}>
          {results.length} result{results.length !== 1 ? 's' : ''} for "
          <span className="text-brand-red font-semibold">{query}</span>"
        </p>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4 animate-float">🕊️</p>
          <h2 className={textPrimary} style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem' }}>
            No results found
          </h2>
          <p className={`text-sm font-body mt-2 mb-6 ${textMuted}`}>
            Try a different search term or browse our categories.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold font-body text-sm transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #bc3d3e, #b6893c)', color: '#e9e3cb' }}
          >
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
