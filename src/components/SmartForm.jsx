import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as XLSX from 'xlsx'; // Import Excel Tool

import { parseText } from '../utils/parser';
import { SAMPLE_DATA } from '../utils/sampleData';

// 🛡️ INPUT SANITIZATION - Prevents XSS and injection attacks
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potential XSS characters and trim whitespace
  return input
    .trim()
    .replace(/[<>"'`]/g, '') // Remove HTML/script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .substring(0, 500); // Limit length to prevent huge data
};

const sanitizeNumber = (input) => {
  const num = parseFloat(input);
  if (isNaN(num) || num < 0) return 0;
  if (num > 1000000) return 1000000; // Cap at 1 million
  return num;
}; 

const SmartForm = () => {
  const [inputText, setInputText] = useState('');
  
  const [manualData, setManualData] = useState({
    name: '',
    phone: '',
    address: '',
    sellingPrice: '', 
    productCost: '',
    deliveryCost: 120, // Default to outside Dhaka initially
    adCost: ''         // FIXED: Now starts blank
  });

// ⚡ SMART DETECTION LOGIC
  useEffect(() => {
    if (!inputText) return; 

    const result = parseText(inputText);
    
    // LIST OF AREAS INSIDE DHAKA (English + Bangla)
    // If any of these words appear, we charge 60 Tk.
    const dhakaAreas = [
      'dhaka', 'ঢাকা',
      'mirpur', 'মিরপুর',
      'uttara', 'উত্তরা',
      'savar', 'সাভার',
      'dhanmondi', 'ধানমন্ডি',
      'gulshan', 'গুলশান',
      'banani', 'বনানী',
      'mohammadpur', 'মোহাম্মদপুর',
      'farmgate', 'ফার্মগেট',
      'motijheel', 'মতিঝিল',
      'badda', 'বাড্ডা',
      'jatrabari', 'যাত্রাবাড়ী',
      'khilgaon', 'খিলগাঁও',
      'rampura', 'রামপুরা',
      'bashundhara', 'বসুন্ধরা',
      'cantonment', 'ক্যান্টনমেন্ট',
      'keraniganj', 'কেরানীগঞ্জ',
      'new market', 'নিউ মার্কেট'
    ];

    let autoDelivery = 120; // Default: Outside Dhaka (120)
    
    if (result.address) {
      const lowerAddress = result.address.toLowerCase();
      
      // Check if ANY keyword from our list is inside the address
      const isInsideDhaka = dhakaAreas.some(area => lowerAddress.includes(area));
      
      if (isInsideDhaka) {
        autoDelivery = 60; // Found a match! Set to 60.
      }
    }

    setManualData(prev => ({
      ...prev,
      phone: result.phone || prev.phone,
      name: result.name || prev.name,
      address: result.address || prev.address,
      deliveryCost: autoDelivery 
    }));

  }, [inputText]);

  // 💾 SAVE ORDER
  const handleSave = async () => {
    if (!auth.currentUser) {
      alert("⚠️ Please Login First!");
      return;
    }
    const selling = parseFloat(manualData.sellingPrice);
    const product = parseFloat(manualData.productCost);
    const delivery = parseFloat(manualData.deliveryCost);
    const ads = parseFloat(manualData.adCost);

    if (!selling || selling <= 0) {
      alert("⚠️ Stop! You must enter a Selling Price.");
      return;
    }

    // Calculate Profit for this single order
    const totalCost = (product || 0) + (delivery || 0) + (ads || 0);
    const netProfit = selling - totalCost;

    try {
      // 🛡️ SANITIZE ALL INPUTS BEFORE SAVING
      await addDoc(collection(db, "orders"), {
        userId: auth.currentUser.uid,
        originalText: sanitizeInput(inputText),
        name: sanitizeInput(manualData.name),
        phone: sanitizeInput(manualData.phone),
        address: sanitizeInput(manualData.address),
        sellingPrice: sanitizeNumber(selling),
        productCost: sanitizeNumber(product || 0),
        deliveryCost: sanitizeNumber(delivery || 0),
        adCost: sanitizeNumber(ads || 0),
        netProfit: netProfit,
        timestamp: serverTimestamp()
      });

      // Reset Form
      setInputText(''); 
      setManualData({
        name: '', phone: '', address: '',
        sellingPrice: '', productCost: '',
        deliveryCost: 120, adCost: '' 
      });
      alert("✅ Order Saved!");
    } catch (error) {
      console.error("Error saving:", error);
      alert("❌ Error saving order");
    }
  };

  const loadExample = () => {
    if (SAMPLE_DATA && SAMPLE_DATA.length > 0) {
      const random = SAMPLE_DATA[Math.floor(Math.random() * SAMPLE_DATA.length)];
      setInputText(random.text);
      setManualData(prev => ({
        ...prev,
        sellingPrice: random.sell,
        productCost: random.cost
      }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-w-2xl mx-auto mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">📝 New Order</h2>
        <button onClick={loadExample} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
          🎲 Load Sample Data
        </button>
      </div>

      <textarea 
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm mb-3"
        rows="4"
        placeholder="Paste customer text here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          type="text" placeholder="Name" 
          value={manualData.name}
          onChange={(e) => setManualData({...manualData, name: e.target.value})}
          className="p-2 border rounded font-bold text-gray-700"
        />
        <input 
          type="text" placeholder="Phone" 
          value={manualData.phone}
          onChange={(e) => setManualData({...manualData, phone: e.target.value})}
          className="p-2 border rounded font-bold text-gray-700"
        />
      </div>

      <input 
        type="text" placeholder="Address" 
        value={manualData.address}
        onChange={(e) => setManualData({...manualData, address: e.target.value})}
        className="w-full p-2 border rounded mt-3 text-sm text-gray-600"
      />

      {/* UNIT ECONOMICS */}
      <div className="bg-blue-50 p-4 rounded-xl mt-4 border border-blue-100">
        <h3 className="text-xs font-bold text-blue-800 uppercase mb-2">💰 Unit Economics</h3>
        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block text-xs text-gray-500">Selling Price</label>
                <input 
                    type="number" 
                    value={manualData.sellingPrice}
                    onChange={(e) => setManualData({...manualData, sellingPrice: e.target.value})}
                    className="w-full p-2 border border-green-400 rounded font-bold text-green-700 bg-white"
                />
            </div>
            <div>
                <label className="block text-xs text-gray-500">Product Cost</label>
                <input 
                    type="number" 
                    value={manualData.productCost}
                    onChange={(e) => setManualData({...manualData, productCost: e.target.value})}
                    className="w-full p-2 border border-red-200 rounded text-red-600 bg-white"
                />
            </div>
            <div>
                <label className="block text-xs text-gray-500">Delivery (Auto)</label>
                <input 
                    type="number" 
                    value={manualData.deliveryCost}
                    onChange={(e) => setManualData({...manualData, deliveryCost: e.target.value})}
                    className="w-full p-2 border border-red-200 rounded text-red-600 bg-white"
                />
            </div>
            <div>
                <label className="block text-xs text-blue-600 font-bold">Ad Cost (CPR)</label>
                <input 
                    type="number" 
                    placeholder="e.g. 50"
                    value={manualData.adCost}
                    onChange={(e) => setManualData({...manualData, adCost: e.target.value})}
                    className="w-full p-2 border border-blue-300 rounded text-blue-700 font-bold bg-white shadow-sm"
                />
            </div>
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="w-full mt-4 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all"
      >
        💾 Save Order
      </button>
    </div>
  );
};

export default SmartForm; 