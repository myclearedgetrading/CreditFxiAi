
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WifiOff, Download } from 'lucide-react';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import DisputeGenerator from './pages/DisputeGenerator';
import AnalysisEngine from './pages/AnalysisEngine';
import Reports from './pages/Reports';
import CommunicationHub from './pages/CommunicationHub';
import SupportCenter from './pages/SupportCenter';
import Settings from './pages/Settings';
import GamificationCenter from './pages/GamificationCenter';
import LearningCenter from './pages/LearningCenter';
import BusinessFunding from './pages/BusinessFunding';
import Marketplace from './pages/Marketplace';
import Onboarding from './pages/Onboarding';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminPortal from './pages/AdminPortal';
import { requestNotificationPermission } from './services/mobileService';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';

const OfflineIndicator = () => (
  <div className="fixed top-0 left-0 right-0 bg-slate-800 text-white text-xs font-bold text-center py-1 z-[100] flex justify-center items-center gap-2">
    <WifiOff className="w-3 h-3" />
    You are offline. Changes will sync when online.
  </div>
);

const InstallPrompt = ({ onInstall, onClose }: { onInstall: () => void, onClose: () => void }) => (
  <div className="fixed bottom-20 left-4 right-4 bg-indigo-600 text-white p-4 rounded-xl shadow-2xl z-50 flex justify-between items-center animate-fade-in lg:hidden">
    <div className="flex items-center gap-3">
      <div className="bg-white/20 p-2 rounded-lg">
        <Download className="w-6 h-6" />
      </div>
      <div>
        <p className="font-bold">Install App</p>
        <p className="text-xs text-indigo-200">Add to home screen for better experience</p>
      </div>
    </div>
    <div className="flex gap-2">
      <button onClick={onClose} className="text-indigo-200 text-sm px-2">Later</button>
      <button onClick={onInstall} className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm">Install</button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    requestNotificationPermission();

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      });
    }
  };

  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          {isOffline && <OfflineIndicator />}
          {showInstallPrompt && <InstallPrompt onInstall={handleInstallClick} onClose={() => setShowInstallPrompt(false)} />}
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Authenticated Routes */}
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/disputes" element={<DisputeGenerator />} />
                    <Route path="/analysis" element={<AnalysisEngine />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/analytics" element={<Reports />} />
                    <Route path="/communication" element={<CommunicationHub />} />
                    <Route path="/learning" element={<LearningCenter />} />
                    <Route path="/funding" element={<BusinessFunding />} />
                    <Route path="/support" element={<SupportCenter />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/rewards" element={<GamificationCenter />} />
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminPortal />
                        </AdminRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
