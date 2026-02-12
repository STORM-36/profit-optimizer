import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true); // true = Login Mode, false = Signup Mode
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle the Form Submit (Login or Signup)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN LOGIC
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // SIGNUP LOGIC
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // If successful, App.jsx handles the redirect automatically
    } catch (err) {
      // Show error (e.g., "Password too weak" or "Email already in use")
      setError(err.message.replace("Firebase: ", ""));
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      // If popup is blocked, use redirect instead
      if (err.code === 'auth/popup-blocked') {
        console.log('Popup blocked, using redirect method...');
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-blue-100 animate-fade-in">
      {/* HEADER */}
      <div className="text-center mb-6">
        <h2 className={`text-3xl font-bold ${isLogin ? 'text-blue-600' : 'text-green-600'}`}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {isLogin ? 'Enter your details to access your dashboard' : 'Start optimizing your profit today'}
        </p>
      </div>
      
      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200">
          ⚠️ {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-bold">Email Address</label>
          <input 
            type="email" 
            placeholder="name@example.com" 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-bold">Password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full font-bold py-3 rounded-lg transition-all shadow-md text-white
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 
              (isLogin ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700')
            }`}
        >
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Free Account')}
        </button>
      </form>

      {/* GOOGLE LOGIN */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="w-full mt-4 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition-all flex justify-center items-center gap-2"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5"/>
          Google
        </button>
      </div>

      {/* TOGGLE SWITCH */}
      <div className="text-center mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <p className="text-sm text-gray-600">
          {isLogin ? "Don't have an account yet?" : "Already have an account?"}
        </p>
        <button 
          type="button" // This ensures it doesn't submit the form
          onClick={() => {
            setIsLogin(!isLogin);
            setError(''); // Clear errors when switching
          }} 
          className={`font-bold hover:underline mt-1 ${isLogin ? 'text-green-600' : 'text-blue-600'}`}
        >
          {isLogin ? 'Create an Account' : 'Login to Dashboard'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;