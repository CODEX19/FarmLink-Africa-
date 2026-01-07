
import React from 'react';
import { ViewState } from '../pages/types.ts';
import { Icons } from '../constants.tsx';

interface SidebarProps {
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  isExpanded: boolean;
  onToggle: () => void;
  isOnline: boolean;
  isSyncing: boolean;
  resolution?: 'MOBILE' | 'TABLET' | 'LAPTOP';
  userRole: 'farmer' | 'buyer';
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, onLogout, isExpanded, onToggle, isOnline, isSyncing, resolution, userRole }) => {
  const isTablet = resolution === 'TABLET';
  const effectiveExpanded = isExpanded && !isTablet;

  const navItems = [
    { id: userRole === 'buyer' ? 'buyer-dashboard' : 'dashboard', label: 'Dashboard', Icon: Icons.Home, roles: ['farmer', 'buyer'] },
    { id: 'marketplace', label: 'Marketplace', Icon: Icons.Shop, roles: ['farmer', 'buyer'] },
    { id: 'farming-calendar', label: 'Calendar', Icon: Icons.Calendar, roles: ['farmer'] },
    { id: 'community-hub', label: 'Community', Icon: Icons.Users, roles: ['farmer'] },
    { id: 'wallet', label: 'Wallet', Icon: Icons.Wallet, roles: ['farmer', 'buyer'] },
    { id: 'logistics', label: 'Logistics', Icon: Icons.Truck, roles: ['farmer', 'buyer'] },
    { id: 'messages', label: 'Messages', Icon: Icons.Message, roles: ['farmer', 'buyer'] },
    { id: 'profile', label: 'Profile', Icon: Icons.Settings, roles: ['farmer', 'buyer'] },
  ].filter(item => item.roles.includes(userRole));

  return (
    <aside className={`h-screen bg-white dark:bg-slate-900 fixed left-0 top-0 flex flex-col border-r border-slate-100 dark:border-slate-800 z-50 transition-all duration-500 shadow-2xl ${effectiveExpanded ? 'w-64' : 'w-24'}`}>
      <div className="flex items-center justify-center py-10">
        <Icons.Logo className={effectiveExpanded ? "w-14 h-14" : "w-12 h-12"} />
      </div>
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as ViewState)}
            className={`w-full flex items-center rounded-2xl transition-all duration-300 group relative ${effectiveExpanded ? 'px-4 py-3.5 gap-4' : 'justify-center py-4'} ${
              activeView === item.id 
                ? `${userRole === 'buyer' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'} shadow-sm` 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className={`transition-all duration-300 w-8 h-8 flex items-center justify-center ${activeView === item.id ? 'scale-110 brightness-110' : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100'}`}>
              <item.Icon className="w-7 h-7" />
            </div>
            {effectiveExpanded && (
              <span className={`font-bold text-sm tracking-tight ${activeView === item.id ? (userRole === 'buyer' ? 'text-indigo-700 dark:text-indigo-400' : 'text-emerald-700 dark:text-emerald-400') : 'text-slate-600 dark:text-slate-400'}`}>
                {item.label}
              </span>
            )}
            {activeView === item.id && (
              <div className={`absolute right-2 w-1.5 h-1.5 ${userRole === 'buyer' ? 'bg-indigo-500' : 'bg-emerald-500'} rounded-full animate-pulse`}></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-50 dark:border-slate-800 space-y-3">
        {!isTablet && (
          <button onClick={onToggle} className="w-full py-3 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 transition-colors">
            {effectiveExpanded ? <Icons.ChevronLeft className="w-5 h-5 opacity-40" /> : <Icons.ChevronRight className="w-5 h-5 opacity-40" />}
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
