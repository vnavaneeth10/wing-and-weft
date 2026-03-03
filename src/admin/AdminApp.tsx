// src/admin/AdminApp.tsx
import React, { useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from './lib/AdminAuthContext';
import AdminLogin from './pages/AdminLogin';
import AdminSidebar, { AdminPage } from './components/AdminSidebar';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminBanners from './pages/AdminBanners';
import AdminInquiries from './pages/AdminInquiries';
import AdminSettings from './pages/AdminSettings';
import { useProducts, useInquiries } from './hooks/useAdminData';

// ─── Inner app (auth-gated) ────────────────────────────────────────────────────
const AdminInner: React.FC = () => {
  const { session } = useAdminAuth();
  const [page, setPage] = useState<AdminPage>('dashboard');

  const { products, loading: productsLoading } = useProducts();
  const { newCount: newInquiries } = useInquiries();

  if (!session) return <AdminLogin />;

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return (
          <AdminDashboard
            products={products}
            productsLoading={productsLoading}
            newInquiries={newInquiries}
            onNavigate={(p) => setPage(p)}
          />
        );
      case 'products':
        return <AdminProducts />;
      case 'banners':
        return <AdminBanners />;
      case 'inquiries':
        return <AdminInquiries />;
      case 'settings':
        return <AdminSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#0b0d18' }}>
      <AdminSidebar
        activePage={page}
        onNavigate={setPage}
        newInquiries={newInquiries}
      />

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 lg:py-4 border-b"
          style={{ background: 'rgba(11,13,24,0.95)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-3 lg:hidden">
            {/* spacer for mobile menu button */}
            <div className="w-10" />
          </div>
          <p
            className="text-slate-400 text-xs capitalize hidden lg:block"
            style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.1em' }}
          >
            {page.replace('-', ' ')}
          </p>
          <div className="flex items-center gap-3">
            {newInquiries > 0 && (
              <button
                onClick={() => setPage('inquiries')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: 'rgba(188,61,62,0.15)', border: '1px solid rgba(188,61,62,0.3)', color: '#fca5a5', fontFamily: '"Raleway", sans-serif' }}
              >
                🔔 {newInquiries} new
              </button>
            )}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #bc3d3e, #b6893c)', color: '#e9e3cb', fontFamily: '"Raleway", sans-serif' }}>
                A
              </div>
              <span className="text-slate-400 text-xs hidden sm:block" style={{ fontFamily: '"Raleway", sans-serif' }}>Admin</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-5 lg:p-8 max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

// ─── Root export ──────────────────────────────────────────────────────────────
const AdminApp: React.FC = () => (
  <AdminAuthProvider>
    <AdminInner />
  </AdminAuthProvider>
);

export default AdminApp;
