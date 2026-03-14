// src/admin/components/AdminSidebar.tsx
import React, { useState } from 'react';
import {
  LayoutDashboard, Package, Image, MessageSquare,
  Settings, LogOut, Menu, X, ChevronRight,
  Layers, Tag, type LucideIcon,
} from 'lucide-react';
import { useAdminAuth } from '../lib/AdminAuthContext';
import { useAdminTheme } from '../lib/AdminThemeContext';
import { adminTokens } from '../lib/adminTokens';

export type AdminPage = 'dashboard' | 'products' | 'banners' | 'categories' | 'inquiries' | 'settings';

interface Props {
  activePage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  newInquiries?: number;
}

const NAV_ITEMS: { id: AdminPage; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'products',   label: 'Products',   icon: Package },
  { id: 'banners',    label: 'Banners',    icon: Image },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'inquiries',  label: 'Inquiries',  icon: MessageSquare },
  { id: 'settings',   label: 'Settings',   icon: Settings },
];

const AdminSidebar: React.FC<Props> = ({ activePage, onNavigate, newInquiries = 0 }) => {
  const { session, signOut } = useAdminAuth();
  const { isDarkAdmin } = useAdminTheme();
  const tk = isDarkAdmin ? adminTokens.dark : adminTokens.light;

  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div
      className="flex flex-col h-full transition-colors duration-300"
      style={{ background: tk.sidebarBg }}
    >
      {/* Brand header — always brand red, unaffected by theme */}
      <div
        className="px-5 py-6"
        style={{
          background: 'linear-gradient(135deg, #bc3d3e, #9e3233)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(233,227,203,0.15)', border: '1px solid rgba(233,227,203,0.3)' }}
          >
            <Layers size={18} color="#e9e3cb" />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ fontFamily: '"Raleway", sans-serif', color: '#e9e3cb', letterSpacing: '0.05em' }}>
              Wing & Weft
            </p>
            <p className="text-xs" style={{ fontFamily: '"Raleway", sans-serif', color: 'rgba(233,227,203,0.55)' }}>
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-3 space-y-0.5" aria-label="Admin navigation">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => { onNavigate(id); setMobileOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group"
              style={{
                background: isActive ? tk.navActive : 'transparent',
                border: isActive ? `1px solid ${tk.navActiveBorder}` : '1px solid transparent',
                color: isActive ? tk.textPrimary : tk.textSecondary,
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = tk.navHoverBg; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={17}
                  color={isActive ? tk.navIconActive : tk.navIconIdle}
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
                {isActive && <ChevronRight size={14} color={tk.navIconActive} />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: '1px', background: tk.border, margin: '0 16px' }} />

      {/* User + Logout */}
      <div className="px-3 py-4">
        <div
          className="px-4 py-3 rounded-xl mb-2 transition-colors duration-300"
          style={{ background: isDarkAdmin ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${tk.border}` }}
        >
          <p className="text-xs mb-0.5" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textMuted }}>
            Signed in as
          </p>
          <p className="text-sm truncate" style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}>
            {session?.user.email}
          </p>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all"
          style={{ color: tk.textMuted, fontFamily: '"Raleway", sans-serif' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#f87171';
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = tk.textMuted;
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-300"
        style={{
          background: tk.cardBg,
          border: `1px solid ${tk.borderMed}`,
        }}
        onClick={() => setMobileOpen(v => !v)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen
          ? <X size={18} color={isDarkAdmin ? '#e9e3cb' : '#1a1410'} />
          : <Menu size={18} color={isDarkAdmin ? '#e9e3cb' : '#1a1410'} />
        }
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: tk.sidebarBg }}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 h-screen sticky top-0 flex-shrink-0 transition-colors duration-300"
        style={{ background: tk.sidebarBg, borderRight: `1px solid ${tk.border}` }}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default AdminSidebar;