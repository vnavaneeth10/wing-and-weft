// src/App.tsx
import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { FloatingActions } from './components/WhatsApp/WhatsAppSection';
import LoadingScreen from './components/UI/LoadingScreen';
import './styles/a11y.css'; // ← global focus rings, reduced-motion, shimmer, sr-only

const HomePage          = lazy(() => import('./pages/HomePage'));
const CategoryPage      = lazy(() => import('./pages/CategoryPage'));
const CategoriesPage    = lazy(() => import('./pages/CategoriesPage')); // ← ADDED
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const OurStoryPage      = lazy(() => import('./pages/OurStoryPage'));
const ContactPage       = lazy(() => import('./pages/ContactPage'));
const SearchPage        = lazy(() => import('./pages/SearchPage'));
const NotFoundPage      = lazy(() => import('./pages/NotFoundPage'));
const AdminApp          = lazy(() => import('./admin/AdminApp'));

const PageSkeleton = () => (
  <div className="min-h-screen pt-20 max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <div className="space-y-4">
      <div className="h-8 rounded-xl shimmer w-1/3" />
      <div className="h-4 rounded shimmer w-2/3" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden">
            <div className="h-64 shimmer" />
            <div className="p-4 space-y-2">
              <div className="h-3 rounded shimmer w-3/4" />
              <div className="h-3 rounded shimmer w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AdminFallback = () => (
  <div style={{ background: '#080a12', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(188,61,62,0.2)', borderTopColor: '#bc3d3e', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
  </div>
);

const PublicLayout: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    {/*
      Skip-to-main link — invisible until focused via keyboard Tab.
      Lets screen reader and keyboard users jump past the navbar directly
      to the page content. Styled in globals_a11y.css (.skip-to-main).
    */}
    <a href="#main-content" className="skip-to-main">
      Skip to main content
    </a>

    <Navbar />

    {/*
      id="main-content" is the target of the skip link above.
      role="main" is redundant with <main> but kept for older screen readers.
    */}
    <main id="main-content" className="flex-1">
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/"                     element={<HomePage />} />
          <Route path="/categories"           element={<CategoriesPage />} /> {/* ← ADDED */}
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/product/:productId"   element={<ProductDetailPage />} />
          <Route path="/our-story"            element={<OurStoryPage />} />
          <Route path="/contact"              element={<ContactPage />} />
          <Route path="/search"               element={<SearchPage />} />
          <Route path="*"                     element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </main>

    <Footer />
    <FloatingActions />
  </div>
);

const AppContent: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/admin/*" element={<Suspense fallback={<AdminFallback />}><AdminApp /></Suspense>} />
      <Route path="/*"       element={<PublicLayout />} />
    </Routes>
  </BrowserRouter>
);

const App: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  return (
    <ThemeProvider>
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      {loaded && <AppContent />}
    </ThemeProvider>
  );
};

export default App;