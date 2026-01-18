import React from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";

const Login = () => {
  
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
      // 👇 This will tell us the REAL reason (e.g., "Unauthorized Domain")
      alert(`Login Error: ${error.message}`);
    }
  };

  return (
    // "fixed inset-0" forces it to take the whole screen. "grid place-items-center" forces content to center.
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-blue-600 to-purple-800 grid place-items-center z-50">
      
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20 max-w-sm w-full text-center mx-4">
        
        <div className="mb-6 bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl shadow-lg">
          🚀
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">Profit Optimizer</h1>
        <p className="text-blue-100 mb-8 text-sm opacity-90">Secure Access for Business Owners</p>

        <button
          onClick={handleLogin}
          className="w-full bg-white text-gray-900 font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            className="w-6 h-6" 
          />
          Sign in with Google
        </button>

        <p className="mt-6 text-xs text-blue-200 opacity-60">
          Powered by Firebase Auth
        </p>
      </div>
    </div>
  );
};

export default Login;