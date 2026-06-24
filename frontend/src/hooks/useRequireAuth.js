import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';

/**
 * Redirects to /login if not authenticated.
 * Optionally restrict to a specific role ('buyer' | 'seller' | 'admin').
 */
export function useRequireAuth(role = null) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, profile, loading } = useAuthStore();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login', { state: { from: location }, replace: true });
      return;
    }

    if (role && profile?.role !== role) {
      // Redirect to their correct home rather than a generic 403
      const home = profile?.role === 'seller' ? '/seller' : '/';
      navigate(home, { replace: true });
    }
  }, [user, profile, loading, role, navigate, location]);
}

export default useRequireAuth;
