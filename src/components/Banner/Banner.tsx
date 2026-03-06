// src/components/Banner/Banner.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../admin/lib/supabase';

interface BannerSlide {
  id:         string;
  title:      string;
  subtitle:   string;
  cta_text:   string;
  cta_link:   string;
  image_url:  string;
  is_active:  boolean;
  sort_order: number;
}

const fetchBanners = async (): Promise<BannerSlide[]> => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/banners?is_active=eq.true&order=sort_order.asc`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  );
  if (!res.ok) throw new Error('Failed to fetch banners');
  return res.json();
};

const FALLBACK_SLIDES: BannerSlide[] = [
  {
    id: '1', title: 'Threads of Tradition',
    subtitle: 'Discover our exquisite collection of handwoven silk sarees',
    cta_text: 'Explore Silk', cta_link: '/category/silk-sarees',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1440&h=820&fit=crop',
    is_active: true, sort_order: 1,
  },
  {
    id: '2', title: 'Draped in Elegance',
    subtitle: 'Premium cotton sarees for every occasion',
    cta_text: 'Shop Cotton', cta_link: '/category/cotton-sarees',
    image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1440&h=820&fit=crop',
    is_active: true, sort_order: 2,
  },
  {
    id: '3', title: 'Woven with Love',
    subtitle: 'Timeless sarees crafted with uncompromising quality and grace',
    cta_text: 'View Collection', cta_link: '/category/silk-sarees',
    image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1440&h=820&fit=crop',
    is_active: true, sort_order: 3,
  },
];

const RIBBON_TEXT =
  'Timeless sarees crafted with uncompromising quality, elegance, and attention to every detail  ✦  Pure fabrics, authentic weaves, heritage craftsmanship  ✦  Free shipping on orders above ₹2000  ✦  Handpicked by artisans, curated for you  ✦  ';

const Banner: React.FC = () => {
  const { isDark } = useTheme();
  const [slides, setSlides]                   = useState<BannerSlide[]>(FALLBACK_SLIDES);
  const [current, setCurrent]                 = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    fetchBanners()
      .then((data) => {
        const withImages = data.filter((b) => b.image_url);
        if (withImages.length > 0) setSlides(withImages);
      })
      .catch(() => {});
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent((index + slides.length) % slides.length);
      setTimeout(() => setIsTransitioning(false), 700);
    },
    [isTransitioning, slides.length]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5500);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full" aria-label="Featured saree collection banner">

      {/* ── Carousel ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: 'clamp(480px, 85vh, 820px)' }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
            aria-hidden={i !== current}
          >
            {/* Image */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={slide.image_url}
                alt={slide.title}
                className={`w-full h-full object-cover ${i === current ? 'banner-slide' : ''}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                style={{ transform: 'scale(1.05)' }}
              />
            </div>

            {/* ── Bottom-up gradient only — top of image fully clear ── */}
            <div
              className="absolute inset-x-0 bottom-0"
              style={{
                height: '70%',
                background: 'linear-gradient(to top, rgba(8,6,4,0.92) 0%, rgba(8,6,4,0.6) 40%, rgba(8,6,4,0.15) 70%, transparent 100%)',
              }}
            />
          </div>
        ))}

        {/* ── Text block: absolutely pinned to bottom ── */}
        <div
          className="absolute inset-x-0 z-10 flex flex-col items-center text-center px-6 md:px-16"
          style={{ bottom: '72px' }}  /* fixed distance from bottom edge */
        >
          <p
            className="text-brand-orange text-sm md:text-base uppercase font-body mb-3"
            style={{ letterSpacing: '0.3em' }}
          >
            Wing &amp; Weft Collection
          </p>
          <h2
            className="text-white mb-3"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
              fontWeight: 600,
              lineHeight: 1.1,
              textShadow: '0 2px 24px rgba(0,0,0,0.6)',
            }}
          >
            {slides[current]?.title}
          </h2>
          <p
            className="text-brand-cream text-base md:text-lg mb-6 font-body max-w-xl"
            style={{ fontWeight: 300, textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}
          >
            {slides[current]?.subtitle}
          </p>
          <Link
            to={slides[current]?.cta_link ?? '/'}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold font-body uppercase transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #bc3d3e, #b6893c)',
              color: '#e9e3cb',
              boxShadow: '0 4px 20px rgba(188,61,62,0.4)',
              letterSpacing: '0.15em',
            }}
          >
            {slides[current]?.cta_text}
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* ── Dots: bottom-center, below text ── */}
        <div
          className="absolute inset-x-0 z-20 flex justify-center gap-2"
          style={{ bottom: '28px' }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? '24px' : '8px',
                height: '8px',
                background: i === current ? '#bc3d3e' : 'rgba(233,227,203,0.45)',
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── Scrolling ribbon ── */}
      <div
        className="overflow-hidden py-3 relative"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, #231d17, #bc3d3e 20%, #b6893c 50%, #bc3d3e 80%, #231d17)'
            : 'linear-gradient(90deg, #2a1f1a, #bc3d3e 20%, #b6893c 50%, #bc3d3e 80%, #2a1f1a)',
        }}
        aria-label="Promotional ribbon"
      >
        <div className="ribbon-text">
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="whitespace-nowrap font-body text-sm px-4"
              style={{ color: '#e9e3cb', letterSpacing: '0.1em' }}
            >
              {RIBBON_TEXT}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Banner;