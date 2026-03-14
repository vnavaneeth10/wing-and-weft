// src/admin/AdminApp.tsx
import React, { useState, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';
import { AdminAuthProvider, useAdminAuth } from './lib/AdminAuthContext';
import { AdminThemeProvider, useAdminTheme } from './lib/AdminThemeContext';
import { adminTokens } from './lib/adminTokens';
import AdminLogin from './pages/AdminLogin';
import AdminSidebar, { AdminPage } from './components/AdminSidebar';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminBanners from './pages/AdminBanners';
import AdminInquiries from './pages/AdminInquiries';
import AdminSettings from './pages/AdminSettings';
import AdminCategories from './pages/AdminCategories';
import { useProducts, useInquiries } from './hooks/useAdminData';

const AdminInner: React.FC = () => {
  const { session } = useAdminAuth();
  const { isDarkAdmin, toggleAdminTheme } = useAdminTheme();
  const tk = isDarkAdmin ? adminTokens.dark : adminTokens.light;

  const [page, setPage] = useState<AdminPage>('dashboard');
  const { products, loading: productsLoading, refresh: refreshProducts } = useProducts();
  const { newCount: newInquiries } = useInquiries();

  const handleProductsChanged = useCallback(() => refreshProducts(), [refreshProducts]);

  if (!session) return <AdminLogin />;

  const renderPage = () => {
    switch (page) {
      case 'dashboard':  return <AdminDashboard products={products} productsLoading={productsLoading} newInquiries={newInquiries} onNavigate={(p) => setPage(p)} />;
      case 'products':   return <AdminProducts onChanged={handleProductsChanged} />;
      case 'banners':    return <AdminBanners />;
      case 'categories': return <AdminCategories />;
      case 'inquiries':  return <AdminInquiries />;
      case 'settings':   return <AdminSettings />;
      default:           return null;
    }
  };

  return (
    <div
      className="flex min-h-screen transition-colors duration-300"
      style={{ background: tk.pageBg }}
    >
      <AdminSidebar activePage={page} onNavigate={setPage} newInquiries={newInquiries} />

      <main className="flex-1 overflow-auto">
        {/* ── Top bar ── */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 lg:py-4 border-b transition-colors duration-300"
          style={{
            background: tk.topbarBg,
            backdropFilter: 'blur(12px)',
            borderColor: tk.border,
          }}
        >
          {/* Page breadcrumb */}
          <div className="flex items-center gap-2">
            <div className="w-10 lg:hidden" />
            <p
              className="text-xs capitalize hidden lg:block"
              style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.1em', color: tk.textMuted }}
            >
              Admin &nbsp;/&nbsp;
              <span style={{ color: tk.textSecondary }}>{page.replace('-', ' ')}</span>
            </p>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* New inquiries pill */}
            {newInquiries > 0 && (
              <button
                onClick={() => setPage('inquiries')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                style={{
                  background: 'rgba(188,61,62,0.15)',
                  border: '1px solid rgba(188,61,62,0.3)',
                  color: '#fca5a5',
                  fontFamily: '"Raleway", sans-serif',
                }}
              >
                🔔 {newInquiries} new
              </button>
            )}

            {/* ── Theme toggle ── */}
            <button
              onClick={toggleAdminTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{
                background: isDarkAdmin ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                border: `1px solid ${tk.borderMed}`,
              }}
              aria-label={isDarkAdmin ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkAdmin ? 'Light mode' : 'Dark mode'}
            >
              {isDarkAdmin
                ? <Sun size={16} color="#fcd34d" />
                : <Moon size={16} color="#6366f1" />
              }
            </button>

            {/* Admin avatar */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors duration-300"
              style={{ background: isDarkAdmin ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${tk.border}` }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #bc3d3e, #b6893c)', color: '#e9e3cb', fontFamily: '"Raleway", sans-serif' }}
              >
                A
              </div>
              <span
                className="text-xs hidden sm:block"
                style={{ fontFamily: '"Raleway", sans-serif', color: tk.textSecondary }}
              >
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* ── Page content ── */}
        <div className="p-5 lg:p-8 max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

const AdminApp: React.FC = () => (
  <AdminAuthProvider>
    <AdminThemeProvider>
      <AdminInner />
    </AdminThemeProvider>
  </AdminAuthProvider>
);

export default AdminApp;