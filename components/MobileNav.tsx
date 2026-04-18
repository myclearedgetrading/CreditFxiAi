
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageCircle, ScanLine, Menu, ShoppingBag, GraduationCap, Settings } from 'lucide-react';
import { vibrate, HAPTIC } from '../services/mobileService';
import type { PlanTier } from '../services/access';

interface MobileNavProps {
  onMenuClick: () => void;
  planTier: PlanTier;
}

const MobileNav: React.FC<MobileNavProps> = ({ onMenuClick, planTier }) => {
  const navigate = useNavigate();
  const handleClick = () => vibrate(HAPTIC.LIGHT);
  const isDiyPlus = planTier === 'DIY_PRO' || planTier === 'AGENCY';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-slate-800 lg:hidden pb-safe z-50 transition-colors">
      <div className="flex justify-around items-center h-16">
        <NavLink 
          to="/dashboard" 
          onClick={handleClick}
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>

        {isDiyPlus ? (
          <NavLink 
            to="/marketplace" 
            onClick={handleClick}
            className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <ShoppingBag className="w-6 h-6" />
            <span className="text-[10px] font-medium">Offers</span>
          </NavLink>
        ) : (
          <NavLink 
            to="/learning" 
            onClick={handleClick}
            className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <GraduationCap className="w-6 h-6" />
            <span className="text-[10px] font-medium">Learn</span>
          </NavLink>
        )}

        {isDiyPlus ? (
          <NavLink 
            to="/analysis" 
            onClick={handleClick}
            className="relative -top-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full p-4 shadow-[0_0_15px_rgba(249,115,22,0.4)] text-white transform transition-transform active:scale-95 border-4 border-[#050505]"
          >
            <ScanLine className="w-6 h-6" />
          </NavLink>
        ) : (
          <button
            type="button"
            onClick={() => { handleClick(); navigate('/settings'); }}
            className="relative -top-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full px-5 py-3 shadow-[0_0_15px_rgba(249,115,22,0.4)] text-white text-xs font-bold border-4 border-[#050505]"
          >
            Subscribe
          </button>
        )}

        {isDiyPlus ? (
          <NavLink 
            to="/disputes" 
            onClick={handleClick}
            className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-[10px] font-medium">Action</span>
          </NavLink>
        ) : (
          <NavLink 
            to="/settings" 
            onClick={handleClick}
            className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-medium">Settings</span>
          </NavLink>
        )}

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
