import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Dashboard = () => {
  const { currentUser, workspaceId } = useAuth();
  const [metrics, setMetrics] = useState({
    revenue: 0,
    totalOrders: 0,
    pendingDelivery: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    const activeWorkspaceId = currentUser?.workspaceId || workspaceId;

    if (!activeWorkspaceId) {
      setLoading(false);
      return;
    }

    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const ordersQuery = query(
          collection(db, 'orders'),
          where('workspaceId', '==', activeWorkspaceId)
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const orders = ordersSnapshot.docs.map((snapshotDoc) => snapshotDoc.data());

        const revenue = orders.reduce((sum, order) => {
          const total = Number(order?.total || order?.orderTotal || 0);
          if (Number.isFinite(total) && total > 0) return sum + total;

          const selling = Number(order?.sellingPrice || 0);
          const discount = Number(order?.discountPrice || 0);
          const effectiveTotal = discount > 0 ? discount : selling;
          return sum + (Number.isFinite(effectiveTotal) ? effectiveTotal : 0);
        }, 0);

        const totalOrders = orders.length;
        const pendingDelivery = orders.filter((order) => {
          const status = String(order?.status || '').toLowerCase();
          return status === 'pending' || status === 'processing';
        }).length;

        const inventoryQuery = query(
          collection(db, 'inventory'),
          where('workspaceId', '==', activeWorkspaceId)
        );
        const inventorySnapshot = await getDocs(inventoryQuery);
        const totalProducts = inventorySnapshot.size;

        setMetrics({
          revenue,
          totalOrders,
          pendingDelivery,
          totalProducts
        });
      } catch (error) {
        console.error('Error loading dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [currentUser?.workspaceId, workspaceId]);

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-8 font-sans">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">{currentDate}</p>
      </div>

      <div className="bg-[#6366f1] text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <p className="text-sm md:text-base text-indigo-100">Good morning {currentUser?.firstName || 'Owner'} 👋</p>
          <h2 className="text-2xl md:text-4xl font-bold mt-1">{currentUser?.shopName || 'My Boutique'}</h2>
          <p className="text-sm md:text-base text-indigo-100 mt-3">Your shop is performing 12.4% better than last month.</p>
        </div>

        <div className="flex flex-row flex-wrap justify-center gap-4 w-full md:w-auto">
          <div className="bg-white/20 rounded-full px-6 py-3 text-center">
            <p className="text-lg md:text-xl font-bold">Rs. 9,218</p>
            <p className="text-xs text-indigo-100 mt-1">Avg daily revenue</p>
          </div>
          <div className="bg-white/20 rounded-full px-6 py-3 text-center">
            <p className="text-lg md:text-xl font-bold">23.6%</p>
            <p className="text-xs text-indigo-100 mt-1">Profit margin</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">
            {loading ? '...' : `Rs. ${metrics.revenue.toLocaleString()}`}
          </p>
          <p className="text-sm text-emerald-600 mt-3">+12.4%</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Products</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">
            {loading ? '...' : metrics.totalProducts.toLocaleString()}
          </p>
          <p className="text-sm text-emerald-600 mt-3">+8.2%</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Orders</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">
            {loading ? '...' : metrics.totalOrders.toLocaleString()}
          </p>
          <p className="text-sm text-emerald-600 mt-3">+24 today</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-slate-500">Pending Delivery</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">
            {loading ? '...' : metrics.pendingDelivery.toLocaleString()}
          </p>
          <p className="text-sm text-rose-600 mt-3">-5 from yesterday</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;