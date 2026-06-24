import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';
import useCartStore from '@/stores/cartStore';
import useThemeStore from '@/stores/themeStore';

export default function Navbar() {
  const { user, profile, logout } = useAuthStore();
  const cartCount  = useCartStore((s) => s.count);
  const { theme, cycle } = useThemeStore();
  const navigate = useNavigate();

  const themeIcon = theme === 'light' ? '☀️' : theme === 'neon' ? '⚡' : '🌙';

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="theme-panel sticky top-0 z-50 border-b">
      <nav className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link to="/" className="font-semibold text-brand-pink text-lg tracking-tight shrink-0">
          Rashmi Shree
        </Link>

        <div className="flex-1" />

        <NavLink to="/products" className="text-sm theme-muted hover:text-white transition-colors hidden sm:block">
          Shop
        </NavLink>

        {/* Theme toggle */}
        <button
          onClick={cycle}
          className="text-lg leading-none p-1"
          title={`Theme: ${theme}`}
        >
          {themeIcon}
        </button>

        {/* Cart */}
        {user && (
          <Link to="/cart" className="relative p-1">
            <span className="text-xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-pink text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
        )}

        {/* Auth */}
        {user ? (
          <div className="flex items-center gap-3">
            {profile?.role === 'seller' && (
              <Link to="/seller" className="text-sm theme-muted hover:text-white transition-colors hidden sm:block">
                Seller Hub
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-sm theme-muted hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="text-sm bg-brand-pink hover:bg-brand-pink-strong text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
