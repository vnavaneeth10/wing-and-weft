// src/components/ComingSoon/ComingSoon.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../admin/lib/supabase';

const LAUNCH_DATE = new Date('2026-04-15T00:00:00+05:30');

const getTimeLeft = () => {
  const diff = LAUNCH_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const saveNotifyEmail = async (email: string) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/inquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey:         SUPABASE_ANON_KEY,
      Authorization:  `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer:         'return=minimal',
    },
    body: JSON.stringify({
      customer_name:  'Launch Notification',
      customer_phone: 'N/A',
      customer_email: email,
      message:        '🔔 Requested launch day notification from the Coming Soon page.',
      status:         'new',
    }),
  });
  if (!res.ok) throw new Error('Failed');
};

// ─── Floating silk thread particle ───────────────────────────────────────────
interface Thread { id: number; x: number; y: number; len: number; angle: number; color: string; speed: number; opacity: number; delay: number; }

const THREAD_COLORS = ['#bc3d3e','#b6893c','#e69358','#d4956a','#f0c070','#c8955a','#e9e3cb'];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Raleway:wght@300;400;500;600;700&display=swap');

:root {
  --red:    #bc3d3e;
  --gold:   #b6893c;
  --amber:  #e69358;
  --cream:  #f7f0e6;
  --dark:   #f7f0e6;
  --text:   #1a1410;
  --muted:  rgba(26,20,16,0.45);
  --subtle: rgba(26,20,16,0.2);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.cs-root {
  min-height: 100vh;
  background: #f7f0e6;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  position: relative; overflow: hidden;
  padding: 1rem 1.5rem;
  font-family: 'Raleway', sans-serif;
  cursor: none;
}

/* ── Custom cursor ── */
.cs-cursor-dot {
  position: fixed; width: 8px; height: 8px; border-radius: 50%;
  background: var(--red); pointer-events: none; z-index: 9999;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 12px rgba(188,61,62,0.8);
  transition: transform 0.05s;
}
.cs-cursor-ring {
  position: fixed; width: 36px; height: 36px; border-radius: 50%;
  border: 1px solid rgba(182,137,60,0.6);
  pointer-events: none; z-index: 9998;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s, border-color 0.3s;
}

/* ── Grain ── */
.cs-grain {
  position: fixed; inset: -50%; width: 200%; height: 200%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.025; pointer-events: none; z-index: 1;
  animation: cs-grain 10s steps(10) infinite;
}
@keyframes cs-grain {
  0%,100%{transform:translate(0,0)} 10%{transform:translate(-3%,-2%)}
  20%{transform:translate(2%,3%)} 30%{transform:translate(-1%,2%)}
  40%{transform:translate(3%,-2%)} 50%{transform:translate(-2%,1%)}
  60%{transform:translate(1%,-3%)} 70%{transform:translate(-3%,2%)}
  80%{transform:translate(2%,-1%)} 90%{transform:translate(1%,3%)}
}

/* ── Background rings ── */
.cs-ring {
  position: fixed; border-radius: 50%;
  border: 1px solid rgba(188,61,62,0.1);
  pointer-events: none;
  animation: cs-ring-pulse 8s ease-in-out infinite;
}
@keyframes cs-ring-pulse {
  0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.1}
  50%{transform:translate(-50%,-50%) scale(1.06);opacity:0.22}
}

/* ── Glows ── */
.cs-glow {
  position: fixed; border-radius: 50%;
  pointer-events: none; z-index: 0;
}
@keyframes cs-glow-drift {
  0%,100%{transform:translate(0,0) scale(1)}
  50%{transform:translate(var(--dx),var(--dy)) scale(1.1)}
}

/* ── Floating thread canvas ── */
.cs-threads { position: fixed; inset: 0; pointer-events: none; z-index: 0; }

/* ── Woven border — art deco frame ── */
.cs-frame {
  position: fixed; inset: 20px;
  pointer-events: none; z-index: 1;
  border: 1px solid rgba(182,137,60,0.22);
}
.cs-frame::before {
  content: '';
  position: absolute; inset: 6px;
  border: 1px solid rgba(182,137,60,0.1);
}
.cs-frame-corner {
  position: absolute; width: 28px; height: 28px;
}
.cs-frame-corner::before,
.cs-frame-corner::after {
  content: ''; position: absolute;
  background: var(--gold);
}
.cs-frame-corner::before { width: 100%; height: 1px; top: 0; left: 0; }
.cs-frame-corner::after  { width: 1px; height: 100%; top: 0; left: 0; }
.cs-frame-corner.tl { top: -1px; left: -1px; }
.cs-frame-corner.tr { top: -1px; right: -1px; transform: scaleX(-1); }
.cs-frame-corner.bl { bottom: -1px; left: -1px; transform: scaleY(-1); }
.cs-frame-corner.br { bottom: -1px; right: -1px; transform: scale(-1,-1); }

/* ── Main content ── */
.cs-content {
  position: relative; z-index: 10;
  text-align: center;
  max-width: 860px; width: 100%;
}

/* ── Staggered entrance ── */
.cs-in { opacity: 0; transform: translateY(28px); }
.cs-in.go {
  animation: cs-float-up 0.8s cubic-bezier(0.22,1,0.36,1) forwards;
}
@keyframes cs-float-up {
  to { opacity: 1; transform: translateY(0); }
}

/* ── Logo section ── */
.cs-logo-wrap {
  margin-bottom: 1.4rem;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.cs-logo-eyebrow {
  display: flex; align-items: center; gap: 12px;
}
.cs-logo-line {
  height: 1px; width: 44px;
  background: linear-gradient(90deg, transparent, var(--gold));
}
.cs-logo-line.r { background: linear-gradient(90deg, var(--gold), transparent); }
.cs-logo-text {
  color: rgba(182,137,60,0.85);
  font-size: 0.58rem; letter-spacing: 0.42em;
  text-transform: uppercase; font-weight: 700;
}
.cs-logo-img { height: 72px; width: auto; object-fit: contain; max-width: 280px; }

/* ── Headline ── */
.cs-headline {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2.8rem, 7.5vw, 5.5rem);
  font-weight: 300; line-height: 0.92;
  color: #1a1410; letter-spacing: -0.02em;
  margin-bottom: 0.3rem;
}
.cs-headline-accent {
  font-style: italic; color: transparent;
  background: linear-gradient(115deg, #bc3d3e 0%, #e69358 40%, #f0c070 55%, #b6893c 100%);
  -webkit-background-clip: text; background-clip: text;
  animation: cs-shimmer 4s linear infinite;
  background-size: 200% auto;
}
@keyframes cs-shimmer {
  0%{background-position:0% center}
  100%{background-position:200% center}
}

.cs-subhead {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.3rem, 3vw, 2rem);
  font-weight: 300; color: rgba(26,20,16,0.52);
  margin-bottom: 0.2rem; letter-spacing: 0.03em;
}

/* ── Ornament rule ── */
.cs-rule {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; margin: 0.8rem auto;
}
.cs-rule-line {
  height: 1px; width: 64px;
  background: linear-gradient(90deg, transparent, rgba(182,137,60,0.55));
}
.cs-rule-line.r { background: linear-gradient(90deg, rgba(182,137,60,0.55), transparent); }
.cs-rule-diamond {
  width: 7px; height: 7px;
  background: var(--gold); transform: rotate(45deg);
  box-shadow: 0 0 8px rgba(182,137,60,0.6);
  animation: cs-diamond-pulse 2s ease-in-out infinite;
}
@keyframes cs-diamond-pulse {
  0%,100%{box-shadow:0 0 8px rgba(182,137,60,0.6)}
  50%{box-shadow:0 0 20px rgba(182,137,60,1),0 0 40px rgba(182,137,60,0.3)}
}

/* ── Date badge ── */
.cs-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 0.45rem 1.2rem; border-radius: 100px;
  border: 1px solid rgba(182,137,60,0.3);
  background: rgba(182,137,60,0.06);
  margin-bottom: 2.8rem;
  backdrop-filter: blur(8px);
}
.cs-badge-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--red);
  animation: cs-blink 1.8s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(188,61,62,0.8);
}
@keyframes cs-blink {
  0%,100%{opacity:1;transform:scale(1)}
  50%{opacity:0.3;transform:scale(0.6)}
}
.cs-badge-text {
  color: var(--gold); font-size: 0.7rem;
  letter-spacing: 0.28em; text-transform: uppercase; font-weight: 600;
}

/* ── Countdown ── */
.cs-countdown {
  display: flex; align-items: flex-start;
  justify-content: center;
  gap: clamp(10px, 2.5vw, 24px);
  margin-bottom: 1.6rem;
}
.cs-sep {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 5vw, 3.8rem);
  color: rgba(182,137,60,0.5); font-weight: 300;
  line-height: 1; padding-top: 10px; user-select: none;
}
.cs-unit {
  display: flex; flex-direction: column;
  align-items: center; gap: 10px;
}
.cs-unit-box {
  position: relative;
  width: clamp(68px, 14vw, 100px);
  height: clamp(68px, 14vw, 100px);
  border-radius: 14px;
  border: 1px solid rgba(182,137,60,0.2);
  background: rgba(233,227,203,0.03);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  transition: border-color 0.4s, box-shadow 0.4s;
}
.cs-unit-box:hover {
  border-color: rgba(182,137,60,0.5);
  box-shadow: 0 4px 20px rgba(182,137,60,0.2), inset 0 0 20px rgba(182,137,60,0.03);
}
.cs-unit-box::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(188,61,62,0.05) 0%, rgba(182,137,60,0.04) 100%);
}
.cs-unit-box::after {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(182,137,60,0.35), transparent);
}
.cs-unit-num {
  position: relative;
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 5vw, 3.4rem);
  font-weight: 400; color: #1a1410;
  letter-spacing: -0.02em; line-height: 1;
  text-shadow: none;
}
.cs-unit-label {
  color: rgba(182,137,60,0.85);
  font-size: 0.6rem; letter-spacing: 0.28em;
  text-transform: uppercase; font-weight: 600;
}

/* ── Tagline ── */
.cs-tagline {
  color: rgba(26,20,16,0.48);
  font-size: 0.82rem; letter-spacing: 0.08em;
  font-weight: 300; line-height: 1.9;
  max-width: 500px; margin: 0 auto 1.6rem;
}
.cs-tagline strong { color: rgba(26,20,16,0.72); font-weight: 500; }

/* ── Notify form ── */
.cs-notify {
  display: flex;
  max-width: 420px; margin: 0 auto 0.8rem;
  border-radius: 100px;
  overflow: hidden;
  border: 1px solid rgba(182,137,60,0.25);
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(12px);
  transition: border-color 0.3s, box-shadow 0.3s;
}
.cs-notify:focus-within {
  border-color: rgba(182,137,60,0.55);
  box-shadow: 0 0 24px rgba(182,137,60,0.1);
}
.cs-notify input {
  flex: 1; background: transparent; border: none; outline: none;
  padding: 0.75rem 1.1rem;
  color: #1a1410; font-size: 0.82rem;
  font-family: 'Raleway', sans-serif; letter-spacing: 0.05em;
}
.cs-notify input::placeholder { color: rgba(26,20,16,0.32); }
.cs-notify-btn {
  background: linear-gradient(115deg, #bc3d3e, #b6893c);
  border: none; padding: 0.75rem 1.3rem;
  color: var(--cream); font-size: 0.68rem;
  font-family: 'Raleway', sans-serif; font-weight: 700;
  letter-spacing: 0.22em; text-transform: uppercase;
  cursor: pointer; white-space: nowrap;
  transition: opacity 0.2s, letter-spacing 0.3s;
  position: relative; overflow: hidden;
}
.cs-notify-btn::after {
  content: ''; position: absolute;
  top: 0; left: -100%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
  transition: left 0.5s ease;
}
.cs-notify-btn:hover { opacity: 0.9; letter-spacing: 0.28em; }
.cs-notify-btn:hover::after { left: 130%; }
.cs-notify-success {
  color: #86efac; font-size: 0.8rem;
  letter-spacing: 0.12em; margin-top: 0.6rem;
}
.cs-notify-error {
  color: #fca5a5; font-size: 0.8rem;
  letter-spacing: 0.12em; margin-top: 0.6rem;
}

/* ── Social row ── */
.cs-social {
  display: flex; align-items: center; justify-content: center;
  gap: 10px; margin-top: 1.2rem;
}
.cs-social-icon {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.75);
  border: 1px solid rgba(182,137,60,0.25);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  color: rgba(26,20,16,0.55); text-decoration: none;
  font-size: 13px;
}
.cs-social-icon:hover {
  transform: translateY(-3px) scale(1.1);
  background: rgba(182,137,60,0.12);
  border-color: rgba(182,137,60,0.5);
  color: var(--gold);
  box-shadow: 0 8px 20px rgba(182,137,60,0.2);
}

/* ── Footer ── */
.cs-foot {
  margin-top: 1.2rem;
  color: rgba(26,20,16,0.28);
  font-size: 0.65rem; letter-spacing: 0.18em; text-transform: uppercase;
}

@media (max-width: 480px) {
  .cs-sep { display: none; }
  .cs-countdown { gap: 8px; }
  .cs-frame { inset: 10px; }
}
`;

// ─── Animated thread particle ─────────────────────────────────────────────────
const ThreadCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threadsRef = useRef<Thread[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Spawn threads
    threadsRef.current = Array.from({ length: 22 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      len: 60 + Math.random() * 100,
      angle: Math.random() * Math.PI * 2,
      color: THREAD_COLORS[Math.floor(Math.random() * THREAD_COLORS.length)],
      speed: 0.2 + Math.random() * 0.4,
      opacity: 0.08 + Math.random() * 0.18,
      delay: Math.random() * 5,
    }));

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.004;

      threadsRef.current.forEach(thread => {
        const wave  = Math.sin(t * thread.speed + thread.delay) * 0.3;
        const angle = thread.angle + wave;
        const x2    = thread.x + Math.cos(angle) * thread.len;
        const y2    = thread.y + Math.sin(angle) * thread.len;

        // Drift slowly
        thread.x += Math.cos(thread.angle) * 0.12;
        thread.y += Math.sin(thread.angle) * 0.12;

        // Wrap around
        if (thread.x < -150) thread.x = canvas.width + 50;
        if (thread.x > canvas.width + 150) thread.x = -50;
        if (thread.y < -150) thread.y = canvas.height + 50;
        if (thread.y > canvas.height + 150) thread.y = -50;

        const grad = ctx.createLinearGradient(thread.x, thread.y, x2, y2);
        grad.addColorStop(0, `${thread.color}00`);
        grad.addColorStop(0.3, `${thread.color}${Math.round(thread.opacity * 255).toString(16).padStart(2,'0')}`);
        grad.addColorStop(0.7, `${thread.color}${Math.round(thread.opacity * 200).toString(16).padStart(2,'0')}`);
        grad.addColorStop(1, `${thread.color}00`);

        ctx.beginPath();
        ctx.moveTo(thread.x, thread.y);

        // Bezier curve for silk-like flow
        const cpX = (thread.x + x2) / 2 + Math.sin(t + thread.delay) * 20;
        const cpY = (thread.y + y2) / 2 + Math.cos(t + thread.delay) * 20;
        ctx.quadraticCurveTo(cpX, cpY, x2, y2);

        ctx.strokeStyle = grad;
        ctx.lineWidth   = 0.8 + Math.sin(t * 2 + thread.delay) * 0.4;
        ctx.stroke();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="cs-threads" />;
};

// ─── Custom cursor ────────────────────────────────────────────────────────────
const Cursor: React.FC = () => {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos     = useRef({ x: 0, y: 0 });
  const ring    = useRef({ x: 0, y: 0 });
  const raf     = useRef(0);

  useEffect(() => {
    const move = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', move);
    const tick = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.1;
      ring.current.y += (pos.current.y - ring.current.y) * 0.1;
      if (dotRef.current)  dotRef.current.style.transform  = `translate(${pos.current.x}px,${pos.current.y}px) translate(-50%,-50%)`;
      if (ringRef.current) ringRef.current.style.transform = `translate(${ring.current.x}px,${ring.current.y}px) translate(-50%,-50%)`;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf.current); };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="cs-cursor-dot"  />
      <div ref={ringRef} className="cs-cursor-ring" />
    </>
  );
};

// ─── Countdown unit with flip animation ──────────────────────────────────────
const Unit: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const [displayed, setDisplayed] = useState(value);
  const [flipping, setFlipping]   = useState(false);

  useEffect(() => {
    if (value !== displayed) {
      setFlipping(true);
      const t = setTimeout(() => { setDisplayed(value); setFlipping(false); }, 300);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div className="cs-unit">
      <div className="cs-unit-box" style={{ perspective: '300px' }}>
        <span
          className="cs-unit-num"
          style={{
            transition: 'transform 0.3s, opacity 0.3s',
            transform: flipping ? 'rotateX(90deg)' : 'rotateX(0deg)',
            opacity:   flipping ? 0 : 1,
          }}
        >
          {String(displayed).padStart(2, '0')}
        </span>
      </div>
      <span className="cs-unit-label">{label}</span>
    </div>
  );
};

// ─── Notify form ──────────────────────────────────────────────────────────────
const NotifyForm: React.FC = () => {
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState<'idle'|'saving'|'success'|'error'>('idle');

  const submit = async () => {
    if (!email.includes('@')) return;
    setStatus('saving');
    try {
      await saveNotifyEmail(email.trim());
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  if (status === 'success') return <p className="cs-notify-success">✦ You're on the list! We'll notify you on launch day.</p>;

  return (
    <div>
      <div className="cs-notify">
        <input
          type="email" placeholder="Your email address"
          value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          disabled={status === 'saving'}
        />
        <button className="cs-notify-btn" onClick={submit} disabled={status === 'saving'}>
          {status === 'saving' ? '···' : 'Notify Me'}
        </button>
      </div>
      {status === 'error' && <p className="cs-notify-error">Something went wrong. Please try again.</p>}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const ComingSoon: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [phase, setPhase]       = useState(0); // controls staggered entrance

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  // Stagger content reveal
  useEffect(() => {
    const timers = [0,100,250,420,580,720,880,1020,1160].map(
      (delay, i) => setTimeout(() => setPhase(i + 1), delay + 100)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const inStyle = (n: number): React.CSSProperties => ({
    animationDelay: '0ms',
    animationDuration: '0.8s',
  });

  const show = (n: number) => phase >= n ? 'cs-in go' : 'cs-in';

  return (
    <>
      <style>{CSS}</style>

      <div className="cs-root">
        <Cursor />
        <div className="cs-grain" />
        <ThreadCanvas />

        {/* Art deco frame */}
        <div className="cs-frame">
          <div className="cs-frame-corner tl" />
          <div className="cs-frame-corner tr" />
          <div className="cs-frame-corner bl" />
          <div className="cs-frame-corner br" />
        </div>

        {/* Pulsing rings */}
        {[320,480,640].map((s,i) => (
          <div key={s} className="cs-ring" style={{
            width: s, height: s,
            top: '44%', left: '50%',
            animationDelay: `${i * 2}s`,
            animationDuration: `${8 + i * 2}s`,
          }}/>
        ))}

        {/* Ambient glows */}
        <div className="cs-glow" style={{
          width: '55vw', height: '55vw', top: '10%', left: '-10%',
          background: 'radial-gradient(circle, rgba(188,61,62,0.09) 0%, transparent 65%)',
          '--dx':'40px','--dy':'20px',
          animation: 'cs-glow-drift 18s ease-in-out infinite alternate',
        } as React.CSSProperties}/>
        <div className="cs-glow" style={{
          width: '45vw', height: '45vw', bottom: '-5%', right: '-5%',
          background: 'radial-gradient(circle, rgba(182,137,60,0.08) 0%, transparent 65%)',
          '--dx':'-30px','--dy':'-20px',
          animation: 'cs-glow-drift 22s ease-in-out 4s infinite alternate',
        } as React.CSSProperties}/>
        <div className="cs-glow" style={{
          width: '30vw', height: '30vw', top: '55%', left: '55%',
          background: 'radial-gradient(circle, rgba(230,147,88,0.06) 0%, transparent 65%)',
          '--dx':'20px','--dy':'-30px',
          animation: 'cs-glow-drift 14s ease-in-out 2s infinite alternate',
        } as React.CSSProperties}/>

        {/* ── Content ── */}
        <div className="cs-content">

          {/* Logo */}
          <div className={`cs-logo-wrap ${show(1)}`} style={inStyle(1)}>
            <div className="cs-logo-eyebrow">
              <div className="cs-logo-line" />
              <span className="cs-logo-text">Wing &amp; Weft</span>
              <div className="cs-logo-line r" />
            </div>
            <picture>
              <source srcSet="/logo@2x.webp 2x, /logo@1x.webp 1x" type="image/webp" />
              <source srcSet="/logo@2x.png 2x, /logo@1x.png 1x"  type="image/png" />
              <img src="/logo@1x.png" alt="Wing & Weft" className="cs-logo-img" loading="eager" decoding="sync" />
            </picture>
          </div>

          {/* Headline */}
          <div className={show(2)} style={inStyle(2)}>
            <h1 className="cs-headline">
              Something <span className="cs-headline-accent">beautiful</span>
              <br />is on its way
            </h1>
          </div>

          {/* Subhead */}
          <div className={show(3)} style={inStyle(3)}>
            <p className="cs-subhead">Timeless sarees. Uncompromising craft.</p>
          </div>

          {/* Ornament rule */}
          <div className={show(4)} style={inStyle(4)}>
            <div className="cs-rule">
              <div className="cs-rule-line" />
              <div className="cs-rule-diamond" />
              <div className="cs-rule-line r" />
            </div>
          </div>

          {/* Launch badge */}
          <div className={show(5)} style={{ ...inStyle(5), display:'flex', justifyContent:'center', marginBottom:'1.2rem' }}>
            <div className="cs-badge">
              <div className="cs-badge-dot" />
              <span className="cs-badge-text">Launching April 15, 2026</span>
            </div>
          </div>

          {/* Countdown */}
          <div className={show(6)} style={inStyle(6)}>
            <div className="cs-countdown">
              <Unit value={timeLeft.days}    label="Days"    />
              <span className="cs-sep">:</span>
              <Unit value={timeLeft.hours}   label="Hours"   />
              <span className="cs-sep">:</span>
              <Unit value={timeLeft.minutes} label="Minutes" />
              <span className="cs-sep">:</span>
              <Unit value={timeLeft.seconds} label="Seconds" />
            </div>
          </div>

          {/* Tagline */}
          <div className={show(7)} style={inStyle(7)}>
            <p className="cs-tagline">
              We're weaving something extraordinary for you —<br />
              <strong>pure fabrics, authentic weaves, heritage craftsmanship.</strong>
            </p>
          </div>

          {/* Notify form */}
          <div className={show(8)} style={inStyle(8)}>
            <NotifyForm />
          </div>

          {/* Social + footer */}
          <div className={show(9)} style={inStyle(9)}>
            <div className="cs-social">
              <a href="https://www.instagram.com/wingandweft/" target="_blank" rel="noopener noreferrer" className="cs-social-icon" aria-label="Instagram">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a href="#" className="cs-social-icon" aria-label="Facebook">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="mailto:support@wingandweft.com" className="cs-social-icon" aria-label="Email">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </a>
              <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="cs-social-icon" aria-label="WhatsApp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </a>
            </div>
            <p className="cs-foot">© 2026 Wing &amp; Weft · All rights reserved</p>
          </div>

        </div>
      </div>
    </>
  );
};

export default ComingSoon;