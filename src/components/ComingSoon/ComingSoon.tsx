// src/components/ComingSoon/ComingSoon.tsx
import React, { useState, useEffect } from 'react';

// ─── Launch date: April 15, 2025 at 12:00 AM IST ─────────────────────────────
const LAUNCH_DATE = new Date('2026-04-15T00:00:00+05:30');

interface TimeLeft {
  days:    number;
  hours:   number;
  minutes: number;
  seconds: number;
}

const getTimeLeft = (): TimeLeft => {
  const diff = LAUNCH_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

// ─── Countdown unit block ─────────────────────────────────────────────────────
const Unit: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const display = String(value).padStart(2, '0');
  return (
    <div className="ww-unit">
      <div className="ww-unit-box">
        <span className="ww-unit-number">{display}</span>
      </div>
      <span className="ww-unit-label">{label}</span>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ComingSoon: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft());
  const [mounted, setMounted]   = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Raleway:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ww-root {
          min-height: 100vh;
          background: #0e0b08;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 2rem 1.5rem;
          font-family: 'Raleway', sans-serif;
        }

        /* ── Grain overlay ── */
        .ww-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.6;
        }

        /* ── Ambient glows ── */
        .ww-glow-red {
          position: fixed;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(188,61,62,0.12) 0%, transparent 70%);
          top: -100px; left: -100px;
          pointer-events: none;
          z-index: 0;
          animation: drift1 18s ease-in-out infinite alternate;
        }
        .ww-glow-gold {
          position: fixed;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(182,137,60,0.1) 0%, transparent 70%);
          bottom: -80px; right: -80px;
          pointer-events: none;
          z-index: 0;
          animation: drift2 22s ease-in-out infinite alternate;
        }
        @keyframes drift1 { from { transform: translate(0,0); } to { transform: translate(60px, 40px); } }
        @keyframes drift2 { from { transform: translate(0,0); } to { transform: translate(-50px, -30px); } }

        /* ── Decorative lines ── */
        .ww-lines {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .ww-line {
          position: absolute;
          background: linear-gradient(180deg, transparent, rgba(182,137,60,0.08), transparent);
          width: 1px;
          height: 100%;
          animation: linefade 6s ease-in-out infinite alternate;
        }
        .ww-line:nth-child(1) { left: 15%; animation-delay: 0s; }
        .ww-line:nth-child(2) { left: 85%; animation-delay: 2s; }
        @keyframes linefade { from { opacity: 0.4; } to { opacity: 1; } }

        /* ── Content wrapper ── */
        .ww-content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 820px;
          width: 100%;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.9s ease, transform 0.9s ease;
        }
        .ww-content.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Logo mark ── */
        .ww-logomark {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 2.5rem;
        }
        .ww-logomark-line {
          width: 40px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #b6893c);
        }
        .ww-logomark-line.right {
          background: linear-gradient(90deg, #b6893c, transparent);
        }
        .ww-logomark-text {
          color: #b6893c;
          font-family: 'Raleway', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          font-weight: 600;
        }

        /* ── Headline ── */
        .ww-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3.2rem, 9vw, 6.5rem);
          font-weight: 300;
          line-height: 1.0;
          color: #e9e3cb;
          letter-spacing: -0.01em;
          margin-bottom: 0.3rem;
        }
        .ww-headline em {
          font-style: italic;
          color: #bc3d3e;
        }
        .ww-subheadline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.4rem, 3.5vw, 2.2rem);
          font-weight: 300;
          color: rgba(233,227,203,0.55);
          margin-bottom: 1.2rem;
          letter-spacing: 0.02em;
        }

        /* ── Divider ── */
        .ww-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 1.6rem auto 2.4rem;
        }
        .ww-divider-line {
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(182,137,60,0.5));
        }
        .ww-divider-line.right {
          background: linear-gradient(90deg, rgba(182,137,60,0.5), transparent);
        }
        .ww-divider-diamond {
          width: 6px; height: 6px;
          background: #b6893c;
          transform: rotate(45deg);
        }

        /* ── Date badge ── */
        .ww-date-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.5rem 1.4rem;
          border-radius: 100px;
          border: 1px solid rgba(182,137,60,0.3);
          background: rgba(182,137,60,0.07);
          margin-bottom: 2.8rem;
        }
        .ww-date-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #bc3d3e;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
        .ww-date-text {
          color: #b6893c;
          font-size: 0.72rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          font-weight: 600;
        }

        /* ── Countdown ── */
        .ww-countdown {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: clamp(12px, 3vw, 28px);
          margin-bottom: 3rem;
        }
        .ww-separator {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          color: rgba(182,137,60,0.4);
          font-weight: 300;
          line-height: 1;
          padding-top: 8px;
          user-select: none;
        }
        .ww-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .ww-unit-box {
          position: relative;
          width: clamp(72px, 16vw, 110px);
          height: clamp(72px, 16vw, 110px);
          border-radius: 12px;
          background: rgba(233,227,203,0.04);
          border: 1px solid rgba(182,137,60,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .ww-unit-box::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(188,61,62,0.06), rgba(182,137,60,0.04));
        }
        .ww-unit-number {
          position: relative;
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.2rem, 6vw, 3.8rem);
          font-weight: 400;
          color: #e9e3cb;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .ww-unit-label {
          color: rgba(182,137,60,0.7);
          font-size: 0.62rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          font-weight: 600;
        }

        /* ── Tagline ── */
        .ww-tagline {
          color: rgba(233,227,203,0.4);
          font-size: 0.85rem;
          letter-spacing: 0.12em;
          font-weight: 400;
          line-height: 1.8;
          max-width: 480px;
          margin: 0 auto 2.5rem;
        }
        .ww-tagline strong {
          color: rgba(233,227,203,0.65);
          font-weight: 500;
        }

        /* ── Notify form ── */
        .ww-notify {
          display: flex;
          gap: 0;
          max-width: 400px;
          margin: 0 auto 1rem;
          border-radius: 100px;
          overflow: hidden;
          border: 1px solid rgba(182,137,60,0.25);
          background: rgba(255,255,255,0.03);
          transition: border-color 0.3s;
        }
        .ww-notify:focus-within {
          border-color: rgba(182,137,60,0.5);
        }
        .ww-notify-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          padding: 0.8rem 1.2rem;
          color: #e9e3cb;
          font-size: 0.82rem;
          font-family: 'Raleway', sans-serif;
          letter-spacing: 0.05em;
        }
        .ww-notify-input::placeholder { color: rgba(233,227,203,0.25); }
        .ww-notify-btn {
          background: linear-gradient(135deg, #bc3d3e, #b6893c);
          border: none;
          padding: 0.8rem 1.4rem;
          color: #e9e3cb;
          font-size: 0.75rem;
          font-family: 'Raleway', sans-serif;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s;
          white-space: nowrap;
        }
        .ww-notify-btn:hover { opacity: 0.85; }
        .ww-notify-success {
          color: #86efac;
          font-size: 0.78rem;
          letter-spacing: 0.1em;
          margin-top: 0.5rem;
        }

        /* ── Footer note ── */
        .ww-footer {
          margin-top: 3rem;
          color: rgba(233,227,203,0.2);
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .ww-separator { display: none; }
          .ww-countdown { gap: 8px; }
        }
      `}</style>

      <div className="ww-root">
        {/* Ambient glows */}
        <div className="ww-glow-red" />
        <div className="ww-glow-gold" />

        {/* Decorative vertical lines */}
        <div className="ww-lines">
          <div className="ww-line" />
          <div className="ww-line" />
        </div>

        {/* Main content */}
        <div className={`ww-content ${mounted ? 'visible' : ''}`}>

          {/* Brand mark */}
          <div className="ww-logomark">
            <div className="ww-logomark-line" />
            <span className="ww-logomark-text">Wing &amp; Weft</span>
            <div className="ww-logomark-line right" />
          </div>

          {/* Headline */}
          <h1 className="ww-headline">
            Something <em>beautiful</em><br />is on its way
          </h1>
          <p className="ww-subheadline">Timeless sarees. Uncompromising craft.</p>

          {/* Divider */}
          <div className="ww-divider">
            <div className="ww-divider-line" />
            <div className="ww-divider-diamond" />
            <div className="ww-divider-line right" />
          </div>

          {/* Launch date badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.8rem' }}>
            <div className="ww-date-badge">
              <div className="ww-date-dot" />
              <span className="ww-date-text">Launching April 15, 2026</span>
            </div>
          </div>

          {/* Countdown */}
          <div className="ww-countdown">
            <Unit value={timeLeft.days}    label="Days"    />
            <span className="ww-separator">:</span>
            <Unit value={timeLeft.hours}   label="Hours"   />
            <span className="ww-separator">:</span>
            <Unit value={timeLeft.minutes} label="Minutes" />
            <span className="ww-separator">:</span>
            <Unit value={timeLeft.seconds} label="Seconds" />
          </div>

          {/* Tagline */}
          <p className="ww-tagline">
            We're weaving something extraordinary for you —<br />
            <strong>pure fabrics, authentic weaves, heritage craftsmanship.</strong>
          </p>

          {/* Email notify */}
          <NotifyForm />

          {/* Footer */}
          <p className="ww-footer">© 2025 Wing &amp; Weft · All rights reserved</p>
        </div>
      </div>
    </>
  );
};

// ─── Email notify form ────────────────────────────────────────────────────────
const NotifyForm: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!email.includes('@')) return;
    // For now just shows success — hook up to Supabase inquiries or email service later
    setSubmitted(true);
  };

  if (submitted) {
    return <p className="ww-notify-success">✦ We'll notify you on launch day!</p>;
  }

  return (
    <div>
      <div className="ww-notify">
        <input
          className="ww-notify-input"
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button className="ww-notify-btn" onClick={handleSubmit}>
          Notify Me
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;