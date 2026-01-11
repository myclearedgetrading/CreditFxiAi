
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageCircle, ScanLine, Menu, ShoppingBag } from 'lucide-react';
import { vibrate, HAPTIC } from '../services/mobileService';

interface MobileNavProps {
  onMenuClick: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ onMenuClick }) => {
  const handleClick = () => vibrate(HAPTIC.LIGHT);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-slate-800 lg:hidden pb-safe z-50 transition-colors">
      <div className="flex justify-around items-center h-16">
        <NavLink 
          to="/" 
          onClick={handleClick}
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>

        <NavLink 
          to="/marketplace" 
          onClick={handleClick}
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <ShoppingBag className="w-6 h-6" />
          <span className="text-[10px] font-medium">Offers</span>
        </NavLink>

        {/* Center Floating Action Button Style */}
        <NavLink 
          to="/analysis" 
          onClick={handleClick}
          className="relative -top-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full p-4 shadow-[0_0_15px_rgba(249,115,22,0.4)] text-white transform transition-transform active:scale-95 border-4 border-[#050505]"
        >
          <ScanLine className="w-6 h-6" />
        </NavLink>

        <NavLink 
          to="/disputes" 
          onClick={handleClick}
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-[10px] font-medium">Action</span>
        </NavLink>

        <button 
          onClick={() => { handleClick(); onMenuClick(); }}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 hover:text-slate-300"
        >
          <Menu className="w-6 h-6" />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNav;
