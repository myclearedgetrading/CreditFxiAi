
import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, EyeOff, Key, FileText, UserCheck, 
  AlertTriangle, CheckCircle2, History, Database, Fingerprint,
  Search, Download, Trash2, RefreshCw, Smartphone, Users
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { SecurityLog } from '../types';

const SecurityCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'encryption'>('dashboard');
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  
  // Encryption Simulation
  const [isVaultLocked, setIsVaultLocked] = useState(true);
  const [ssnVisible, setSsnVisible] = useState(false);

  const toggleEncryption = () => {
    // Simulate re-auth for vault access
    if (isVaultLocked) {
      const pin = prompt("Enter Admin PIN to unlock Vault (use 1234):");
      if (pin === '1234') setIsVaultLocked(false);
      else alert("Access Denied");
    } else {
      setIsVaultLocked(true);
      setSsnVisible(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <ShieldCheck className="text-emerald-600 w-8 h-8" />
            Security Command Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Enterprise-grade security monitoring and data protection.
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-800">
           <CheckCircle2 className="w-5 h-5" />
           <span className="font-bold text-sm">System Status: SECURE</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-6 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Overview', icon: BarChart },
          { id: 'encryption', label: 'Encryption Vault', icon: Lock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- DASHBOARD TAB --- */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Security Score */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
             <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                <svg className="absolute w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#e2e8f0" strokeWidth="8" fill="transparent" className="dark:stroke-slate-700" />
                  <circle cx="64" cy="64" r="56" stroke="#10b981" strokeWidth="8" fill="transparent" strokeDasharray="351" strokeDashoffset="0" strokeLinecap="round" />
                </svg>
                <div className="text-3xl font-bold text-slate-800 dark:text-white">100</div>
             </div>
             <h3 className="font-bold text-slate-700 dark:text-white">Security Health Score</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400">No vulnerabilities detected</p>
          </div>

          {/* MFA Adoption */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
             <h3 className="font-bold text-slate-800 dark:text-white mb-4">2FA Status</h3>
             <div className="flex items-center gap-4">
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">Disabled</span>
                   </div>
                   <p className="text-xs text-slate-400 mt-2">Enable 2FA in settings for enhanced security.</p>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- ENCRYPTION VAULT TAB --- */}
      {activeTab === 'encryption' && (
         <div className="max-w-2xl mx-auto text-center">
            <div className={`inline-flex p-6 rounded-full mb-6 transition-all duration-500 ${isVaultLocked ? 'bg-slate-100 dark:bg-slate-700' : 'bg-emerald-100 dark:bg-emerald-900/30 scale-110'}`}>
               {isVaultLocked ? (
                  <Lock className="w-16 h-16 text-slate-400 dark:text-slate-500" />
               ) : (
                  <Lock className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
               )}
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
               {isVaultLocked ? 'Secure Vault Locked' : 'Vault Access Granted'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
               Advanced Field-Level Encryption (AES-256) protects sensitive client data (SSN, DOB) at rest.
            </p>

            {isVaultLocked ? (
               <button 
                  onClick={toggleEncryption}
                  className="px-8 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-600 shadow-lg transition-transform hover:scale-105"
               >
                  Authenticate to View Data
               </button>
            ) : (
               <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-900 text-left animate-fade-in">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-slate-800 dark:text-white">Decrypted Sample Record</h3>
                     <button onClick={toggleEncryption} className="text-xs text-red-500 hover:underline">Lock Vault</button>
                  </div>
                  
                  <div className="space-y-4">
                     <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Client Name</label>
                        <div className="font-mono text-slate-700 dark:text-slate-200">Current User</div>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Social Security Number</label>
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-750 p-2 rounded border border-slate-200 dark:border-slate-700">
                           <span className="font-mono text-slate-800 dark:text-white tracking-widest">
                              {ssnVisible ? '000-00-0000' : '•••-••-••••'}
                           </span>
                           <button onClick={() => setSsnVisible(!ssnVisible)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                              {ssnVisible ? <EyeOff className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                           </button>
                        </div>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
                           <CheckCircle2 className="w-3 h-3 mr-1" /> Decrypted using Hardware Security Module (HSM)
                        </p>
                     </div>
                  </div>
               </div>
            )}
         </div>
      )}
    </div>
  );
};

export default SecurityCenter;
