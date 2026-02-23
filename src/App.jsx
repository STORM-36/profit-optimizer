import React, { useEffect, Suspense, lazy } from 'react';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import TopNav from './components/TopNav';
import Unauthorized from './components/Unauthorized';
import InventoryPage from './pages/InventoryPage';
import OrdersPage from './pages/OrdersPage';
import TeamManagement from './pages/TeamManagement';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load components
const Settings = lazy(() => import('./components/Settings'));
import { validateThirdPartyLibraries } from './utils/validateLibraries'; 

const LoadingComponent = () => (
  <div className="flex items-center justify-center p-10">
    <p className="text-gray-500">⏳ Loading...</p>
  </div>
);

function App() {
  const { currentUser, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    validateThirdPartyLibraries();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/orders', label: 'Orders' },
    ...(userRole === 'owner' ? [{ to: '/team', label: 'Team Management' }] : []),
    ...(userRole === 'owner' ? [{ to: '/settings', label: 'Settings' }] : [])
  ];

  if (loading) {
    return <LoadingComponent />;
  }

  const AppShell = () => (
    <div className="min-h-screen bg-slate-50 pb-20">
      <TopNav
        onLogout={handleLogout}
        menuItems={menuItems}
      />
      <div className="max-w-4xl mx-auto p-4">
        <Outlet />
      </div>
    </div>
  );

  return (
    <Routes>
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/dashboard" replace /> : <AuthForm />}
      />

      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        element={
          <ProtectedRoute allowedRoles={['owner', 'operator']}>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<InventoryPage />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/team" element={<TeamManagement />} />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<LoadingComponent />}>
              <Settings goBack={() => navigate('/dashboard')} />
            </Suspense>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to={currentUser ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default App;