import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const STATUS_COLORS = {
  pending:    'bg-yellow-500/20 text-yellow-400',
  confirmed:  'bg-blue-500/20 text-blue-400',
  shipped:    'bg-purple-500/20 text-purple-400',
  delivered:  'bg-green-500/20 text-green-400',
  cancelled:  'bg-red-500/20 text-red-400',
};

export default function Orders() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [searchParams] = useSearchParams();
  const highlight = searchParams.get('highlight');

  useEffect(() => {
    api.get('/orders')
      .then((d) => setOrders(d.orders ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-32"><LoadingSpinner size="lg" /></div>;
  if (error)   return <p className="text-center text-red-400 py-16">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">Your orders</h1>

      {orders.length === 0 && (
        <p className="text-center theme-muted py-16">No orders yet.</p>
      )}

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className={`theme-card rounded-xl p-5 flex flex-col gap-3 transition-all ${
              order.id === highlight ? 'ring-2 ring-brand-pink' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs theme-muted font-mono">{order.id}</p>
                <p className="text-sm font-medium mt-0.5">
                  ₹{Number(order.total).toLocaleString('en-IN')}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] ?? 'bg-white/10'}`}>
                {order.status}
              </span>
            </div>

            {order.items?.length > 0 && (
              <div className="text-xs theme-muted flex flex-wrap gap-2">
                {order.items.map((i) => (
                  <span key={i.productId} className="theme-chip px-2 py-0.5 rounded-full">
                    {i.title} × {i.quantity}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs theme-muted">
              {new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
