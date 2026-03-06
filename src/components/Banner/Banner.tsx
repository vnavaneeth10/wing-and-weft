// src/components/Banner/Banner.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../admin/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────
interface BannerSlide {
  id:        string;
  title:     string;
  subtitle:  string;
  cta_text:  string;
  cta_link:  string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

// ─── Fetch active banners from Supabase ───────────────────────────────────────
const fetchBanners = async (): Promise<BannerSlide[]> => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/banners?is_active=eq.true&order=sort_order.asc`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );
  if (!res.ok) throw new Error('Failed to fetch banners');
  return res.json();
};

// ─── Fallback slides shown while loading or if Supabase has no banners ────────
const FALLBACK_SLIDES: BannerSlide[] = [
  {
    id: '1', title: 'Threads of Tradition',
    subtitle: 'Discover our exquisite collection of handwoven silk sarees',
    cta_text: 'Explore Silk', cta_link: '/category/silk-sarees',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1440&h=700&fit=crop',
    is_active: true, sort_order: 1,
  },
  {
    id: '2', title: 'Draped in Elegance',
    subtitle: 'Premium cotton sarees for every occasion',
    cta_text: 'Shop Cotton', cta_link: '/category/cotton-sarees',
    image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1440&h=700&fit=crop',
    is_active: true, sort_order: 2,
  },
  {
    id: '3', title: 'Woven with Love',
    subtitle: 'Timeless sarees crafted with uncompromising quality and grace',
    cta_text: 'View Collection', cta_link: '/category/silk-sarees',
    image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1440&h=700&fit=crop',
    is_active: true, sort_order: 3,
  },
];

const RIBBON_TEXT =
  'Timeless sarees crafted with uncompromising quality, elegance, and attention to every detail  ✦  Pure fabrics, authentic weaves, heritage craftsmanship  ✦  Free shipping on orders above ₹2000  ✦  Handpicked by artisans, curated for you  ✦  ';

// ─── Banner Component ─────────────────────────────────────────────────────────
const Banner: React.FC = () => {
  const { isDark } = useTheme();
  const [slides, setSlides] = useState<BannerSlide[]>(FALLBACK_SLIDES);
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ✅ Fetch live banners from Supabase on mount
  useEffect(() => {
    fetchBanners()
      .then((data) => {
        // Only update if we got real banners with images
        const withImages = data.filter((b) => b.image_url);
        if (withImages.length > 0) setSlides(withImages);
      })
      .catch(() => {
        // Silently fall back to static slides if fetch fails
      });
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
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5500);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full" aria-label="Featured saree collection banner">
      {/* Main carousel */}
      <div className="relative w-full overflow-hidden" style={{ height: 'clamp(480px, 85vh, 820px)' }}>
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

            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, rgba(26,20,16,0.75) 0%, rgba(26,20,16,0.4) 50%, rgba(26,20,16,0.2) 100%)',
              }}
            />
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{ height: '65%', background: 'linear-gradient(to top, rgba(10,8,6,0.88) 0%, rgba(10,8,6,0.55) 50%, transparent 100%)' }}
            />

            {/* Slide text */}
            <div className="absolute inset-0 flex items-end justify-center z-10 px-6 md:px-16 pb-20 md:pb-28">
              <div className="text-center max-w-2xl">
                <p
                  className="text-brand-orange text-sm md:text-base uppercase tracking-widest mb-3 font-body"
                  style={{ letterSpacing: '0.3em' }}
                >
                  Wing & Weft Collection
                </p>
                <h2
                  className="text-white mb-4"
                  style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                    fontWeight: 600,
                    lineHeight: 1.1,
                    textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                  }}
                >
                  {slide.title}
                </h2>
                <p
                  className="text-brand-cream text-base md:text-xl mb-8 font-body"
                  style={{ fontWeight: 300, textShadow: '0 1px 10px rgba(0,0,0,0.4)' }}
                >
                  {slide.subtitle}
                </p>
                {/* ✅ uses cta_text and cta_link (DB field names) */}
                <Link
                  to={slide.cta_link}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold font-body uppercase tracking-widest transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #bc3d3e, #b6893c)',
                    color: '#e9e3cb',
                    boxShadow: '0 4px 20px rgba(188,61,62,0.4)',
                    letterSpacing: '0.15em',
                  }}
                >
                  {slide.cta_text}
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Arrow controls */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(233,227,203,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(233,227,203,0.25)' }}
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} color="#e9e3cb" />
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(233,227,203,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(233,227,203,0.25)' }}
          aria-label="Next slide"
        >
          <ChevronRight size={20} color="#e9e3cb" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? '24px' : '8px',
                height: '8px',
                background: i === current ? '#bc3d3e' : 'rgba(233,227,203,0.5)',
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Scrolling ribbon */}
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