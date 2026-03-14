// src/components/Banner/Banner.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  if (!res.ok) throw new Error('Failed');
  return res.json();
};

const FALLBACK_SLIDES: BannerSlide[] = [
  {
    id: '1', title: 'Threads of\nTradition',
    subtitle: 'Handwoven silk sarees — where every thread carries a story older than time',
    cta_text: 'Explore Silk', cta_link: '/category/silk-sarees',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1440&h=900&fit=crop&q=85',
    is_active: true, sort_order: 1,
  },
  {
    id: '2', title: 'Draped in\nElegance',
    subtitle: 'Premium cotton sarees — refined for the modern woman who honours heritage',
    cta_text: 'Shop Cotton', cta_link: '/category/cotton-sarees',
    image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1440&h=900&fit=crop&q=85',
    is_active: true, sort_order: 2,
  },
  {
    id: '3', title: 'Woven\nwith Love',
    subtitle: 'Each saree a masterpiece — uncompromising craftsmanship, timeless grace',
    cta_text: 'View Collection', cta_link: '/category/silk-sarees',
    image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1440&h=900&fit=crop&q=85',
    is_active: true, sort_order: 3,
  },
];

const RIBBON_ITEMS = [
  'Handwoven Heritage', '◆', 'Free Shipping Above ₹2000', '◆',
  'Pure Silk & Cotton', '◆', 'Artisan Crafted', '◆',
  'New Arrivals Weekly', '◆', 'Authentic Weaves', '◆',
  'Curated Collections', '◆', 'Since Generations', '◆',
];

const STYLES = `
  @keyframes kb { 0%{transform:scale(1.12) translateX(8px)} 100%{transform:scale(1.0) translateX(0)} }
  @keyframes ribbon { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes prog { from{transform:scaleX(0)} to{transform:scaleX(1)} }
  @keyframes grain {
    0%,100%{transform:translate(0,0)}
    10%{transform:translate(-2%,-3%)}
    20%{transform:translate(3%,2%)}
    30%{transform:translate(-1%,4%)}
    40%{transform:translate(4%,-1%)}
    50%{transform:translate(-3%,1%)}
    60%{transform:translate(2%,-4%)}
    70%{transform:translate(-4%,3%)}
    80%{transform:translate(1%,-2%)}
    90%{transform:translate(3%,4%)}
  }
  @keyframes float-up {
    0%  { opacity:0; transform:translateY(40px) skewY(1deg); }
    100%{ opacity:1; transform:translateY(0)    skewY(0deg); }
  }
  @keyframes line-grow {
    0%  { transform:scaleX(0); opacity:0; }
    100%{ transform:scaleX(1); opacity:1; }
  }
  @keyframes fade-soft { from{opacity:0} to{opacity:1} }
  @keyframes badge-in {
    0%  { opacity:0; transform:translateX(-16px); }
    100%{ opacity:1; transform:translateX(0); }
  }
  @keyframes cursor-blink {
    0%,100%{opacity:1} 50%{opacity:0}
  }

  .bnr-kb { animation: kb 9s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }

  .bnr-badge   { animation: badge-in  0.7s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
  .bnr-line    { animation: line-grow 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s  both; transform-origin:left; }
  .bnr-title   { animation: float-up  0.9s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
  .bnr-rule    { animation: line-grow 0.5s ease                         0.5s  both; transform-origin:left; }
  .bnr-sub     { animation: float-up  0.8s cubic-bezier(0.22,1,0.36,1) 0.35s both; }
  .bnr-cta     { animation: float-up  0.8s cubic-bezier(0.22,1,0.36,1) 0.5s  both; }
  .bnr-counter { animation: fade-soft 0.6s ease                         0.6s  both; }

  .ribbon-track { display:flex; width:max-content; animation:ribbon 36s linear infinite; }
  .ribbon-track:hover { animation-play-state:paused; cursor:default; }

  .cta-primary {
    position:relative; overflow:hidden;
    transition: transform 0.35s cubic-bezier(0.22,1,0.36,1),
                box-shadow 0.35s ease,
                letter-spacing 0.3s ease;
  }
  .cta-primary::after {
    content:'';
    position:absolute; top:0; left:-100%; width:60%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);
    transition: left 0.5s ease;
  }
  .cta-primary:hover { transform:translateY(-3px); letter-spacing:0.24em; box-shadow:0 12px 40px rgba(188,61,62,0.55),0 4px 12px rgba(0,0,0,0.4); }
  .cta-primary:hover::after { left:130%; }
  .cta-primary:active { transform:translateY(-1px) scale(0.98); }

  .cta-ghost {
    position:relative; overflow:hidden;
    transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
  }
  .cta-ghost::before {
    content:''; position:absolute; inset:0;
    background:rgba(233,227,203,0.06);
    transform:translateX(-100%);
    transition:transform 0.35s ease;
  }
  .cta-ghost:hover { border-color:rgba(182,137,60,0.7) !important; color:#b6893c !important; transform:translateY(-2px); }
  .cta-ghost:hover::before { transform:translateX(0); }

  .dot-v { transition: height 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease, background 0.3s ease; }

  .grain-overlay {
    position:absolute; inset:-50%;
    width:200%; height:200%;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    opacity:0.028;
    animation: grain 8s steps(10) infinite;
    pointer-events:none;
    z-index:15;
  }
`;

const Banner: React.FC = () => {
  const { isDark } = useTheme();
  const [slides, setSlides]       = useState<BannerSlide[]>(FALLBACK_SLIDES);
  const [current, setCurrent]     = useState(0);
  const [prev, setPrev]           = useState<number | null>(null);
  const [animKey, setAnimKey]     = useState(0);
  const [transitioning, setTrans] = useState(false);
  const styleRef                  = useRef(false);

  useEffect(() => {
    if (styleRef.current) return;
    const s = document.createElement('style');
    s.textContent = STYLES;
    document.head.appendChild(s);
    styleRef.current = true;
  }, []);

  useEffect(() => {
    fetchBanners()
      .then(d => { const w = d.filter(b => b.image_url); if (w.length) setSlides(w); })
      .catch(() => {});
  }, []);

  const goTo = useCallback((idx: number) => {
    if (transitioning) return;
    setTrans(true);
    setPrev(current);
    setCurrent((idx + slides.length) % slides.length);
    setAnimKey(k => k + 1);
    setTimeout(() => { setPrev(null); setTrans(false); }, 900);
  }, [transitioning, current, slides.length]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative w-full pt-16 md:pt-20" aria-label="Featured collection">

      {/* ── Main Stage ── */}
      <div className="relative w-full overflow-hidden" style={{ height: 'clamp(520px, 90vh, 920px)' }}>

        {/* Film grain */}
        <div className="grain-overlay" />

        {/* ── Image layers ── */}
        {slides.map((s, i) => {
          const isActive = i === current;
          const isLeaving = i === prev;
          return (
            <div
              key={s.id}
              className="absolute inset-0"
              style={{
                zIndex: isActive ? 2 : isLeaving ? 1 : 0,
                opacity: isActive ? 1 : isLeaving ? 1 : 0,
                transition: isLeaving ? 'opacity 0.9s cubic-bezier(0.4,0,0.2,1)' : 'none',
              }}
            >
              {isLeaving && (
                <div className="absolute inset-0 z-10"
                  style={{
                    background:'rgba(5,3,2,0)',
                    animation:'fade-soft 0.9s ease forwards',
                    animationFillMode:'forwards',
                  }}
                />
              )}
              <img
                src={s.image_url}
                alt={s.title}
                className={`w-full h-full object-cover ${isActive ? 'bnr-kb' : ''}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                style={{ objectPosition: 'center 30%' }}
              />
            </div>
          );
        })}

        {/* ── Gradient system ── */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
          {/* Deep bottom pool */}
          <div style={{ position:'absolute', inset:0,
            background:'linear-gradient(to top, rgba(4,2,1,0.97) 0%, rgba(4,2,1,0.82) 22%, rgba(4,2,1,0.45) 45%, rgba(4,2,1,0.12) 65%, transparent 100%)',
          }}/>
          {/* Left atmospheric haze */}
          <div style={{ position:'absolute', inset:0,
            background:'linear-gradient(105deg, rgba(4,2,1,0.65) 0%, rgba(4,2,1,0.3) 35%, transparent 60%)',
          }}/>
          {/* Vignette corners */}
          <div style={{ position:'absolute', inset:0,
            background:'radial-gradient(ellipse at center, transparent 40%, rgba(4,2,1,0.6) 100%)',
          }}/>
        </div>

        {/* ── Architectural lines ── */}
        {/* Left vertical rule */}
        <div className="hidden md:block absolute z-10 pointer-events-none"
          style={{
            left:'52px', top:'10%', bottom:'10%', width:'1px',
            background:'linear-gradient(to bottom, transparent, rgba(182,137,60,0.25) 25%, rgba(182,137,60,0.25) 75%, transparent)',
          }}
        />
        {/* Bottom horizontal rule */}
        <div className="hidden md:block absolute z-10 pointer-events-none"
          style={{
            bottom:'88px', left:'52px', right:'52px', height:'1px',
            background:'linear-gradient(to right, rgba(182,137,60,0.2), rgba(182,137,60,0.08) 50%, transparent)',
          }}
        />

        {/* ── Collection badge — top left ── */}
        <div
          key={`badge-${animKey}`}
          className="bnr-badge absolute z-20 hidden md:flex items-center gap-3"
          style={{ top:'36px', left:'72px' }}
        >
          <div style={{
            width:'30px', height:'1px',
            background:'linear-gradient(to right, #b6893c, rgba(182,137,60,0.3))',
          }}/>
          <span style={{
            fontFamily:'"Raleway", sans-serif',
            fontSize:'0.6rem', fontWeight:700,
            letterSpacing:'0.35em', textTransform:'uppercase',
            color:'rgba(240,224,196,0.9)',
          }}>
            Wing &amp; Weft — {new Date().getFullYear()} Collection
          </span>
        </div>

        {/* ── Slide counter — top right ── */}
        <div
          key={`counter-${animKey}`}
          className="bnr-counter absolute z-20 hidden md:block"
          style={{ top:'36px', right:'52px' }}
        >
          <div className="flex items-center gap-3">
            <span style={{ fontFamily:'"Cormorant Garamond", serif', fontSize:'1.6rem', fontWeight:400, color:'#f5ede0', lineHeight:1 }}>
              {String(current + 1).padStart(2,'0')}
            </span>
            <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
              <div style={{ width:'36px', height:'1px', background:'rgba(233,227,203,0.15)' }}>
                <div key={animKey} style={{
                  height:'100%', background:'linear-gradient(to right, #d4956a, #e8c080)',
                  transformOrigin:'left',
                  animation:'prog 6s linear forwards',
                }}/>
              </div>
              <span style={{ fontFamily:'"Raleway", sans-serif', fontSize:'0.55rem', letterSpacing:'0.2em', color:'rgba(240,224,196,0.55)' }}>
                OF {String(slides.length).padStart(2,'0')}
              </span>
            </div>
          </div>
        </div>

        {/* ── Main text block ── */}
        <div
          key={`text-${animKey}`}
          className="absolute z-20"
          style={{
            bottom:'clamp(100px, 13vh, 140px)',
            left:'clamp(24px, 5.5vw, 80px)',
            right:'clamp(80px, 15vw, 200px)',
            maxWidth:'660px',
          }}
        >
          {/* Eyebrow line */}
          <div className="bnr-line flex items-center gap-4 mb-6">
            <div style={{ width:'40px', height:'1px', background:'#c4855a', flexShrink:0 }}/>
            <span style={{
              fontFamily:'"Raleway", sans-serif', fontSize:'0.58rem', fontWeight:700,
              letterSpacing:'0.42em', textTransform:'uppercase', color:'#d4956a',
            }}>
              {slide?.cta_link?.replace('/category/','').replace(/-/g,' ') || 'Featured'}
            </span>
          </div>

          {/* Hero title — split lines for drama */}
          <h2
            className="bnr-title"
            style={{
              fontFamily:'"Cormorant Garamond", serif',
              fontSize:'clamp(3.2rem, 7.5vw, 6.4rem)',
              fontWeight:400,
              lineHeight:0.95,
              letterSpacing:'-0.015em',
              color:'#ffffff',
              textShadow:'0 8px 48px rgba(0,0,0,0.5)',
              whiteSpace:'pre-line',
              marginBottom:'20px',
            }}
          >
            {slide?.title}
          </h2>

          {/* Gold ornament rule */}
          <div className="bnr-rule flex items-center gap-3 mb-5">
            <div style={{ width:'56px', height:'1px', background:'linear-gradient(to right, #c8955a, rgba(200,149,90,0.15))' }}/>
            <span style={{ color:'rgba(210,175,120,0.8)', fontSize:'0.5rem', letterSpacing:'0.3em' }}>◆</span>
            <div style={{ width:'24px', height:'1px', background:'rgba(200,149,90,0.2)' }}/>
          </div>

          {/* Subtitle */}
          <p
            className="bnr-sub"
            style={{
              fontFamily:'"Raleway", sans-serif',
              fontSize:'clamp(0.82rem, 1.3vw, 1rem)',
              fontWeight:300,
              letterSpacing:'0.06em',
              lineHeight:1.75,
              color:'rgba(240,228,208,0.82)',
              maxWidth:'420px',
              marginBottom:'40px',
            }}
          >
            {slide?.subtitle}
          </p>

          {/* CTAs */}
          <div className="bnr-cta" style={{ display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>

            {/* Primary — filled */}
            <Link
              to={slide?.cta_link ?? '/'}
              className="cta-primary"
              style={{
                display:'inline-flex', alignItems:'center', gap:'14px',
                padding:'15px 36px',
                background:'linear-gradient(115deg, #bc3d3e 0%, #a8322f 40%, #b6893c 100%)',
                color:'#f5ede0',
                fontFamily:'"Raleway", sans-serif',
                fontSize:'0.62rem', fontWeight:700,
                letterSpacing:'0.2em', textTransform:'uppercase',
                textDecoration:'none', borderRadius:'1px',
                boxShadow:'0 6px 28px rgba(188,61,62,0.38), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              {slide?.cta_text}
              <span style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
                <span style={{ display:'block', width:'18px', height:'1px', background:'currentColor', opacity:0.9 }}/>
                <span style={{ display:'block', width:'10px', height:'1px', background:'currentColor', opacity:0.5, marginLeft:'8px' }}/>
              </span>
            </Link>

            {/* Ghost — bordered */}
            <Link
              to="/our-story"
              className="cta-ghost"
              style={{
                display:'inline-flex', alignItems:'center', gap:'10px',
                padding:'14px 30px',
                background:'transparent',
                color:'rgba(240,228,208,0.88)',
                fontFamily:'"Raleway", sans-serif',
                fontSize:'0.62rem', fontWeight:600,
                letterSpacing:'0.2em', textTransform:'uppercase',
                textDecoration:'none', borderRadius:'1px',
                border:'1px solid rgba(233,227,203,0.22)',
              }}
            >
              Our Story
            </Link>

          </div>
        </div>

        {/* ── Vertical dot nav — right edge ── */}
        <div
          className="absolute z-20 flex flex-col items-center gap-3"
          style={{ right:'28px', top:'50%', transform:'translateY(-50%)' }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="dot-v"
              title={`Slide ${i + 1}`}
              style={{
                width:'2px',
                height: i === current ? '40px' : '10px',
                background: i === current
                  ? 'linear-gradient(to bottom, #e0a870, #c87840)'
                  : 'rgba(240,228,208,0.28)',
                border:'none', padding:0, cursor:'pointer',
                borderRadius:'1px',
                opacity: i === current ? 1 : 0.55,
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
          {/* Slide number below dots */}
          <span style={{
            marginTop:'8px',
            fontFamily:'"Raleway", sans-serif',
            fontSize:'0.5rem', letterSpacing:'0.2em',
            color:'rgba(240,224,196,0.5)',
            writingMode:'vertical-rl',
          }}>
            {String(current + 1).padStart(2,'0')}
          </span>
        </div>

      </div>

      {/* ── Premium Ribbon ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background:'linear-gradient(90deg, #1a0d06 0%, #2a1508 15%, #bc3d3e 35%, #9e2f1a 50%, #bc3d3e 65%, #2a1508 85%, #1a0d06 100%)',
          borderTop:'1px solid rgba(182,137,60,0.4)',
          borderBottom:'1px solid rgba(182,137,60,0.25)',
        }}
      >
        {/* Gold shimmer accent line on top */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:'2px',
          background:'linear-gradient(90deg, transparent 0%, #b6893c 20%, #e9e3cb 50%, #b6893c 80%, transparent 100%)',
          opacity: 0.7,
        }}/>
        {/* Bottom accent line */}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:'1px',
          background:'linear-gradient(90deg, transparent 0%, rgba(182,137,60,0.4) 30%, rgba(182,137,60,0.4) 70%, transparent 100%)',
        }}/>

        <div style={{ padding:'12px 0', overflow:'hidden' }}>
          <div className="ribbon-track">
            {[...RIBBON_ITEMS, ...RIBBON_ITEMS, ...RIBBON_ITEMS].map((item, i) => (
              <span
                key={i}
                style={{
                  display:'inline-flex', alignItems:'center',
                  padding:`0 ${item === '◆' ? '14px' : '22px'}`,
                  fontFamily:'"Raleway", sans-serif',
                  fontSize: item === '◆' ? '0.42rem' : '0.62rem',
                  fontWeight: item === '◆' ? 400 : 700,
                  letterSpacing: item === '◆' ? 0 : '0.3em',
                  textTransform:'uppercase',
                  color: item === '◆' ? '#f0d080' : '#f5ede0',
                  textShadow: item === '◆' ? 'none' : '0 1px 6px rgba(0,0,0,0.5)',
                  whiteSpace:'nowrap',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Fade edges — match new bg */}
        <div style={{ position:'absolute', top:0, left:0, bottom:0, width:'60px', background:'linear-gradient(to right, #1a0d06, transparent)', pointerEvents:'none', zIndex:2 }}/>
        <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'60px', background:'linear-gradient(to left, #1a0d06, transparent)', pointerEvents:'none', zIndex:2 }}/>
      </div>

    </section>
  );
};

export default Banner;