import { useParams, Link } from 'react-router-dom';
import { useProduct } from '@/hooks/useProducts';
import useCartStore from '@/stores/cartStore';
import useWishlistStore from '@/stores/wishlistStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/Toast';

export default function ProductDetail() {
  const { id }       = useParams();
  const { product, loading, error } = useProduct(id);
  const addItem      = useCartStore((s) => s.addItem);
  const toggle       = useWishlistStore((s) => s.toggle);
  const isWished     = useWishlistStore((s) => s.has(id));

  if (loading) return <div className="flex justify-center py-32"><LoadingSpinner size="lg" /></div>;
  if (error)   return <p className="text-center text-red-400 py-16">{error}</p>;
  if (!product) return null;

  function handleAddToCart() {
    addItem(product);
    showToast(`${product.title} added to cart`);
  }

  function handleWishlist() {
    toggle(product.id);
    showToast(isWished ? 'Removed from wishlist' : 'Saved to wishlist');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link to="/products" className="text-sm theme-muted hover:text-white mb-6 inline-block">
        ← Back to products
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-800">
          {product.image_url ? (
            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">👗</div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6 py-2">
          <div>
            <p className="text-xs text-brand-pink uppercase tracking-widest mb-2">
              {product.category ?? 'Ethnic wear'}
            </p>
            <h1 className="text-2xl font-semibold">{product.title}</h1>
          </div>

          <p className="text-3xl font-bold text-brand-pink">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </p>

          {product.description && (
            <p className="theme-muted text-sm leading-relaxed">{product.description}</p>
          )}

          <div className="flex gap-3 mt-auto">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-brand-pink hover:bg-brand-pink-strong text-white py-3 rounded-xl font-medium transition-colors"
            >
              Add to cart
            </button>
            <button
              onClick={handleWishlist}
              className="w-12 h-12 rounded-xl theme-card flex items-center justify-center text-xl"
              aria-label="Wishlist"
            >
              {isWished ? '❤️' : '🤍'}
            </button>
          </div>

          {product.seller_name && (
            <p className="text-xs theme-muted">Sold by {product.seller_name}</p>
          )}
        </div>
      </div>
    </div>
  );
}
