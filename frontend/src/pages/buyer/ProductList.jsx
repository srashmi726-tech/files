import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/product/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const CATEGORIES = ['saree', 'lehenga', 'kurti', 'dupatta', 'jewellery', 'fusion'];
const SORT_OPTIONS = [
  { value: 'newest',       label: 'Newest' },
  { value: 'price_asc',   label: 'Price: Low to High' },
  { value: 'price_desc',  label: 'Price: High to Low' },
];

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);

  const category = searchParams.get('category') ?? '';
  const sort     = searchParams.get('sort') ?? 'newest';
  const q        = searchParams.get('q') ?? '';
  const [search, setSearch] = useState(q);

  const { products, loading, error, meta } = useProducts({ category, sort, q, page, pageSize: 20 });

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setPage(1);
    setSearchParams(next);
  }

  function handleSearch(e) {
    e.preventDefault();
    updateParam('q', search);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">
        {category ? category.charAt(0).toUpperCase() + category.slice(1) + 's' : 'All products'}
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8 items-center">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-pink w-44"
          />
          <button type="submit" className="text-sm bg-brand-pink/20 hover:bg-brand-pink/30 text-brand-pink px-3 py-1.5 rounded-lg transition-colors">
            Go
          </button>
        </form>

        {/* Category chips */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => updateParam('category', '')}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!category ? 'border-brand-pink text-brand-pink' : 'border-white/10 theme-muted'}`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => updateParam('category', c)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${category === c ? 'border-brand-pink text-brand-pink' : 'border-white/10 theme-muted'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="ml-auto bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {loading && <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}
      {error   && <p className="text-center text-red-400 py-8">{error}</p>}

      {!loading && products.length === 0 && (
        <p className="text-center theme-muted py-16">No products found. Try a different filter.</p>
      )}

      {!loading && products.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {/* Pagination */}
          {meta.total > meta.pageSize && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-lg theme-card text-sm disabled:opacity-40 hover:bg-white/5 transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm theme-muted">
                Page {page} of {Math.ceil(meta.total / meta.pageSize)}
              </span>
              <button
                disabled={page >= Math.ceil(meta.total / meta.pageSize)}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg theme-card text-sm disabled:opacity-40 hover:bg-white/5 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
