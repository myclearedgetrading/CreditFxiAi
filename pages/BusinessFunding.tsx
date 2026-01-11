
import React, { useState } from 'react';
import { 
  Building2, CheckCircle2, Circle, AlertCircle, 
  DollarSign, Briefcase, Lock, ChevronRight, Wand2
} from 'lucide-react';
import { generateFundingPlan } from '../services/geminiService';
import { FundingTier } from '../types';

const COMPLIANCE_STEPS = [
  { id: '1', label: 'Business Entity (LLC/Corp)', category: 'FOUNDATION', completed: true },
  { id: '2', label: 'EIN (Tax ID)', category: 'FOUNDATION', completed: true },
  { id: '3', label: 'Business Bank Account', category: 'FINANCIALS', completed: true },
  { id: '4', label: 'D-U-N-S Number', category: 'FOUNDATION', completed: false },
  { id: '5', label: 'Professional Website & Email', category: 'FOUNDATION', completed: false },
  { id: '6', label: 'Business Phone (411 Listed)', category: 'FOUNDATION', completed: false },
  { id: '7', label: 'Foreign Qualification', category: 'LEGAL', completed: false },
];

const FUNDING_SOURCES = [
  { name: 'Uline', type: 'Net-30', tier: 1, limit: '$1,000+', logo: '📦' },
  { name: 'Grainger', type: 'Net-30', tier: 1, limit: '$1,000+', logo: '🔧' },
  { name: 'Nav Prime', type: 'Trade Line', tier: 1, limit: 'Reporting', logo: '📊' },
  { name: 'Amazon Business', type: 'Net-55', tier: 2, limit: '$3,000+', logo: '🛒' },
];

const BusinessFunding: React.FC = () => {
  const [checklist, setChecklist] = useState(COMPLIANCE_STEPS);
  const [activeTier, setActiveTier] = useState<number>(1);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const toggleStep = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedCount = checklist.filter(i => i.completed).length;
  const progress = (completedCount / checklist.length) * 100;

  const runFundingAnalysis = async () => {
    setLoading(true);
    const result = await generateFundingPlan({ 
        complianceScore: progress, 
        completedItems: checklist.filter(i => i.completed).map(i => i.label) 
    });
    setAiAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <Building2 className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
            Business Funding Suite
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Build business credit separate from your SSN. Master the 4 Tiers of Funding.
          </p>
        </div>
        
        <button 
            onClick={runFundingAnalysis}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
            {loading ? 'Analyzing...' : <><Wand2 className="w-4 h-4 mr-2" /> AI Funding Advisor</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Compliance Checklist */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#0A0A0A] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">Fundability Foundation</h3>
                <p className="text-xs text-slate-500 mb-4">Complete these steps before applying to avoid denial.</p>
                
                <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold mb-1 dark:text-slate-300">
                        <span>{completedCount} / {checklist.length} Completed</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <div className="space-y-3">
                    {checklist.map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => toggleStep(item.id)}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                item.completed 
                                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900' 
                                    : 'bg-slate-50 border-slate-100 dark:bg-[#111] dark:border-slate-800'
                            }`}
                        >
                            {item.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                            ) : (
                                <Circle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            )}
                            <div>
                                <p className={`text-sm font-medium ${item.completed ? 'text-green-800 dark:text-green-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {item.label}
                                </p>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{item.category}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Col: Funding Tiers */}
        <div className="lg:col-span-2 space-y-6">
            
            {aiAnalysis && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg animate-fade-in">
                    <h3 className="font-bold text-lg mb-2 flex items-center">
                        <Wand2 className="w-5 h-5 mr-2" /> AI Recommendation
                    </h3>
                    <p className="text-indigo-100 mb-4">
                        Based on your profile, you are currently in <strong>{aiAnalysis.currentTier}</strong>. 
                        We recommend applying for 3 Net-30 accounts to build your Paydex score.
                    </p>
                    <div className="bg-white/10 rounded-lg p-3 text-sm">
                        <p className="font-bold">Next Step:</p>
                        <p>{aiAnalysis.complianceIssues?.[0] || "Apply for Uline and Grainger."}</p>
                    </div>
                </div>
            )}

            {/* Tiers Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map(tier => (
                    <button
                        key={tier}
                        onClick={() => setActiveTier(tier)}
                        className={`px-6 py-3 rounded-lg font-bold whitespace-nowrap transition-colors ${
                            activeTier === tier 
                                ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' 
                                : 'bg-white text-slate-500 border border-slate-200 dark:bg-[#0A0A0A] dark:text-slate-400 dark:border-slate-800'
                        }`}
                    >
                        Tier {tier}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-[#0A0A0A] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                            {activeTier === 1 ? 'Net-30 Vendor Credit' : 
                             activeTier === 2 ? 'Store Credit Cards' : 
                             activeTier === 3 ? 'Cash Credit Cards' : 'Business Loans'}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {activeTier === 1 ? 'Easiest to get. Requires no personal guarantee (PG). Builds Paydex.' : 
                             activeTier === 2 ? 'Revolving credit at specific retailers (Amazon, Staples, Dell).' : 
                             'Unsecured Visa/Mastercards usable anywhere.'}
                        </p>
                    </div>
                    {activeTier > 1 && progress < 80 && (
                        <div className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                            <Lock className="w-3 h-3 mr-1" /> Locked
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {FUNDING_SOURCES.filter(s => s.tier === activeTier).map((source, idx) => (
                        <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors group cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-2xl">
                                    {source.logo}
                                </div>
                                <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-bold px-2 py-1 rounded">
                                    {source.type}
                                </span>
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white">{source.name}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Est. Limit: {source.limit}</p>
                            <button className="w-full py-2 bg-slate-900 text-white dark:bg-slate-700 rounded-lg text-sm font-medium group-hover:bg-indigo-600 transition-colors flex items-center justify-center">
                                Apply Now <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    ))}
                    {/* Add placeholder for empty tiers in this mock */}
                    {FUNDING_SOURCES.filter(s => s.tier === activeTier).length === 0 && (
                        <div className="col-span-2 text-center py-10 text-slate-400">
                            <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                            <p>Unlock previous tiers to see Tier {activeTier} lenders.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default BusinessFunding;
