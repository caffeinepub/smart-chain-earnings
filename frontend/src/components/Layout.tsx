import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useEffect } from 'react';
import BottomNavBar from './BottomNavBar';

const ADMIN_MOBILE = '9422018674';

export default function Layout() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = !!identity;
  const isAdmin = profile?.mobileNumber === ADMIN_MOBILE;
  const isSetupPage = location.pathname === '/setup';
  const isAdminPage = location.pathname === '/admin';

  useEffect(() => {
    if (isInitializing || profileLoading) return;

    if (!isAuthenticated) {
      navigate({ to: '/' });
      return;
    }

    if (isFetched && profile === null && !isSetupPage) {
      navigate({ to: '/setup' });
      return;
    }

    if (isFetched && profile !== null && isSetupPage) {
      if (isAdmin) {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/dashboard' });
      }
      return;
    }

    // Non-admin user trying to access /admin → redirect to dashboard
    if (isFetched && profile !== null && isAdminPage && !isAdmin) {
      navigate({ to: '/dashboard' });
      return;
    }
  }, [isAuthenticated, isInitializing, profileLoading, profile, isFetched, isSetupPage, isAdminPage, isAdmin, navigate]);

  if (isInitializing || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const showBottomNav = isAuthenticated && profile !== null && !isSetupPage && !isAdminPage;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className={`flex-1 ${showBottomNav ? 'pb-20' : ''}`}>
        <Outlet />
      </main>
      {showBottomNav && <BottomNavBar />}
    </div>
  );
}
