
import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Blocks, Bot, ShieldCheck, 
  BrainCircuit, Trophy, User, CreditCard, UploadCloud
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

  const clientTabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'billing', label: 'My Subscription', icon: CreditCard },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ];

  const FileUploadField = ({ label, description, accepted }: { label: string, description: string, accepted?: string }) => (
    <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#111] transition-colors group">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
          <UploadCloud className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <label className="relative cursor-pointer">
        <input type="file" className="hidden" accept={accepted} />
        <span className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 transition-colors shadow-sm">
          Select File
        </span>
      </label>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'integrations': return <Integrations />;
      case 'automation': return <AutomationEngine />;
      case 'security': return <SecurityCenter />;
      case 'learning': return <LearningCenter />;
      case 'rewards': return <GamificationCenter />;
      case 'profile': 
        return (
          <div className="bg-white dark:bg-[#0A0A0A] p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 max-w-2xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
              Personal Information
            </h2>
            
            {/* Basic Info */}
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    First Name
                  </label>
                  <input type="text" defaultValue={user.firstName} placeholder="Your Name" className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-[#111] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Last Name
                  </label>
                  <input type="text" defaultValue={user.lastName} placeholder="Surname" className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-[#111] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input type="email" defaultValue={user.email} placeholder="you@example.com" className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-[#111] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            {/* Verification Documents (New Section) */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-8 mb-8">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Identity Verification</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Required for dispute letters to be accepted by bureaus. These are stored in our secure encrypted vault.
              </p>
              
              <div className="space-y-3">
                <FileUploadField 
                  label="Government Photo ID" 
                  description="Driver's License, Passport, or State ID"
                  accepted="image/*,.pdf"
                />
                <FileUploadField 
                  label="Social Security Card" 
                  description="Copy of card or W-2 form with full SSN" 
                  accepted="image/*,.pdf"
                />
                <FileUploadField 
                  label="Proof of Address" 
                  description="Utility bill, bank statement, or insurance policy (last 60 days)" 
                  accepted="image/*,.pdf"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
               <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors">
                 Save Changes
               </button>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div className="bg-white dark:bg-[#0A0A0A] p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 max-w-2xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Subscription Plan</h2>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-indigo-900 dark:text-indigo-300">
                  Premium Credit Repair
                </h3>
                <p className="text-sm text-indigo-700 dark:text-indigo-400">Monthly Plan</p>
              </div>
              <span className="px-3 py-1 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full shadow-sm">ACTIVE</span>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-3">Payment Methods</h3>
            <div className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="w-10 h-6 bg-slate-200 rounded"></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">•••• •••• •••• 4242</span>
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
          Manage your account details and subscription.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-6 overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0 overflow-y-auto pr-2">
          <div className="space-y-1">
            {clientTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
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
