import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase'; 
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); 
  
  // 🟢 NEW STRATEGY: STABLE CPR INPUT
  // We don't ask for "Total Spend". We ask "What is your CPR running at?"
  const [avgCPR, setAvgCPR] = useState(150); // Default guess 150

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "orders"), 
      where("userId", "==", user.uid), 
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Updated Profit Calculator (Uses the FIXED CPR)
  const getDynamicProfit = (order) => {
    const packaging = 15; 
    const unitAdCost = avgCPR; // NO DIVISION. Just use the number the user gave.
    
    // Safety check: ensure values exist
    const pCost = order.productCost || 0;
    const dCost = order.deliveryCost || 0;
    const sPrice = order.sellingPrice || 0;

    const totalSpent = pCost + dCost + unitAdCost + packaging;
    const trueProfit = sPrice - totalSpent;
    
    return { trueProfit, totalSpent, unitAdCost };
  };

  if (loading) return <div className="text-center p-10 text-gray-500">⏳ Loading Data...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mt-10 w-full relative">
      
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 border-b pb-4 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">📊 Daily Dashboard</h2>
           <p className="text-xs text-gray-400">Profit adjusted by your Campaign CPR.</p>
        </div>

        {/* 🟢 THE STABILIZER BOX */}
        <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 flex items-center gap-3">
          <div className="text-right">
            <label className="block text-xs font-bold text-purple-800 uppercase">Average FB CPR</label>
            <input 
              type="number" 
              value={avgCPR}
              onChange={(e) => setAvgCPR(parseFloat(e.target.value) || 0)}
              className="w-24 p-1 bg-white border border-purple-300 rounded text-right font-bold text-purple-900 outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="0"
            />
          </div>
          <div className="text-xs text-purple-600 font-medium">
             Tk / Order<br/> (From Ads Manager)
          </div>
        </div>
      </div>
      
      {/* THE TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4 text-center">Real Profit</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {orders.map((order) => {
               const { trueProfit } = getDynamicProfit(order);
               return (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                  <td className="py-3 px-4 whitespace-nowrap">
                    {order.timestamp?.toDate().toLocaleDateString('en-GB') || "N/A"}
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {order.name}<br/>
                    <span className="text-xs text-gray-400">{order.phone}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-bold ${trueProfit > 0 ? "text-green-600" : "text-red-600"}`}>
                        {trueProfit.toFixed(0)} Tk
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button 
                      onClick={() => setSelectedOrder(order)} 
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-bold hover:bg-blue-200"
                    >
                      Analyze
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- THE POPUP MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-bounce-in">
            <div className="bg-slate-800 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">💰 Profit Autopsy</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">Order for {selectedOrder.name}</p>
                <h2 className={`text-4xl font-bold ${getDynamicProfit(selectedOrder).trueProfit > 0 ? "text-green-600" : "text-red-500"}`}>
                  {getDynamicProfit(selectedOrder).trueProfit.toFixed(0)} Tk
                </h2>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">True Net Profit</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-600">Selling Price</span>
                  <span className="font-bold">{selectedOrder.sellingPrice || 0} Tk</span>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-red-500">
                    <span>📦 Product Cost</span>
                    <span>- {selectedOrder.productCost}</span>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <span>🚚 Delivery</span>
                    <span>- {selectedOrder.deliveryCost}</span>
                  </div>
                  {/* STABLE CPR DISPLAY */}
                  <div className="flex justify-between text-purple-600 font-bold bg-purple-100 p-1 rounded">
                    <span>📢 Ad Spend (Avg CPR)</span>
                    <span>- {getDynamicProfit(selectedOrder).unitAdCost.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-orange-500 font-medium">
                    <span>🏷️ Packaging (Hidden)</span>
                    <span>- 15</span>
                  </div>
                </div>

                <div className="flex justify-between pt-2 font-bold text-gray-800">
                  <span>Total Deductions</span>
                  <span>- {getDynamicProfit(selectedOrder).totalSpent.toFixed(0)} Tk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;