// src/pages/NotFoundPage.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { usePageMeta } from '../hooks/usePageMeta';
import SEO from '../components/SEO/SEO';
import { theme } from '../theme/heroThemes';

// ─── All colours now derived from the active theme ────────────────────────────
//  Only WhatsApp green (#25D366) is hard-coded — it's a brand requirement.

const STYLES = `
  @keyframes nf-drift1  { 0%,100%{transform:translate(0,0) rotate(0deg) scale(1)}   33%{transform:translate(30px,-20px) rotate(8deg) scale(1.05)}  66%{transform:translate(-15px,25px) rotate(-5deg) scale(0.97)} }
  @keyframes nf-drift2  { 0%,100%{transform:translate(0,0) rotate(0deg) scale(1)}   40%{transform:translate(-25px,15px) rotate(-10deg) scale(1.08)} 70%{transform:translate(20px,-30px) rotate(6deg) scale(0.95)} }
  @keyframes nf-drift3  { 0%,100%{transform:translate(0,0) rotate(0deg)}             50%{transform:translate(15px,20px) rotate(12deg)} }

  @keyframes nf-pulse-r { 0%,100%{opacity:0.12;transform:scale(1)}   50%{opacity:0.28;transform:scale(1.15)} }
  @keyframes nf-pulse-g { 0%,100%{opacity:0.08;transform:scale(1)}   50%{opacity:0.22;transform:scale(1.1)} }

  @keyframes nf-char-fall {
    0%   { opacity:0; transform:translateY(-80px) rotateX(90deg) scale(0.5); }
    60%  { transform:translateY(8px) rotateX(-8deg) scale(1.02); }
    80%  { transform:translateY(-4px) rotateX(4deg); }
    100% { opacity:1; transform:translateY(0) rotateX(0) scale(1); }
  }
  @keyframes nf-zero-spin {
    0%   { opacity:0; transform:rotateY(180deg) scale(0.3); }
    60%  { transform:rotateY(-10deg) scale(1.05); }
    100% { opacity:1; transform:rotateY(0) scale(1); }
  }

  @keyframes nf-in-up   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes nf-in-fade { from{opacity:0} to{opacity:1} }

  @keyframes nf-thread1 {
    0%   { stroke-dashoffset: 900; opacity:0; }
    10%  { opacity:1; }
    100% { stroke-dashoffset: 0; opacity:1; }
  }
  @keyframes nf-thread2 {
    0%,15% { stroke-dashoffset:900; opacity:0; }
    25%    { opacity:1; }
    100%   { stroke-dashoffset:0; opacity:1; }
  }
  @keyframes nf-thread3 {
    0%,30% { stroke-dashoffset:900; opacity:0; }
    40%    { opacity:1; }
    100%   { stroke-dashoffset:0; opacity:1; }
  }
  @keyframes nf-bobbin {
    0%,100%{transform:translateY(0) rotate(0deg)}
    25%{transform:translateY(-6px) rotate(5deg)}
    75%{transform:translateY(4px) rotate(-3deg)}
  }
  @keyframes nf-shimmer-loop {
    0%{background-position:-300% center}
    100%{background-position:300% center}
  }
  @keyframes nf-grain {
    0%,100%{transform:translate(0,0)} 10%{transform:translate(-3%,-2%)} 20%{transform:translate(2%,3%)}
    30%{transform:translate(-1%,2%)} 40%{transform:translate(3%,-2%)} 50%{transform:translate(-2%,1%)}
    60%{transform:translate(1%,-3%)} 70%{transform:translate(-3%,2%)} 80%{transform:translate(2%,-1%)} 90%{transform:translate(1%,3%)}
  }
  @keyframes nf-orbit-cw  { from{transform:rotate(0deg) translateX(var(--r,180px)) rotate(0deg)} to{transform:rotate(360deg) translateX(var(--r,180px)) rotate(-360deg)} }
  @keyframes nf-orbit-ccw { from{transform:rotate(0deg) translateX(var(--r,180px)) rotate(0deg)} to{transform:rotate(-360deg) translateX(var(--r,180px)) rotate(360deg)} }

  @keyframes nf-ring-pulse  { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.12} 50%{transform:translate(-50%,-50%) scale(1.08);opacity:0.22} }
  @keyframes nf-ring-pulse2 { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.07} 50%{transform:translate(-50%,-50%) scale(1.12);opacity:0.16} }

  @keyframes nf-particle {
    0%   { transform:translate(0,0) scale(1); opacity:1; }
    100% { transform:translate(var(--px),var(--py)) scale(0); opacity:0; }
  }

  .nf-shimmer {
    background-size: 300% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: nf-shimmer-loop 3s linear infinite;
  }
  .nf-grain-overlay {
    position:absolute;inset:-50%;width:200%;height:200%;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity:0.035;pointer-events:none;animation:nf-grain 10s steps(10) infinite;z-index:1;
  }
  .nf-cta-primary {
    position:relative;overflow:hidden;
    transition:transform 0.4s cubic-bezier(0.22,1,0.36,1),box-shadow 0.4s ease,letter-spacing 0.35s ease;
  }
  .nf-cta-primary::before {
    content:'';position:absolute;top:0;left:-120%;width:80%;height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent);
    transition:left 0.6s ease;
  }
  .nf-cta-primary:hover { transform:translateY(-4px); letter-spacing:0.25em; }
  .nf-cta-primary:hover::before { left:120%; }
  .nf-cta-primary:active { transform:translateY(-1px) scale(0.97); }

  .nf-cta-ghost {
    transition:all 0.4s cubic-bezier(0.22,1,0.36,1);
    position:relative;overflow:hidden;
  }
  .nf-cta-ghost::after {
    content:'';position:absolute;inset:0;
    transform:translateX(-101%);transition:transform 0.4s ease;
  }
  .nf-cta-ghost:hover { transform:translateY(-2px); }
  .nf-cta-ghost:hover::after { transform:translateX(0); }
`;

// ─── Custom cursor ─────────────────────────────────────────────────────────────
const CustomCursor: React.FC<{ dark: boolean }> = ({ dark }) => {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos     = useRef({ x: 0, y: 0 });
  const ring    = useRef({ x: 0, y: 0 });
  const raf     = useRef(0);

  useEffect(() => {
    const move = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', move);
    const animate = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;
      if (dotRef.current)
        dotRef.current.style.transform = `translate(${pos.current.x}px,${pos.current.y}px) translate(-50%,-50%)`;
      if (ringRef.current)
        ringRef.current.style.transform = `translate(${ring.current.x}px,${ring.current.y}px) translate(-50%,-50%)`;
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf.current); };
  }, []);

  return (
    <>
      <div ref={dotRef} style={{
        position:'fixed',top:0,left:0,width:'6px',height:'6px',borderRadius:'50%',
        background: theme.accentPrimary,
        pointerEvents:'none',zIndex:9999,
        boxShadow:`0 0 8px ${theme.accentPrimary}cc`,
      }}/>
      <div ref={ringRef} style={{
        position:'fixed',top:0,left:0,width:'32px',height:'32px',borderRadius:'50%',
        border:`1px solid ${dark ? theme.accentSecondary + '99' : theme.accentPrimary + '80'}`,
        pointerEvents:'none',zIndex:9999,
        transition:'border-color 0.3s',
      }}/>
    </>
  );
};

// ─── Thread canvas ────────────────────────────────────────────────────────────
const ThreadCanvas: React.FC = () => (
  <svg viewBox="0 0 560 140" fill="none"
    style={{ width:'100%', maxWidth:'520px', height:'70px', overflow:'visible' }}
    aria-hidden="true">
    <path d="M0,70 C70,20 100,110 180,60 C260,10 290,100 360,55 C430,10 470,90 560,65"
      stroke="url(#nf-tg1)" strokeWidth="2" strokeLinecap="round" strokeDasharray="900"
      style={{animation:'nf-thread1 3s ease 0.6s both'}}/>
    <path d="M0,85 C60,45 110,115 190,75 C270,35 300,105 375,70 C450,35 500,95 560,80"
      stroke="url(#nf-tg2)" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="900" opacity="0.6"
      style={{animation:'nf-thread2 3s ease 0.6s both'}}/>
    <path d="M0,55 C80,25 120,95 195,50 C270,5 310,85 385,45 C460,5 505,75 560,55"
      stroke="url(#nf-tg3)" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="900" opacity="0.35"
      style={{animation:'nf-thread3 3s ease 0.6s both'}}/>
    <circle cx="0"   cy="70" r="5" fill={theme.accentPrimary}   opacity="0.7" style={{animation:'nf-bobbin 3s ease-in-out infinite'}}/>
    <circle cx="560" cy="65" r="5" fill={theme.accentSecondary} opacity="0.7" style={{animation:'nf-bobbin 3s ease-in-out 1.5s infinite'}}/>
    <defs>
      <linearGradient id="nf-tg1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor={theme.accentPrimary}   stopOpacity="0"/>
        <stop offset="25%"  stopColor={theme.accentPrimary}/>
        <stop offset="75%"  stopColor={theme.accentSecondary}/>
        <stop offset="100%" stopColor={theme.accentSecondary} stopOpacity="0"/>
      </linearGradient>
      <linearGradient id="nf-tg2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor={theme.accentSecondary} stopOpacity="0"/>
        <stop offset="50%"  stopColor={theme.threadPrimary}/>
        <stop offset="100%" stopColor={theme.accentPrimary}   stopOpacity="0"/>
      </linearGradient>
      <linearGradient id="nf-tg3" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor={theme.accentPrimary}   stopOpacity="0"/>
        <stop offset="40%"  stopColor={theme.diamond}/>
        <stop offset="100%" stopColor={theme.accentSecondary} stopOpacity="0"/>
      </linearGradient>
    </defs>
  </svg>
);

// ─── Particle burst ───────────────────────────────────────────────────────────
interface Particle { id: number; x: number; y: number; angle: number; }

const NotFoundPage: React.FC = () => {
  const { isDark } = useTheme();
  usePageMeta({ title: 'Page Not Found', description: 'The page you are looking for does not exist. Browse our handwoven saree collection or return to the homepage.' });
  const styleRef   = useRef(false);
  const [mounted, setMounted]     = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const pidRef = useRef(0);

  useEffect(() => {
    if (!styleRef.current) {
      const tag = document.createElement('style');
      tag.textContent = STYLES;
      document.head.appendChild(tag);
      styleRef.current = true;
    }
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const burst = useCallback((e: React.MouseEvent) => {
    const newP: Particle[] = Array.from({ length: 10 }, (_, i) => ({
      id: pidRef.current++, x: e.clientX, y: e.clientY, angle: (i / 10) * 360,
    }));
    setParticles(p => [...p, ...newP]);
    setTimeout(() => setParticles(p => p.filter(x => !newP.find(n => n.id === x.id))), 800);
  }, []);

  const dark      = isDark;
  const bg        = dark ? '#080604' : '#f7f0e6';
  const textMain  = dark ? theme.notFoundPrimary : '#1a1410';
  const textSub   = dark ? `${theme.notFoundPrimary}70` : 'rgba(26,20,16,0.38)';
  const cardBg    = dark ? 'rgba(18,12,8,0.75)' : 'rgba(255,255,255,0.72)';
  const cardBdr   = dark ? `${theme.accentSecondary}2e` : `${theme.accentSecondary}47`;

  // Orbit dots derived from theme accent colours
  const orbitDots = [
    { r: 240, size: 7, dur: '16s', color: theme.accentPrimary,   cw: true,  delay: 0   },
    { r: 300, size: 4, dur: '22s', color: theme.accentSecondary, cw: false, delay: -5  },
    { r: 200, size: 5, dur: '12s', color: theme.threadPrimary,   cw: true,  delay: -8  },
    { r: 340, size: 3, dur: '28s', color: theme.accentPrimary,   cw: false, delay: -12 },
  ];

  return (
    <div onClick={burst} style={{
      minHeight:'100vh', background: bg,
      display:'flex', alignItems:'center', justifyContent:'center',
      overflow:'hidden', position:'relative',
      paddingTop:'80px', paddingBottom:'40px',
      cursor:'none',
    }}>
      <CustomCursor dark={dark} />
      <div className="nf-grain-overlay" />

      {/* Particle bursts — theme-coloured */}
      {particles.map(p => (
        <div key={p.id} style={{
          position:'fixed',
          left: p.x, top: p.y,
          width:'6px', height:'6px', borderRadius:'50%',
          background: `hsl(${p.angle * 0.5 + 10}, 75%, 55%)`,
          pointerEvents:'none', zIndex:9998,
          '--px': `${Math.cos(p.angle * Math.PI / 180) * (40 + Math.random() * 40)}px`,
          '--py': `${Math.sin(p.angle * Math.PI / 180) * (40 + Math.random() * 40)}px`,
          animation: 'nf-particle 0.7s ease-out forwards',
          transform: 'translate(-50%,-50%)',
        } as React.CSSProperties} />
      ))}

      {/* Ambient layers */}
      <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
        <SEO title="Page Not Found" description="The page you are looking for does not exist. Return to Wing & Weft to browse our saree collections." noIndex={true} />

        {/* Pulsing rings — theme colour */}
        {[260, 380, 500].map((r, i) => (
          <div key={r} style={{
            position:'absolute', top:'42%', left:'50%',
            width:r, height:r,
            border:`1px solid ${dark ? theme.ringBorderDark : theme.ringBorderLight}`,
            borderRadius:'50%',
            animation:`nf-ring-pulse${i === 2 ? '2' : ''} ${8 + i * 2}s ease-in-out ${i * 1.5}s infinite`,
          }}/>
        ))}

        {/* Primary glow — theme colour */}
        <div style={{
          position:'absolute', top:'42%', left:'50%',
          width:'60vw', height:'60vw', maxWidth:'520px', maxHeight:'520px',
          transform:'translate(-50%,-50%)', borderRadius:'50%',
          background: dark ? theme.glowColorDark : theme.glowColorLight,
          animation:'nf-pulse-r 7s ease-in-out infinite',
        }}/>

        {/* Secondary accent glow */}
        <div style={{
          position:'absolute', bottom:'-5%', right:'-5%',
          width:'50vw', height:'50vw', maxWidth:'440px', maxHeight:'440px',
          borderRadius:'50%',
          background: dark
            ? `radial-gradient(circle, ${theme.accentSecondary}24 0%, transparent 65%)`
            : `radial-gradient(circle, ${theme.accentSecondary}14 0%, transparent 65%)`,
          animation:'nf-pulse-g 9s ease-in-out 3s infinite',
        }}/>

        {/* Floating fabric shapes — theme-tinted */}
        {[
          { w:220, h:260, x:'3%',  y:'5%',  anim:'nf-drift1 18s ease-in-out infinite',          op: dark ? 0.55 : 0.3  },
          { w:160, h:200, x:'78%', y:'8%',  anim:'nf-drift2 14s ease-in-out 2s infinite',        op: dark ? 0.45 : 0.25 },
          { w:130, h:170, x:'70%', y:'68%', anim:'nf-drift3 12s ease-in-out 4s infinite',        op: dark ? 0.40 : 0.20 },
          { w:180, h:140, x:'-2%', y:'68%', anim:'nf-drift1 16s ease-in-out 1s infinite',        op: dark ? 0.50 : 0.25 },
          { w:90,  h:110, x:'50%', y:'3%',  anim:'nf-drift2 20s ease-in-out 3s infinite',        op: dark ? 0.30 : 0.15 },
        ].map((s, i) => (
          <div key={i} style={{
            position:'absolute', left:s.x, top:s.y,
            width:s.w, height:s.h,
            borderRadius:'60% 40% 55% 45% / 45% 55% 40% 60%',
            background: i % 2 === 0
              ? `radial-gradient(ellipse at 35% 35%, ${dark ? theme.accentPrimary + '66' : theme.accentPrimary + '38'} 0%, ${dark ? theme.accentSecondary + '26' : theme.accentSecondary + '1a'} 50%, transparent 75%)`
              : `radial-gradient(ellipse at 65% 35%, ${dark ? theme.accentSecondary + '59' : theme.accentSecondary + '33'} 0%, ${dark ? theme.accentPrimary + '1a' : theme.accentPrimary + '14'} 50%, transparent 75%)`,
            opacity: s.op,
            animation: s.anim,
            filter:'blur(2px)',
          }}/>
        ))}

        {/* Orbiting particles — theme coloured */}
        {orbitDots.map((o, i) => (
          <div key={i} style={{
            position:'absolute', top:'42%', left:'50%',
            width:o.size, height:o.size,
            borderRadius:'50%',
            background: o.color,
            marginLeft: -o.size / 2, marginTop: -o.size / 2,
            '--r': `${o.r}px`,
            animation:`${o.cw ? 'nf-orbit-cw' : 'nf-orbit-ccw'} ${o.dur} linear ${o.delay}s infinite`,
            boxShadow:`0 0 ${o.size * 2}px ${o.color}`,
            opacity:0.7,
          } as React.CSSProperties}/>
        ))}
      </div>

      {/* ── Main card ── */}
      <div style={{
        position:'relative', zIndex:10,
        display:'flex', flexDirection:'column', alignItems:'center',
        textAlign:'center',
        padding:'clamp(44px,6vw,72px) clamp(28px,5vw,88px)',
        maxWidth:'640px', width:'100%', margin:'0 16px',
        background: cardBg,
        border:`1px solid ${cardBdr}`,
        borderRadius:'20px',
        backdropFilter:'blur(28px)',
        WebkitBackdropFilter:'blur(28px)',
        boxShadow: dark
          ? `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px ${theme.accentSecondary}1a, inset 0 1px 0 rgba(255,255,255,0.04)`
          : `0 24px 64px rgba(26,20,16,0.12), 0 0 0 1px ${theme.accentSecondary}1e`,
        opacity:   mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)',
        transition:'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
      }}>

        {/* Corner accents — theme coloured */}
        <div style={{position:'absolute',top:0,left:0,width:'48px',height:'48px',pointerEvents:'none'}}>
          <div style={{position:'absolute',top:'16px',left:'16px',width:'24px',height:'1px',background: `${theme.accentPrimary}80`}}/>
          <div style={{position:'absolute',top:'16px',left:'16px',width:'1px',height:'24px',background: `${theme.accentPrimary}80`}}/>
        </div>
        <div style={{position:'absolute',bottom:0,right:0,width:'48px',height:'48px',pointerEvents:'none'}}>
          <div style={{position:'absolute',bottom:'16px',right:'16px',width:'24px',height:'1px',background: `${theme.accentSecondary}80`}}/>
          <div style={{position:'absolute',bottom:'16px',right:'16px',width:'1px',height:'24px',background: `${theme.accentSecondary}80`}}/>
        </div>

        {/* Eyebrow — theme coloured */}
        <div style={{
          display:'flex', alignItems:'center', gap:'10px',
          marginBottom:'24px',
          animation:'nf-in-up 0.5s ease 0.2s both',
        }}>
          <div style={{width:'32px',height:'1px',background:`linear-gradient(to right, transparent, ${theme.accentPrimary})`}}/>
          <span style={{
            fontFamily:'"Raleway",sans-serif', fontSize:'0.58rem', fontWeight:700,
            letterSpacing:'0.42em', textTransform:'uppercase',
            color: theme.accentPrimary,
          }}>Wing &amp; Weft</span>
          <div style={{width:'32px',height:'1px',background:`linear-gradient(to left, transparent, ${theme.accentPrimary})`}}/>
        </div>

        {/* 404 digits */}
        <div style={{
          perspective:'800px',
          display:'flex',
          gap:'clamp(2px,1.5vw,12px)',
          marginBottom:'12px',
          lineHeight:0.88,
        }}>
          <span style={{
            fontFamily:'"Cormorant Garamond",serif',
            fontSize:'clamp(7.5rem,19vw,12rem)',
            fontWeight:300, display:'inline-block', color: textMain,
            animation:'nf-char-fall 0.9s cubic-bezier(0.22,1,0.36,1) 0.30s both',
          }}>4</span>

          {/* 0 — shimmer using theme shimmer gradient */}
          <span
            className="nf-shimmer"
            style={{
              fontFamily:'"Cormorant Garamond",serif',
              fontSize:'clamp(7.5rem,19vw,12rem)',
              fontWeight:300, display:'inline-block',
              backgroundImage: theme.notFoundShimmer,
              animation:'nf-shimmer-loop 3s linear infinite, nf-zero-spin 1s cubic-bezier(0.22,1,0.36,1) 0.43s both',
            }}
          >0</span>

          <span style={{
            fontFamily:'"Cormorant Garamond",serif',
            fontSize:'clamp(7.5rem,19vw,12rem)',
            fontWeight:300, display:'inline-block', color: textMain,
            animation:'nf-char-fall 0.9s cubic-bezier(0.22,1,0.36,1) 0.56s both',
          }}>4</span>
        </div>

        {/* Thread animation */}
        <div style={{width:'100%',animation:'nf-in-fade 0.8s ease 0.75s both'}}>
          <ThreadCanvas />
        </div>

        {/* Headline */}
        <p style={{
          fontFamily:'"Cormorant Garamond",serif',
          fontSize:'clamp(1.3rem,3vw,1.9rem)',
          fontWeight:400, color: textMain,
          marginTop:'4px', marginBottom:'14px',
          opacity:0.9,
          animation:'nf-in-up 0.6s ease 0.9s both',
        }}>
          The thread has unravelled
        </p>

        {/* Accent rule — theme coloured */}
        <div style={{
          display:'flex', alignItems:'center', gap:'8px',
          marginBottom:'16px',
          animation:'nf-in-fade 0.5s ease 1.0s both',
        }}>
          <div style={{width:'40px',height:'1px',background:`linear-gradient(to right, transparent, ${theme.accentSecondary})`}}/>
          <span style={{color: theme.accentSecondary, fontSize:'0.45rem',opacity:0.8}}>◆</span>
          <div style={{width:'40px',height:'1px',background:`linear-gradient(to left, transparent, ${theme.accentSecondary})`}}/>
        </div>

        {/* Body copy */}
        <p style={{
          fontFamily:'"Raleway",sans-serif',
          fontSize:'clamp(0.82rem,1.4vw,0.96rem)',
          fontWeight:300, color: textSub,
          lineHeight:1.8, marginBottom:'36px', maxWidth:'370px',
          animation:'nf-in-up 0.7s ease 1.1s both',
        }}>
          This page wandered off the loom. Let us guide you back to our curated collection of handwoven sarees.
        </p>

        {/* CTAs — theme coloured */}
        <div style={{
          display:'flex', gap:'12px', flexWrap:'wrap', justifyContent:'center',
          animation:'nf-in-up 0.7s ease 1.25s both',
        }}>
          <Link to="/" className="nf-cta-primary" style={{
            display:'inline-flex', alignItems:'center', gap:'14px',
            padding:'15px 36px',
            background: theme.ctaBg,
            color: theme.ctaText,
            fontFamily:'"Raleway",sans-serif',
            fontSize:'0.62rem', fontWeight:700,
            letterSpacing:'0.2em', textTransform:'uppercase',
            textDecoration:'none', borderRadius:'2px',
            boxShadow:`0 6px 28px ${theme.ctaShadow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
          }}>
            Return Home
            <span style={{display:'flex',flexDirection:'column',gap:'3px'}}>
              <span style={{display:'block',width:'18px',height:'1px',background:'currentColor',opacity:0.9}}/>
              <span style={{display:'block',width:'10px',height:'1px',background:'currentColor',opacity:0.5,marginLeft:'8px'}}/>
            </span>
          </Link>

          <Link to="/contact" className="nf-cta-ghost" style={{
            display:'inline-flex', alignItems:'center', gap:'8px',
            padding:'14px 28px',
            background:'transparent',
            color: dark ? `${theme.h1}a6` : 'rgba(26,20,16,0.5)',
            fontFamily:'"Raleway",sans-serif',
            fontSize:'0.62rem', fontWeight:600,
            letterSpacing:'0.2em', textTransform:'uppercase',
            textDecoration:'none', borderRadius:'2px',
            border:`1px solid ${cardBdr}`,
          }}>
            Contact Us
          </Link>
        </div>

        {/* Click hint — theme coloured */}
        <p style={{
          fontFamily:'"Raleway",sans-serif',
          fontSize:'0.62rem', color: textSub,
          marginTop:'28px', letterSpacing:'0.15em',
          animation:'nf-in-fade 0.6s ease 1.6s both',
        }}>
          Click anywhere for a surprise ✦
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;