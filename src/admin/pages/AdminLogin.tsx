// src/admin/pages/AdminLogin.tsx
import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, Layers, AlertTriangle, Shield } from 'lucide-react';
import { useAdminAuth } from '../lib/AdminAuthContext';
import { isLockedOut, getLockoutRemaining } from '../lib/supabase';

const AdminLogin: React.FC = () => {
  const { signIn, loading, error, remainingAttempts, lockoutMinutes } = useAdminAuth();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [animIn, setAnimIn]       = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => { setTimeout(() => setAnimIn(true), 80); }, []);

  useEffect(() => {
    if (!isLockedOut()) return;
    setCountdown(getLockoutRemaining());
    const t = setInterval(() => {
      const rem = getLockoutRemaining();
      setCountdown(rem);
      if (rem <= 0) clearInterval(t);
    }, 15000);
    return () => clearInterval(t);
  }, [lockoutMinutes]);

  const locked = isLockedOut();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    signIn(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: '#080a12' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(188,61,62,0.07) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      <div className={`relative w-full max-w-md transition-all duration-700 ${animIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="rounded-2xl overflow-hidden" style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Header with logo */}
          <div className="px-8 py-6 text-center" style={{ background: 'linear-gradient(135deg, rgba(188,61,62,0.15), rgba(182,137,60,0.1))' }}>
            {/* Logo image — uses the actual brand logo */}
            <div className="flex justify-center mb-4">
              <picture>
                <source srcSet="/logo@2x.webp 2x, /logo@1x.webp 1x" type="image/webp" />
                <source srcSet="/logo@2x.png 2x, /logo@1x.png 1x" type="image/png" />
                <img
                  src="/logo@1x.png"
                  alt="Wing & Weft"
                  width={160} height={90}
                  className="w-auto object-contain"
                  style={{ height: '56px' }}
                  loading="eager"
                  decoding="sync"
                />
              </picture>
            </div>
            <h1 className="text-white text-lg font-bold mb-0.5" style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.08em' }}>
              Wing &amp; Weft
            </h1>
            <p className="text-slate-400 text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>Admin Dashboard</p>
          </div>

          {locked && (
            <div className="mx-6 mt-5 flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-300 text-sm font-semibold" style={{ fontFamily: '"Raleway", sans-serif' }}>Account temporarily locked</p>
                <p className="text-red-400/70 text-xs mt-0.5" style={{ fontFamily: '"Raleway", sans-serif' }}>
                  Too many failed attempts. Try again in {countdown} minute{countdown !== 1 ? 's' : ''}.
                </p>
              </div>
            </div>
          )}

          {!locked && remainingAttempts <= 2 && remainingAttempts > 0 && (
            <div className="mx-6 mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.25)' }}>
              <AlertTriangle size={14} className="text-orange-400 flex-shrink-0" />
              <p className="text-orange-300 text-xs" style={{ fontFamily: '"Raleway", sans-serif' }}>
                {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining before lockout
              </p>
            </div>
          )}

          {error && !locked && (
            <div className="mx-6 mt-5 flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <Lock size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5" autoComplete="off">
            <div>
              <label htmlFor="adm-email" className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.12em' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input id="adm-email" type="email" autoComplete="new-password" required
                  disabled={locked} value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@wingandweft.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-brand-red/40 disabled:opacity-40"
                  style={{ background: '#080a12', border: '1px solid rgba(255,255,255,0.1)', fontFamily: '"Raleway", sans-serif' }} />
              </div>
            </div>

            <div>
              <label htmlFor="adm-pass" className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.12em' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input id="adm-pass" type={showPass ? 'text' : 'password'} autoComplete="new-password"
                  required disabled={locked} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-brand-red/40 disabled:opacity-40"
                  style={{ background: '#080a12', border: '1px solid rgba(255,255,255,0.1)', fontFamily: '"Raleway", sans-serif' }} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || locked}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #bc3d3e, #9e3233)', color: '#e9e3cb', fontFamily: '"Raleway", sans-serif', boxShadow: '0 4px 20px rgba(188,61,62,0.25)' }}>
              {loading
                ? <><div className="w-4 h-4 border-2 border-brand-cream/30 border-t-brand-cream rounded-full animate-spin" /> Verifying…</>
                : locked
                ? <><AlertTriangle size={16} /> Locked — wait {countdown} min</>
                : <><Lock size={16} /> Sign In</>}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-slate-600 text-xs" style={{ fontFamily: '"Raleway", sans-serif' }}>
              <Shield size={11} />
              Session ends automatically when browser tab is closed
            </div>
          </form>
        </div>

        <p className="text-center text-slate-700 text-xs mt-5" style={{ fontFamily: '"Raleway", sans-serif' }}>
          Authorised personnel only · Wing &amp; Weft Admin
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;