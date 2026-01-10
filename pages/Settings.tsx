import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Blocks, Bot, ShieldCheck, 
  BrainCircuit, Trophy, User, Bell, CreditCard, Layout,
  LogOut
} from 'lucide-react';
import Integrations from './Integrations';
import AutomationEngine from './AutomationEngine';
import SecurityCenter from './SecurityCenter';
import LearningCenter from './LearningCenter';
import GamificationCenter from './GamificationCenter';
import { useUser } from '../context/UserContext';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useUser();
  const role = user.role;

  const adminTabs = [
    { id: 'profile', label: 'Company Profile', icon: User },
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
    { id: 'integrations', label: 'Integrations', icon: Blocks },
    { id: 'automation', label: 'Automation Engine', icon: Bot },
    { id: 'security', label: 'Security & Compliance', icon: ShieldCheck },
    { id: 'learning', label: 'AI Training', icon: BrainCircuit },
    { id: 'rewards', label: 'Rewards Config', icon: Trophy },
  ];

  const clientTabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'billing', label: 'My Subscription', icon: CreditCard },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ];

  const tabs = role === 'ADMIN' ? adminTabs : clientTabs;

  const renderContent = () => {
    switch (activeTab) {
      case 'integrations': return <Integrations />;
      case 'automation': return <AutomationEngine />;
      case 'security': return <SecurityCenter />;
      case 'learning': return <LearningCenter />;
      case 'rewards': return <GamificationCenter />;
      case 'profile': 
        return (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 max-w-2xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
              {role === 'ADMIN' ? 'Company Profile' : 'Personal Information'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {role === 'ADMIN' ? 'Company Name' : 'First Name'}
                  </label>
                  <input type="text" defaultValue={role === 'ADMIN' ? "CreditFix Pro" : "James"} className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {role === 'ADMIN' ? 'Support Email' : 'Last Name'}
                  </label>
                  <input type="text" defaultValue={role === 'ADMIN' ? "support@creditfix.com" : "Robinson"} className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input type="email" defaultValue={role === 'ADMIN' ? "admin@creditfix.com" : "james.r@example.com"} className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 dark:text-white" />
              </div>
              {role === 'ADMIN' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Brand Color</label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white shadow-sm cursor-pointer"></div>
                    <div className="w-8 h-8 rounded-full bg-blue-600 cursor-pointer"></div>
                    <div className="w-8 h-8 rounded-full bg-green-600 cursor-pointer"></div>
                    <div className="w-8 h-8 rounded-full bg-slate-900 cursor-pointer"></div>
                  </div>
                </div>
              )}
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 mt-4">Save Changes</button>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 max-w-2xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Subscription Plan</h2>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-indigo-900 dark:text-indigo-300">
                  {role === 'ADMIN' ? 'Enterprise Plan' : 'Premium Credit Repair'}
                </h3>
                <p className="text-sm text-indigo-700 dark:text-indigo-400">Next billing date: Dec 1, 2024</p>
              </div>
              <span className="px-3 py-1 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full shadow-sm">ACTIVE</span>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-3">Payment Methods</h3>
            <div className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-600 rounded-lg">
              <div className="w-10 h-6 bg-slate-200 rounded"></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Visa ending in 4242</span>
              <button className="ml-auto text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Edit</button>
            </div>
          </div>
        );
      default: return <div>Select a setting</div>;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <SettingsIcon className="text-slate-600 dark:text-slate-300 w-8 h-8" />
          Settings & Configuration
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {role === 'ADMIN' ? 'Manage system preferences, integrations, and admin tools.' : 'Manage your account details and subscription.'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-6 overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0 overflow-y-auto pr-2">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;