import useAuthStore from '@/stores/authStore';
import useThemeStore from '@/stores/themeStore';
import { useNavigate } from 'react-router-dom';

const THEMES = ['dark', 'light', 'neon'];

export default function Profile() {
  const { user, profile, logout } = useAuthStore();
  const { theme, setTheme }       = useThemeStore();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">Profile</h1>

      <div className="theme-card rounded-xl p-6 flex flex-col gap-6">
        {/* Avatar + info */}
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="w-14 h-14 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-brand-pink/20 flex items-center justify-center text-2xl">
              {user?.displayName?.[0] ?? '?'}
            </div>
          )}
          <div>
            <p className="font-medium">{user?.displayName ?? user?.phoneNumber ?? '—'}</p>
            <p className="text-sm theme-muted">{user?.email ?? user?.phoneNumber}</p>
            <span className="mt-1 inline-block text-xs bg-brand-pink/20 text-brand-pink px-2 py-0.5 rounded-full capitalize">
              {profile?.role ?? 'buyer'}
            </span>
          </div>
        </div>

        {/* Theme */}
        <div>
          <p className="text-sm font-medium mb-3">Theme</p>
          <div className="flex gap-2">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                  theme === t ? 'bg-brand-pink/20 text-brand-pink border border-brand-pink/40' : 'theme-card'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
