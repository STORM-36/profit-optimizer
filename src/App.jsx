import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import AuthForm from './components/AuthForm';
import SmartForm from './components/SmartForm';
import OrderList from './components/OrderList';
import Settings from './components/Settings'; // Import the new page

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'settings'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600 tracking-tighter">
            🚀 Profit Optimizer
          </h1>
          
          <div className="flex gap-3">
             {/* TOGGLE BUTTONS */}
            {currentView === 'dashboard' ? (
              <button 
                onClick={() => setCurrentView('settings')}
                className="text-gray-500 hover:text-blue-600 font-medium text-sm"
              >
                ⚙️ Settings
              </button>
            ) : (
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="text-gray-500 hover:text-blue-600 font-medium text-sm"
              >
                🏠 Dashboard
              </button>
            )}

            <button 
              onClick={() => signOut(auth)}
              className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm font-bold hover:bg-red-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* VIEW SWITCHER */}
      <div className="max-w-4xl mx-auto p-4">
        {currentView === 'dashboard' ? (
          <>
            <SmartForm />
            <OrderList />
          </>
        ) : (
          <Settings goBack={() => setCurrentView('dashboard')} />
        )}
      </div>

    </div>
  );
}

export default App;