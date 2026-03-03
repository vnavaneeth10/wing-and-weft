// src/components/WatchShop/WatchShop.tsx
import React, { useRef, useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useInView } from '../../hooks';

const DUMMY_REELS = [
  { id: '1', thumbnail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop', name: 'Kanchipuram Draping Style', price: 7200, link: 'https://www.instagram.com/wingandweft/' },
  { id: '2', thumbnail: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=600&fit=crop', name: 'Kerala Kasavu Elegance', price: 1900, link: 'https://www.instagram.com/wingandweft/' },
  { id: '3', thumbnail: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=600&fit=crop', name: 'Georgette Party Look', price: 3800, link: 'https://www.instagram.com/wingandweft/' },
  { id: '4', thumbnail: 'https://images.unsplash.com/photo-1631947430066-48c30d57b943?w=400&h=600&fit=crop', name: 'Linen Office Drape', price: 3200, link: 'https://www.instagram.com/wingandweft/' },
  { id: '5', thumbnail: 'https://images.unsplash.com/photo-1617627143233-a6699d9f3d2a?w=400&h=600&fit=crop', name: 'Chiffon Floral Draping', price: 2100, link: 'https://www.instagram.com/wingandweft/' },
];

const WatchShop: React.FC = () => {
  const { isDark } = useTheme();
  const { ref, inView } = useInView();

  return (
    <section
      ref={ref}
      className={`py-16 md:py-24 ${isDark ? 'bg-dark-card' : 'bg-brand-cream/30'}`}
      aria-label="Watch and shop our saree reels"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          className={`text-center mb-10 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <p className="text-brand-gold text-xs uppercase tracking-widest mb-2 font-body" style={{ letterSpacing: '0.3em' }}>
            See it in action
          </p>
          <h2
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600 }}
            className={isDark ? 'text-brand-cream' : 'text-stone-800'}
          >
            Watch & Shop
          </h2>
          <div className="saree-divider w-32 mx-auto mt-4" />
        </div>

        <div className="relative overflow-hidden">
          <div
            className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
            style={{ background: isDark ? 'linear-gradient(to right, #231d17, transparent)' : 'linear-gradient(to right, #f5f0e8, transparent)' }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
            style={{ background: isDark ? 'linear-gradient(to left, #231d17, transparent)' : 'linear-gradient(to left, #f5f0e8, transparent)' }}
          />
          <div className="auto-scroll-container gap-5 py-3" style={{ animationDuration: '30s' }}>
            {[...DUMMY_REELS, ...DUMMY_REELS].map((reel, i) => (
              <ReelCard key={`${reel.id}-${i}`} reel={reel} isDark={isDark} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const ReelCard: React.FC<{ reel: typeof DUMMY_REELS[0]; isDark: boolean }> = ({ reel, isDark }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={reel.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 group relative overflow-hidden rounded-2xl cursor-pointer block"
      style={{ width: '200px', height: '300px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Watch and shop: ${reel.name}`}
    >
      <img
        src={reel.thumbnail}
        alt={reel.name}
        className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? 'scale-110' : 'scale-100'}`}
        loading="lazy"
      />
      {/* Overlay */}
      <div
        className={`absolute inset-0 transition-all duration-300 flex flex-col items-center justify-center ${
          hovered ? 'bg-black/50' : 'bg-gradient-to-t from-black/60 via-transparent to-transparent'
        }`}
      >
        {/* Play button on hover */}
        <div className={`transition-all duration-300 ${hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(233,227,203,0.2)', border: '2px solid rgba(233,227,203,0.7)' }}
          >
            <Play size={24} color="#e9e3cb" fill="#e9e3cb" />
          </div>
        </div>
        {/* Product info on hover */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${
            hovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-70'
          }`}
        >
          <p
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1rem', fontWeight: 600 }}
            className="text-brand-cream mb-0.5 line-clamp-1"
          >
            {reel.name}
          </p>
          <p className="text-brand-orange text-sm font-body font-semibold">₹{reel.price.toLocaleString()}</p>
          {hovered && (
            <div className="flex items-center gap-1 mt-1 text-brand-cream/70 text-xs font-body">
              <ExternalLink size={10} /> View Post
            </div>
          )}
        </div>
      </div>
    </a>
  );
};

export default WatchShop;
