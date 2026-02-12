import React from "react";
import AddInventory from "../components/AddInventory";

const InventoryPage = () => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="text-xl font-bold text-gray-800">📦 Inventory</h2>
      <p className="text-xs text-gray-400">Add and manage your stock with AI assistance.</p>
    </div>
    <AddInventory />
  </div>
);

export default InventoryPage;
