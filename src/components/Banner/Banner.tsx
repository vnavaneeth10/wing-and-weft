// src/components/Banner/Banner.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../admin/lib/supabase';

interface BannerSlide {
  id:         string;
  title:      string;
  subtitle:   string;
  eyebrow:    string;
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
  if (!res.ok) throw new Error('Failed');
  return res.json();
};

const RIBBON_ITEMS = [
  'Handwoven Heritage', '◆', 'Free Shipping Above ₹2000', '◆',
  'Pure Silk & Cotton', '◆', 'Artisan Crafted', '◆',
  'New Arrivals Weekly', '◆', 'Authentic Weaves', '◆',
  'Curated Collections', '◆', 'Since Generations', '◆',
];

const STYLES = `
  @keyframes bnr-kb-1 {
    0%   { transform: scale(1.10) translate(8px, 4px); }
    100% { transform: scale(1.0)  translate(0, 0); }
  }
  @keyframes bnr-kb-2 {
    0%   { transform: scale(1.12) translate(-6px, -4px); }
    100% { transform: scale(1.0)  translate(0, 0); }
  }
  @keyframes bnr-kb-3 {
    0%   { transform: scale(1.08) translate(0px, 6px); }
    100% { transform: scale(1.0)  translate(0, 0); }
  }
  @keyframes bnr-ribbon {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes bnr-prog {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes bnr-grain {
    0%,100%{transform:translate(0,0)}
    10%{transform:translate(-2%,-3%)} 20%{transform:translate(3%,2%)}
    30%{transform:translate(-1%,4%)} 40%{transform:translate(4%,-1%)}
    50%{transform:translate(-3%,1%)} 60%{transform:translate(2%,-4%)}
    70%{transform:translate(-4%,3%)} 80%{transform:translate(1%,-2%)}
    90%{transform:translate(3%,4%)}
  }
  @keyframes bnr-float-up {
    0%   { opacity:0; transform:translateY(36px); }
    100% { opacity:1; transform:translateY(0); }
  }
  @keyframes bnr-line-grow {
    0%   { transform:scaleX(0); opacity:0; }
    100% { transform:scaleX(1); opacity:1; }
  }
  @keyframes bnr-fade {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes bnr-slide-left {
    0%   { opacity:0; transform:translateX(-20px); }
    100% { opacity:1; transform:translateX(0); }
  }
  @keyframes bnr-skeleton {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes bnr-skeleton-pulse {
    0%,100% { opacity: 0.5; }
    50%     { opacity: 1; }
  }

  .bnr-kb-1 { animation: bnr-kb-1 11s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
  .bnr-kb-2 { animation: bnr-kb-2 10s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
  .bnr-kb-3 { animation: bnr-kb-3 12s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
  .bnr-badge   { animation: bnr-slide-left 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
  .bnr-eyebrow { animation: bnr-float-up  0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
  .bnr-title   { animation: bnr-float-up  0.9s cubic-bezier(0.22,1,0.36,1) 0.22s both; }
  .bnr-rule    { animation: bnr-line-grow 0.5s ease 0.48s both; transform-origin:center; }
  .bnr-sub     { animation: bnr-float-up  0.8s cubic-bezier(0.22,1,0.36,1) 0.38s both; }
  .bnr-counter { animation: bnr-fade      0.6s ease 0.6s both; }

  .bnr-ribbon-track {
    display:flex; width:max-content;
    animation: bnr-ribbon 36s linear infinite;
  }
  .bnr-ribbon-track:hover { animation-play-state:paused; }

  .bnr-dot {
    transition: height 0.4s cubic-bezier(0.22,1,0.36,1),
                opacity 0.3s ease, background 0.3s ease;
  }

  /* ── Dot nav ── */
  .bnr-dots-mobile  { display: none; }
  .bnr-dots-desktop { display: flex; }

  @media (max-width: 767px) {
    .bnr-dots-mobile {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      gap: 8px;
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 20;
    }
    .bnr-dots-desktop { display: none; }
    .bnr-dot-h {
      transition: width 0.4s cubic-bezier(0.22,1,0.36,1),
                  opacity 0.3s ease, background 0.3s ease;
      height: 2px;
      border: none;
      padding: 0;
      cursor: pointer;
      border-radius: 1px;
    }
  }

  /* ── Text block responsive ── */
  .bnr-text-block {
    position: absolute;
    z-index: 20;
    left: 0;
    right: 0;
    bottom: clamp(64px, 10vh, 120px);
    padding: 0 clamp(20px, 5vw, 64px);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    box-sizing: border-box;
    width: 100%;
  }

  @media (max-width: 767px) {
    .bnr-text-block {
      bottom: 48px;                /* sits above the pill dots */
      padding: 0 20px;
    }
    .bnr-title-text {
      font-size: clamp(1.6rem, 7vw, 2.6rem) !important;
    }
    .bnr-sub-text {
      font-size: 0.8rem !important;
      max-width: 100% !important;
    }
    .bnr-cta-btn {
      font-size: 0.6rem !important;
      padding: 9px 22px !important;
    }
    .bnr-eyebrow-text {
      font-size: 0.53rem !important;
      letter-spacing: 0.3em !important;
    }
    .bnr-rule-line { width: 36px !important; }
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    .bnr-title-text {
      font-size: clamp(2rem, 4vw, 3rem) !important;
    }
    .bnr-text-block {
      padding: 0 clamp(32px, 5vw, 80px);
    }
  }

  /* ── Stage height ── */
  .bnr-stage {
    height: clamp(480px, 88vh, 900px);
  }
  @media (max-width: 480px) {
    .bnr-stage {
      height: clamp(480px, 92svh, 700px);
    }
  }

  /* ── Image object-position: center on mobile ── */
  .bnr-img {
    object-position: center 25%;
  }
  @media (max-width: 767px) {
    .bnr-img {
      object-position: center center;
    }
  }

  .bnr-grain {
    position:absolute; inset:-50%; width:200%; height:200%;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    opacity:0.028; pointer-events:none;
    animation: bnr-grain 8s steps(10) infinite;
    z-index:15;
  }

  .bnr-skeleton-shimmer {
    background: linear-gradient(
      90deg,
      rgba(26,20,16,0.6) 0%,
      rgba(60,40,20,0.4) 40%,
      rgba(182,137,60,0.15) 50%,
      rgba(60,40,20,0.4) 60%,
      rgba(26,20,16,0.6) 100%
    );
    background-size: 200% 100%;
    animation: bnr-skeleton 2.2s ease-in-out infinite;
  }
  .bnr-skeleton-pulse {
    animation: bnr-skeleton-pulse 1.8s ease-in-out infinite;
  }

  /* Touch swipe hint — fade in then out once */
  @keyframes bnr-swipe-hint {
    0%   { opacity: 0; transform: translateX(0); }
    20%  { opacity: 0.7; }
    60%  { opacity: 0.7; transform: translateX(-12px); }
    100% { opacity: 0; transform: translateX(-12px); }
  }
  .bnr-swipe-hint {
    animation: bnr-swipe-hint 2s ease 1.5s 1 forwards;
    pointer-events: none;
  }
`;

// ─── Loading skeleton ────────────────────────────────────────────────────────
const BannerSkeleton: React.FC = () => (
  <div
    className="bnr-stage relative w-full flex items-end justify-center overflow-hidden"
    style={{ background: '#0d0a07' }}
    aria-label="Loading banner"
    aria-busy="true"
  >
    <div className="bnr-skeleton-shimmer absolute inset-0" />
    <div className="bnr-grain" />
    <div className="relative z-10 flex flex-col items-center pb-24 text-center px-6">
      <div
        className="bnr-skeleton-pulse mb-8 rounded-2xl overflow-hidden"
        style={{ width: '140px', height: '79px', background: 'rgba(182,137,60,0.12)', border: '1px solid rgba(182,137,60,0.2)' }}
      >
        <picture>
          <source srcSet="/logo@2x.webp 2x, /logo@1x.webp 1x" type="image/webp" />
          <source srcSet="/logo@2x.png 2x, /logo@1x.png 1x" type="image/png" />
          <img
            src="/logo@1x.png"
            alt="Wing & Weft"
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px', opacity: 0.7 }}
            loading="eager"
            decoding="sync"
          />
        </picture>
      </div>
      <div className="flex items-center gap-3 mb-5 bnr-skeleton-pulse">
        <div style={{ width: '32px', height: '1px', background: 'rgba(182,137,60,0.35)' }} />
        <div style={{ width: '140px', height: '8px', borderRadius: '4px', background: 'rgba(182,137,60,0.2)' }} />
        <div style={{ width: '32px', height: '1px', background: 'rgba(182,137,60,0.35)' }} />
      </div>
      <div className="space-y-3 mb-5 bnr-skeleton-pulse" style={{ animationDelay: '0.2s' }}>
        <div style={{ width: 'min(320px, 80vw)', height: '14px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', margin: '0 auto' }} />
        <div style={{ width: 'min(240px, 60vw)', height: '14px', borderRadius: '6px', background: 'rgba(255,255,255,0.07)', margin: '0 auto' }} />
      </div>
      <div className="flex items-center gap-3 bnr-skeleton-pulse" style={{ animationDelay: '0.4s' }}>
        <div style={{ width: '40px', height: '1px', background: 'rgba(182,137,60,0.2)' }} />
        <div style={{ width: '6px', height: '6px', transform: 'rotate(45deg)', background: 'rgba(182,137,60,0.35)' }} />
        <div style={{ width: '40px', height: '1px', background: 'rgba(182,137,60,0.2)' }} />
      </div>
    </div>
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ background: 'linear-gradient(to top, rgba(4,2,1,0.96) 0%, rgba(4,2,1,0.6) 30%, transparent 70%)' }}
    />
  </div>
);

// ─── Empty state ─────────────────────────────────────────────────────────────
const BannerEmpty: React.FC = () => (
  <div
    className="bnr-stage relative w-full flex items-center justify-center overflow-hidden"
    style={{ background: 'linear-gradient(135deg, #0d0a07, #1a0f06)' }}
  >
    <div className="bnr-grain" />
    <div className="relative z-10 text-center px-6">
      <picture>
        <source srcSet="/logo@2x.webp 2x, /logo@1x.webp 1x" type="image/webp" />
        <source srcSet="/logo@2x.png 2x, /logo@1x.png 1x" type="image/png" />
        <img src="/logo@1x.png" alt="Wing & Weft"
          style={{ height: '60px', width: 'auto', objectFit: 'contain', margin: '0 auto 24px', display: 'block', opacity: 0.6 }}
          loading="eager" />
      </picture>
      <p style={{ fontFamily: '"Raleway",sans-serif', fontSize: '0.65rem', letterSpacing: '0.32em',
        textTransform: 'uppercase', color: 'rgba(182,137,60,0.6)', marginBottom: '12px' }}>
        Wing &amp; Weft
      </p>
      <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(2rem,5vw,3.5rem)',
        fontWeight: 300, color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>
        Coming Soon
      </p>
      <p style={{ fontFamily: '"Raleway",sans-serif', fontSize: '0.85rem', fontWeight: 300,
        color: 'rgba(240,228,208,0.45)', letterSpacing: '0.06em' }}>
        Our collection is being curated for you.
      </p>
    </div>
  </div>
);

// ─── Main Banner component ───────────────────────────────────────────────────
const Banner: React.FC = () => {
  const { isDark }                        = useTheme();
  const [slides, setSlides]               = useState<BannerSlide[]>([]);
  const [status, setStatus]               = useState<'loading' | 'ready' | 'empty'>('loading');
  const [ribbonVisible, setRibbonVisible] = useState(true);
  const [current, setCurrent]             = useState(0);
  const [prev, setPrev]                   = useState<number | null>(null);
  const [animKey, setAnimKey]             = useState(0);
  const [trans, setTrans]                 = useState(false);
  const styleRef                          = useRef(false);

  // Touch/swipe support
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (styleRef.current) return;
    const s = document.createElement('style');
    s.textContent = STYLES;
    document.head.appendChild(s);
    styleRef.current = true;
  }, []);

  useEffect(() => {
    fetchBanners()
      .then(data => {
        const active = data.filter(b => b.image_url?.trim());
        const normalised = active.map(b => ({ ...b, eyebrow: b.eyebrow ?? '' }));
        if (normalised.length > 0) { setSlides(normalised); setStatus('ready'); }
        else { setStatus('empty'); }
      })
      .catch(() => setStatus('empty'));

    fetch(`${SUPABASE_URL}/rest/v1/settings?key=eq.ribbon_visible&select=value`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    })
      .then(r => r.json())
      .then((rows: { value: string }[]) => {
        if (rows[0]?.value === 'false') setRibbonVisible(false);
      })
      .catch(() => {});
  }, []);

  const goTo = useCallback((idx: number) => {
    if (trans || slides.length < 2) return;
    setTrans(true);
    setPrev(current);
    setCurrent((idx + slides.length) % slides.length);
    setAnimKey(k => k + 1);
    setTimeout(() => { setPrev(null); setTrans(false); }, 900);
  }, [trans, current, slides.length]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev_ = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (status !== 'ready' || slides.length < 2) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next, status, slides.length]);

  // ── Touch handlers for swipe ──
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only trigger if horizontal swipe is dominant and large enough
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
      dx < 0 ? next() : prev_();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (status === 'loading') {
    return (
      <section aria-label="Featured collection">
        <BannerSkeleton />
        {ribbonVisible && <RibbonBar />}
      </section>
    );
  }

  if (status === 'empty') {
    return (
      <section aria-label="Featured collection">
        <BannerEmpty />
        {ribbonVisible && <RibbonBar />}
      </section>
    );
  }

  const slide = slides[current];
  const eyebrowText = slide?.eyebrow?.trim() || 'Featured';

  return (
    <section className="relative w-full pt-16 md:pt-20" aria-label="Featured collection">

      {/* ── Main stage ── */}
      <div
        className="bnr-stage relative w-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >

        <div className="bnr-grain" aria-hidden="true" />

        {/* Images */}
        {slides.map((s, i) => {
          const isActive  = i === current;
          const isLeaving = i === prev;
          return (
            <div key={s.id} className="absolute inset-0" style={{
              zIndex:     isActive ? 2 : isLeaving ? 1 : 0,
              opacity:    isLeaving ? 0 : isActive ? 1 : 0,
              transition: isLeaving ? 'opacity 0.9s cubic-bezier(0.4,0,0.2,1)' : 'none',
            }}>
              <img
                src={s.image_url}
                alt={s.title}
                className={`bnr-img w-full h-full object-cover${isActive ? ` bnr-kb-${(i % 3) + 1}` : ''}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                width={1440} height={900}
              />
            </div>
          );
        })}

        {/* Gradients */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }} aria-hidden="true">
          {/* Bottom gradient — stronger on mobile so text is always legible */}
          <div style={{ position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(4,2,1,0.97) 0%, rgba(4,2,1,0.82) 30%, rgba(4,2,1,0.35) 58%, rgba(4,2,1,0.08) 75%, transparent 100%)'
          }}/>
          <div style={{ position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 55%, rgba(4,2,1,0.5) 100%)'
          }}/>
        </div>

        {/* Top bar — badge + counter (desktop only) */}
        <div className="hidden md:flex absolute z-20 items-center justify-between"
          style={{ top: '32px', left: 'clamp(32px,4vw,64px)', right: 'clamp(32px,4vw,64px)' }}>

          <div key={`badge-${animKey}`} className="bnr-badge flex items-center gap-3">
            <div style={{ width: '28px', height: '1px', background: 'linear-gradient(to right,#9C6F2E,rgba(156,111,46,0.3))' }} aria-hidden="true"/>
            <span style={{ fontFamily: '"Raleway",sans-serif', fontSize: '0.58rem', fontWeight: 700,
              letterSpacing: '0.38em', textTransform: 'uppercase', color: 'rgba(240,224,196,0.85)' }}>
              Wing &amp; Weft — {new Date().getFullYear()} Collection
            </span>
          </div>

          {slides.length > 1 && (
            <div key={`counter-${animKey}`} className="bnr-counter flex items-center gap-3" aria-label={`Slide ${current + 1} of ${slides.length}`}>
              <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: '1.5rem',
                fontWeight: 400, color: '#f5ede0', lineHeight: 1, textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
                {String(current + 1).padStart(2, '0')}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ width: '40px', height: '1px', background: 'rgba(250,246,239,0.15)' }}>
                  <div key={animKey} style={{
                    height: '100%', background: 'linear-gradient(to right, #C49A4A, #F5D78E)',
                    transformOrigin: 'left', animation: 'bnr-prog 6s linear forwards',
                  }} aria-hidden="true"/>
                </div>
                <span style={{ fontFamily: '"Raleway",sans-serif', fontSize: '0.52rem',
                  letterSpacing: '0.2em', color: 'rgba(240,224,196,0.45)' }}>
                  OF {String(slides.length).padStart(2, '0')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Architectural vertical line — desktop only */}
        <div className="hidden md:block absolute z-10 pointer-events-none" aria-hidden="true" style={{
          left: 'clamp(32px,4vw,64px)', top: '80px', bottom: '100px', width: '1px',
          background: 'linear-gradient(to bottom,transparent,rgba(156,111,46,0.2) 20%,rgba(156,111,46,0.2) 80%,transparent)',
        }}/>

        {/* ── TEXT BLOCK ── */}
        <div key={`text-${animKey}`} className="bnr-text-block">

          {/* Eyebrow */}
          <div className="bnr-eyebrow flex items-center gap-3 mb-4">
            <div className="bnr-rule-line" style={{ width: '28px', height: '1px', background: '#c4855a' }} aria-hidden="true"/>
            <span className="bnr-eyebrow-text" style={{
              fontFamily: '"Raleway",sans-serif', fontSize: '0.58rem', fontWeight: 700,
              letterSpacing: '0.42em', textTransform: 'uppercase', color: '#d4956a',
            }}>
              {eyebrowText}
            </span>
            <div className="bnr-rule-line" style={{ width: '28px', height: '1px', background: '#c4855a' }} aria-hidden="true"/>
          </div>

          {/* Title */}
          <h2 className="bnr-title bnr-title-text" style={{
            fontFamily: '"Cormorant Garamond",serif',
            fontSize: 'clamp(1.9rem, 4.5vw, 3.8rem)',
            fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.01em',
            color: '#ffffff', textShadow: '0 6px 40px rgba(0,0,0,0.55)',
            wordBreak: 'break-word',
            marginBottom: '16px',
            maxWidth: '100%',
          }}>
            {slide?.title}
          </h2>

          {/* Ornament rule */}
          <div className="bnr-rule flex items-center gap-3 mb-4" aria-hidden="true">
            <div className="bnr-rule-line" style={{ width: '44px', height: '1px', background: 'linear-gradient(to right,transparent,#c8955a)' }}/>
            <span style={{ color: 'rgba(210,175,120,0.85)', fontSize: '0.48rem', letterSpacing: '0.3em' }}>◆</span>
            <div className="bnr-rule-line" style={{ width: '44px', height: '1px', background: 'linear-gradient(to left,transparent,#c8955a)' }}/>
          </div>

          {/* Subtitle */}
          <p className="bnr-sub bnr-sub-text" style={{
            fontFamily: '"Raleway",sans-serif',
            fontSize: 'clamp(0.78rem, 1.2vw, 1rem)',
            fontWeight: 300, letterSpacing: '0.05em', lineHeight: 1.75,
            color: 'rgba(240,228,208,0.78)', maxWidth: 'min(480px, 90vw)', marginBottom: '0',
          }}>
            {slide?.subtitle}
          </p>

          {/* CTA button */}
          {slide?.cta_link && (
            <Link
              to={slide.cta_link}
              className="bnr-sub bnr-cta-btn mt-6 inline-flex items-center gap-2 transition-all duration-300"
              style={{
                border: '1px solid rgba(196,154,74,0.6)',
                color: 'rgba(245,235,210,0.92)',
                padding: '10px 28px', borderRadius: '999px',
                fontFamily: '"Raleway",sans-serif', fontSize: '0.65rem',
                fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase',
                backdropFilter: 'blur(4px)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(196,154,74,0.18)';
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(196,154,74,0.9)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 18px rgba(196,154,74,0.2)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(196,154,74,0.6)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
              }}
            >
              {slide.cta_text}
            </Link>
          )}
        </div>

        {/* Desktop dot nav — vertical, right side */}
        {slides.length > 1 && (
          <nav
            className="bnr-dots-desktop flex-col items-center gap-3"
            style={{ position: 'absolute', right: 'clamp(16px,2.5vw,32px)', top: '50%', transform: 'translateY(-50%)', zIndex: 20 }}
            aria-label="Slide navigation"
          >
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="bnr-dot"
                title={`Go to slide ${i + 1}`}
                aria-label={`Slide ${i + 1}`}
                aria-current={i === current ? 'true' : undefined}
                style={{
                  width: '2px', height: i === current ? '36px' : '10px',
                  background: i === current ? 'linear-gradient(to bottom, #C49A4A, #9C6F2E)' : 'rgba(240,228,208,0.28)',
                  border: 'none', padding: 0, cursor: 'pointer', borderRadius: '1px',
                  opacity: i === current ? 1 : 0.55,
                }}
              />
            ))}
          </nav>
        )}

        {/* Mobile dot nav — horizontal pills */}
        {slides.length > 1 && (
          <nav className="bnr-dots-mobile" aria-label="Slide navigation">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="bnr-dot-h"
                title={`Go to slide ${i + 1}`}
                aria-label={`Slide ${i + 1}`}
                aria-current={i === current ? 'true' : undefined}
                style={{
                  width: i === current ? '28px' : '8px',
                  background: i === current
                    ? 'linear-gradient(to right, #C49A4A, #9C6F2E)'
                    : 'rgba(240,228,208,0.35)',
                  opacity: i === current ? 1 : 0.6,
                }}
              />
            ))}
          </nav>
        )}

      </div>

      {ribbonVisible && <RibbonBar />}
    </section>
  );
};

// ─── Ribbon ──────────────────────────────────────────────────────────────────
const RibbonBar: React.FC = () => (
  <div className="relative overflow-hidden" aria-hidden="true" style={{
    background: 'linear-gradient(90deg,#100C08 0%,#1E1208 15%,#2E1A08 35%,#251408 50%,#2E1A08 65%,#1E1208 85%,#100C08 100%)',
    borderTop: '1px solid rgba(156,111,46,0.4)', borderBottom: '1px solid rgba(156,111,46,0.25)',
  }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
      background: 'linear-gradient(90deg,transparent,#9C6F2E 20%,#FAF6EF 50%,#9C6F2E 80%,transparent)', opacity: 0.7 }}/>
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px',
      background: 'linear-gradient(90deg,transparent,rgba(156,111,46,0.4) 30%,rgba(156,111,46,0.4) 70%,transparent)' }}/>
    <div style={{ padding: '12px 0', overflow: 'hidden' }}>
      <div className="bnr-ribbon-track">
        {[...RIBBON_ITEMS, ...RIBBON_ITEMS].map((item, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center',
            padding: `0 ${item === '◆' ? '14px' : '22px'}`,
            fontFamily: '"Raleway",sans-serif',
            fontSize: item === '◆' ? '0.42rem' : '0.62rem',
            fontWeight: item === '◆' ? 400 : 700,
            letterSpacing: item === '◆' ? 0 : '0.3em',
            textTransform: 'uppercase',
            color: item === '◆' ? '#C49A4A' : '#FAF6EF',
            textShadow: item === '◆' ? 'none' : '0 1px 6px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap',
          }}>{item}</span>
        ))}
      </div>
    </div>
    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '60px',
      background: 'linear-gradient(to right,#100C08,transparent)', pointerEvents: 'none', zIndex: 2 }}/>
    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '60px',
      background: 'linear-gradient(to left,#100C08,transparent)', pointerEvents: 'none', zIndex: 2 }}/>
  </div>
);

export default Banner;