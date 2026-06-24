import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SellerDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    api.get('/seller/stats')
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-32"><LoadingSpinner size="lg" /></div>;
  if (error)   return <p className="text-center text-red-400 p-8">{error}</p>;

  const cards = [
    { label: 'Total products',    value: stats?.productCount   ?? 0 },
    { label: 'Total orders',      value: stats?.orderCount     ?? 0 },
    { label: 'Revenue',           value: `₹${Number(stats?.revenue ?? 0).toLocaleString('en-IN')}` },
    { label: 'Pending orders',    value: stats?.pendingOrders  ?? 0 },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="theme-card rounded-xl p-5">
            <p className="text-xs theme-muted mb-1">{c.label}</p>
            <p className="text-2xl font-semibold text-brand-pink">{c.value}</p>
          </div>
        ))}
      </div>

      {stats?.recentOrders?.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-4">Recent orders</h2>
          <div className="flex flex-col gap-3">
            {stats.recentOrders.map((o) => (
              <div key={o.id} className="theme-card rounded-lg px-4 py-3 flex justify-between items-center text-sm">
                <span className="font-mono text-xs theme-muted">{o.id.slice(0, 8)}…</span>
                <span>₹{Number(o.total).toLocaleString('en-IN')}</span>
                <span className="capitalize theme-muted">{o.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
