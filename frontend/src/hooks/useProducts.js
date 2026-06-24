import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export function useProducts(params = {}) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [meta,     setMeta]     = useState({ total: 0, page: 1, pageSize: 20 });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
      ).toString();
      const data = await api.get(`/products${qs ? `?${qs}` : ''}`);
      setProducts(data.products ?? []);
      setMeta(data.meta ?? meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]); // eslint-disable-line

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return { products, loading, error, meta, refetch: fetchProducts };
}

export function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/products/${id}`)
      .then((d) => setProduct(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { product, loading, error };
}
