// src/components/WhatsApp/WhatsAppSection.tsx
import React from 'react';
import { MessageCircle, ArrowUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { WHATSAPP_NUMBER } from '../../data/products';
import { useScrollToTop } from '../../hooks';
import { theme } from '../../theme/heroThemes';
import { useSettings } from '../../context/SettingsContext'; 

const WA_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I need help choosing a saree from Wing & Weft.')}`;

// ─── CTA Section ──────────────────────────────────────────────────────────────
export const WhatsAppSection: React.FC = () => {
  const { isDark } = useTheme();
  const { whatsapp_number } = useSettings(); 

  return (
    <section
      className="relative py-20 overflow-hidden"
      style={{
        // Background switches between dark/light variants of the active theme
        background: isDark ? theme.waSectionBgDark : theme.waSectionBgLight,
      }}
      aria-label="Contact us on WhatsApp"
    >
      {/* Decorative pattern */}
      <div className="absolute inset-0 pattern-overlay opacity-20" />

      {/* Radial accent glow — theme-coloured */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${theme.accentSecondary}26 0%, transparent 70%)`,
        }}
      />

      {/* Animated thread lines */}
      <svg
        aria-hidden="true"
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.4 }}
      >
        <defs>
          <linearGradient id="was-t1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={theme.threadPrimary} stopOpacity="0" />
            <stop offset="50%"  stopColor={theme.threadPrimary} />
            <stop offset="100%" stopColor={theme.threadPrimary} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,100 C120,60 200,140 320,90 C440,40 540,130 680,90 C760,70 800,100 800,100"
          stroke="url(#was-t1)" strokeWidth="1" fill="none" strokeLinecap="round"
        />
      </svg>

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        {/* WhatsApp icon — always brand green */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-float"
          style={{ background: '#25D366', boxShadow: '0 0 30px rgba(37,211,102,0.5)' }}
        >
          <MessageCircle size={36} color="white" />
        </div>

        {/* Eyebrow — theme-coloured */}
        <p
          className="text-xs uppercase tracking-widest mb-3 font-body"
          style={{ letterSpacing: '0.3em', color: theme.eyebrow }}
        >
          We're here to help
        </p>

        <h2
          style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400 }}
          className="text-brand-cream mb-4"
        >
          Need Help Choosing?
        </h2>

        <p className="text-brand-cream/80 font-body text-base mb-8 max-w-md mx-auto leading-relaxed">
          Can't decide which saree to pick? Our saree experts are just a WhatsApp message away. Get personalised recommendations, check availability, and place your order — all through chat!
        </p>

        {/* Diamond rule */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '28px' }}>
          <div style={{ width: '40px', height: '1px', background: `linear-gradient(to right, transparent, ${theme.rule})` }} />
          <div style={{ width: '6px', height: '6px', background: theme.diamond, transform: 'rotate(45deg)' }} />
          <div style={{ width: '40px', height: '1px', background: `linear-gradient(to left, transparent, ${theme.rule})` }} />
        </div>

        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-bold font-body text-sm uppercase tracking-widest transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          style={{
            background: '#25D366',
            color: '#fff',
            boxShadow: '0 4px 25px rgba(37,211,102,0.5)',
            letterSpacing: '0.15em',
          }}
        >
          <MessageCircle size={20} />
          Chat on WhatsApp
        </a>

        <p className="text-brand-cream/50 text-xs mt-4 font-body">
          Usually replies within a few hours
        </p>
      </div>
    </section>
  );
};

// ─── Floating WhatsApp + Scroll-to-top ────────────────────────────────────────
export const FloatingActions: React.FC = () => {
  const { visible, scrollToTop } = useScrollToTop();
  const { whatsapp_number } = useSettings();  

  return (
    <div className="whatsapp-float z-50">
      {/* Scroll to top — theme-coloured gradient */}
      <button
        onClick={scrollToTop}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{
          background: theme.ctaBg,
          color: theme.ctaText,
        }}
        aria-label="Scroll to top"
      >
        <ArrowUp size={18} />
      </button>

      {/* WhatsApp button — always brand green */}
      <a
        href={WA_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110"
        style={{
          background: '#25D366',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(37,211,102,0.5)',
        }}
        aria-label="Chat with us on WhatsApp"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
};

export default WhatsAppSection;