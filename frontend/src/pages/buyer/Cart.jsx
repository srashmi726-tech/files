import { Link } from 'react-router-dom';
import useCartStore from '@/stores/cartStore';

export default function Cart() {
  const { items, updateQty, removeItem, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <span className="text-6xl">🛒</span>
        <p className="text-lg font-medium">Your cart is empty</p>
        <Link to="/products" className="text-sm text-brand-pink hover:underline">
          Browse products →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">Your cart</h1>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.productId} className="theme-card rounded-xl p-4 flex gap-4 items-center">
            <div className="w-16 h-20 rounded-lg overflow-hidden bg-slate-800 flex-none">
              {item.image ? (
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="text-brand-pink font-semibold mt-1">
                ₹{Number(item.price).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(item.productId, item.quantity - 1)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
              >
                −
              </button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <button
                onClick={() => updateQty(item.productId, item.quantity + 1)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
              >
                +
              </button>
            </div>

            <button
              onClick={() => removeItem(item.productId)}
              className="text-red-400 hover:text-red-300 text-sm ml-2"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 theme-card rounded-xl p-6 flex flex-col gap-4">
        <div className="flex justify-between text-sm theme-muted">
          <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
          <span>₹{Number(total).toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span className="text-brand-pink">₹{Number(total).toLocaleString('en-IN')}</span>
        </div>
        <Link
          to="/checkout"
          className="w-full bg-brand-pink hover:bg-brand-pink-strong text-white py-3 rounded-xl font-medium text-center transition-colors"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
