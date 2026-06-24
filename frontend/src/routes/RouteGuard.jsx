import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Wraps a set of <Route> elements.
 * - While Firebase resolves the session: show a full-screen spinner
 * - If not logged in: redirect to /login (preserving intended URL)
 * - If wrong role: redirect to the correct home for that role
 */
export default function RouteGuard({ role = null }) {
  const location = useLocation();
  const { user, profile, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && profile?.role !== role) {
    const home = profile?.role === 'seller' ? '/seller' : '/';
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}
