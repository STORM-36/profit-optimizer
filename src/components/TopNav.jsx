import React, { useState } from "react";

const TopNav = ({ currentView, onChangeView, onLogout, menuItems }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleMenuClick = (key) => {
    console.log("🔄 Switching to:", key);
    onChangeView(key);
    setDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm p-4 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600 tracking-tighter">
          🚀 MunafaOS
        </h1>

        <div className="flex gap-3 items-center">
          {/* DROPDOWN MENU */}
          <div className="relative">
            <button
              onClick={() => {
                console.log("☰ Menu clicked, dropdown open:", !dropdownOpen);
                setDropdownOpen(!dropdownOpen);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                dropdownOpen
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ☰ Menu
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {menuItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleMenuClick(item.key)}
                    className={`w-full text-left px-4 py-2 text-sm font-semibold transition ${
                      currentView === item.key
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onLogout}
            className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm font-bold hover:bg-red-200"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
