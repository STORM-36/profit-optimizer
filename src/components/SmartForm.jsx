import React, { useState } from 'react';
import { db, auth } from '../firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SmartForm = () => {
  const [inputText, setInputText] = useState('');
  
  // STATE MANAGEMENT
  const [manualData, setManualData] = useState({
    name: '',
    phone: '',
    address: '',
    sellingPrice: '', 
    productCost: '',
    deliveryCost: 120, 
    adCost: 100       // Default Ad Cost
  });

  // 1. PARSER
  const parseOrder = () => {
    const phoneMatch = inputText.match(/(01\d{9})/);
    const nameMatch = inputText.match(/Name[:\s-]*([A-Za-z\s]+)/i); 
    
    let addressClean = inputText;
    if (phoneMatch) addressClean = addressClean.replace(phoneMatch[0], '');
    if (nameMatch) addressClean = addressClean.replace(nameMatch[0], '');

    setManualData(prev => ({
      ...prev,
      phone: phoneMatch ? phoneMatch[0] : prev.phone,
      name: nameMatch ? nameMatch[1].trim() : prev.name,
      address: addressClean.substring(0, 80).trim() 
    }));
  };

  // 2. SAVER
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
        adCost: ads, // <--- SAVES THE LOCKED COST
        timestamp: serverTimestamp()
      });

      // 3. AUTO-RESET
      setInputText(''); 
      setManualData({
        name: '',
        phone: '',
        address: '',
        sellingPrice: '', 
        productCost: '',
        deliveryCost: 120,
        adCost: 100       
      });

      alert("✅ Order Saved!");

    } catch (error) {
      console.error("Error saving:", error);
      alert("❌ Error saving order");
    }
  };

  const loadExample = () => {
    setInputText("Example Order: Rahim 01711000000. House 10, Road 5, Dhaka.");
    setManualData({
      name: 'Rahim',
      phone: '01711000000',
      address: 'House 10, Road 5, Dhaka',
      sellingPrice: '1500',
      productCost: '800',
      deliveryCost: 60,
      adCost: 120
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-w-2xl mx-auto mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">📝 New Order</h2>
        <button onClick={loadExample} className="text-xs text-blue-500 hover:underline">🎲 Load Example</button>
      </div>

      <textarea 
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm mb-3"
        rows="3"
        placeholder="Paste text here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onBlur={parseOrder} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          type="text" placeholder="Name" 
          value={manualData.name}
          onChange={(e) => setManualData({...manualData, name: e.target.value})}
          className="p-2 border rounded"
        />
        <input 
          type="text" placeholder="Phone" 
          value={manualData.phone}
          onChange={(e) => setManualData({...manualData, phone: e.target.value})}
          className="p-2 border rounded"
        />
      </div>

      <input 
        type="text" placeholder="Address" 
        value={manualData.address}
        onChange={(e) => setManualData({...manualData, address: e.target.value})}
        className="w-full p-2 border rounded mt-3"
      />

      {/* 🟢 THIS IS THE NEW SECTION */}
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
            
            {/* 🟢 THE MISSING AD COST BOX */}
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