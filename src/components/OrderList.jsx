import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase'; 
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import * as XLSX from 'xlsx';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); 
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

  // 🟢 STABLE PROFIT CALCULATION (Uses saved data only)
  const getStableProfit = (order) => {
    const selling = parseFloat(order.sellingPrice) || 0;
    const cost = parseFloat(order.productCost) || 0;
    const delivery = parseFloat(order.deliveryCost) || 0;
    const ads = parseFloat(order.adCost) || 0; // Uses the LOCKED value
    const packaging = 15; 

    const totalSpent = cost + delivery + ads + packaging;
    const trueProfit = selling - totalSpent;
    
    return { trueProfit, totalSpent, ads };
  };

  const handleExport = () => {
    const excelData = orders.map(order => {
      const { trueProfit } = getStableProfit(order);
      return {
        Date: order.timestamp?.toDate().toLocaleDateString('en-GB') || "N/A",
        Customer: order.name,
        Phone: order.phone,
        "Selling Price": order.sellingPrice || 0,
        "Product Cost": order.productCost || 0,
        "Delivery Cost": order.deliveryCost || 0,
        "Ad Cost": order.adCost || 0,
        "Net Profit": trueProfit.toFixed(2)
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Profit Report");
    XLSX.writeFile(workbook, "Profit_Optimizer_Report.xlsx");
  };

  if (loading) return <div className="text-center p-10 text-gray-500">⏳ Loading Data...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mt-10 w-full relative">
      
      <div className="flex justify-between items-end mb-6 border-b pb-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">📊 Profit Dashboard</h2>
           <p className="text-xs text-gray-400">Real-time calculations based on saved data.</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 shadow-md flex items-center gap-2 transition"
        >
          <span>📄</span> Export Excel
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4 text-center">Ad Cost</th>
              <th className="py-3 px-4 text-center">Net Profit</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {orders.map((order) => {
               const { trueProfit, ads } = getStableProfit(order);
               return (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                  <td className="py-3 px-4 whitespace-nowrap">
                    {order.timestamp?.toDate().toLocaleDateString('en-GB') || "N/A"}
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {order.name}<br/>
                    <span className="text-xs text-gray-400">{order.phone}</span>
                  </td>
                  <td className="py-3 px-4 text-center text-blue-500">
                    {ads} Tk
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

      {/* POPUP MODAL */}
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
                <h2 className={`text-4xl font-bold ${getStableProfit(selectedOrder).trueProfit > 0 ? "text-green-600" : "text-red-500"}`}>
                  {getStableProfit(selectedOrder).trueProfit.toFixed(0)} Tk
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
                  <div className="flex justify-between text-blue-600 font-bold bg-blue-100 p-1 rounded">
                    <span>📢 Ad Spend (Locked)</span>
                    <span>- {getStableProfit(selectedOrder).ads.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-orange-500 font-medium">
                    <span>🏷️ Packaging</span>
                    <span>- 15</span>
                  </div>
                </div>
                <div className="flex justify-between pt-2 font-bold text-gray-800">
                  <span>Total Deductions</span>
                  <span>- {getStableProfit(selectedOrder).totalSpent.toFixed(0)} Tk</span>
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