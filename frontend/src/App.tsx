import { createRootRoute, createRoute, createRouter, RouterProvider, Outlet, redirect } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import DepositPage from './pages/DepositPage';
import WithdrawalPage from './pages/WithdrawalPage';
import TeamPage from './pages/TeamPage';
import AdminPanel from './pages/AdminPanel';
import ProfileSetup from './pages/ProfileSetup';
import Layout from './components/Layout';
import { Toaster } from '@/components/ui/sonner';

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster position="top-center" richColors />
    </>
  ),
});

// Public routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

// Protected layout route
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: Layout,
});

const profileSetupRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/setup',
  component: ProfileSetup,
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/dashboard',
  component: UserDashboard,
});

const depositRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/deposit',
  component: DepositPage,
});

const withdrawalRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/withdrawal',
  component: WithdrawalPage,
});

const teamRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/team',
  component: TeamPage,
});

const adminRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/admin',
  component: AdminPanel,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  layoutRoute.addChildren([
    profileSetupRoute,
    dashboardRoute,
    depositRoute,
    withdrawalRoute,
    teamRoute,
    adminRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
