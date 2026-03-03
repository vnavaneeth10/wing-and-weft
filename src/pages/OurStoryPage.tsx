// src/pages/OurStoryPage.tsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useInView } from '../hooks';

const VALUES = [
  { icon: '✦', title: 'Authenticity', description: 'Every saree in our collection is sourced directly from master weavers, ensuring genuine craftsmanship and fair trade.' },
  { icon: '♡', title: 'Craftsmanship', description: 'We believe in preserving centuries-old weaving traditions by supporting artisan communities across India.' },
  { icon: '❧', title: 'Sustainability', description: 'Handloom weaving uses minimal electricity and supports eco-friendly, slow fashion principles.' },
  { icon: '◆', title: 'Quality', description: 'Each saree undergoes rigorous quality checks before reaching you — because you deserve only the finest.' },
];

const OurStoryPage: React.FC = () => {
  const { isDark } = useTheme();
  const { ref: heroRef, inView: heroVisible } = useInView();
  const { ref: valuesRef, inView: valuesVisible } = useInView();

  const bg = isDark ? 'bg-dark-bg' : 'bg-stone-50';
  const textPrimary = isDark ? 'text-dark-text' : 'text-stone-800';
  const textMuted = isDark ? 'text-dark-muted' : 'text-stone-600';
  const card = isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-stone-200';

  return (
    <div className={`min-h-screen ${bg} pt-20`}>
      {/* Hero banner */}
      <div
        className="relative h-56 md:h-72 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2a1f1a, #bc3d3e)' }}
      >
        <div className="absolute inset-0 pattern-overlay opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <p className="text-brand-cream/60 text-xs uppercase tracking-widest mb-2 font-body" style={{ letterSpacing: '0.3em' }}>
              Our Heritage
            </p>
            <h1
              className="text-brand-cream"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 600 }}
            >
              Our Story
            </h1>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {/* Story section */}
        <div
          ref={heroRef}
          className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20 transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Logo / Brand image */}
          <div className="flex justify-center">
            <div className="relative group cursor-pointer">
              {/* Glow ring */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: '0 0 40px rgba(188,61,62,0.3)', transform: 'scale(1.02)' }}
              />
              {/* Logo placeholder */}
              <div
                className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-500"
                style={{ background: 'linear-gradient(135deg, #bc3d3e 0%, #b6893c 50%, #e69358 100%)' }}
              >
                {/* Replace with: <img src="/logo.png" alt="Wing & Weft logo" className="w-full h-full object-contain p-8" /> */}
                <div className="text-center">
                  <span
                    style={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: '4rem',
                      fontWeight: 700,
                      color: '#e9e3cb',
                      opacity: 0.9,
                      lineHeight: 1,
                    }}
                  >
                    W&W
                  </span>
                  <p style={{ fontFamily: '"Raleway", sans-serif', fontSize: '0.65rem', color: '#e9e3cb', letterSpacing: '0.3em', marginTop: '0.5rem', opacity: 0.8 }}>
                    WING & WEFT
                  </p>
                </div>
                {/* Decorative corner */}
                <div className="absolute top-4 left-4 text-brand-cream/20" style={{ fontSize: '2rem' }}>❧</div>
                <div className="absolute bottom-4 right-4 text-brand-cream/20" style={{ fontSize: '2rem', transform: 'scale(-1,-1)' }}>❧</div>
              </div>
            </div>
          </div>

          {/* Story text */}
          <div>
            <p className="text-brand-gold text-xs uppercase tracking-widest mb-3 font-body" style={{ letterSpacing: '0.3em' }}>
              Woven from Tradition
            </p>
            <h2
              className={`mb-6 ${textPrimary}`}
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(2rem, 3vw, 2.8rem)', fontWeight: 600 }}
            >
              Where Every Thread Tells a Story
            </h2>
            <div className={`space-y-4 text-sm leading-relaxed font-body ${textMuted}`}>
              <p>
                Wing & Weft was born from a deep love for the timeless art of Indian handloom weaving. Founded by a family passionate about preserving the rich textile heritage of India, we set out on a mission to bring authentic, handcrafted sarees to women who appreciate the beauty of tradition.
              </p>
              <p>
                Our journey began in the narrow lanes of weaving villages, where we met master craftsmen whose families had been weaving for generations. Inspired by their dedication and artistry, we decided to build a bridge between these gifted artisans and the modern world.
              </p>
              <p>
                Today, Wing & Weft is more than just a saree brand — it's a movement to celebrate and sustain India's living textile heritage. Every saree we offer is a piece of art, a cultural artifact, and a symbol of a woman's timeless elegance.
              </p>
              <p>
                We believe that when you wear a Wing & Weft saree, you don't just wear fabric — you wear a story of skill, culture, and love.
              </p>
            </div>

            {/* Signature */}
            <div className="mt-6 pt-6 border-t" style={{ borderColor: isDark ? '#3a2e24' : '#e9e3cb' }}>
              <p
                className={textMuted}
                style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.2rem', fontStyle: 'italic' }}
              >
                — The Wing & Weft Family
              </p>
            </div>
          </div>
        </div>

        {/* Values section */}
        <div ref={valuesRef}>
          <div className={`text-center mb-10 transition-all duration-700 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-brand-gold text-xs uppercase tracking-widest mb-2 font-body" style={{ letterSpacing: '0.3em' }}>
              What We Stand For
            </p>
            <h2
              className={textPrimary}
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: 600 }}
            >
              Our Values
            </h2>
            <div className="saree-divider w-32 mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value, i) => (
              <div
                key={value.title}
                className={`rounded-2xl border p-6 text-center group hover:-translate-y-2 transition-all duration-300 ${card}`}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: 'linear-gradient(135deg, #bc3d3e20, #b6893c20)', fontSize: '1.5rem', color: '#b6893c' }}
                >
                  {value.icon}
                </div>
                <h3
                  className={`mb-2 ${textPrimary}`}
                  style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.3rem', fontWeight: 600 }}
                >
                  {value.title}
                </h3>
                <p className={`text-sm font-body leading-relaxed ${textMuted}`}>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurStoryPage;
