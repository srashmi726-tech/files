import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/product/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const CATEGORIES = [
  { label: 'Sarees',     value: 'saree',     emoji: '🥻' },
  { label: 'Lehengas',   value: 'lehenga',   emoji: '👘' },
  { label: 'Kurtis',     value: 'kurti',     emoji: '👗' },
  { label: 'Dupattas',   value: 'dupatta',   emoji: '🧣' },
  { label: 'Jewellery',  value: 'jewellery', emoji: '💍' },
  { label: 'Fusion',     value: 'fusion',    emoji: '✨' },
];

export default function Home() {
  const { products, loading, error } = useProducts({ pageSize: 8, sort: 'newest' });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Wear the <span className="text-brand-pink">soul</span> of India
          </h1>
          <p className="mt-4 text-lg theme-muted max-w-lg mx-auto">
            Curated ethnic and fusion fashion from artisans and designers across India.
          </p>
          <Link
            to="/products"
            className="inline-block mt-8 bg-brand-pink hover:bg-brand-pink-strong text-white px-8 py-3 rounded-xl font-medium transition-colors"
          >
            Browse collection
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-lg font-semibold mb-4">Shop by category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              to={`/products?category=${cat.value}`}
              className="theme-card rounded-xl p-4 flex flex-col items-center gap-2 hover:border-brand-pink/40 transition-colors text-sm"
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="theme-muted text-xs">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">New arrivals</h2>
          <Link to="/products" className="text-sm text-brand-pink hover:underline">
            View all →
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        )}

        {error && (
          <p className="text-center text-red-400 py-8">{error}</p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-center theme-muted py-8">No products yet. Check back soon!</p>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
