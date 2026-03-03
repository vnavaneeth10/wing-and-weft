// src/admin/pages/AdminLogin.tsx
import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, Layers } from 'lucide-react';
import { useAdminAuth } from '../lib/AdminAuthContext';

const AdminLogin: React.FC = () => {
  const { signIn, loading, error } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimIn(true), 100);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn(email, password);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: '#080a12' }}
    >
      {/* Ambient background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(188,61,62,0.08) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(182,137,60,0.05) 0%, transparent 70%)' }}
      />

      {/* Decorative grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div
        className={`relative w-full max-w-md transition-all duration-700 ${animIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Header strip */}
          <div
            className="px-8 py-6 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(188,61,62,0.15), rgba(182,137,60,0.1))' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #bc3d3e, #b6893c)', boxShadow: '0 8px 24px rgba(188,61,62,0.4)' }}
            >
              <Layers size={28} color="#e9e3cb" />
            </div>
            <h1 className="text-white text-xl font-bold mb-1" style={{ fontFamily: '"Raleway", sans-serif' }}>
              Wing & Weft
            </h1>
            <p className="text-slate-400 text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>
              Admin Dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
            {error && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontFamily: '"Raleway", sans-serif' }}
                role="alert"
              >
                <Lock size={14} />
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.12em' }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@wingandweft.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-brand-red/40"
                  style={{
                    background: '#080a12',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontFamily: '"Raleway", sans-serif',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.12em' }}
              >
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="admin-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-brand-red/40"
                  style={{
                    background: '#080a12',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontFamily: '"Raleway", sans-serif',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #bc3d3e, #9e3233)',
                color: '#e9e3cb',
                fontFamily: '"Raleway", sans-serif',
                letterSpacing: '0.08em',
                boxShadow: '0 4px 20px rgba(188,61,62,0.3)',
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-brand-cream/30 border-t-brand-cream rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <Lock size={16} /> Sign In
                </>
              )}
            </button>

            <p className="text-center text-slate-600 text-xs" style={{ fontFamily: '"Raleway", sans-serif' }}>
              Authorised personnel only
            </p>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-700 text-xs mt-6" style={{ fontFamily: '"Raleway", sans-serif' }}>
          Wing & Weft Admin · Secured by Supabase Auth
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
