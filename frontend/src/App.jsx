import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import ToastContainer from './components/ui/Toast';
import useAuthStore from './stores/authStore';
import useThemeStore from './stores/themeStore';

export default function App() {
  const initAuth  = useAuthStore((s) => s.init);
  const initTheme = useThemeStore((s) => s.init);

  useEffect(() => {
    initTheme();
    const unsub = initAuth();
    return unsub;
  }, []); // eslint-disable-line

  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <AppRoutes />
      <ToastContainer />
    </BrowserRouter>
  );
}
