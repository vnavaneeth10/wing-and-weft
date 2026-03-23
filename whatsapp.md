// src/components/WhatsApp/WhatsAppSection.tsx
import React from 'react';
import { MessageCircle, ArrowUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { WHATSAPP_NUMBER } from '../../data/products';
import { useScrollToTop } from '../../hooks';

const WA_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I need help choosing a saree from Wing & Weft.')}`;

// CTA Section
export const WhatsAppSection: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <section
      className="relative py-20 overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #231d17 0%, #2e1a1b 50%, #231d17 100%)'
          : 'linear-gradient(135deg, #bc3d3e 0%, #9e3233 50%, #b6893c 100%)',
      }}
      aria-label="Contact us on WhatsApp"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pattern-overlay opacity-20" />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(182,137,60,0.15) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        {/* WhatsApp icon */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-float"
          style={{ background: '#25D366', boxShadow: '0 0 30px rgba(37,211,102,0.5)' }}>
          <MessageCircle size={36} color="white" />
        </div>

        <p className="text-brand-cream/70 text-xs uppercase tracking-widest mb-3 font-body" style={{ letterSpacing: '0.3em' }}>
          We're here to help
        </p>
        <h2
          style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600 }}
          className="text-brand-cream mb-4"
        >
          Need Help Choosing?
        </h2>
        <p className="text-brand-cream/80 font-body text-base mb-8 max-w-md mx-auto leading-relaxed">
          Can't decide which saree to pick? Our saree experts are just a WhatsApp message away. Get personalised recommendations, check availability, and place your order — all through chat!
        </p>

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

// Floating WhatsApp + Scroll-to-top
export const FloatingActions: React.FC = () => {
  const { visible, scrollToTop } = useScrollToTop();

  return (
    <div className="whatsapp-float z-50">
      {/* Scroll to top — only shown when scrolled */}
      <button
        onClick={scrollToTop}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{
          background: 'linear-gradient(135deg, #bc3d3e, #b6893c)',
          color: '#e9e3cb',
        }}
        aria-label="Scroll to top"
      >
        <ArrowUp size={18} />
      </button>

      {/* WhatsApp button */}
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
