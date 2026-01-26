import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// 👇 THESE IMPORTS MUST MATCH THE FILE NAMES EXACTLY
import { parseText } from '../utils/parser';
import { SAMPLE_DATA } from '../utils/sampleData';

const SmartForm = () => {
  const [inputText, setInputText] = useState('');
  
  const [manualData, setManualData] = useState({
    name: '',
    phone: '',
    address: '',
    sellingPrice: '', 
    productCost: '',
    deliveryCost: 120, 
    adCost: 100       
  });

  // ⚡ INSTANT PARSER
  useEffect(() => {
    // Safety Check: If parser is missing, do nothing
    if (!parseText) return; 

    const result = parseText(inputText);

    setManualData(prev => ({
      ...prev,
      phone: result.phone || prev.phone,
      name: result.name || prev.name,
      address: result.address || prev.address
    }));

  }, [inputText]);

  // 💾 SAVER
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

    try {
      await addDoc(collection(db, "orders"), {
        userId: auth.currentUser.uid,
        originalText: inputText,
        name: manualData.name,
        phone: manualData.phone,
        address: manualData.address,
        sellingPrice: selling,
        productCost: product,
        deliveryCost: delivery,
        adCost: ads,
        timestamp: serverTimestamp()
      });

      setInputText(''); 
      setManualData({
        name: '', phone: '', address: '',
        sellingPrice: '', productCost: '',
        deliveryCost: 120, adCost: 100       
      });
      alert("✅ Order Saved!");
    } catch (error) {
      console.error("Error saving:", error);
      alert("❌ Error saving order");
    }
  };

  // 🎲 LOAD RANDOM EXAMPLE
  const loadExample = () => {
    // Safety Check: Ensure data exists before trying to load it
    if (SAMPLE_DATA && SAMPLE_DATA.length > 0) {
      const random = SAMPLE_DATA[Math.floor(Math.random() * SAMPLE_DATA.length)];
      setInputText(random.text);
      setManualData(prev => ({
        ...prev,
        sellingPrice: random.sell,
        productCost: random.cost
      }));
    } else {
        console.error("Sample Data is missing or empty!");
        alert("⚠️ Could not load sample data. Check console.");
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
                <label className="block text-xs text-gray-500">Delivery</label>
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