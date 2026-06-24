import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { showToast } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS = {
  pending:   'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  shipped:   'bg-purple-500/20 text-purple-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export default function SellerOrders() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    api.get('/seller/orders')
      .then((d) => setOrders(d.orders ?? []))
      .catch((e) => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(orderId, status) {
    setUpdating(orderId);
    try {
      await api.patch(`/seller/orders/${orderId}`, { status });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
      showToast('Status updated');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <div className="flex justify-center py-32"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-8">Orders</h1>

      {orders.length === 0 && (
        <p className="text-center theme-muted py-16">No orders yet.</p>
      )}

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div key={order.id} className="theme-card rounded-xl p-5">
            <div className="flex flex-wrap items-start gap-4 justify-between mb-3">
              <div>
                <p className="font-mono text-xs theme-muted">{order.id}</p>
                <p className="font-semibold text-brand-pink mt-1">
                  ₹{Number(order.total).toLocaleString('en-IN')}
                </p>
                <p className="text-xs theme-muted mt-0.5">
                  {order.buyer_email ?? '—'} ·{' '}
                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <select
                value={order.status}
                disabled={updating === order.id}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 capitalize focus:outline-none ${STATUS_COLORS[order.status] ?? ''}`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
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
          </div>
        ))}
      </div>
    </div>
  );
}
