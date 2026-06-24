import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { api } from '@/lib/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,       // Firebase user object
      profile: null,    // { id, email, role } from our DB
      loading: true,
      error: null,

      // Called once in App.jsx to wire up the Firebase listener
      init() {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              // Upsert user in our DB and fetch their role
              const profile = await api.post('/auth/sync', {
                uid:   firebaseUser.uid,
                email: firebaseUser.email,
                name:  firebaseUser.displayName,
                photo: firebaseUser.photoURL,
              });
              set({ user: firebaseUser, profile, loading: false, error: null });
            } catch (e) {
              set({ user: firebaseUser, profile: null, loading: false, error: e.message });
            }
          } else {
            set({ user: null, profile: null, loading: false, error: null });
          }
        });
        return unsub;
      },

      async loginWithGoogle() {
        set({ error: null });
        try {
          await signInWithPopup(auth, googleProvider);
          // onAuthStateChanged above handles the rest
        } catch (e) {
          set({ error: e.message });
        }
      },

      async logout() {
        await signOut(auth);
        set({ user: null, profile: null });
      },

      clearError() {
        set({ error: null });
      },

      get role() {
        return get().profile?.role ?? null;
      },

      get isBuyer() {
        return get().profile?.role === 'buyer';
      },

      get isSeller() {
        return get().profile?.role === 'seller';
      },

      get isAdmin() {
        return get().profile?.role === 'admin';
      },
    }),
    {
      name: 'rs-auth',
      partialize: (s) => ({ profile: s.profile }),
    }
  )
);

export default useAuthStore;
