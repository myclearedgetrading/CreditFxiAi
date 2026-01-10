import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, Settings, LogOut, Menu, X,
  ShieldCheck, ScanSearch, LineChart, Bot, MessageCircle, Trophy, Lock, Blocks,
  Sun, Moon, BrainCircuit, LifeBuoy
} from 'lucide-react';
import MobileNav from './MobileNav';
import { isMobileDevice } from '../services/mobileService';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setIsMobile(isMobileDevice());
    window.addEventListener('resize', () => setIsMobile(isMobileDevice()));
    return () => window.removeEventListener('resize', () => setIsMobile(isMobileDevice()));
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/support', label: 'Support Center', icon: LifeBuoy },
    { path: '/learning', label: 'AI Learning Center', icon: BrainCircuit },
    { path: '/analysis', label: 'Analysis Engine', icon: ScanSearch },
    { path: '/analytics', label: 'Predictive Analytics', icon: LineChart },
    { path: '/automation', label: 'Automation Engine', icon: Bot },
    { path: '/communication', label: 'Communication Hub', icon: MessageCircle },
    { path: '/integrations', label: 'Integrations', icon: Blocks },
    { path: '/rewards', label: 'Client Rewards', icon: Trophy },
    { path: '/security', label: 'Security Center', icon: Lock },
    { path: '/clients', label: 'Clients', icon: Users },
    { path: '/disputes', label: 'AI Dispute Center', icon: ShieldCheck },
    { path: '/reports', label: 'Reports', icon: FileText },
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
            <span className="text-xl font-bold tracking-tight">CreditFix AI</span>
          </div>
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto pb-24 lg:pb-6">
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
          {/* Theme Toggle in Sidebar for Desktop */}
          <button 
            onClick={toggleTheme}
            className="flex items-center w-full px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          <button className="flex items-center w-full px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden w-full">
        {/* Header - Hidden on mobile if needed, or simplified */}
        <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0 transition-colors">
          <div className="flex items-center gap-4">
            <button 
              className="p-1 text-slate-500 dark:text-slate-400 rounded-md lg:hidden hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 lg:hidden">
              {navItems.find(i => i.path === location.pathname)?.label || 'CreditFix'}
            </h1>
          </div>
          
          <div className="flex items-center ml-auto space-x-4">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Admin User</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Credit Specialist</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold border-2 border-white dark:border-slate-600 shadow-sm">
              AU
            </div>
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