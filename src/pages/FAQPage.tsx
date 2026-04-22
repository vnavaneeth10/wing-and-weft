// src/pages/FAQPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, MessageCircle, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { theme } from '../theme/heroThemes';

// ─── FAQ data ─────────────────────────────────────────────────────────────────

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // Ordering & Shopping
  {
    id: 'faq-01',
    category: 'Ordering & Shopping',
    question: 'How do I place an order?',
    answer:
      'Ordering is simple and personal. Browse our collection, and when you find a saree you love, click the "Enquire via WhatsApp" button on the product page. You\'ll be connected directly with us on WhatsApp, where we can confirm availability, discuss customisation, and arrange payment — all in one conversation. We believe in a personal touch for every purchase.',
  },
  {
    id: 'faq-02',
    category: 'Ordering & Shopping',
    question: 'Can I request a saree in a different colour or fabric?',
    answer:
      'Absolutely. Many of our sarees are available in multiple colourways or can be sourced in specific fabrics. Reach out to us on WhatsApp or via email with your preference and we\'ll let you know what\'s possible. Custom or bespoke requests are handled on a case-by-case basis depending on weaver availability.',
  },
  {
    id: 'faq-03',
    category: 'Ordering & Shopping',
    question: 'Is there a minimum order quantity?',
    answer:
      'Not at all. We cater to individual buyers as well as bulk purchases for events, weddings, or gifting. Whether you\'re looking for a single heirloom-quality piece or a set of sarees for a special occasion, we\'re happy to assist.',
  },
  {
    id: 'faq-04',
    category: 'Ordering & Shopping',
    question: 'Do you offer gift wrapping or special packaging?',
    answer:
      'Yes! All Wing & Weft sarees are carefully folded and packaged. We also offer premium gift packaging with a handwritten note for that extra personal touch — perfect for weddings, birthdays, or festive gifting. Mention this when you enquire and we\'ll take care of it.',
  },

  // Payments
  {
    id: 'faq-05',
    category: 'Payments',
    question: 'What payment methods do you accept?',
    answer:
      'We accept UPI (GPay, PhonePe, Paytm, BHIM), bank transfers (NEFT/IMPS/RTGS), and major credit/debit cards. Payment details are shared securely over WhatsApp once you confirm your order. We do not store any card or banking information.',
  },
  {
    id: 'faq-06',
    category: 'Payments',
    question: 'Is advance payment required?',
    answer:
      'For standard orders from our ready stock, full payment is required before dispatch. For custom or pre-order pieces, we typically ask for a 50% advance to confirm the order, with the remaining balance due before shipping.',
  },
  {
    id: 'faq-07',
    category: 'Payments',
    question: 'Do you offer Cash on Delivery (COD)?',
    answer:
      'Currently, we do not offer Cash on Delivery. All orders are prepaid. We understand this may be a concern for first-time buyers — please feel free to chat with us, check our customer reviews, or follow us on Instagram to see the community we\'ve built before placing an order.',
  },

  // Shipping & Delivery
  {
    id: 'faq-08',
    category: 'Shipping & Delivery',
    question: 'Do you ship across India?',
    answer:
      'Yes, we ship pan-India through trusted courier partners. Deliveries typically take 3–7 business days depending on your location. Remote areas may take slightly longer. You\'ll receive a tracking number via WhatsApp once your order is dispatched.',
  },
  {
    id: 'faq-09',
    category: 'Shipping & Delivery',
    question: 'Do you ship internationally?',
    answer:
      'Yes, we do ship internationally! Shipping charges and delivery timelines vary by country. Please reach out to us on WhatsApp or email before placing an international order so we can provide accurate shipping costs and estimated delivery windows.',
  },
  {
    id: 'faq-10',
    category: 'Shipping & Delivery',
    question: 'How can I track my order?',
    answer:
      'Once your saree is dispatched, we\'ll share the courier name and tracking number with you via WhatsApp. You can also use the "Track Your Order" link in the footer, which connects you to a tracking portal. If you face any issues, just message us and we\'ll help locate your parcel.',
  },
  {
    id: 'faq-11',
    category: 'Shipping & Delivery',
    question: 'What if my package arrives damaged?',
    answer:
      'We take great care in packing every order. However, if your package arrives damaged or tampered with, please take photos immediately and contact us within 24 hours of delivery via WhatsApp or email. We will investigate with the courier and work towards a resolution as quickly as possible.',
  },

  // Returns & Exchanges
  {
    id: 'faq-12',
    category: 'Returns & Exchanges',
    question: 'What is your return policy?',
    answer:
      'We accept returns within 7 days of delivery for items that are unused, unwashed, and in their original packaging with tags intact. Custom-made or personalised sarees are not eligible for return. Please initiate a return request by contacting us on WhatsApp with your order details and reason for return.',
  },
  {
    id: 'faq-13',
    category: 'Returns & Exchanges',
    question: 'Can I exchange a saree for a different one?',
    answer:
      'Yes, exchanges are welcome within 7 days of delivery, subject to availability of the desired piece. The saree being returned must be in original, unused condition. Shipping charges for the exchange may apply depending on the situation.',
  },
  {
    id: 'faq-14',
    category: 'Returns & Exchanges',
    question: 'What if I received the wrong item?',
    answer:
      'We sincerely apologise if this happens. Please contact us immediately via WhatsApp with a photo of what you received. We will arrange for the correct piece to be sent to you as quickly as possible and cover any associated shipping costs.',
  },

  // Saree Care
  {
    id: 'faq-15',
    category: 'Saree Care',
    question: 'How should I care for my saree?',
    answer:
      'Care instructions vary by fabric. As a general rule: dry clean silk and Kanjivaram sarees; hand wash light cotton or linen sarees in cold water with mild detergent; avoid wringing or tumble drying; store folded in muslin cloth away from direct sunlight. Specific care guidance is included with each saree.',
  },
  {
    id: 'faq-16',
    category: 'Saree Care',
    question: 'Are your sarees authentic handloom?',
    answer:
      'Yes. Authenticity is at the heart of Wing & Weft. We source directly from weavers and trusted artisans across India. Each piece is carefully verified for craftsmanship and origin. Where applicable, we include weaver details or GI (Geographical Indication) tags with the saree.',
  },
  {
    id: 'faq-17',
    category: 'Saree Care',
    question: 'Will the colours match exactly what I see on screen?',
    answer:
      'We photograph our sarees in natural light to ensure accurate colour representation. However, screen calibration and display settings can cause slight variations. If colour accuracy is critical — for example, matching a blouse — please request additional photos or a short video over WhatsApp before ordering.',
  },
];

const CATEGORIES = Array.from(new Set(faqs.map((f) => f.category)));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

const fadeStyle = (vis: boolean, delay = 0): React.CSSProperties => ({
  opacity:    vis ? 1 : 0,
  transform:  vis ? 'translateY(0)' : 'translateY(22px)',
  transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
});

// ─── Accordion item ───────────────────────────────────────────────────────────

interface AccordionItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  isDark: boolean;
  isLast: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ item, isOpen, onToggle, isDark, isLast }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    setHeight(isOpen ? (contentRef.current?.scrollHeight ?? 0) : 0);
  }, [isOpen]);

  const dividerColor  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const questionColor = isDark ? '#FAF6EF' : '#1c1917';
  const answerColor   = isDark ? '#a8a29e' : '#78716c';
  const rowHoverBg    = isDark ? theme.infoRowHoverDark : theme.infoRowHoverLight;

  return (
    <div
      style={{
        borderBottom: isLast ? 'none' : `1px solid ${dividerColor}`,
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '20px 24px',
          background: isOpen ? rowHoverBg : 'transparent',
          cursor: 'pointer',
          transition: 'background 0.25s ease',
          width: '100%',
          border: 'none',
          textAlign: 'left',
        }}
      >
        {/* Question */}
        <span
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '1.08rem',
            fontWeight: isOpen ? 600 : 500,
            lineHeight: 1.4,
            color: isOpen ? theme.accentPrimary : questionColor,
            transition: 'color 0.3s ease',
            textAlign: 'left',
          }}
        >
          {item.question}
        </span>

        {/* Chevron badge */}
        <span
          aria-hidden="true"
          style={{
            flexShrink: 0,
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isOpen ? theme.accentPrimary : 'transparent',
            border: `1.5px solid ${isOpen ? theme.accentPrimary : dividerColor}`,
            transition: 'all 0.3s ease',
          }}
        >
          <ChevronDown
            size={14}
            style={{
              color: isOpen ? '#fff' : answerColor,
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
              display: 'block',
            }}
          />
        </span>
      </button>

      {/* Collapsible answer */}
      <div
        style={{
          height: `${height}px`,
          overflow: 'hidden',
          transition: 'height 0.38s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div ref={contentRef} style={{ padding: '0 24px 24px' }}>
          {/* Accent rule */}
          <div
            style={{
              height: '1.5px',
              width: '36px',
              borderRadius: '2px',
              background: theme.accentPrimary,
              marginBottom: '12px',
              opacity: 0.65,
            }}
          />
          <p
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.925rem',
              lineHeight: 1.82,
              color: answerColor,
              margin: 0,
            }}
          >
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const FAQPage: React.FC = () => {
  const { isDark }                         = useTheme();
  const { whatsapp_number, contact_email } = useSettings();

  const [openId, setOpenId]                 = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const heroRef = useFadeIn();
  const bodyRef = useFadeIn();
  const ctaRef  = useFadeIn();

  const filteredFaqs =
    activeCategory === 'All' ? faqs : faqs.filter((f) => f.category === activeCategory);

  const grouped = CATEGORIES.reduce<Record<string, FAQItem[]>>((acc, cat) => {
    const items = filteredFaqs.filter((f) => f.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  // Derived surface colours
  const pageBg     = isDark ? '#1c1917' : '#faf9f7';
  const cardBg     = isDark ? '#292524' : '#ffffff';
  const muted      = isDark ? '#a8a29e' : '#78716c';
  const pill       = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)';
  const divider    = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const cardShadow = isDark ? '0 6px 32px rgba(0,0,0,0.4)' : '0 6px 32px rgba(0,0,0,0.06)';

  return (
    <div style={{ minHeight: '100vh', background: pageBg }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div
        ref={heroRef.ref}
        style={{
          ...fadeStyle(heroRef.visible),
          background: theme.footerBannerBg,
          position: 'relative',
          overflow: 'hidden',
          padding: 'clamp(64px, 10vw, 96px) 24px clamp(56px, 8vw, 80px)',
          textAlign: 'center',
        }}
      >
        {/* Thread SVG */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1200 220"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.22 }}
        >
          <defs>
            <linearGradient id="faq-hero-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={theme.threadPrimary} stopOpacity="0" />
              <stop offset="50%"  stopColor={theme.threadPrimary} />
              <stop offset="100%" stopColor={theme.threadPrimary} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,110 C150,45 300,175 500,100 C700,25 860,165 1050,90 C1130,62 1175,105 1200,110"
            stroke="url(#faq-hero-grad)" strokeWidth="1.5" fill="none" strokeLinecap="round"
          />
          <path
            d="M0,145 C200,88 370,188 570,118 C770,48 920,168 1110,100 C1165,78 1192,118 1200,130"
            stroke="url(#faq-hero-grad)" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.55"
          />
          <path
            d="M0,75 C100,40 250,130 420,72 C590,14 740,130 950,72 C1060,45 1150,78 1200,72"
            stroke={theme.threadAccent} strokeWidth="0.6" fill="none" strokeLinecap="round" opacity="0.3"
          />
        </svg>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ marginBottom: '22px' }}>
            <picture>
              <source srcSet="/logo@2x.webp 2x, /logo@1x.webp 1x" type="image/webp" />
              <source srcSet="/logo@2x.png 2x, /logo@1x.png 1x"   type="image/png" />
              <img
                src="/logo@1x.png"
                alt="Wing & Weft"
                loading="eager"
                decoding="async"
                style={{ height: '52px', width: 'auto', display: 'inline-block', objectFit: 'contain' }}
              />
            </picture>
          </div>

          {/* Eyebrow */}
          <p
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: theme.eyebrow,
              marginBottom: '12px',
            }}
          >
            Help Centre
          </p>

          {/* Accent rule */}
          <div
            style={{
              width: '48px',
              height: '1.5px',
              background: theme.rule,
              margin: '0 auto 20px',
              borderRadius: '2px',
            }}
          />

          <h1
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
              fontWeight: 400,
              color: theme.h1,
              margin: '0 auto 14px',
              lineHeight: 1.15,
              maxWidth: '700px',
            }}
          >
            Frequently Asked Questions
          </h1>

          <p
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
              color: theme.tagline,
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Everything you need to know about shopping, shipping, care, and returns — answered simply.
          </p>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div
        ref={bodyRef.ref}
        style={{
          ...fadeStyle(bodyRef.visible, 80),
          maxWidth: '840px',
          margin: '0 auto',
          padding: 'clamp(40px, 6vw, 72px) 20px clamp(60px, 8vw, 100px)',
        }}
      >
        {/* Category pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '52px',
            justifyContent: 'center',
          }}
        >
          {['All', ...CATEGORIES].map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setOpenId(null); }}
                style={{
                  padding: '7px 18px',
                  borderRadius: '999px',
                  border: `1.5px solid ${active ? theme.accentPrimary : pill}`,
                  background: active
                    ? theme.accentPrimary
                    : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  color: active ? '#fff' : muted,
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.78rem',
                  fontWeight: active ? 600 : 500,
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                  transition: 'all 0.22s ease',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = theme.accentPrimary;
                    (e.currentTarget as HTMLButtonElement).style.color = theme.accentPrimary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = pill;
                    (e.currentTarget as HTMLButtonElement).style.color = muted;
                  }
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Accordion groups */}
        {Object.entries(grouped).map(([category, items], groupIdx) => (
          <div
            key={category}
            style={{
              marginBottom: '36px',
              opacity: 0,
              animation: `wwFadeUp 0.52s ease ${groupIdx * 70}ms forwards`,
            }}
          >
            {/* Category label */}
            {activeCategory === 'All' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <span
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: theme.accentPrimary,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {category}
                </span>
                <div style={{ flex: 1, height: '1px', background: divider }} />
              </div>
            )}

            {/* Card */}
            <div
              style={{
                background: cardBg,
                borderRadius: '14px',
                border: `1px solid ${divider}`,
                overflow: 'hidden',
                boxShadow: cardShadow,
              }}
            >
              {items.map((item, idx) => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isOpen={openId === item.id}
                  onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                  isDark={isDark}
                  isLast={idx === items.length - 1}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <div
        ref={ctaRef.ref}
        style={{
          ...fadeStyle(ctaRef.visible, 60),
          maxWidth: '840px',
          margin: '0 auto',
          padding: '0 20px clamp(72px, 10vw, 110px)',
        }}
      >
        <div
          style={{
            borderRadius: '16px',
            padding: 'clamp(36px, 6vw, 52px) clamp(28px, 6vw, 52px)',
            textAlign: 'center',
            background: theme.footerBannerBg,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 800 130"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.18 }}
          >
            <defs>
              <linearGradient id="faq-cta-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor={theme.threadPrimary} stopOpacity="0" />
                <stop offset="50%"  stopColor={theme.threadPrimary} />
                <stop offset="100%" stopColor={theme.threadPrimary} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,65 C100,22 220,108 360,58 C500,8 630,98 800,58"
              stroke="url(#faq-cta-grad)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          </svg>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <p
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: theme.eyebrow,
                marginBottom: '10px',
              }}
            >
              Still have questions?
            </p>

            <h2
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 'clamp(1.7rem, 4vw, 2.4rem)',
                fontWeight: 400,
                color: theme.h1,
                marginBottom: '10px',
                lineHeight: 1.2,
              }}
            >
              We're here to help
            </h2>

            <p
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.9rem',
                color: theme.tagline,
                marginBottom: '28px',
                lineHeight: 1.65,
              }}
            >
              Reach out to us directly — we typically respond within a few hours.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href={`https://wa.me/${whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 26px',
                  borderRadius: '999px',
                  background: '#25D366',
                  color: '#fff',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'opacity 0.2s ease, transform 0.2s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.88'; (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1';    (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)'; }}
              >
                <MessageCircle size={15} /> Chat on WhatsApp
              </a>

              <a
                href={`mailto:${contact_email}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 26px',
                  borderRadius: '999px',
                  background: theme.footerButtonBg,
                  color: theme.footerButtonText,
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'opacity 0.2s ease, transform 0.2s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'; (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1';    (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)'; }}
              >
                <Mail size={15} /> Send an Email
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes wwFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default FAQPage;