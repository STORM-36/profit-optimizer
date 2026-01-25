import React, { useState, useEffect } from 'react';
import { auth, provider, signInWithPopup, signOut } from './firebase'; 
import SmartForm from './components/SmartForm'; // 👈 NEW IMPORT NAME
import OrderList from './components/OrderList'; 

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4 md:mb-0 w-full md:w-auto">
             <div className="bg-blue-600 text-white p-2 rounded-lg text-xl">🚀</div>
             <h1 className="text-2xl font-bold text-gray-800">Profit Optimizer</h1>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            {user ? (
               <div className="text-right flex items-center gap-3">
                <div className="hidden md:block">
                  <p className="text-sm font-bold text-gray-700">{user.displayName}</p>
                  <p className="text-xs text-green-600 font-medium">● Online</p>
                </div>
                {user.photoURL && <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-md" />}
                <button 
                  onClick={() => signOut(auth)} 
                  className="text-xs text-red-600 font-bold border border-red-200 bg-red-50 px-3 py-1 rounded hover:bg-red-100 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition w-full md:w-auto"
              >
                Login with Google
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {user ? (
          <>
            {/* 🟢 USING THE NEW SMART FORM */}
            <SmartForm /> 
            <OrderList />
          </>
        ) : (
          <div className="text-center mt-20">
            <h2 className="text-2xl font-bold text-gray-400">Please Login to Manage Orders</h2>
            <p className="text-gray-300">Your data is secure.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;