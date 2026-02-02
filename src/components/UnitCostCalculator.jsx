import React, { useState } from 'react';

const UnitCostCalculator = ({ onApplyCost, onClose }) => {
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [additionalCosts, setAdditionalCosts] = useState('');
  const [quantity, setQuantity] = useState('');
  const [calculatedCost, setCalculatedCost] = useState(null);

  // 🧮 CALCULATE UNIT COST
  const handleCalculate = () => {
    const wholesale = parseFloat(wholesalePrice) || 0;
    const additional = parseFloat(additionalCosts) || 0;
    const qty = parseFloat(quantity) || 0;

    if (qty <= 0) {
      alert('⚠️ Quantity must be greater than 0');
      return;
    }

    const unitCost = (wholesale + additional) / qty;
    setCalculatedCost(unitCost);
  };

  // 💾 APPLY AND SEND TO PARENT
  const handleApply = () => {
    if (calculatedCost === null) {
      alert('⚠️ Please calculate the unit cost first');
      return;
    }
    onApplyCost(calculatedCost);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">🧮 Unit Cost Calculator</h2>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          
          {/* INPUT 1: WHOLESALE PRICE */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              💰 Total Wholesale Purchase Price
            </label>
            <input 
              type="number" 
              placeholder="e.g., 5000"
              value={wholesalePrice}
              onChange={(e) => setWholesalePrice(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Total cost of the entire batch</p>
          </div>

          {/* INPUT 2: ADDITIONAL COSTS */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              📦 Additional Batch Costs (Optional)
            </label>
            <input 
              type="number" 
              placeholder="e.g., 500 (Transport, Labor, Packaging)"
              value={additionalCosts}
              onChange={(e) => setAdditionalCosts(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Transport, Labor, Packaging costs for whole batch</p>
          </div>

          {/* INPUT 3: QUANTITY */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              📊 Total Quantity of Items
            </label>
            <input 
              type="number" 
              placeholder="e.g., 50"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">How many units in this batch?</p>
          </div>

          {/* FORMULA DISPLAY */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 font-semibold">
              📐 Formula: (Wholesale + Additional Costs) ÷ Quantity
            </p>
          </div>

          {/* CALCULATE BUTTON */}
          <button 
            onClick={handleCalculate}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all shadow-md"
          >
            🧮 Calculate Unit Cost
          </button>

          {/* RESULT DISPLAY */}
          {calculatedCost !== null && (
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300 text-center">
              <p className="text-sm text-green-700 font-semibold">Cost Per Unit</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {calculatedCost.toFixed(2)} ৳
              </p>
              <p className="text-xs text-green-600 mt-2">
                ({wholesalePrice} + {additionalCosts || 0}) ÷ {quantity} = {calculatedCost.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* FOOTER BUTTONS */}
        <div className="bg-gray-50 p-4 flex gap-3 border-t">
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleApply}
            disabled={calculatedCost === null}
            className={`flex-1 font-bold py-2 rounded-lg transition ${
              calculatedCost !== null 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            ✅ Apply Cost
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnitCostCalculator;
