/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#f472b6',
          'pink-strong': '#db2777',
          sky: '#38bdf8',
          'sky-strong': '#0284c7',
        },
        surface: {
          950: '#020617',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'app-dark': 'linear-gradient(135deg, #020617 0%, #111827 35%, #172554 100%)',
        'app-light': 'linear-gradient(135deg, #fffaf5 0%, #eff6ff 48%, #fdf2f8 100%)',
        'app-neon': 'linear-gradient(135deg, #020617 0%, #111827 20%, #4c1d95 60%, #115e59 100%)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        shimmer: 'shimmer 1.5s infinite linear',
      },
    },
  },
  plugins: [],
};
