import { Link } from 'react-router-dom';
import useCartStore from '@/stores/cartStore';
import useWishlistStore from '@/stores/wishlistStore';
import { showToast } from '@/components/ui/Toast';

export default function ProductCard({ product }) {
  const addItem  = useCartStore((s) => s.addItem);
  const toggle   = useWishlistStore((s) => s.toggle);
  const isWished = useWishlistStore((s) => s.has(product.id));

  function handleAddToCart(e) {
    e.preventDefault();
    addItem(product);
    showToast(`${product.title} added to cart`);
  }

  function handleWishlist(e) {
    e.preventDefault();
    toggle(product.id);
    showToast(isWished ? 'Removed from wishlist' : 'Saved to wishlist');
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className="theme-card rounded-xl overflow-hidden flex flex-col group hover:shadow-2xl transition-shadow"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-800">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">👗</div>
        )}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-sm"
          aria-label={isWished ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          {isWished ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3 className="text-sm font-medium line-clamp-2 theme-muted group-hover:text-white transition-colors">
          {product.title}
        </h3>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-semibold text-brand-pink">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </span>
          <button
            onClick={handleAddToCart}
            className="text-xs bg-brand-pink hover:bg-brand-pink-strong text-white px-2 py-1 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </Link>
  );
}
