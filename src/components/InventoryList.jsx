/* src/components/InventoryList.jsx */
import React, { useState, useEffect, useMemo } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot, query, where, orderBy, deleteDoc, doc, limit, getCountFromServer } from "firebase/firestore";
import { CATEGORY_OPTIONS } from "../utils/categories";

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [fetchLimit, setFetchLimit] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch server-side total count on mount
  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const fetchTotalCount = async () => {
      try {
        const countQuery = query(
          collection(db, "inventory"),
          where("userId", "==", auth.currentUser.uid)
        );
        const snapshot = await getCountFromServer(countQuery);
        setTotalCount(snapshot.data().count);
      } catch (error) {
        console.error("Error fetching total count:", error);
        setTotalCount(0);
      }
    };

    fetchTotalCount();
  }, []);

  // Fetch inventory from Firebase with dynamic limit
  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "inventory"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("timestamp", "desc"),
      limit(fetchLimit)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setInventory(items);
      setLoading(false);
      setIsLoadingMore(false);
    });

    return () => unsubscribe();
  }, [fetchLimit]);

  // Filter inventory based on search and category
  useEffect(() => {
    let filtered = [...inventory];

    // Search filter (by name or SKU)
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.name || "").toLowerCase().includes(search) ||
          (item.sku || "").toLowerCase().includes(search)
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    setFilteredInventory(filtered);
  }, [inventory, searchText, selectedCategory]);

  // Delete item
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from inventory?`)) return;

    try {
      await deleteDoc(doc(db, "inventory", id));
      alert("✅ Item deleted successfully!");
      
      // Decrease total count
      setTotalCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("❌ Failed to delete item.");
    }
  };

  // Load more items
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setFetchLimit(prev => prev + 50);
  };

  // Calculate summary
  const totalItems = filteredInventory.reduce((sum, item) => {
    return sum + (parseFloat(item.quantity) || 0);
  }, 0);

  const totalValue = filteredInventory.reduce((sum, item) => {
    const price = parseFloat(item.buyingPrice) || 0;
    const qty = parseFloat(item.quantity) || 0;
    return sum + price * qty;
  }, 0);

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Memoized table rows for performance
  const tableRows = useMemo(() => {
    return filteredInventory.map((item) => {
      const price = parseFloat(item.buyingPrice) || 0;
      const qty = parseFloat(item.quantity) || 0;
      const total = price * qty;

      return (
        <tr key={item.id} className="border-b hover:bg-gray-50 transition">
          <td className="p-3 text-gray-600">
            {formatDate(item.timestamp)}
          </td>
          <td className="p-3 font-semibold text-gray-700">
            {item.name || "(Unnamed)"}
          </td>
          <td className="p-3 text-gray-600">
            {item.sku || "-"}
          </td>
          <td className="p-3 text-gray-600">
            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold">
              {item.category || "Other"}
            </span>
          </td>
          <td className="p-3 text-right text-gray-700 font-medium">
            ৳{price.toFixed(2)}
          </td>
          <td className="p-3 text-right text-gray-700">
            {qty.toFixed(0)}
          </td>
          <td className="p-3 text-right text-gray-800 font-bold">
            ৳{total.toFixed(2)}
          </td>
          <td className="p-3 text-center">
            <button
              onClick={() => handleDelete(item.id, item.name)}
              className="text-red-600 hover:text-red-800 font-bold transition"
              title="Delete"
            >
              🗑️
            </button>
          </td>
        </tr>
      );
    });
  }, [filteredInventory]);

  if (!auth.currentUser) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-w-6xl mx-auto mt-6">
        <p className="text-center text-gray-500">Please login to view inventory.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-w-6xl mx-auto mt-6">
        <p className="text-center text-gray-500">⏳ Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-w-6xl mx-auto mt-6">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-xl font-bold text-gray-800">📋 Inventory List</h2>
        <p className="text-xs text-gray-400">View and manage your stock items.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-600 font-bold uppercase mb-1">Total Items in Stock</p>
          <p className="text-2xl font-bold text-blue-700">{totalItems.toFixed(0)}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <p className="text-xs text-green-600 font-bold uppercase mb-1">Total Inventory Value</p>
          <p className="text-2xl font-bold text-green-700">৳{totalValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
            🔍 Search by Name or SKU
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type product name or SKU..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
            📁 Filter by Category
          </label>
          <select
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      {filteredInventory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {inventory.length === 0 ? (
            <>
              <p className="text-lg font-semibold mb-2">📦 No inventory items yet</p>
              <p className="text-sm">Add your first stock item using the form above.</p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold mb-2">🔍 No results found</p>
              <p className="text-sm">Try adjusting your search or filter.</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600">
                  <th className="text-left p-3 border-b font-bold">Date</th>
                  <th className="text-left p-3 border-b font-bold">Product Name</th>
                  <th className="text-left p-3 border-b font-bold">SKU</th>
                  <th className="text-left p-3 border-b font-bold">Category</th>
                  <th className="text-right p-3 border-b font-bold">Buying Price</th>
                  <th className="text-right p-3 border-b font-bold">Qty</th>
                  <th className="text-right p-3 border-b font-bold">Total Value</th>
                  <th className="text-center p-3 border-b font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {tableRows}
              </tbody>
            </table>
          </div>

          {/* Footer Stats */}
          <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm">
            <p className="text-gray-600">
              Showing <span className="font-bold">{filteredInventory.length}</span> of{" "}
              <span className="font-bold">{inventory.length}</span> items
            </p>
            <p className="text-gray-600">
              Total Value: <span className="font-bold text-green-600">৳{totalValue.toFixed(2)}</span>
            </p>
          </div>

          {/* Load More Section */}
          {!searchText && !selectedCategory && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-3">
                Showing <span className="font-bold text-gray-700">{inventory.length}</span> of{" "}
                <span className="font-bold text-gray-700">{totalCount}</span> total items
              </p>
              {inventory.length < totalCount && (
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  {isLoadingMore ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>⬇️ Load More</>
                  )}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InventoryList;
