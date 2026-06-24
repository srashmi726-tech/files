import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { showToast } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  function load() {
    setLoading(true);
    api.get('/seller/products')
      .then((d) => setProducts(d.products ?? []))
      .catch((e) => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/seller/products/${id}`);
      showToast('Product deleted');
      load();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link
          to="/seller/products/new"
          className="bg-brand-pink hover:bg-brand-pink-strong text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add product
        </Link>
      </div>

      {loading && <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>}

      {!loading && products.length === 0 && (
        <p className="text-center theme-muted py-16">No products yet. Add your first one!</p>
      )}

      {!loading && products.length > 0 && (
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <div key={p.id} className="theme-card rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-800 flex-none">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">👗</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.title}</p>
                <p className="text-xs theme-muted mt-0.5 capitalize">{p.category ?? '—'}</p>
              </div>

              <p className="text-brand-pink font-semibold text-sm">
                ₹{Number(p.price).toLocaleString('en-IN')}
              </p>

              <div className="flex gap-2">
                <Link
                  to={`/seller/products/${p.id}/edit`}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
