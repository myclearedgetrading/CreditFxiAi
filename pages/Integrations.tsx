import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Shield, MessageCircle, Mail, FileSignature, 
  Zap, FileSpreadsheet, ShieldCheck, Users, Search, 
  CheckCircle2, XCircle, RefreshCw, AlertTriangle, Blocks, Link as LinkIcon
} from 'lucide-react';
import { getIntegrations, connectIntegration, disconnectIntegration, syncIntegration, getWebhookLogs } from '../services/integrationService';
import { Integration, IntegrationCategory, WebhookEvent } from '../types';

const CATEGORIES: { id: IntegrationCategory | 'ALL', label: string }[] = [
  { id: 'ALL', label: 'All Apps' },
  { id: 'CREDIT_BUREAU', label: 'Credit Bureaus' },
  { id: 'PAYMENT', label: 'Payments' },
  { id: 'COMMUNICATION', label: 'Communication' },
  { id: 'MARKETING', label: 'Marketing' },
  { id: 'DOCUMENT', label: 'Documents' },
  { id: 'ACCOUNTING', label: 'Accounting' },
];

const IntegrationIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => {
  const props = { className: className || "w-6 h-6" };
  switch (name) {
    case 'CreditCard': return <CreditCard {...props} />;
    case 'Shield': return <Shield {...props} />;
    case 'MessageCircle': return <MessageCircle {...props} />;
    case 'Mail': return <Mail {...props} />;
    case 'FileSignature': return <FileSignature {...props} />;
    case 'Zap': return <Zap {...props} />;
    case 'FileSpreadsheet': return <FileSpreadsheet {...props} />;
    case 'ShieldCheck': return <ShieldCheck {...props} />;
    case 'Users': return <Users {...props} />;
    default: return <Blocks {...props} />;
  }
};

const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [webhookLogs, setWebhookLogs] = useState<WebhookEvent[]>([]);
  
  // Modal State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [ints, logs] = await Promise.all([getIntegrations(), getWebhookLogs()]);
    setIntegrations(ints);
    setWebhookLogs(logs);
    setLoading(false);
  };

  const filteredIntegrations = integrations.filter(int => {
    const matchesCategory = selectedCategory === 'ALL' || int.category === selectedCategory;
    const matchesSearch = int.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleConnectClick = (int: Integration) => {
    setSelectedIntegration(int);
    setShowConnectModal(true);
    setApiKey('');
  };

  const handleConnectSubmit = async () => {
    if (!selectedIntegration) return;
    setConnectingId(selectedIntegration.id);
    setShowConnectModal(false);
    
    await connectIntegration(selectedIntegration.id, { apiKey });
    
    setIntegrations(prev => prev.map(i => 
      i.id === selectedIntegration.id ? { ...i, status: 'CONNECTED', health: 100, lastSync: 'Just now' } : i
    ));
    setConnectingId(null);
  };

  const handleDisconnect = async (id: string) => {
    if (!window.confirm('Are you sure you want to disconnect this service? Features relying on it will stop working.')) return;
    
    setConnectingId(id);
    await disconnectIntegration(id);
    
    setIntegrations(prev => prev.map(i => 
      i.id === id ? { ...i, status: 'DISCONNECTED', health: 0 } : i
    ));
    setConnectingId(null);
  };

  const handleSync = async (id: string) => {
    setSyncingId(id);
    await syncIntegration(id);
    setIntegrations(prev => prev.map(i => 
      i.id === id ? { ...i, lastSync: 'Just now' } : i
    ));
    setSyncingId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <Blocks className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
            Integration Ecosystem
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Connect your favorite tools to automate credit repair workflows.
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-100 dark:border-indigo-900 shadow-sm transition-colors">
           <Zap className="w-4 h-4 fill-indigo-100 dark:fill-indigo-900" />
           <span className="font-bold text-sm">{integrations.filter(i => i.status === 'CONNECTED').length} Active Connections</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search apps..." 
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {CATEGORIES.slice(0, 3).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
              <select 
                className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none"
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                value={['ALL', 'CREDIT_BUREAU', 'PAYMENT'].includes(selectedCategory) ? '' : selectedCategory}
              >
                <option value="" disabled>More...</option>
                {CATEGORIES.slice(3).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredIntegrations.map(int => (
                <div key={int.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${int.status === 'CONNECTED' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                        <IntegrationIcon name={int.icon} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">{int.name}</h3>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{int.category.replace('_', ' ')}</p>
                      </div>
                    </div>
                    {int.status === 'CONNECTED' ? (
                      <span className="flex items-center text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 dark:text-slate-500 px-2 py-1 rounded-full">
                        Offline
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 min-h-[40px]">{int.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700">
                    <div className="flex gap-2">
                      {int.status === 'CONNECTED' ? (
                        <>
                          <button 
                            onClick={() => handleDisconnect(int.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            disabled={!!connectingId}
                          >
                            {connectingId === int.id ? 'Disconnecting...' : 'Disconnect'}
                          </button>
                          <button 
                            onClick={() => handleSync(int.id)}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium px-2 py-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded flex items-center"
                            disabled={!!syncingId}
                          >
                            {syncingId === int.id ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                            Sync
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleConnectClick(int)}
                          className="px-4 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                          disabled={!!connectingId}
                        >
                          {connectingId === int.id ? 'Connecting...' : 'Connect'}
                        </button>
                      )}
                    </div>
                    {int.lastSync && (
                      <span className="text-[10px] text-slate-400">Synced {int.lastSync}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Activity & Health */}
        <div className="space-y-6">
          {/* Health Status */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
              System Health
            </h3>
            <div className="space-y-4">
              {integrations.filter(i => i.status === 'CONNECTED').map(int => (
                <div key={int.id} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
                    <IntegrationIcon name={int.icon} className="w-3 h-3 mr-2 text-slate-400" />
                    {int.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${int.health > 90 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${int.health}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{int.health}%</span>
                  </div>
                </div>
              ))}
              {integrations.filter(i => i.status === 'CONNECTED').length === 0 && (
                <div className="text-sm text-slate-400 text-center py-4">No active integrations to monitor.</div>
              )}
            </div>
          </div>

          {/* Webhook Stream */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col max-h-[500px] transition-colors">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Live Event Stream</h3>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {webhookLogs.map(log => (
                <div key={log.id} className="p-3 border-l-2 border-indigo-100 dark:border-indigo-900 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-r-md transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.source}</span>
                    <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                  </div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono mb-1">{log.event}</p>
                  <div className="flex items-center gap-2">
                    {log.status === 'PROCESSED' ? (
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-500" />
                    )}
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                      {JSON.stringify(log.payload)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      {showConnectModal && selectedIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-colors">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <IntegrationIcon name={selectedIntegration.icon} className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Connect {selectedIntegration.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selectedIntegration.category.replace('_', ' ')}</p>
                </div>
              </div>

              {selectedIntegration.requiresOAuth ? (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                    You will be redirected to {selectedIntegration.name} to authorize access to your account.
                  </p>
                  <button 
                    onClick={handleConnectSubmit}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Authorize with OAuth
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">API Key / Secret</label>
                    <input 
                      type="password" 
                      className="w-full border border-slate-200 dark:border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm bg-white dark:bg-slate-700 dark:text-white"
                      placeholder="sk_test_..."
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                    />
                    <p className="text-xs text-slate-400 mt-1">Found in your {selectedIntegration.name} dashboard settings.</p>
                  </div>
                  <button 
                    onClick={handleConnectSubmit}
                    disabled={apiKey.length < 5}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Connect API
                  </button>
                </div>
              )}
            </div>
            <div className="bg-slate-50 dark:bg-slate-750 p-4 text-center border-t border-slate-100 dark:border-slate-700">
              <button 
                onClick={() => setShowConnectModal(false)}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Integrations;