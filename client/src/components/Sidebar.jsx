import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Package, Users, Receipt, BarChart2, Settings, LogOut, History
} from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Point of Sale', path: '/pos', icon: ShoppingCart },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Transactions', path: '/transactions', icon: History },
    { name: 'Suppliers', path: '/suppliers', icon: Users },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'P&L Reports', path: '/reports', icon: BarChart2 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm print:hidden">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center shadow-sm shadow-indigo-200">
            <span className="text-white font-black text-sm">S</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">Stax <span className="text-indigo-600">Store</span></h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-5 px-4 flex flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-sm ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
              }`
            }
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            {link.name}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200 space-y-1">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 mb-2">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-500">{user?.role || 'Administrator'}</p>
          </div>
        </div>
        <NavLink to="/settings" className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
          <Settings className="w-5 h-5" /> Settings
        </NavLink>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-all text-sm"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
