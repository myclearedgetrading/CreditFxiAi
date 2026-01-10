import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, EyeOff, Key, FileText, UserCheck, 
  AlertTriangle, CheckCircle2, History, Database, Fingerprint,
  Search, Download, Trash2, RefreshCw, Smartphone, Users
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { SecurityLog, RBACRole, ComplianceRequest, SecurityScanResult } from '../types';
import { analyzeSecurityLogs } from '../services/geminiService';

// MOCK DATA

const INITIAL_ROLES: RBACRole[] = [
  { role: 'SUPER_ADMIN', permissions: ['ALL_ACCESS'], usersCount: 2 },
  { role: 'ADMIN', permissions: ['MANAGE_USERS', 'VIEW_FINANCIALS', 'EDIT_SETTINGS'], usersCount: 3 },
  { role: 'MANAGER', permissions: ['VIEW_REPORTS', 'MANAGE_CLIENTS'], usersCount: 5 },
  { role: 'SPECIALIST', permissions: ['VIEW_CLIENTS', 'CREATE_DISPUTES'], usersCount: 12 },
  { role: 'AUDITOR', permissions: ['READ_ONLY_LOGS'], usersCount: 1 }
];

const INITIAL_LOGS: SecurityLog[] = [
  { id: '1', userId: 'u1', userName: 'Admin User', action: 'LOGIN_SUCCESS', resource: 'Auth System', ipAddress: '192.168.1.1', timestamp: '2023-11-20 09:00:00', status: 'SUCCESS', severity: 'INFO' },
  { id: '2', userId: 'u2', userName: 'Sarah Specialist', action: 'VIEW_SSN', resource: 'Client #104 Profile', ipAddress: '192.168.1.45', timestamp: '2023-11-20 09:15:22', status: 'SUCCESS', severity: 'WARNING' },
  { id: '3', userId: 'unknown', userName: 'Unknown', action: 'LOGIN_FAILED', resource: 'Auth System', ipAddress: '45.33.22.11', timestamp: '2023-11-20 03:45:00', status: 'FAILURE', severity: 'CRITICAL', metadata: { reason: 'Bad Password' } },
  { id: '4', userId: 'u1', userName: 'Admin User', action: 'EXPORT_DATA', resource: 'Financial Reports', ipAddress: '192.168.1.1', timestamp: '2023-11-20 10:30:00', status: 'SUCCESS', severity: 'INFO' },
];

const MOCK_COMPLIANCE_REQUESTS: ComplianceRequest[] = [
  { id: 'req1', clientId: 'c105', clientName: 'John Doe', type: 'EXPORT_DATA', status: 'COMPLETED', requestDate: '2023-11-18' },
  { id: 'req2', clientId: 'c109', clientName: 'Alice Smith', type: 'DELETE_DATA', status: 'PENDING', requestDate: '2023-11-20' },
];

const VULNERABILITIES = [
  { severity: 'LOW', issue: 'Outdated Dependency', description: 'react-scripts v5.0.0 has minor vulnerability', remediation: 'Upgrade to v5.0.1' },
  { severity: 'MEDIUM', issue: 'Weak Password Policy', description: '2 users have passwords older than 90 days', remediation: 'Force password reset' },
];

const SecurityCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rbac' | 'audit' | 'compliance' | 'encryption'>('dashboard');
  const [logs, setLogs] = useState<SecurityLog[]>(INITIAL_LOGS);
  const [logFilter, setLogFilter] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  
  // MFA Simulation
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [mfaStep, setMfaStep] = useState(1);
  const [mfaCode, setMfaCode] = useState('');

  // Encryption Simulation
  const [isVaultLocked, setIsVaultLocked] = useState(true);
  const [ssnVisible, setSsnVisible] = useState(false);

  useEffect(() => {
    if (activeTab === 'audit') {
      runLogAnalysis();
    }
  }, [activeTab]);

  const runLogAnalysis = async () => {
    const analysis = await analyzeSecurityLogs(logs.slice(0, 5));
    setAiAnalysis(analysis);
  };

  const handleMfaSetup = () => {
    if (mfaStep === 1) {
      setMfaStep(2); // Show QR
    } else if (mfaStep === 2) {
      if (mfaCode === '123456') {
        setMfaEnabled(true);
        setShowMfaModal(false);
        setMfaStep(1);
        setMfaCode('');
        alert("MFA Successfully Enabled");
      } else {
        alert("Invalid Code");
      }
    }
  };

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

  const filteredLogs = logs.filter(log => 
    log.userName.toLowerCase().includes(logFilter.toLowerCase()) || 
    log.action.toLowerCase().includes(logFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <ShieldCheck className="text-emerald-600 w-8 h-8" />
            Security Command Center
          </h1>
          <p className="text-slate-500 mt-1">
            Enterprise-grade security monitoring, access control, and compliance management.
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
           <CheckCircle2 className="w-5 h-5" />
           <span className="font-bold text-sm">System Status: SECURE</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Overview', icon: BarChart },
          { id: 'rbac', label: 'Access Control', icon: UserCheck },
          { id: 'audit', label: 'Audit Logs', icon: History },
          { id: 'compliance', label: 'GDPR & Compliance', icon: FileText },
          { id: 'encryption', label: 'Encryption Vault', icon: Lock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-emerald-600 text-emerald-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
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
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
             <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                <svg className="absolute w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
                  <circle cx="64" cy="64" r="56" stroke="#10b981" strokeWidth="8" fill="transparent" strokeDasharray="351" strokeDashoffset="35" strokeLinecap="round" />
                </svg>
                <div className="text-3xl font-bold text-slate-800">92</div>
             </div>
             <h3 className="font-bold text-slate-700">Security Health Score</h3>
             <p className="text-sm text-slate-500">2 minor vulnerabilities detected</p>
          </div>

          {/* MFA Adoption */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h3 className="font-bold text-slate-800 mb-4">MFA Adoption Rate</h3>
             <div className="flex items-center gap-4">
                <div className="h-32 w-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{ name: 'Enabled', value: 85 }, { name: 'Disabled', value: 15 }]} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                      <span className="text-sm text-slate-600">Enabled (85%)</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span className="text-sm text-slate-600">Disabled (15%)</span>
                   </div>
                   <button onClick={() => setShowMfaModal(true)} className="mt-3 text-xs text-indigo-600 hover:underline font-bold">Configure My MFA</button>
                </div>
             </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 overflow-hidden">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                Vulnerability Scan
             </h3>
             <div className="space-y-3">
                {VULNERABILITIES.map((vuln, i) => (
                   <div key={i} className="p-3 bg-slate-50 rounded-lg text-sm">
                      <div className="flex justify-between font-bold text-slate-700">
                         {vuln.issue}
                         <span className={`text-[10px] px-2 py-0.5 rounded ${vuln.severity === 'MEDIUM' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>{vuln.severity}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{vuln.remediation}</p>
                   </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* --- RBAC TAB --- */}
      {activeTab === 'rbac' && (
         <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
               <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Role Definitions</h3>
                  <button className="text-sm bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700">
                     Add Custom Role
                  </button>
               </div>
               <table className="w-full text-left text-sm">
                  <thead className="text-slate-500 border-b border-slate-200">
                     <tr>
                        <th className="px-6 py-3">Role Name</th>
                        <th className="px-6 py-3">Users</th>
                        <th className="px-6 py-3">Permissions Scope</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {INITIAL_ROLES.map((role) => (
                        <tr key={role.role}>
                           <td className="px-6 py-4 font-bold text-slate-700">{role.role}</td>
                           <td className="px-6 py-4 flex items-center">
                              <Users className="w-4 h-4 mr-2 text-slate-400" /> {role.usersCount}
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex gap-1 flex-wrap">
                                 {role.permissions.map(p => (
                                    <span key={p} className="text-[10px] bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-600">{p}</span>
                                 ))}
                              </div>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs">Edit Permissions</button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* --- AUDIT LOGS TAB --- */}
      {activeTab === 'audit' && (
         <div className="space-y-6">
            {aiAnalysis && (
               <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 text-white shadow-lg flex items-start gap-3">
                  <div className="p-2 bg-white bg-opacity-10 rounded-lg">
                     <History className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                     <h4 className="font-bold text-sm mb-1 text-emerald-400">AI Threat Analysis</h4>
                     <p className="text-xs text-slate-300 leading-relaxed">{aiAnalysis}</p>
                  </div>
               </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
               <div className="p-4 border-b border-slate-100 flex gap-4">
                  <div className="relative flex-1">
                     <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                     <input 
                        type="text" 
                        placeholder="Search logs by user, IP, or action..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={logFilter}
                        onChange={(e) => setLogFilter(e.target.value)}
                     />
                  </div>
                  <button className="flex items-center px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                     <Download className="w-4 h-4 mr-2" /> Export Logs
                  </button>
               </div>
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                     <tr>
                        <th className="px-6 py-3">Timestamp</th>
                        <th className="px-6 py-3">Severity</th>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Action</th>
                        <th className="px-6 py-3">Resource</th>
                        <th className="px-6 py-3">IP Address</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                           <td className="px-6 py-3 text-slate-500 font-mono text-xs">{log.timestamp}</td>
                           <td className="px-6 py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                 log.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                 log.severity === 'WARNING' ? 'bg-orange-100 text-orange-700' :
                                 'bg-slate-100 text-slate-700'
                              }`}>
                                 {log.severity}
                              </span>
                           </td>
                           <td className="px-6 py-3 font-medium text-slate-700">{log.userName}</td>
                           <td className="px-6 py-3 text-slate-600">{log.action}</td>
                           <td className="px-6 py-3 text-slate-500">{log.resource}</td>
                           <td className="px-6 py-3 font-mono text-xs text-slate-400">{log.ipAddress}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* --- COMPLIANCE TAB --- */}
      {activeTab === 'compliance' && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-indigo-600" />
                  GDPR & Privacy Requests
               </h3>
               <div className="space-y-4">
                  {MOCK_COMPLIANCE_REQUESTS.map((req) => (
                     <div key={req.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center">
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                 req.type === 'DELETE_DATA' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                 {req.type.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-slate-400">{req.requestDate}</span>
                           </div>
                           <p className="font-bold text-sm text-slate-800">{req.clientName} (ID: {req.clientId})</p>
                        </div>
                        {req.status === 'PENDING' ? (
                           <button className="px-3 py-1 bg-slate-800 text-white text-xs rounded hover:bg-slate-700">
                              Process Request
                           </button>
                        ) : (
                           <span className="text-xs font-bold text-green-600 flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Completed
                           </span>
                        )}
                     </div>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-2">Automated Data Retention</h3>
                  <p className="text-sm text-slate-500 mb-4">Policies actively managing data lifecycle.</p>
                  
                  <div className="space-y-3">
                     <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium">Inactive Leads (>6 months)</span>
                        <span className="text-xs font-bold text-slate-400">AUTO-ARCHIVE</span>
                     </div>
                     <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium">Deleted Client Data (>7 years)</span>
                        <span className="text-xs font-bold text-red-400">PERMANENT DELETE</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* --- ENCRYPTION VAULT TAB --- */}
      {activeTab === 'encryption' && (
         <div className="max-w-2xl mx-auto text-center">
            <div className={`inline-flex p-6 rounded-full mb-6 transition-all duration-500 ${isVaultLocked ? 'bg-slate-100' : 'bg-emerald-100 scale-110'}`}>
               {isVaultLocked ? (
                  <Lock className="w-16 h-16 text-slate-400" />
               ) : (
                  <Lock className="w-16 h-16 text-emerald-600" /> // Open lock visual would be better but reusing icon for now
               )}
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
               {isVaultLocked ? 'Secure Vault Locked' : 'Vault Access Granted'}
            </h2>
            <p className="text-slate-500 mb-8">
               Advanced Field-Level Encryption (AES-256) protects sensitive client data (SSN, DOB) at rest.
            </p>

            {isVaultLocked ? (
               <button 
                  onClick={toggleEncryption}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg transition-transform hover:scale-105"
               >
                  Authenticate to View Data
               </button>
            ) : (
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100 text-left animate-fade-in">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-slate-800">Decrypted Sample Record</h3>
                     <button onClick={toggleEncryption} className="text-xs text-red-500 hover:underline">Lock Vault</button>
                  </div>
                  
                  <div className="space-y-4">
                     <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Client Name</label>
                        <div className="font-mono text-slate-700">James Robinson</div>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Social Security Number</label>
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200">
                           <span className="font-mono text-slate-800 tracking-widest">
                              {ssnVisible ? '442-19-9921' : '•••-••-••••'}
                           </span>
                           <button onClick={() => setSsnVisible(!ssnVisible)} className="text-slate-400 hover:text-slate-600">
                              {ssnVisible ? <EyeOff className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                           </button>
                        </div>
                        <p className="text-[10px] text-emerald-600 mt-1 flex items-center">
                           <CheckCircle2 className="w-3 h-3 mr-1" /> Decrypted using Hardware Security Module (HSM)
                        </p>
                     </div>
                  </div>
               </div>
            )}
         </div>
      )}

      {/* MFA Modal */}
      {showMfaModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
               <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Smartphone className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Setup 2-Factor Authentication</h3>
                  <p className="text-sm text-slate-500 mb-6">Secure your account by linking an authenticator app.</p>

                  {mfaStep === 1 ? (
                     <button 
                        onClick={handleMfaSetup}
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
                     >
                        Generate QR Code
                     </button>
                  ) : (
                     <div className="space-y-4">
                        <div className="w-48 h-48 bg-slate-900 mx-auto rounded-lg flex items-center justify-center text-slate-500 text-xs">
                           [QR CODE PLACEHOLDER]
                        </div>
                        <input 
                           type="text" 
                           placeholder="Enter 6-digit code"
                           className="w-full text-center tracking-[0.5em] font-bold text-xl py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                           maxLength={6}
                           value={mfaCode}
                           onChange={(e) => setMfaCode(e.target.value)}
                        />
                        <button 
                           onClick={handleMfaSetup}
                           className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700"
                        >
                           Verify & Enable
                        </button>
                     </div>
                  )}
               </div>
               <div className="bg-slate-50 p-4 text-center">
                  <button onClick={() => { setShowMfaModal(false); setMfaStep(1); }} className="text-sm text-slate-500 hover:text-slate-800">Cancel</button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default SecurityCenter;