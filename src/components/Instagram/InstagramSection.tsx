// src/components/Instagram/InstagramSection.tsx
import React from 'react';
import { Instagram } from 'lucide-react';
import { INSTAGRAM_POSTS, INSTAGRAM_URL } from '../../data/products';
import { useTheme } from '../../context/ThemeContext';
import { useInView } from '../../hooks';

const InstagramSection: React.FC = () => {
  const { isDark } = useTheme();
  const { ref, inView } = useInView();

  return (
    <section
      ref={ref}
      className={`py-16 md:py-24 ${isDark ? 'bg-dark-bg' : 'bg-white'}`}
      aria-label="Follow us on Instagram"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div
          className={`text-center mb-10 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Instagram size={20} className="text-brand-red" />
            <p className="text-brand-gold text-xs uppercase tracking-widest font-body" style={{ letterSpacing: '0.3em' }}>
              Follow Us on Instagram
            </p>
          </div>
          <h2
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600 }}
            className={isDark ? 'text-brand-cream' : 'text-stone-800'}
          >
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-red transition-colors"
            >
              @wingandweft
            </a>
          </h2>
          <div className="saree-divider w-32 mx-auto mt-4" />
        </div>

        {/* Auto-scrolling posts */}
        <div className="relative overflow-hidden mb-10">
          <div
            className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
            style={{ background: isDark ? 'linear-gradient(to right, #1a1410, transparent)' : 'linear-gradient(to right, white, transparent)' }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
            style={{ background: isDark ? 'linear-gradient(to left, #1a1410, transparent)' : 'linear-gradient(to left, white, transparent)' }}
          />
          <div className="auto-scroll-container gap-4 py-2" style={{ animationDuration: '25s' }}>
            {[...INSTAGRAM_POSTS, ...INSTAGRAM_POSTS].map((post, i) => (
              <a
                key={`${post.id}-${i}`}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 group relative overflow-hidden rounded-xl cursor-pointer"
                style={{ width: '220px', height: '280px' }}
                aria-label={`View Instagram post: ${post.caption}`}
              >
                <img
                  src={post.image}
                  alt={post.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 text-center">
                    <Instagram size={32} color="white" className="mx-auto mb-2" />
                    <p className="text-white text-xs font-body font-semibold">{post.caption}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Follow button */}
        <div className="text-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold font-body text-sm uppercase tracking-widest transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(220,39,67,0.4)',
              letterSpacing: '0.15em',
            }}
          >
            <Instagram size={18} />
            Follow on Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
