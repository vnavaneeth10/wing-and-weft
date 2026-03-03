// src/pages/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const NotFoundPage: React.FC = () => {
  const { isDark } = useTheme();
  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-dark-bg' : 'bg-stone-50'}`}>
      <div className="text-center">
        <div className="text-8xl mb-6 animate-float">🕊️</div>
        <h1
          className={isDark ? 'text-brand-cream' : 'text-stone-800'}
          style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '4rem', fontWeight: 600, lineHeight: 1 }}
        >
          404
        </h1>
        <p
          className={`mb-2 ${isDark ? 'text-dark-muted' : 'text-stone-500'}`}
          style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem' }}
        >
          Page Not Found
        </p>
        <p className={`text-sm font-body mb-8 ${isDark ? 'text-dark-muted' : 'text-stone-500'}`}>
          The thread seems to have snapped! Let's weave you back home.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold font-body text-sm uppercase tracking-widest transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #bc3d3e, #b6893c)',
            color: '#e9e3cb',
            letterSpacing: '0.15em',
          }}
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
