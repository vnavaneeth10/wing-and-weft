// src/admin/pages/AdminDashboard.tsx
import React, { useMemo } from 'react';
import {
  Package, AlertTriangle, TrendingUp, Star,
  MessageSquare, ArrowRight, BarChart3, Layers
} from 'lucide-react';
import { StatCard, Badge } from '../components/AdminUI';
import { DBProduct } from '../hooks/useAdminData';

interface Props {
  products: DBProduct[];
  productsLoading: boolean;
  newInquiries: number;
  onNavigate: (page: 'products' | 'inquiries') => void;
}

const AdminDashboard: React.FC<Props> = ({ products, productsLoading, newInquiries, onNavigate }) => {
  const stats = useMemo(() => {
    const total = products.length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 3).length;
    const featured = products.filter((p) => p.is_featured).length;
    const newArrivals = products.filter((p) => p.is_new_arrival).length;
    const bestSellers = products.filter((p) => p.is_best_seller).length;

    const byCategory: Record<string, number> = {};
    products.forEach((p) => {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    });

    return { total, outOfStock, lowStock, featured, newArrivals, bestSellers, byCategory };
  }, [products]);

  const alertProducts = products.filter((p) => p.stock <= 3).slice(0, 6);

  const CATEGORY_LABELS: Record<string, string> = {
    'silk-sarees': 'Silk Sarees',
    'cotton-sarees': 'Cotton Sarees',
    'georgette-sarees': 'Georgette',
    'linen-sarees': 'Linen Sarees',
    'chiffon-sarees': 'Chiffon',
  };

  const maxCat = Math.max(...Object.values(stats.byCategory), 1);

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-white text-2xl font-bold mb-1" style={{ fontFamily: '"Raleway", sans-serif' }}>
          Dashboard
        </h1>
        <p className="text-slate-500 text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>
          Overview of your Wing & Weft store
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={productsLoading ? '–' : stats.total}
          icon={<Package size={20} color="#bc3d3e" />}
          accent="#bc3d3e"
        />
        <StatCard
          title="Out of Stock"
          value={productsLoading ? '–' : stats.outOfStock}
          sub={stats.outOfStock > 0 ? 'Needs restocking' : 'All stocked'}
          icon={<AlertTriangle size={20} color={stats.outOfStock > 0 ? '#f97316' : '#22c55e'} />}
          accent={stats.outOfStock > 0 ? '#f97316' : '#22c55e'}
        />
        <StatCard
          title="New Arrivals"
          value={productsLoading ? '–' : stats.newArrivals}
          icon={<TrendingUp size={20} color="#b6893c" />}
          accent="#b6893c"
        />
        <StatCard
          title="New Inquiries"
          value={newInquiries}
          sub={newInquiries > 0 ? 'Awaiting response' : 'All caught up'}
          icon={<MessageSquare size={20} color="#3b82f6" />}
          accent="#3b82f6"
        />
      </div>

      {/* Two column: category chart + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Category breakdown */}
        <div className="rounded-2xl p-6" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={18} className="text-brand-gold" />
            <h2 className="text-white font-semibold text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>
              Products by Category
            </h2>
          </div>
          <div className="space-y-4">
            {Object.entries(stats.byCategory).map(([cat, count]) => (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-300 text-xs" style={{ fontFamily: '"Raleway", sans-serif' }}>
                    {CATEGORY_LABELS[cat] || cat}
                  </span>
                  <span className="text-slate-400 text-xs" style={{ fontFamily: '"Raleway", sans-serif' }}>
                    {count}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(count / maxCat) * 100}%`,
                      background: 'linear-gradient(90deg, #bc3d3e, #b6893c)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Tag summary */}
          <div className="mt-6 pt-4 border-t border-white/10 flex gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Badge label={`${stats.bestSellers} Best Sellers`} color="gold" />
            </div>
            <div className="flex items-center gap-2">
              <Badge label={`${stats.featured} Featured`} color="blue" />
            </div>
            <div className="flex items-center gap-2">
              <Badge label={`${stats.newArrivals} New`} color="green" />
            </div>
          </div>
        </div>

        {/* Low stock / out of stock alerts */}
        <div className="rounded-2xl p-6" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-400" />
              <h2 className="text-white font-semibold text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>
                Stock Alerts
              </h2>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-brand-orange transition-colors"
              style={{ fontFamily: '"Raleway", sans-serif' }}
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          {alertProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-slate-500 text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>
                All products are well stocked!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alertProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div
                    className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                    style={{ background: '#0f1117' }}
                  >
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Layers size={14} className="text-slate-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-xs font-semibold truncate" style={{ fontFamily: '"Raleway", sans-serif' }}>
                      {p.name}
                    </p>
                    <p className="text-slate-500 text-xs" style={{ fontFamily: '"Raleway", sans-serif' }}>
                      {p.id}
                    </p>
                  </div>
                  <Badge
                    label={p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                    color={p.stock === 0 ? 'red' : 'orange'}
                  />
                </div>
              ))}
            </div>
          )}

          {newInquiries > 0 && (
            <button
              onClick={() => onNavigate('inquiries')}
              className="w-full mt-4 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:opacity-90"
              style={{
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.3)',
                color: '#93c5fd',
                fontFamily: '"Raleway", sans-serif',
              }}
            >
              <MessageSquare size={16} />
              {newInquiries} new {newInquiries === 1 ? 'inquiry' : 'inquiries'} waiting
            </button>
          )}
        </div>
      </div>

      {/* Recent products */}
      <div className="rounded-2xl p-6" style={{ background: '#1a1b2e', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-sm" style={{ fontFamily: '"Raleway", sans-serif' }}>
            Recently Added
          </h2>
          <button
            onClick={() => onNavigate('products')}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-brand-orange transition-colors"
            style={{ fontFamily: '"Raleway", sans-serif' }}
          >
            All products <ArrowRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-white/10">
                {['Product', 'Category', 'Price', 'Stock', 'Tags'].map((h) => (
                  <th key={h} className="pb-3 pr-4 text-slate-500 font-semibold text-xs uppercase tracking-wider" style={{ fontFamily: '"Raleway", sans-serif', letterSpacing: '0.1em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 6).map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0" style={{ background: '#0f1117' }}>
                        {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="text-slate-200 font-medium text-xs" style={{ fontFamily: '"Raleway", sans-serif' }}>{p.name}</p>
                        <p className="text-slate-600 text-xs" style={{ fontFamily: '"Raleway", sans-serif' }}>{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-slate-400 text-xs capitalize" style={{ fontFamily: '"Raleway", sans-serif' }}>
                      {(CATEGORY_LABELS[p.category] || p.category)}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div>
                      {p.discount_price ? (
                        <>
                          <span className="text-brand-red text-xs font-bold" style={{ fontFamily: '"Raleway", sans-serif' }}>
                            ₹{p.discount_price.toLocaleString()}
                          </span>
                          <span className="text-slate-600 text-xs line-through ml-1" style={{ fontFamily: '"Raleway", sans-serif' }}>
                            ₹{p.price.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-300 text-xs font-bold" style={{ fontFamily: '"Raleway", sans-serif' }}>
                          ₹{p.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge
                      label={p.stock === 0 ? 'Out of Stock' : `${p.stock}`}
                      color={p.stock === 0 ? 'red' : p.stock <= 3 ? 'orange' : 'green'}
                    />
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1 flex-wrap">
                      {p.is_new_arrival && <Badge label="New" color="green" />}
                      {p.is_best_seller && <Badge label="Best" color="gold" />}
                      {p.is_featured && <Badge label="Featured" color="blue" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
