import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';

const NAV = [
  { to: '/seller',          label: 'Dashboard', end: true },
  { to: '/seller/products', label: 'Products' },
  { to: '/seller/orders',   label: 'Orders' },
  { to: '/profile',         label: 'Profile' },
];

export default function SellerShell() {
  const { profile, logout } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 flex-none theme-panel border-r flex flex-col py-6 px-4 gap-2">
        <div className="mb-6 px-2">
          <span className="text-brand-pink font-semibold text-lg">Rashmi Shree</span>
          <p className="text-xs theme-muted mt-1 truncate">{profile?.email}</p>
        </div>

        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-brand-pink/20 text-brand-pink font-medium'
                  : 'theme-muted hover:bg-white/5'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}

        <div className="flex-1" />
        <button
          onClick={handleLogout}
          className="px-3 py-2 rounded-lg text-sm theme-muted hover:bg-white/5 text-left transition-colors"
        >
          Sign out
        </button>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
