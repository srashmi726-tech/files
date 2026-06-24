import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const THEMES = ['dark', 'light', 'neon'];

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
};

const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'dark',

      setTheme(theme) {
        if (!THEMES.includes(theme)) return;
        applyTheme(theme);
        set({ theme });
      },

      cycle() {
        set((s) => {
          const next = THEMES[(THEMES.indexOf(s.theme) + 1) % THEMES.length];
          applyTheme(next);
          return { theme: next };
        });
      },

      init() {
        const saved = JSON.parse(localStorage.getItem('rs-theme') ?? '{}').state?.theme ?? 'dark';
        applyTheme(saved);
      },
    }),
    { name: 'rs-theme' }
  )
);

export default useThemeStore;
