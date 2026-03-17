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
    id: '1', title: 'Threads of Tradition',
    subtitle: 'Handwoven silk sarees — where every thread carries a story older than time',
    cta_text: 'Explore Silk', cta_link: '/category/silk-sarees',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1440&h=900&fit=crop&q=85',
    is_active: true, sort_order: 1,
  },
  {
    id: '2', title: 'Draped in Elegance',
    subtitle: 'Premium cotton sarees — refined for the modern woman who honours heritage',
    cta_text: 'Shop Cotton', cta_link: '/category/cotton-sarees',
    image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1440&h=900&fit=crop&q=85',
    is_active: true, sort_order: 2,
  },
  {
    id: '3', title: 'Woven with Love',
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

  .bnr-grain {
    position:absolute; inset:-50%; width:200%; height:200%;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    opacity:0.028; pointer-events:none;
    animation: bnr-grain 8s steps(10) infinite;
    z-index:15;
  }

`;

const Banner: React.FC = () => {
  const { isDark }            = useTheme();
  const [slides, setSlides]   = useState<BannerSlide[]>(FALLBACK_SLIDES);
  const [current, setCurrent] = useState(0);
  const [prev, setPrev]       = useState<number | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [trans, setTrans]     = useState(false);
  const styleRef              = useRef(false);

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
    if (trans) return;
    setTrans(true);
    setPrev(current);
    setCurrent((idx + slides.length) % slides.length);
    setAnimKey(k => k + 1);
    setTimeout(() => { setPrev(null); setTrans(false); }, 900);
  }, [trans, current, slides.length]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative w-full pt-16 md:pt-20" aria-label="Featured collection">

      {/* ── Main stage ── */}
      <div className="relative w-full overflow-hidden"
        style={{ height: 'clamp(520px, 88vh, 900px)' }}>

        {/* Film grain */}
        <div className="bnr-grain" />

        {/* ── Images ── */}
        {slides.map((s, i) => {
          const isActive  = i === current;
          const isLeaving = i === prev;
          return (
            <div key={s.id} className="absolute inset-0" style={{
              zIndex:  isActive ? 2 : isLeaving ? 1 : 0,
              opacity: isLeaving ? 0 : isActive ? 1 : 0,
              transition: isLeaving ? 'opacity 0.9s cubic-bezier(0.4,0,0.2,1)' : 'none',
            }}>
              <img
                src={s.image_url} alt={s.title}
                className={`w-full h-full object-cover ${isActive ? `bnr-kb-${(i % 3) + 1}` : ''}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                style={{ objectPosition: 'center 25%' }}
              />
            </div>
          );
        })}

        {/* ── Gradients — bottom heavy so top stays clear ── */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
          {/* Strong bottom-up gradient — text lives here */}
          <div style={{ position:'absolute', inset:0,
            background:'linear-gradient(to top, rgba(4,2,1,0.96) 0%, rgba(4,2,1,0.78) 28%, rgba(4,2,1,0.35) 55%, rgba(4,2,1,0.08) 75%, transparent 100%)',
          }}/>
          {/* Subtle side vignette */}
          <div style={{ position:'absolute', inset:0,
            background:'radial-gradient(ellipse at center, transparent 55%, rgba(4,2,1,0.5) 100%)',
          }}/>
        </div>

        {/* ── Top decorative bar — slide info ── */}
        <div className="hidden md:flex absolute z-20 items-center justify-between"
          style={{ top:'32px', left:'clamp(32px,4vw,64px)', right:'clamp(32px,4vw,64px)' }}>

          {/* Left: collection badge */}
          <div key={`badge-${animKey}`}
            className="bnr-badge flex items-center gap-3">
            <div style={{ width:'28px', height:'1px', background:'linear-gradient(to right,#b6893c,rgba(182,137,60,0.3))' }}/>
            <span style={{ fontFamily:'"Raleway",sans-serif', fontSize:'0.58rem', fontWeight:700,
              letterSpacing:'0.38em', textTransform:'uppercase', color:'rgba(240,224,196,0.85)' }}>
              Wing &amp; Weft — {new Date().getFullYear()} Collection
            </span>
          </div>

          {/* Right: slide counter + progress */}
          <div key={`counter-${animKey}`} className="bnr-counter flex items-center gap-3">
            <span style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'1.5rem',
              fontWeight:400, color:'#f5ede0', lineHeight:1 }}>
              {String(current + 1).padStart(2,'0')}
            </span>
            <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
              <div style={{ width:'40px', height:'1px', background:'rgba(233,227,203,0.15)' }}>
                <div key={animKey} style={{
                  height:'100%',
                  background:'linear-gradient(to right, #d4956a, #e8c080)',
                  transformOrigin:'left',
                  animation:'bnr-prog 6s linear forwards',
                }}/>
              </div>
              <span style={{ fontFamily:'"Raleway",sans-serif', fontSize:'0.52rem',
                letterSpacing:'0.2em', color:'rgba(240,224,196,0.45)' }}>
                OF {String(slides.length).padStart(2,'0')}
              </span>
            </div>
          </div>
        </div>

        {/* ── Architectural vertical line — left ── */}
        <div className="hidden md:block absolute z-10 pointer-events-none" style={{
          left:'clamp(32px,4vw,64px)', top:'80px', bottom:'100px', width:'1px',
          background:'linear-gradient(to bottom,transparent,rgba(182,137,60,0.2) 20%,rgba(182,137,60,0.2) 80%,transparent)',
        }}/>

        {/* ── TEXT BLOCK — centred horizontally, pinned to bottom ── */}
        <div
          key={`text-${animKey}`}
          className="absolute z-20"
          style={{
            bottom: 'clamp(80px, 11vh, 120px)',
            left:   '50%',
            transform: 'translateX(-50%)',
            width:  '100%',
            maxWidth: '720px',
            padding: '0 clamp(24px, 4vw, 48px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Eyebrow */}
          <div className="bnr-eyebrow flex items-center gap-3 mb-5">
            <div style={{ width:'32px', height:'1px', background:'#c4855a' }}/>
            <span style={{
              fontFamily:'"Raleway",sans-serif', fontSize:'0.58rem', fontWeight:700,
              letterSpacing:'0.42em', textTransform:'uppercase', color:'#d4956a',
            }}>
              {slide?.cta_link?.replace('/category/','').replace(/-/g,' ') || 'Featured'}
            </span>
            <div style={{ width:'32px', height:'1px', background:'#c4855a' }}/>
          </div>

          {/* Title */}
          <h2 className="bnr-title" style={{
            fontFamily:'"Cormorant Garamond",serif',
            fontSize:'clamp(2.2rem, 4.5vw, 3.8rem)',
            fontWeight:400,
            lineHeight:0.92,
            letterSpacing:'-0.01em',
            color:'#ffffff',
            textShadow:'0 6px 40px rgba(0,0,0,0.55)',
            whiteSpace:'nowrap',
            marginBottom:'20px',
          }}>
            {slide?.title}
          </h2>

          {/* Ornament rule — centred */}
          <div className="bnr-rule flex items-center gap-3 mb-5">
            <div style={{ width:'52px', height:'1px', background:'linear-gradient(to right,transparent,#c8955a)' }}/>
            <span style={{ color:'rgba(210,175,120,0.85)', fontSize:'0.48rem', letterSpacing:'0.3em' }}>◆</span>
            <div style={{ width:'52px', height:'1px', background:'linear-gradient(to left,transparent,#c8955a)' }}/>
          </div>

          {/* Subtitle */}
          <p className="bnr-sub" style={{
            fontFamily:'"Raleway",sans-serif',
            fontSize:'clamp(0.82rem, 1.2vw, 1rem)',
            fontWeight:300,
            letterSpacing:'0.05em',
            lineHeight:1.8,
            color:'rgba(240,228,208,0.78)',
            maxWidth:'480px',
            marginBottom:'0',
          }}>
            {slide?.subtitle}
          </p>


        </div>

        {/* ── Vertical dot nav — centred right edge ── */}
        <div className="absolute z-20 flex flex-col items-center gap-3"
          style={{ right:'clamp(16px,2.5vw,32px)', top:'50%', transform:'translateY(-50%)' }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className="bnr-dot"
              title={`Slide ${i + 1}`}
              style={{
                width:'2px',
                height: i === current ? '36px' : '10px',
                background: i === current
                  ? 'linear-gradient(to bottom, #e0a870, #c87840)'
                  : 'rgba(240,228,208,0.28)',
                border:'none', padding:0, cursor:'pointer', borderRadius:'1px',
                opacity: i === current ? 1 : 0.55,
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

      </div>

      {/* ── Premium Ribbon ── */}
      <div className="relative overflow-hidden" style={{
        background:'linear-gradient(90deg,#1a0d06 0%,#2a1508 15%,#bc3d3e 35%,#9e2f1a 50%,#bc3d3e 65%,#2a1508 85%,#1a0d06 100%)',
        borderTop:'1px solid rgba(182,137,60,0.4)',
        borderBottom:'1px solid rgba(182,137,60,0.25)',
      }}>
        {/* Top shimmer line */}
        <div style={{ position:'absolute',top:0,left:0,right:0,height:'2px',
          background:'linear-gradient(90deg,transparent,#b6893c 20%,#e9e3cb 50%,#b6893c 80%,transparent)',
          opacity:0.7,
        }}/>
        {/* Bottom line */}
        <div style={{ position:'absolute',bottom:0,left:0,right:0,height:'1px',
          background:'linear-gradient(90deg,transparent,rgba(182,137,60,0.4) 30%,rgba(182,137,60,0.4) 70%,transparent)',
        }}/>

        <div style={{ padding:'12px 0', overflow:'hidden' }}>
          <div className="bnr-ribbon-track">
            {[...RIBBON_ITEMS, ...RIBBON_ITEMS, ...RIBBON_ITEMS].map((item, i) => (
              <span key={i} style={{
                display:'inline-flex', alignItems:'center',
                padding:`0 ${item === '◆' ? '14px' : '22px'}`,
                fontFamily:'"Raleway",sans-serif',
                fontSize: item === '◆' ? '0.42rem' : '0.62rem',
                fontWeight: item === '◆' ? 400 : 700,
                letterSpacing: item === '◆' ? 0 : '0.3em',
                textTransform:'uppercase',
                color: item === '◆' ? '#f0d080' : '#f5ede0',
                textShadow: item === '◆' ? 'none' : '0 1px 6px rgba(0,0,0,0.5)',
                whiteSpace:'normal',
              }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Fade edges */}
        <div style={{ position:'absolute',top:0,left:0,bottom:0,width:'60px',
          background:'linear-gradient(to right,#1a0d06,transparent)',pointerEvents:'none',zIndex:2 }}/>
        <div style={{ position:'absolute',top:0,right:0,bottom:0,width:'60px',
          background:'linear-gradient(to left,#1a0d06,transparent)',pointerEvents:'none',zIndex:2 }}/>
      </div>

    </section>
  );
};

export default Banner;