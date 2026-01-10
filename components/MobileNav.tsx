import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageCircle, ScanLine, Menu, Zap } from 'lucide-react';
import { vibrate, HAPTIC } from '../services/mobileService';

interface MobileNavProps {
  onMenuClick: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ onMenuClick }) => {
  const handleClick = () => vibrate(HAPTIC.LIGHT);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 lg:hidden pb-safe z-50 transition-colors">
      <div className="flex justify-around items-center h-16">
        <NavLink 
          to="/" 
          onClick={handleClick}
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>

        <NavLink 
          to="/communication" 
          onClick={handleClick}
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-[10px] font-medium">Chat</span>
        </NavLink>

        {/* Center Floating Action Button Style */}
        <NavLink 
          to="/analysis" 
          onClick={handleClick}
          className="relative -top-6 bg-indigo-600 dark:bg-indigo-500 rounded-full p-4 shadow-lg text-white transform transition-transform active:scale-95 border-4 border-slate-50 dark:border-slate-900"
        >
          <ScanLine className="w-6 h-6" />
        </NavLink>

        <NavLink 
          to="/disputes" 
          onClick={handleClick}
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}
        >
          <Zap className="w-6 h-6" />
          <span className="text-[10px] font-medium">Action</span>
        </NavLink>

        <button 
          onClick={() => { handleClick(); onMenuClick(); }}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        >
          <Menu className="w-6 h-6" />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNav;