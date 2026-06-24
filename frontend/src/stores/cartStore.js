import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],     // [{ productId, title, price, image, quantity }]
      syncing: false,

      // Local add — optimistic; call syncToServer() after auth
      addItem(product, qty = 1) {
        set((s) => {
          const existing = s.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }
          return {
            items: [
              ...s.items,
              {
                productId: product.id,
                title:     product.title,
                price:     product.price,
                image:     product.image_url,
                quantity:  qty,
              },
            ],
          };
        });
      },

      removeItem(productId) {
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) }));
      },

      updateQty(productId, quantity) {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clear() {
        set({ items: [] });
      },

      // Pull cart from server (call after login)
      async fetchFromServer() {
        try {
          const data = await api.get('/cart');
          set({ items: data.items ?? [] });
        } catch {
          // silently fail — local cart survives
        }
      },

      // Push local cart to server
      async syncToServer() {
        const { items } = get();
        set({ syncing: true });
        try {
          await api.post('/cart/sync', { items });
        } finally {
          set({ syncing: false });
        }
      },

      get total() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },

      get count() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },
    }),
    { name: 'rs-cart' }
  )
);

export default useCartStore;
