import React, { useState } from "react";
import SmartForm from "../components/SmartForm";
import OrderList from "../components/OrderList";

// Simple Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("❌ Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded">
          <strong>Error:</strong> {this.state.error?.message || "Unknown error"}
        </div>
      );
    }

    return this.props.children;
  }
}

const OrdersPage = () => {
  console.log("📄 OrdersPage component mounted and rendering");
  
  return (
    <div className="space-y-6">
      <div className="text-center border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🧾 Orders</h2>
        <p className="text-sm text-gray-500 mt-1">Record new sales and track profit history.</p>
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-gray-700 mb-4">💼 Add New Sale</h3>
        <ErrorBoundary>
          <SmartForm />
        </ErrorBoundary>
      </div>

      <hr className="my-6 border-gray-200" />

      <div>
        <h3 className="text-lg font-bold text-gray-700 mb-4">📊 Order History & Analytics</h3>
        <ErrorBoundary>
          <OrderList />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default OrdersPage;
