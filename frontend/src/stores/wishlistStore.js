import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      productIds: [],   // Set of product IDs

      toggle(productId) {
        set((s) =>
          s.productIds.includes(productId)
            ? { productIds: s.productIds.filter((id) => id !== productId) }
            : { productIds: [...s.productIds, productId] }
        );
      },

      has(productId) {
        return get().productIds.includes(productId);
      },

      async fetchFromServer() {
        try {
          const data = await api.get('/wishlist');
          set({ productIds: data.productIds ?? [] });
        } catch {
          // silently fail
        }
      },

      async syncToServer() {
        const { productIds } = get();
        try {
          await api.post('/wishlist/sync', { productIds });
        } catch {
          // silently fail
        }
      },

      clear() {
        set({ productIds: [] });
      },
    }),
    { name: 'rs-wishlist' }
  )
);

export default useWishlistStore;
