import { useState, useEffect } from 'react';
import useWishlistStore from '@/stores/wishlistStore';
import { api } from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Wishlist() {
  const productIds = useWishlistStore((s) => s.productIds);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!productIds.length) { setProducts([]); return; }
    setLoading(true);
    api.post('/products/batch', { ids: productIds })
      .then((d) => setProducts(d.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [productIds.join(',')]); // eslint-disable-line

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">Wishlist</h1>

      {loading && <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>}

      {!loading && productIds.length === 0 && (
        <p className="text-center theme-muted py-16">Nothing saved yet. Heart a product to add it here.</p>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
