import { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppLayout = () => {
  const { currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navItemClass = ({ isActive }) =>
    `w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
      isActive
        ? 'bg-indigo-600 text-white'
        : 'text-slate-200 hover:bg-slate-800'
    }`;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <header className="md:hidden flex items-center justify-between bg-slate-900 text-white p-4 w-full z-50 absolute top-0 left-0">
        <h1 className="text-lg font-bold">MunafaOS</h1>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((previousState) => !previousState)}
          className="text-2xl leading-none"
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </header>

      <div
        className={`fixed inset-0 bg-black/50 z-30 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <div className="py-6 px-4 md:px-6 pl-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">MunafaOS</h2>
          <p className="text-xs text-slate-400 mt-1 break-words whitespace-normal">Seller Suite</p>
        </div>

        <div className="py-4 px-4 md:px-6 flex-1 flex flex-col">
          <div>
            <p className="text-xs text-slate-400 font-bold tracking-wider mt-6 mb-2">MAIN</p>
            <nav className="space-y-1 pl-6">
              <NavLink to="/dashboard" onClick={closeMobileMenu} className={navItemClass}>
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/orders" onClick={closeMobileMenu} className={navItemClass}>
                <span>Orders</span>
                <span className="text-xs font-bold bg-slate-700 text-slate-200 px-2 py-0.5 rounded-full">24</span>
              </NavLink>
              <NavLink to="/inventory" onClick={closeMobileMenu} className={navItemClass}>
                <span>Inventory</span>
                <span className="text-xs font-bold bg-slate-700 text-slate-200 px-2 py-0.5 rounded-full">3</span>
              </NavLink>
            </nav>

            <p className="text-xs text-slate-400 font-bold tracking-wider mt-6 mb-2">AI TOOLS</p>
            <nav className="space-y-1">
              <Link
                to="#"
                onClick={closeMobileMenu}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 rounded-lg"
              >
                <span>Bulk Import</span>
                <span className="text-xs font-bold bg-slate-700 text-slate-200 px-2 py-0.5 rounded-full">AI</span>
              </Link>
              <Link
                to="#"
                onClick={closeMobileMenu}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 rounded-lg"
              >
                <span>OCR Scanner</span>
                <span className="text-xs font-bold bg-slate-700 text-slate-200 px-2 py-0.5 rounded-full">AI</span>
              </Link>
            </nav>

            <p className="text-xs text-slate-400 font-bold tracking-wider mt-6 mb-2">INSIGHTS</p>
            <nav>
              <Link
                to="#"
                onClick={closeMobileMenu}
                className="w-full flex items-center px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 rounded-lg"
              >
                Analytics
              </Link>
            </nav>
          </div>

          <div className="mt-auto pt-6 pb-4">
            <NavLink
              to="/settings"
              onClick={closeMobileMenu}
              className={navItemClass}
            >
              Settings
            </NavLink>

            <Link
              to="/settings"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 p-3 mt-4 rounded-xl hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                {(currentUser?.shopName || 'Shop Admin').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100 truncate">{currentUser?.shopName || 'Shop Admin'}</p>
                <p className="text-xs text-slate-400 truncate">{currentUser?.email}</p>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-16 md:pt-0">
        {location.pathname !== '/' && location.pathname !== '/dashboard' && (
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back
          </button>
        )}
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
