import { Outlet, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppLayout = () => {
  const { currentUser } = useAuth();

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-800">MunafaOS</h1>
          <p className="text-xs text-slate-400 mt-1">Seller Suite</p>
        </div>

        <div className="py-4 flex-1 flex flex-col">
          <div>
            <p className="text-xs text-slate-400 font-bold tracking-wider mt-6 mb-2 mx-4">MAIN</p>
            <nav className="space-y-1 px-4">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `w-full flex items-center justify-between px-3 py-2 text-sm ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 rounded-lg'
                      : 'text-slate-600 hover:bg-slate-50 rounded-lg'
                  }`
                }
              >
                <span>Dashboard</span>
              </NavLink>
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `w-full flex items-center justify-between px-3 py-2 text-sm ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 rounded-lg'
                      : 'text-slate-600 hover:bg-slate-50 rounded-lg'
                  }`
                }
              >
                <span>Orders</span>
                <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">24</span>
              </NavLink>
              <NavLink
                to="/inventory"
                className={({ isActive }) =>
                  `w-full flex items-center justify-between px-3 py-2 text-sm ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 rounded-lg'
                      : 'text-slate-600 hover:bg-slate-50 rounded-lg'
                  }`
                }
              >
                <span>Inventory</span>
                <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">3</span>
              </NavLink>
            </nav>

            <p className="text-xs text-slate-400 font-bold tracking-wider mt-6 mb-2 mx-4">AI TOOLS</p>
            <nav className="space-y-1 px-4">
              <Link to="#" className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                <span>Bulk Import</span>
                <span className="text-xs font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">AI</span>
              </Link>
              <Link to="#" className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                <span>OCR Scanner</span>
                <span className="text-xs font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">AI</span>
              </Link>
            </nav>

            <p className="text-xs text-slate-400 font-bold tracking-wider mt-6 mb-2 mx-4">INSIGHTS</p>
            <nav className="px-4">
              <Link to="#" className="w-full flex items-center px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                Analytics
              </Link>
            </nav>
          </div>

          <div className="mt-auto pt-6 px-4">
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
              <p className="text-xs font-semibold text-purple-700">AI Engine Active</p>
              <div className="w-full h-2 bg-purple-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full w-3/4 bg-purple-500 rounded-full" />
              </div>
            </div>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `w-full block text-left px-3 py-2 mt-4 text-sm ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 rounded-lg'
                    : 'text-slate-600 hover:bg-slate-50 rounded-lg'
                }`
              }
            >
              Settings
            </NavLink>

            <Link
              to="/settings"
              className="flex items-center gap-3 p-3 mt-4 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                {(currentUser?.shopName || 'Shop Admin').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">{currentUser?.shopName || 'Shop Admin'}</p>
                <p className="text-xs text-slate-400">{currentUser?.email}</p>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
