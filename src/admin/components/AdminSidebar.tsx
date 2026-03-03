// src/admin/components/AdminSidebar.tsx
import React, { useState } from 'react';
import {
  LayoutDashboard, Package, Image, MessageSquare,
  Settings, LogOut, Menu, X, ChevronRight, Layers,
} from 'lucide-react';
import { useAdminAuth } from '../lib/AdminAuthContext';

export type AdminPage = 'dashboard' | 'products' | 'banners' | 'inquiries' | 'settings';

interface Props {
  activePage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  newInquiries?: number;
}

const NAV_ITEMS: { id: AdminPage; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'banners', label: 'Banners', icon: Image },
  { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const AdminSidebar: React.FC<Props> = ({ activePage, onNavigate, newInquiries = 0 }) => {
  const { session, signOut } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand header */}
      <div
        className="px-5 py-6 border-b border-white/10"
        style={{ background: 'linear-gradient(135deg, #bc3d3e, #9e3233)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(233,227,203,0.15)', border: '1px solid rgba(233,227,203,0.3)' }}
          >
            <Layers size={18} color="#e9e3cb" />
          </div>
          <div>
            <p className="text-brand-cream font-bold text-sm" style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.05em' }}>
              Wing & Weft
            </p>
            <p className="text-brand-cream/60 text-xs" style={{ fontFamily: '"Raleway", sans-serif' }}>
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-3 space-y-1" aria-label="Admin navigation">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => { onNavigate(id); setMobileOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              style={isActive ? { background: 'linear-gradient(135deg, rgba(188,61,62,0.3), rgba(182,137,60,0.2))', border: '1px solid rgba(188,61,62,0.3)' } : {}}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={17}
                  className={isActive ? 'text-brand-orange' : 'text-slate-500 group-hover:text-slate-300'}
                />
                <span style={{ fontFamily: '"Raleway", sans-serif' }}>{label}</span>
              </div>
              <div className="flex items-center gap-2">
                {id === 'inquiries' && newInquiries > 0 && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: '#bc3d3e', color: '#e9e3cb', fontFamily: '"Raleway", sans-serif' }}
                  >
                    {newInquiries}
                  </span>
                )}
                {isActive && <ChevronRight size={14} className="text-brand-orange" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-4 py-3 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-xs text-slate-500 mb-0.5" style={{ fontFamily: '"Raleway", sans-serif' }}>Signed in as</p>
          <p className="text-slate-300 text-sm truncate" style={{ fontFamily: '"Raleway", sans-serif' }}>
            {session?.user.email}
          </p>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all text-sm"
          style={{ fontFamily: '"Raleway", sans-serif' }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
        style={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={() => setMobileOpen((v) => !v)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen ? <X size={18} color="#e9e3cb" /> : <Menu size={18} color="#e9e3cb" />}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#0f1117' }}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 h-screen sticky top-0 flex-shrink-0"
        style={{ background: '#0f1117' }}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default AdminSidebar;
