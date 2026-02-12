import React, { useState, useEffect, Suspense, lazy } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import AuthForm from './components/AuthForm';
import TopNav from './components/TopNav';
import InventoryPage from './pages/InventoryPage';
import OrdersPage from './pages/OrdersPage';

// Lazy load components
const Settings = lazy(() => import('./components/Settings'));
import { validateThirdPartyLibraries } from './utils/validateLibraries'; 

const LoadingComponent = () => (
  <div className="flex items-center justify-center p-10">
    <p className="text-gray-500">⏳ Loading...</p>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('inventory');

  const menuItems = [
    { key: 'inventory', label: 'Inventory' },
    { key: 'orders', label: 'Orders' },
    { key: 'settings', label: 'Settings' }
  ];

  const handleViewChange = (view) => {
    console.log("🔀 App.jsx: Changing view from", currentView, "to", view);
    setCurrentView(view);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    validateThirdPartyLibraries();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log("📺 Rendered view:", currentView);
  }, [currentView]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      <TopNav
        currentView={currentView}
        onChangeView={handleViewChange}
        onLogout={() => signOut(auth)}
        menuItems={menuItems}
      />

      {/* VIEW SWITCHER */}
      <div className="max-w-4xl mx-auto p-4">
        {currentView === 'inventory' && (
          <InventoryPage />
        )}
        {currentView === 'orders' && (
          <OrdersPage />
        )}
        {currentView === 'settings' && (
          <Suspense fallback={<LoadingComponent />}>
            <Settings goBack={() => handleViewChange('inventory')} />
          </Suspense>
        )}
      </div>

    </div>
  );
}

export default App;