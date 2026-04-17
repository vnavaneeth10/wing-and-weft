// src/components/Navbar/Navbar.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Instagram, Sun, Moon, Menu, X, ChevronDown, ArrowRight, PackageSearch,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSearchSuggestions } from '../../hooks';
import { INSTAGRAM_URL } from '../../data/products';
import { getCategories, CachedCategory } from '../../lib/categoriesCache';

const TRACK_ORDER_URL = 'https://trackcourier.io/';

const Navbar: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [menuOpen, setMenuOpen]       = useState(false);
  const [catOpen, setCatOpen]         = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled]       = useState(false);
  const [navCategories, setNavCategories] = useState<CachedCategory[]>([]);

  const suggestions = useSearchSuggestions(searchQuery);

  // ── Uses shared cache — no duplicate network call if other components already fetched
  useEffect(() => {
    getCategories().then(setNavCategories).catch(() => {});
  }, []);

  const searchRef = useRef<HTMLDivElement>(null);
  const catRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setMenuOpen(false);
    setSearchOpen(false);
    setCatOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (catRef.current  && !catRef.current.contains(e.target as Node))  setCatOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Keyboard handler for the dropdown — Arrow keys + Escape
  const handleDropdownKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!catOpen) return;
    const items = catRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
    if (!items || items.length === 0) return;
    const focused = document.activeElement as HTMLElement;
    const idx     = Array.from(items).indexOf(focused);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[idx < items.length - 1 ? idx + 1 : 0].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[idx > 0 ? idx - 1 : items.length - 1].focus();
    } else if (e.key === 'Escape') {
      setCatOpen(false);
    }
  }, [catOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // ── Active state: /categories and /category/* both highlight the Categories button
  const isCatActive = location.pathname.startsWith('/categor');

  const navBg = scrolled
    ? isDark
      ? 'bg-dark-bg/95 border-dark-border shadow-lg'
      : 'bg-brand-cream/95 border-brand-cream-dark shadow-lg'
    : isDark
    ? 'bg-dark-bg/80 border-transparent'
    : 'bg-brand-cream/80 border-transparent';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${navBg}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0" aria-label="Wing & Weft Home">
            <picture>
              <source srcSet="/logo@2x.webp 2x, /logo@1x.webp 1x" type="image/webp" />
              <source srcSet="/logo@2x.png 2x, /logo@1x.png 1x"  type="image/png" />
              <img
                src="/logo@1x.png"
                alt="Wing & Weft"
                width={160}
                height={90}
                className="w-auto object-contain transition-opacity duration-300"
                style={{ height: 'clamp(36px, 4.5vw, 48px)' }}
                loading="eager"
                decoding="async"
              />
            </picture>
            <div className="hidden sm:block">
              <span
                style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem', fontWeight: 600, letterSpacing: '0.05em', lineHeight: 1 }}
                className={isDark ? 'text-brand-cream' : 'text-stone-800'}
              >
                Wing &amp; Weft
              </span>
              <p
                style={{ fontSize: '0.7rem', letterSpacing: '0.2em', fontFamily: '"Raleway", sans-serif' }}
                className={isDark ? 'text-brand-cream' : 'text-stone-800'}
              >
                CHEERS TO THE NEW BEGINNINGS
              </p>
            </div>
          </Link>

          {/* ── Center Nav — Desktop ── */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            <NavLink to="/" label="Home" isDark={isDark} />

            {/* Categories dropdown */}
            <div ref={catRef} className="relative" onKeyDown={handleDropdownKeyDown}>
              <button
                className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-semibold transition-colors font-body ${
                  isCatActive
                    ? isDark ? 'text-brand-orange bg-brand-red/10' : 'text-brand-red bg-brand-red/10'
                    : isDark ? 'text-dark-text hover:text-brand-orange hover:bg-dark-card/50' : 'text-stone-700 hover:text-brand-red hover:bg-brand-red/5'
                }`}
                onClick={() => setCatOpen(v => !v)}
                aria-expanded={catOpen}
                aria-haspopup="true"
                aria-controls="categories-dropdown"
              >
                Categories
                <ChevronDown size={14} className={`transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`} />
              </button>

              {catOpen && (
                <div
                  id="categories-dropdown"
                  className={`absolute top-full left-0 mt-2 w-56 rounded-xl shadow-2xl border z-50 overflow-y-auto ${
                    isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-brand-cream'
                  }`}
                  role="menu"
                  aria-label="Product categories"
                  style={{ maxHeight: 'min(320px, 60vh)' }}
                >
                  {navCategories.length > 0 ? (
                    <>
                      {navCategories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/category/${cat.id}`}
                          className={`flex items-center px-4 py-3 text-sm transition-colors ${
                            isDark
                              ? 'text-dark-text hover:bg-brand-red/10 hover:text-brand-orange'
                              : 'text-stone-700 hover:bg-brand-cream hover:text-brand-red'
                          }`}
                          role="menuitem"
                          tabIndex={0}
                        >
                          <span className="font-body">{cat.name}</span>
                        </Link>
                      ))}

                      {/* View all collections — SEO internal link + UX shortcut */}
                      <Link
                        to="/categories"
                        className={`flex items-center justify-between px-4 py-3 text-xs font-semibold font-body border-t transition-colors ${
                          isDark
                            ? 'border-dark-border text-brand-gold hover:bg-brand-red/10'
                            : 'border-brand-cream-dark text-brand-gold hover:bg-brand-cream'
                        }`}
                        role="menuitem"
                        tabIndex={0}
                      >
                        View all collections
                        <ArrowRight size={12} />
                      </Link>
                    </>
                  ) : (
                    // Skeleton while loading
                    [1, 2, 3].map(n => (
                      <div key={n} className="flex items-center px-4 py-3">
                        <div className={`h-3 w-28 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-stone-200'}`} />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <NavLink to="/our-story" label="About Us" isDark={isDark} />
            <NavLink to="/contact"   label="Contact"  isDark={isDark} />

            {/* ── Track your Order — external link ── */}
            <a
              href={TRACK_ORDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-colors font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-1 ${
                isDark
                  ? 'text-dark-text hover:text-brand-orange hover:bg-dark-card/50'
                  : 'text-stone-700 hover:text-brand-red hover:bg-brand-red/5'
              }`}
              aria-label="Track your courier order (opens in new tab)"
              title="Track your courier order"
            >
              <PackageSearch size={14} aria-hidden="true" />
              Track Order
            </a>
          </div>

          {/* ── Right side ── */}
          <div className="flex items-center gap-2">

            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen(v => !v)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'text-dark-text hover:text-brand-orange hover:bg-dark-card' : 'text-stone-700 hover:text-brand-red hover:bg-brand-cream'
                }`}
                aria-label="Open search"
              >
                <Search size={18} />
              </button>

              {searchOpen && (
                <div
                  className={`absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl border overflow-hidden z-50 ${
                    isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-brand-cream'
                  }`}
                >
                  <form onSubmit={handleSearchSubmit} className="p-3">
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search sarees, fabrics…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm outline-none border transition-colors font-body ${
                          isDark
                            ? 'bg-dark-bg border-dark-border text-dark-text placeholder-dark-muted focus:border-brand-red'
                            : 'bg-brand-cream/50 border-brand-cream-dark text-stone-800 placeholder-stone-400 focus:border-brand-red'
                        }`}
                        aria-label="Search products"
                      />
                      <button
                        type="submit"
                        className="p-2 rounded-lg bg-brand-red text-white hover:bg-brand-red-dark transition-colors"
                        aria-label="Submit search"
                      >
                        <Search size={16} />
                      </button>
                    </div>
                  </form>

                  {/* Live suggestions */}
                  {suggestions.length > 0 && (
                    <div className={`border-t ${isDark ? 'border-dark-border' : 'border-brand-cream'}`}>
                      {suggestions.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                            isDark ? 'hover:bg-dark-bg text-dark-text' : 'hover:bg-brand-cream/50 text-stone-700'
                          }`}
                          onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        >
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                              loading="lazy"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium font-body">{product.name}</p>
                            <p className={`text-xs font-body ${isDark ? 'text-dark-muted' : 'text-stone-500'}`}>
                              {product.category.replace(/-/g, ' ')} · ₹{product.discount_price || product.price}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchQuery.trim().length > 1 && suggestions.length === 0 && (
                    <div className={`px-4 py-3 text-xs font-body ${isDark ? 'text-dark-muted' : 'text-stone-400'}`}>
                      No products found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Instagram */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'text-dark-text hover:text-brand-orange hover:bg-dark-card' : 'text-stone-700 hover:text-brand-red hover:bg-brand-cream'
              }`}
              aria-label="Follow us on Instagram"
            >
              <Instagram size={18} />
            </a>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'text-brand-gold hover:bg-dark-card' : 'text-brand-gold hover:bg-brand-cream'
              }`}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Mobile menu button */}
            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isDark ? 'text-dark-text hover:bg-dark-card' : 'text-stone-700 hover:bg-brand-cream'
              }`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div
          className={`md:hidden border-t px-4 py-4 space-y-1 ${
            isDark ? 'bg-dark-bg border-dark-border' : 'bg-brand-cream border-brand-cream-dark'
          }`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <MobileLink to="/" label="Home" isDark={isDark} />
          <div>
            <button
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold font-body ${
                isCatActive
                  ? isDark ? 'text-brand-orange bg-brand-red/10' : 'text-brand-red bg-brand-red/5'
                  : isDark ? 'text-dark-text' : 'text-stone-800'
              }`}
              onClick={() => setCatOpen(v => !v)}
              aria-expanded={catOpen}
            >
              Categories
              <ChevronDown size={14} className={`transition-transform ${catOpen ? 'rotate-180' : ''}`} />
            </button>
            {catOpen && (
              <div className={`ml-4 mt-1 space-y-0.5 border-l-2 pl-4 ${isDark ? 'border-brand-red/30' : 'border-brand-gold'}`}>
                {navCategories.length > 0 ? (
                  <>
                    {navCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.id}`}
                        className={`block py-2 text-sm font-body ${isDark ? 'text-dark-muted hover:text-brand-orange' : 'text-stone-600 hover:text-brand-red'}`}
                      >
                        {cat.name}
                      </Link>
                    ))}
                    <Link
                      to="/categories"
                      className={`flex items-center gap-1.5 py-2 text-xs font-semibold font-body ${isDark ? 'text-brand-gold' : 'text-brand-gold'}`}
                    >
                      View all collections
                      <ArrowRight size={11} />
                    </Link>
                  </>
                ) : (
                  [1, 2, 3].map(n => (
                    <div key={n} className={`h-3 w-24 rounded animate-pulse my-2.5 ${isDark ? 'bg-white/10' : 'bg-stone-200'}`} />
                  ))
                )}
              </div>
            )}
          </div>
          <MobileLink to="/our-story" label="About Us" isDark={isDark} />
          <MobileLink to="/contact"   label="Contact"  isDark={isDark} />

          {/* ── Track your Order — Mobile ── */}
          <a
            href={TRACK_ORDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold font-body transition-colors ${
              isDark
                ? 'text-dark-text hover:text-brand-orange hover:bg-dark-card'
                : 'text-stone-800 hover:text-brand-red hover:bg-white/50'
            }`}
            aria-label="Track your courier order (opens in new tab)"
          >
            <PackageSearch size={15} aria-hidden="true" />
            Track your Order
          </a>
        </div>
      )}
    </nav>
  );
};

// ─── NavLink ──────────────────────────────────────────────────────────────────

const NavLink: React.FC<{ to: string; label: string; isDark: boolean }> = ({ to, label, isDark }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-1 ${
        isActive
          ? isDark ? 'text-brand-orange bg-brand-red/10' : 'text-brand-red bg-brand-red/10'
          : isDark ? 'text-dark-text hover:text-brand-orange hover:bg-dark-card/50' : 'text-stone-700 hover:text-brand-red hover:bg-brand-red/5'
      }`}
    >
      {label}
    </Link>
  );
};

// ─── MobileLink ───────────────────────────────────────────────────────────────

const MobileLink: React.FC<{ to: string; label: string; isDark: boolean }> = ({ to, label, isDark }) => (
  <Link
    to={to}
    className={`block px-3 py-2.5 rounded-lg text-sm font-semibold font-body ${
      isDark ? 'text-dark-text hover:text-brand-orange hover:bg-dark-card' : 'text-stone-800 hover:text-brand-red hover:bg-white/50'
    }`}
  >
    {label}
  </Link>
);

export default Navbar;