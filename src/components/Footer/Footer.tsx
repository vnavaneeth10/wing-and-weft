// src/components/Footer/Footer.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, MessageCircle, ArrowRight, Heart } from 'lucide-react';
import { CATEGORIES, INSTAGRAM_URL, WHATSAPP_NUMBER } from '../../data/products';
import { useTheme } from '../../context/ThemeContext';
import PolicyModal from '../Policy/PolicyModal';
import { POLICIES } from '../Policy/policies';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../admin/lib/supabase';

// ─── Save newsletter email to Supabase inquiries ──────────────────────────────
const saveNewsletterEmail = async (email: string) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/inquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey:         SUPABASE_ANON_KEY,
      Authorization:  `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer:         'return=minimal',
    },
    body: JSON.stringify({
      customer_name:  'Newsletter Subscriber',
      customer_phone: 'N/A',
      customer_email: email,
      message:        '📧 Subscribed to newsletter from footer.',
      status:         'new',
    }),
  });
  if (!res.ok) throw new Error('Failed to save');
};

const Footer: React.FC = () => {
  const { isDark } = useTheme();
  const [email, setEmail]         = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [openPolicy, setOpenPolicy] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailStatus('saving');
    try {
      // ✅ Save to Supabase — visible in Admin → Inquiries
      await saveNewsletterEmail(email.trim());
      setEmail('');
      setEmailStatus('success');
      setTimeout(() => setEmailStatus('idle'), 3000);
    } catch {
      setEmailStatus('error');
      setTimeout(() => setEmailStatus('idle'), 3000);
    }
  };

  const bg        = isDark ? 'bg-dark-bg border-dark-border' : 'bg-stone-900 border-stone-800';
  const text      = 'text-stone-400';
  const heading   = 'text-brand-cream';
  const linkClass = `${text} hover:text-brand-orange transition-colors text-sm font-body`;

  return (
    <>
      <footer className={`${bg} border-t pt-16 pb-8`} role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Subscribe banner */}
          <div
            className="rounded-2xl p-8 md:p-12 mb-16 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #bc3d3e, #b6893c)' }}
          >
            <div className="absolute inset-0 pattern-overlay opacity-20" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-brand-cream mb-1" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.8rem', fontWeight: 600 }}>
                  Stay in the Loop
                </h3>
                <p className="text-brand-cream/80 text-sm font-body">
                  Get exclusive deals, new arrivals, and saree style tips delivered to your inbox.
                </p>
              </div>
              <form onSubmit={handleEmailSubmit} className="flex gap-2 w-full md:w-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  disabled={emailStatus === 'saving'}
                  className="flex-1 md:w-64 px-4 py-3 rounded-full text-sm font-body outline-none focus:ring-2 focus:ring-brand-cream/50 placeholder-black disabled:opacity-60"
                  style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#e9e3cb' }}
                  aria-label="Email address for newsletter"
                />
                <button
                  type="submit"
                  disabled={emailStatus === 'saving'}
                  className="px-5 py-3 rounded-full font-semibold font-body text-sm transition-all hover:scale-105 disabled:opacity-60"
                  style={{ background: '#e9e3cb', color: '#bc3d3e' }}
                  aria-label="Subscribe to newsletter"
                >
                  {emailStatus === 'saving' ? '...' : emailStatus === 'success' ? '✓' : emailStatus === 'error' ? '✗' : <ArrowRight size={18} />}
                </button>
              </form>
            </div>

            {/* ✅ Status message */}
            {emailStatus === 'success' && (
              <p className="relative z-10 text-brand-cream/80 text-xs font-body mt-3 text-center md:text-right">
                ✓ You're subscribed! We'll be in touch.
              </p>
            )}
            {emailStatus === 'error' && (
              <p className="relative z-10 text-brand-cream/60 text-xs font-body mt-3 text-center md:text-right">
                Something went wrong. Please try again.
              </p>
            )}
          </div>

          {/* Footer grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #bc3d3e, #b6893c)' }}>
                  <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '0.9rem', fontWeight: 700, color: '#e9e3cb' }}>W&W</span>
                </div>
                <span className={heading} style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.3rem', fontWeight: 600 }}>
                  Wing & Weft
                </span>
              </div>
              <p className={`${text} text-sm font-body leading-relaxed mb-4`}>
                Timeless sarees crafted with uncompromising quality, elegance, and attention to every detail. Your heritage, our craft.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className={`${heading} font-semibold font-body text-sm uppercase tracking-widest mb-4`} style={{ letterSpacing: '0.15em' }}>Quick Links</h4>
              <ul className="space-y-2">
                {[{ to: '/', label: 'Home' }, { to: '/our-story', label: 'Our Story' }, { to: '/contact', label: 'Contact' }].map((l) => (
                  <li key={l.to}><Link to={l.to} className={linkClass}>{l.label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Collections */}
            <div>
              <h4 className={`${heading} font-semibold font-body text-sm uppercase tracking-widest mb-4`} style={{ letterSpacing: '0.15em' }}>Collections</h4>
              <ul className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <li key={cat.id}><Link to={`/category/${cat.id}`} className={linkClass}>{cat.name}</Link></li>
                ))}
              </ul>
            </div>

            {/* Policies */}
            <div>
              <h4 className={`${heading} font-semibold font-body text-sm uppercase tracking-widest mb-4`} style={{ letterSpacing: '0.15em' }}>Policies</h4>
              <ul className="space-y-2">
                {POLICIES.map((p) => (
                  <li key={p.id}><button onClick={() => setOpenPolicy(p.id)} className={`${linkClass} text-left`}>{p.title}</button></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="saree-divider mb-8" />

          {/* Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} aria-label="Instagram">
                <Instagram size={16} color="#e9e3cb" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} aria-label="Facebook">
                <Facebook size={16} color="#e9e3cb" />
              </a>
              <a href="mailto:support@wingandweft.com" className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} aria-label="Email">
                <Mail size={16} color="#e9e3cb" />
              </a>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: '#25D366' }} aria-label="WhatsApp">
                <MessageCircle size={16} color="white" />
              </a>
            </div>
            <div className="text-center">
              <p className={`${text} text-xs font-body`}>
                © 2026 Wing & Weft. All Rights Reserved. &nbsp;&nbsp; Crafted with{' '}
                <Heart size={10} className="inline text-brand-red" fill="#bc3d3e" /> by Navi
              </p>
              <p className={`${text} text-xs font-body mt-1`}>
                Email support:{' '}
                <a href="mailto:support@wingandweft.com" className="hover:text-brand-orange transition-colors">
                  support@wingandweft.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {openPolicy && <PolicyModal policyId={openPolicy} onClose={() => setOpenPolicy(null)} />}
    </>
  );
};

export default Footer;