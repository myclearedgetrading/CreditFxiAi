
import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Settings, LogOut, Menu, X,
  ShieldCheck, ScanSearch, LineChart, Trophy,
  GraduationCap, Building2,
  ShoppingBag, BarChart3
} from 'lucide-react';
import MobileNav from './MobileNav';
import { isMobileDevice } from '../services/mobileService';
import { useUser } from '../context/UserContext';
import { logoutUser, isPlatformAdmin } from '../services/firebaseService';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();

  useEffect(() => {
    setIsMobile(isMobileDevice());
    window.addEventListener('resize', () => setIsMobile(isMobileDevice()));
    return () => window.removeEventListener('resize', () => setIsMobile(isMobileDevice()));
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      /* still clear local session */
    }
    logout();
    navigate('/login');
  };

  // DIY-first: personal credit repair flows (no agency/business-mode UI)
  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/analysis', label: 'Credit Audit', icon: ScanSearch },
    { path: '/disputes', label: 'Dispute Center', icon: ShieldCheck },
    { path: '/analytics', label: 'Progress Tracker', icon: LineChart },
    { path: '/learning', label: 'Education Hub', icon: GraduationCap },
    { path: '/funding', label: 'Business Funding', icon: Building2 },
    { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { path: '/rewards', label: 'Rewards', icon: Trophy },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-80 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0A0A] border-r border-slate-900 text-white transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-20 px-6 bg-[#0A0A0A] border-b border-slate-900">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-8 h-8 text-orange-500" />
            <span className="text-xl font-bold tracking-tight text-white">CreditFix AI</span>
          </div>
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-6 pt-6 pb-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">DIY credit repair</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-24 lg:pb-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                isActive(item.path)
                  ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)]'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
              {item.label}
            </Link>
          ))}
          {isPlatformAdmin(user) && (
            <Link
              to="/admin"
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all border border-dashed ${
                isActive('/admin')
                  ? 'bg-amber-900/40 text-amber-200 border-amber-800/50'
                  : 'text-amber-500/90 border-amber-900/30 hover:bg-amber-950/40 hover:text-amber-400'
              }`}
            >
              <BarChart3 className="w-5 h-5 mr-3" />
              Admin portal
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-slate-900 mb-safe lg:mb-0 space-y-2">
          <div className="flex items-center px-4 py-3 mb-2 bg-slate-900 rounded-xl border border-slate-800">
             <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center font-bold text-white mr-3">
               {user.firstName ? user.firstName.charAt(0) : 'U'}
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-bold text-white truncate">{user.firstName} {user.lastName}</p>
               <p className="text-xs text-slate-400 truncate">Personal account</p>
             </div>
          </div>

          <button 
            onClick={handleLogout} 
            className="flex items-center w-full px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden w-full bg-[#050505]">
        {/* Header */}
        <header className="flex items-center justify-between h-20 px-6 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-slate-900 shadow-sm flex-shrink-0 transition-colors z-20">
          <div className="flex items-center gap-4">
            <button 
              className="p-1 text-slate-400 rounded-md lg:hidden hover:bg-slate-800"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-white lg:hidden">
              {navItems.find(i => i.path === location.pathname)?.label || 'CreditFix AI'}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#050505] p-4 lg:p-6 pb-20 lg:pb-6 transition-colors">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav onMenuClick={() => setIsSidebarOpen(true)} />
      </div>
    </div>
  );
};

export default Layout;
