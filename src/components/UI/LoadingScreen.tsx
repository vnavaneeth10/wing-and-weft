// src/components/UI/LoadingScreen.tsx
import React, { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

const LoadingScreen: React.FC<Props> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut]   = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(onComplete, 600);
          }, 400);
          return 100;
        }
        return p + Math.random() * 12 + 3;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className="loading-screen"
      style={{
        opacity:       fadeOut ? 0 : 1,
        transition:    'opacity 0.6s ease',
        pointerEvents: fadeOut ? 'none' : 'all',
      }}
    >
      {/* Background motif lines */}
      <div className="loading-motif">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="loading-motif-line"
            style={{ animationDelay: `${i * 0.4}s`, animationDuration: `${3 + i * 0.3}s` }}
          />
        ))}
      </div>

      {/* Decorative corner ornaments */}
      <div className="absolute top-6 left-6 text-brand-gold opacity-30" style={{ fontSize: '3rem', lineHeight: 1 }}>❧</div>
      <div className="absolute top-6 right-6 text-brand-gold opacity-30" style={{ fontSize: '3rem', lineHeight: 1, transform: 'scaleX(-1)' }}>❧</div>
      <div className="absolute bottom-6 left-6 text-brand-gold opacity-30" style={{ fontSize: '3rem', lineHeight: 1, transform: 'scaleY(-1)' }}>❧</div>
      <div className="absolute bottom-6 right-6 text-brand-gold opacity-30" style={{ fontSize: '3rem', lineHeight: 1, transform: 'scale(-1,-1)' }}>❧</div>

      {/* Center content */}
      <div className="flex flex-col items-center gap-8 relative z-10">

        {/* ── Logo with spinning ring ── */}
        <div className="relative flex items-center justify-center">
          {/* Spinning ring */}
          <div
            className="absolute rounded-full"
            style={{
              width: '148px', height: '148px',
              border: '2px solid transparent',
              borderTopColor: '#bc3d3e',
              borderRightColor: '#b6893c',
              animation: 'spin 2s linear infinite',
            }}
          />
          {/* Logo image — sits inside the ring */}
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center overflow-hidden"
            style={{
              background: 'rgba(26,20,16,0.6)',
              boxShadow: '0 0 40px rgba(188,61,62,0.35), 0 0 80px rgba(182,137,60,0.15)',
            }}
          >
            <picture>
              <source srcSet="/logo@2x.webp 2x, /logo@1x.webp 1x" type="image/webp" />
              <source srcSet="/logo@2x.png 2x, /logo@1x.png 1x"  type="image/png" />
              <img
                src="/logo@1x.png"
                alt="Wing & Weft"
                width={160}
                height={90}
                className="w-auto object-contain"
                style={{ maxWidth: '88px', padding: '12px' }}
                loading="eager"
                decoding="sync"
              />
            </picture>
          </div>
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1 style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '2.5rem', fontWeight: 600,
            color: '#e9e3cb', letterSpacing: '0.15em', lineHeight: 1.1,
          }}>
            Wing & Weft
          </h1>
          <p style={{
            fontFamily: '"Raleway", sans-serif',
            fontSize: '0.7rem', letterSpacing: '0.3em',
            color: '#b6893c', marginTop: '0.4rem', textTransform: 'uppercase',
          }}>
            Timeless Sarees
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(233,227,203,0.15)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(progress, 100)}%`,
              background: 'linear-gradient(90deg, #bc3d3e, #b6893c)',
              transition: 'width 0.1s ease',
              boxShadow: '0 0 8px rgba(188,61,62,0.6)',
            }}
          />
        </div>

        {/* Loading text */}
        <p style={{
          fontFamily: '"Raleway", sans-serif',
          fontSize: '0.7rem', letterSpacing: '0.2em',
          color: 'rgba(233,227,203,0.5)', textTransform: 'uppercase',
        }}>
          Curating Elegance…
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;