import React, { useState, useEffect } from 'react';
import { findPhone, detectLocation, findName } from './utils/parser';
import { sampleOrders } from './utils/sampleData';
import { db, auth } from './firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from "firebase/auth"; 
import OrderList from './components/OrderList';
import Login from './components/Login'; 

function App() {
  const [user, setUser] = useState(null); 
  const [loadingAuth, setLoadingAuth] = useState(true); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const [rawText, setRawText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "Unknown",
    deliveryCost: 0,
    sellingPrice: 0, 
    productCost: 0,
    adCost: 0
  });

  if (loadingAuth) return <div className="h-screen flex items-center justify-center text-xl text-gray-600">⏳ Authenticating...</div>;
  if (!user) return <Login />;

  const loadSample = () => {
    const randomOrder = sampleOrders[Math.floor(Math.random() * sampleOrders.length)];
    processText(randomOrder.text + " 01711000000");
  };

  const handleInputChange = (e) => processText(e.target.value);

  const processText = (text) => {
    setRawText(text);
    const locationData = detectLocation(text);
    setForm(prev => ({
      ...prev,
      name: findName(text),
      phone: findPhone(text),
      city: locationData.city,
      deliveryCost: locationData.charge
    }));
  };

  const handleCostChange = (e) => {
    const val = parseFloat(e.target.value) || 0;
    setForm(prev => ({ ...prev, [e.target.name]: val }));
  };

  const saveOrder = async () => {
    if (!form.phone) return alert("⚠️ No Phone Number found!");
    
    // 🔴 CRITICAL VALIDATION: Prevents the "Zero" Issue
    if (form.sellingPrice <= 0) return alert("⚠️ Stop! Enter the SELLING PRICE.");
    if (form.productCost <= 0) return alert("⚠️ Stop! Enter the PRODUCT COST.");

    try {
      setIsSaving(true);
      
      // We save the raw inputs. Profit is calculated dynamically in the dashboard.
      await addDoc(collection(db, "orders"), {
        ...form,
        originalText: rawText,
        timestamp: serverTimestamp(),
        userId: user.uid, 
        userEmail: user.email
      });

      alert("✅ Order Saved!");
      setRawText(""); 
      // Reset form but keep Selling/Product cost as they often repeat? No, safer to reset.
      setForm({ name: "", phone: "", city: "", deliveryCost: 0, sellingPrice: 0, productCost: 0, adCost: 0 });
    } catch (error) {
      console.error("Error saving:", error);
      alert("❌ Error saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER - UPDATED FOR MOBILE */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4 md:mb-0 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
               <div className="bg-blue-600 text-white p-2 rounded-lg text-xl">🚀</div>
               <h1 className="text-2xl font-bold text-gray-800">Profit Optimizer</h1>
            </div>
            {/* Mobile-only Logout (Optional, but let's keep it simple and just show the main one below) */}
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
             {/* REMOVED 'hidden md:block' -> Now visible on all screens */}
             <div className="text-right">
              <p className="text-sm font-bold text-gray-700">{user.displayName}</p>
              <button 
                onClick={() => signOut(auth)} 
                className="text-xs text-red-600 font-bold border border-red-200 bg-red-50 px-3 py-1 rounded hover:bg-red-100 transition"
              >
                Logout
              </button>
            </div>
            {user.photoURL && <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-md" />}
          </div>
        </div>

        {/* INPUT SECTION */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-700">1. Paste Order</h2>
              <button onClick={loadSample} className="text-blue-600 text-sm font-semibold hover:bg-blue-50 px-3 py-1 rounded-lg transition">
                🎲 Load Example
              </button>
            </div>
            <textarea
              className="w-full h-72 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none resize-none transition-all text-gray-700 text-sm leading-relaxed"
              placeholder="Paste Messenger chat here..."
              value={rawText}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-700">2. Verify & Calculate</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Customer Name</label>
                <input type="text" value={form.name} className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-800 font-medium" readOnly />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Phone</label>
                <input type="text" value={form.phone} className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-800 font-bold" readOnly />
              </div>
            </div>

            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 space-y-4">
              <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">💰 Unit Economics</h3>
              
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-700 font-bold">Selling Price (Required)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400">Tk</span>
                  <input name="sellingPrice" type="number" onChange={handleCostChange} className="w-32 pl-8 p-2 border border-blue-300 rounded-lg text-right focus:border-blue-500 outline-none font-bold text-gray-900" placeholder="0" />
                </div>
              </div>

              <div className="border-t border-blue-200 my-2"></div>

              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-600 font-medium">Product Cost (Required)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400">Tk</span>
                  <input name="productCost" type="number" onChange={handleCostChange} className="w-32 pl-8 p-2 border border-gray-300 rounded-lg text-right focus:border-blue-500 outline-none" placeholder="0" />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-600 font-medium">Delivery ({form.city})</label>
                 <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400">Tk</span>
                  <input value={form.deliveryCost} readOnly className="w-32 pl-8 p-2 border border-gray-200 bg-gray-100 rounded-lg text-right text-gray-500" />
                </div>
              </div>
              
              <div className="text-center text-xs text-gray-400 pt-2 italic">
                *Ad Spend is calculated in the Dashboard
              </div>
            </div>

            <button 
              onClick={saveOrder}
              disabled={isSaving || !form.phone}
              className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg shadow-blue-200 transition-all transform active:scale-95 ${
                isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              }`}
            >
              {isSaving ? "⏳ Saving..." : "💾 Save Order"}
            </button>
          </div>
        </div> 

        <OrderList />

      </div>
    </div>
  );
}

export default App;