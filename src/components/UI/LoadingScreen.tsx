// src/components/UI/LoadingScreen.tsx
import React, { useEffect, useState, useRef } from 'react';

interface Props {
  onComplete: () => void;
}

const STYLES = `
  @keyframes ls-grain {
    0%,100%{transform:translate(0,0)} 10%{transform:translate(-3%,-2%)}
    20%{transform:translate(2%,3%)} 30%{transform:translate(-1%,2%)}
    40%{transform:translate(3%,-2%)} 50%{transform:translate(-2%,1%)}
    60%{transform:translate(1%,-3%)} 70%{transform:translate(-3%,2%)}
    80%{transform:translate(2%,-1%)} 90%{transform:translate(1%,3%)}
  }

  /* ── Woven lines background ── */
  @keyframes ls-line-rise {
    0%   { transform: scaleY(0); opacity: 0; }
    40%  { opacity: 1; }
    100% { transform: scaleY(1); opacity: 0.18; }
  }
  @keyframes ls-line-fall {
    0%,100% { opacity: 0.06; transform: translateY(0); }
    50%     { opacity: 0.16; transform: translateY(-8px); }
  }

  /* ── Petal bloom ── */
  @keyframes ls-petal {
    0%   { opacity: 0; transform: rotate(var(--r)) translateY(-50px) scale(0.3); }
    30%  { opacity: 1; }
    70%  { opacity: 0.8; }
    100% { opacity: 0; transform: rotate(var(--r)) translateY(-90px) scale(0.8); }
  }

  /* ── Logo entrance ── */
  @keyframes ls-logo-in {
    0%   { opacity: 0; transform: scale(0.6) translateY(20px); }
    60%  { transform: scale(1.04) translateY(-3px); }
    80%  { transform: scale(0.98) translateY(1px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }

  /* ── Shimmer sweep across logo ── */
  @keyframes ls-logo-shimmer {
    0%   { left: -80%; }
    100% { left: 130%; }
  }

  /* ── Text reveal ── */
  @keyframes ls-text-in {
    from { opacity: 0; transform: translateY(14px) letterSpacing(0.5em); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Orbiting dot ── */
  @keyframes ls-orbit {
    from { transform: rotate(0deg) translateX(var(--or)) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(var(--or)) rotate(-360deg); }
  }

  /* ── Diamond breathe ── */
  @keyframes ls-diamond-breathe {
    0%,100% { transform: rotate(45deg) scale(1); box-shadow: 0 0 6px rgba(182,137,60,0.5); }
    50%     { transform: rotate(45deg) scale(1.4); box-shadow: 0 0 18px rgba(182,137,60,0.9), 0 0 36px rgba(182,137,60,0.3); }
  }

  /* ── Progress bar fill ── */
  @keyframes ls-glow-pulse {
    0%,100% { box-shadow: 0 0 6px rgba(188,61,62,0.5); }
    50%     { box-shadow: 0 0 16px rgba(188,61,62,0.9), 0 0 32px rgba(182,137,60,0.4); }
  }

  /* ── Corner ornament draw ── */
  @keyframes ls-corner-in {
    from { opacity: 0; transform: scale(0.5); }
    to   { opacity: 1; transform: scale(1); }
  }

  /* ── Tagline dots ── */
  @keyframes ls-dot-bounce {
    0%,80%,100% { transform: translateY(0); opacity: 0.4; }
    40%         { transform: translateY(-5px); opacity: 1; }
  }

  /* ── Fade out ── */
  @keyframes ls-fadeout {
    from { opacity: 1; }
    to   { opacity: 0; }
  }

  .ls-root {
    position: fixed; inset: 0;
    background: #f5ede0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    z-index: 9999;
    overflow: hidden;
    font-family: 'Raleway', sans-serif;
  }

  /* grain */
  .ls-grain {
    position: absolute; inset: -50%; width: 200%; height: 200%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity: 0.022; pointer-events: none;
    animation: ls-grain 10s steps(10) infinite; z-index: 1;
  }

  /* woven line bg */
  .ls-lines {
    position: absolute; inset: 0;
    display: flex; justify-content: space-between;
    pointer-events: none; z-index: 0; padding: 0 8%;
  }
  .ls-vline {
    width: 1px; height: 100%;
    background: linear-gradient(to bottom,
      transparent 0%,
      rgba(182,137,60,0.15) 20%,
      rgba(182,137,60,0.15) 80%,
      transparent 100%
    );
    animation: ls-line-fall 4s ease-in-out infinite;
  }

  /* corner ornaments */
  .ls-corner {
    position: absolute; pointer-events: none; z-index: 2;
    opacity: 0;
    animation: ls-corner-in 0.6s cubic-bezier(0.22,1,0.36,1) forwards;
  }
  .ls-corner-inner {
    position: relative; width: 36px; height: 36px;
  }
  .ls-corner-inner::before,
  .ls-corner-inner::after {
    content: ''; position: absolute; background: #b6893c;
  }
  .ls-corner-inner::before { width: 100%; height: 1px; top: 0; left: 0; }
  .ls-corner-inner::after  { width: 1px; height: 100%; top: 0; left: 0; }

  /* petal burst container */
  .ls-petals {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    pointer-events: none; z-index: 2;
  }
  .ls-petal {
    position: absolute;
    width: 4px; height: 4px; border-radius: 50%;
    animation: ls-petal 2.4s ease-in-out infinite;
    opacity: 0;
  }

  /* logo wrapper */
  .ls-logo-wrap {
    position: relative; z-index: 10;
    display: flex; align-items: center; justify-content: center;
    opacity: 0;
    animation: ls-logo-in 1s cubic-bezier(0.22,1,0.36,1) 0.2s forwards;
  }
  .ls-logo-img {
    width: auto; object-fit: contain;
    height: clamp(80px, 12vw, 120px);
    max-width: 320px;
    display: block;
  }
  /* shimmer overlay on logo */
  .ls-logo-shimmer-wrap {
    position: relative; overflow: hidden; display: inline-block;
  }
  .ls-logo-shimmer-wrap::after {
    content: '';
    position: absolute; top: 0; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
    animation: ls-logo-shimmer 2.2s ease-in-out 0.8s infinite;
    pointer-events: none;
  }

  /* orbiting dots */
  .ls-orbit-dot {
    position: absolute; border-radius: 50%;
    top: 50%; left: 50%;
    margin-top: -4px; margin-left: -4px;
    animation: ls-orbit var(--dur) linear infinite;
  }

  /* brand name */
  .ls-brand {
    opacity: 0;
    animation: ls-text-in 0.7s ease 0.9s forwards;
    text-align: center;
  }

  /* rule + diamond */
  .ls-rule {
    display: flex; align-items: center; gap: 12px;
    opacity: 0;
    animation: ls-text-in 0.6s ease 1.1s forwards;
  }
  .ls-rule-line {
    height: 1px; width: 48px;
    background: linear-gradient(90deg, transparent, rgba(182,137,60,0.5));
  }
  .ls-rule-line.r { background: linear-gradient(90deg, rgba(182,137,60,0.5), transparent); }
  .ls-diamond {
    width: 6px; height: 6px;
    background: #b6893c; transform: rotate(45deg);
    animation: ls-diamond-breathe 1.8s ease-in-out 1.2s infinite;
  }

  /* progress bar */
  .ls-bar-wrap {
    width: clamp(160px, 25vw, 220px); height: 2px;
    background: rgba(182,137,60,0.15);
    border-radius: 2px; overflow: hidden;
    opacity: 0;
    animation: ls-text-in 0.5s ease 1.2s forwards;
  }
  .ls-bar-fill {
    height: 100%; border-radius: 2px;
    background: linear-gradient(90deg, #bc3d3e, #e69358, #b6893c);
    transition: width 0.12s ease;
    animation: ls-glow-pulse 1.5s ease-in-out infinite;
  }

  /* tagline */
  .ls-tagline {
    opacity: 0;
    animation: ls-text-in 0.5s ease 1.35s forwards;
    display: flex; align-items: center; gap: 3px;
  }
  .ls-dot {
    width: 3px; height: 3px; border-radius: 50%;
    background: rgba(182,137,60,0.7);
    animation: ls-dot-bounce 1.2s ease-in-out infinite;
  }
`;

const PETAL_COLORS = ['#bc3d3e','#b6893c','#e69358','#d4956a','#f0c070','#bc3d3e','#b6893c','#e69358'];

const LoadingScreen: React.FC<Props> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut]   = useState(false);
  const styleRef                = useRef(false);

  useEffect(() => {
    if (!styleRef.current) {
      const tag = document.createElement('style');
      tag.textContent = STYLES;
      document.head.appendChild(tag);
      styleRef.current = true;
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(onComplete, 800);
          }, 800);
          return 100;
        }
        return Math.min(p + Math.random() * 4 + 1, 100);
      });
    }, 120);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="ls-root" style={{
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.7s ease',
      pointerEvents: fadeOut ? 'none' : 'all',
    }}>

      {/* Injected styles handled via useEffect */}

      {/* Grain */}
      <div className="ls-grain" />

      {/* Vertical woven lines */}
      <div className="ls-lines">
        {[0,1,2,3,4,5,6].map((_, i) => (
          <div key={i} className="ls-vline"
            style={{ animationDelay: `${i * 0.55}s`, animationDuration: `${3.5 + i * 0.3}s` }} />
        ))}
      </div>

      {/* Corner ornaments */}
      {[
        { style: { top: 20, left: 20 },  delay: '0.1s',  transform: 'none' },
        { style: { top: 20, right: 20 }, delay: '0.2s',  transform: 'scaleX(-1)' },
        { style: { bottom: 20, left: 20 },  delay: '0.3s', transform: 'scaleY(-1)' },
        { style: { bottom: 20, right: 20 }, delay: '0.4s', transform: 'scale(-1,-1)' },
      ].map((c, i) => (
        <div key={i} className="ls-corner" style={{ ...c.style, animationDelay: c.delay }}>
          <div className="ls-corner-inner" style={{ transform: c.transform }} />
        </div>
      ))}

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '50vw', height: '50vw', maxWidth: '400px', maxHeight: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(188,61,62,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }}/>
      <div style={{
        position: 'absolute', bottom: '-5%', right: '-5%',
        width: '35vw', height: '35vw', maxWidth: '320px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(182,137,60,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }}/>

      {/* ── Center content ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '20px',
      }}>

        {/* Petal burst + orbiting dots around logo */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          {/* Orbiting dots */}
          {[
            { size: 7, color: '#bc3d3e', r: 110, dur: '3.2s', delay: '0s',    opacity: 0.7 },
            { size: 5, color: '#b6893c', r: 130, dur: '4.8s', delay: '-1.5s', opacity: 0.6 },
            { size: 4, color: '#e69358', r: 95,  dur: '2.6s', delay: '-0.8s', opacity: 0.55 },
          ].map((d, i) => (
            <div key={i} className="ls-orbit-dot" style={{
              width: d.size, height: d.size,
              background: d.color, opacity: d.opacity,
              '--or': `${d.r}px`, '--dur': d.dur,
              animationDelay: d.delay,
              boxShadow: `0 0 ${d.size * 2}px ${d.color}`,
            } as React.CSSProperties}/>
          ))}

          {/* Petal burst */}
          <div className="ls-petals">
            {PETAL_COLORS.map((color, i) => (
              <div key={i} className="ls-petal" style={{
                background: color,
                '--r': `${i * 45}deg`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${2.4 + i * 0.15}s`,
                boxShadow: `0 0 6px ${color}`,
              } as React.CSSProperties}/>
            ))}
          </div>

          {/* Logo — large, prominent, shimmer sweep */}
          <div className="ls-logo-wrap">
            <div className="ls-logo-shimmer-wrap">
              <picture>
                <source srcSet="/logo@2x.webp 2x, /logo@1x.webp 1x" type="image/webp" />
                <source srcSet="/logo@2x.png 2x, /logo@1x.png 1x"  type="image/png" />
                <img
                  src="/logo@1x.png"
                  alt="Wing & Weft"
                  className="ls-logo-img"
                  loading="eager"
                  decoding="sync"
                />
              </picture>
            </div>
          </div>
        </div>

        {/* Brand name + tagline */}
        <div className="ls-brand">
          <h1 style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 500,
            color: '#1a1410',
            letterSpacing: '0.12em',
            lineHeight: 1.1,
          }}>
            Wing &amp; Weft
          </h1>
          <p style={{
            fontFamily: '"Raleway", sans-serif',
            fontSize: '0.65rem',
            letterSpacing: '0.28em',
            color: '#b6893c',
            marginTop: '0.35rem',
            textTransform: 'uppercase',
          }}>
            CHEERS TO THE NEW BEGINNINGS
          </p>
        </div>

        {/* Gold rule + diamond */}
        <div className="ls-rule">
          <div className="ls-rule-line" />
          <div className="ls-diamond" />
          <div className="ls-rule-line r" />
        </div>

        {/* Progress bar */}
        <div className="ls-bar-wrap">
          <div className="ls-bar-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>

        {/* Tagline with bouncing dots */}
        <div className="ls-tagline">
          <p style={{
            fontFamily: '"Raleway", sans-serif',
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            color: 'rgba(26,20,16,0.4)',
            textTransform: 'uppercase',
          }}>
            Curating Elegance
          </p>
          <div className="ls-dot" style={{ animationDelay: '0s' }} />
          <div className="ls-dot" style={{ animationDelay: '0.2s' }} />
          <div className="ls-dot" style={{ animationDelay: '0.4s' }} />
        </div>

      </div>
    </div>
  );
};

export default LoadingScreen;