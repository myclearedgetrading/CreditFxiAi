
import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Settings, LogOut, Menu, X,
  ShieldCheck, ScanSearch, LineChart, Trophy,
  Sun, Moon, Briefcase, GraduationCap, Building2, Home,
  ShoppingBag
} from 'lucide-react';
import MobileNav from './MobileNav';
import { isMobileDevice } from '../services/mobileService';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();

  useEffect(() => {
    setIsMobile(isMobileDevice());
    window.addEventListener('resize', () => setIsMobile(isMobileDevice()));
    return () => window.removeEventListener('resize', () => setIsMobile(isMobileDevice()));
  }, []);

  // Reordered Navigation Items: Credit Repair -> Business Funding
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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 dark:bg-slate-950 text-white transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 bg-slate-950 dark:bg-black">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-8 h-8 text-indigo-500" />
            <span className="text-xl font-bold tracking-tight">CreditFix DIY</span>
          </div>
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-6 pt-6 pb-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">My Journey</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-24 lg:pb-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 mb-safe lg:mb-0 space-y-2">
          <div className="flex items-center px-4 py-3 mb-2 bg-slate-800 rounded-lg">
             <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white mr-3">
               {user.firstName.charAt(0)}
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-bold text-white truncate">{user.firstName} {user.lastName}</p>
               <p className="text-xs text-slate-400 truncate">DIY Member</p>
             </div>
          </div>

          <button 
            onClick={toggleTheme}
            className="flex items-center w-full px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          <Link to="/" className="flex items-center w-full px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden w-full">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0 transition-colors">
          <div className="flex items-center gap-4">
            <button 
              className="p-1 text-slate-500 dark:text-slate-400 rounded-md lg:hidden hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 lg:hidden">
              {navItems.find(i => i.path === location.pathname)?.label || 'CreditFix DIY'}
            </h1>
          </div>
          
          <div className="flex items-center ml-auto space-x-4">
             <button className="hidden sm:flex items-center px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
               <Briefcase className="w-3 h-3 mr-1.5" />
               Business Mode: Active
             </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 lg:p-6 pb-20 lg:pb-6 transition-colors">
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
