// src/pages/ContactPage.tsx
import React, { useState } from 'react';
import { Phone, Mail, Clock, Instagram, Facebook, MessageCircle, Send } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { WHATSAPP_NUMBER, INSTAGRAM_URL } from '../data/products';

const ContactPage: React.FC = () => {
  const { isDark } = useTheme();
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `*New Contact Form Message*\n\nName: ${form.name}\nEmail: ${form.email}\nWhatsApp: ${form.whatsapp}\nMessage: ${form.message}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const bg = isDark ? 'bg-dark-bg' : 'bg-stone-50';
  const textPrimary = isDark ? 'text-dark-text' : 'text-stone-800';
  const textMuted = isDark ? 'text-dark-muted' : 'text-stone-600';
  const card = isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-stone-200';
  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm font-body outline-none focus:ring-2 focus:ring-brand-red/30 transition-all ${
    isDark ? 'bg-dark-bg border-dark-border text-dark-text placeholder-dark-muted focus:border-brand-red' : 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400 focus:border-brand-red'
  }`;

  const CONTACT_DETAILS = [
    { icon: Phone, label: 'Phone', value: '+91 99999 99999', href: 'tel:+919999999999' },
    { icon: Mail, label: 'Email', value: 'support@wingandweft.com', href: 'mailto:support@wingandweft.com' },
    { icon: Clock, label: 'Business Hours', value: 'Mon–Sat: 10AM – 7PM', href: null },
    { icon: Instagram, label: 'Instagram', value: '@wingandweft', href: INSTAGRAM_URL },
    { icon: Facebook, label: 'Facebook', value: 'Wing & Weft', href: '#' },
  ];

  return (
    <div className={`min-h-screen ${bg} pt-20`}>
      {/* Hero */}
      <div
        className="relative h-48 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #bc3d3e, #b6893c)' }}
      >
        <div className="absolute inset-0 pattern-overlay opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div>
            <p className="text-brand-cream/60 text-xs uppercase tracking-widest mb-2 font-body" style={{ letterSpacing: '0.3em' }}>
              Get in Touch
            </p>
            <h1
              className="text-brand-cream"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600 }}
            >
              Contact Us
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact info card */}
          <div className={`rounded-2xl border p-8 ${card}`}>
            <h2
              className={`mb-6 ${textPrimary}`}
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.8rem', fontWeight: 600 }}
            >
              Contact Information
            </h2>
            <div className="space-y-5">
              {CONTACT_DETAILS.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #bc3d3e15, #b6893c15)', border: '1px solid #b6893c30' }}
                  >
                    <Icon size={18} className="text-brand-gold" />
                  </div>
                  <div>
                    <p className={`text-xs uppercase tracking-wide font-body font-semibold mb-0.5 ${textMuted}`} style={{ letterSpacing: '0.15em' }}>
                      {label}
                    </p>
                    {href ? (
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                        className={`text-sm font-body hover:text-brand-red transition-colors ${textPrimary}`}>
                        {value}
                      </a>
                    ) : (
                      <p className={`text-sm font-body ${textPrimary}`}>{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp direct */}
            <div className="mt-8 pt-6 border-t" style={{ borderColor: isDark ? '#3a2e24' : '#f0ebe0' }}>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I need help with Wing & Weft.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-3.5 rounded-full font-bold font-body text-sm uppercase tracking-widest transition-all hover:scale-105"
                style={{ background: '#25D366', color: '#fff', letterSpacing: '0.15em' }}
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Contact form */}
          <div className={`rounded-2xl border p-8 ${card}`}>
            <h2
              className={`mb-6 ${textPrimary}`}
              style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.8rem', fontWeight: 600 }}
            >
              Send Us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className={`block text-xs font-semibold font-body uppercase tracking-wide mb-1.5 ${textMuted}`} style={{ letterSpacing: '0.15em' }} htmlFor="name">
                  Name *
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold font-body uppercase tracking-wide mb-1.5 ${textMuted}`} style={{ letterSpacing: '0.15em' }} htmlFor="email">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold font-body uppercase tracking-wide mb-1.5 ${textMuted}`} style={{ letterSpacing: '0.15em' }} htmlFor="whatsapp">
                  WhatsApp Number
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold font-body uppercase tracking-wide mb-1.5 ${textMuted}`} style={{ letterSpacing: '0.15em' }} htmlFor="message">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  className={`${inputClass} resize-none`}
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold font-body text-sm uppercase tracking-widest transition-all hover:scale-[1.02] hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #bc3d3e, #b6893c)',
                  color: '#e9e3cb',
                  letterSpacing: '0.15em',
                }}
              >
                <Send size={16} />
                Send via WhatsApp
              </button>
              <p className={`text-xs text-center font-body ${textMuted}`}>
                This will open WhatsApp with your message pre-filled
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
