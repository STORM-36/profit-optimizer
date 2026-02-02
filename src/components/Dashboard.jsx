import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Receipt from './Receipt';

const Dashboard = ({ orders }) => {
  // 1. CALCULATE TOTALS
  const totalOrders = orders.length;
  
  let totalRevenue = 0;
  let totalProductCost = 0;
  let totalDeliveryCost = 0;
  let totalAdCost = 0;
  let totalPackagingCost = 0;

  orders.forEach(order => {
    totalRevenue += parseFloat(order.sellingPrice) || 0;
    totalProductCost += parseFloat(order.productCost) || 0;
    totalDeliveryCost += parseFloat(order.deliveryCost) || 0;
    totalAdCost += parseFloat(order.adCost) || 0;
    totalPackagingCost += 15; // Fixed packaging cost
  });

  const totalExpenses = totalProductCost + totalDeliveryCost + totalAdCost + totalPackagingCost;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  // 2. DATA FOR PIE CHART
  const pieData = [
    { name: 'Product Cost', value: totalProductCost, color: '#FF8042' }, // Orange
    { name: 'Ads', value: totalAdCost, color: '#0088FE' }, // Blue
    { name: 'Delivery', value: totalDeliveryCost, color: '#FFBB28' }, // Yellow
    { name: 'Packaging', value: totalPackagingCost, color: '#999' }, // Gray
    { name: 'Net Profit', value: netProfit > 0 ? netProfit : 0, color: '#00C49F' } // Green
  ];

  const [selectedOrder, setSelectedOrder] = React.useState(null);

  const handleSaveOrder = (order) => {
    // Logic to save the order
    setSelectedOrder(order); // Set the saved order to display receipt
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in">
      
      {/* LEFT: STATS CARDS */}
      <div className="grid grid-cols-2 gap-4">
        {/* Card 1: NET PROFIT */}
        <div className={`p-5 rounded-2xl shadow-sm border-2 ${netProfit >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'} col-span-2`}>
          <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Net Profit</h3>
          <p className={`text-4xl font-extrabold mt-2 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
             {netProfit.toLocaleString()} ৳
          </p>
          <p className="text-xs text-gray-400 mt-2">After all deductions</p>
        </div>

        {/* Card 2: REVENUE */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-400 text-xs font-bold uppercase">Revenue</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalRevenue.toLocaleString()} ৳</p>
        </div>

        {/* Card 3: PROFIT MARGIN */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-400 text-xs font-bold uppercase">Margin</h3>
          <p className={`text-2xl font-bold mt-1 ${profitMargin > 20 ? 'text-green-500' : 'text-orange-500'}`}>
            {profitMargin}%
          </p>
        </div>
      </div>

      {/* RIGHT: COST BREAKDOWN CHART */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
        <h3 className="text-gray-600 font-bold mb-2 text-sm">Where is the money going?</h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toLocaleString()} ৳`} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {selectedOrder && <Receipt order={selectedOrder} />}
      <button onClick={() => handleSaveOrder(savedOrder)}>Save Order</button>
    </div>
  );
};

export default Dashboard;