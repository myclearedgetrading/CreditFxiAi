import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, BookOpen, MessageSquare, TestTube, Search, 
  ThumbsUp, ThumbsDown, Edit2, Check, ArrowRight, Zap, 
  BarChart2, FileText, Scale
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  LineChart, Line, Legend 
} from 'recharts';
import { searchKnowledgeBase, submitModelFeedback } from '../services/geminiService';
import { KnowledgeArticle, ModelFeedback, StrategyPerformance, Bureau } from '../types';

// Mock Data
const PERFORMANCE_DATA = [
  { month: 'Jul', aiSuccess: 45, manualSuccess: 42 },
  { month: 'Aug', aiSuccess: 48, manualSuccess: 43 },
  { month: 'Sep', aiSuccess: 52, manualSuccess: 44 },
  { month: 'Oct', aiSuccess: 58, manualSuccess: 45 },
  { month: 'Nov', aiSuccess: 63, manualSuccess: 46 },
  { month: 'Dec', aiSuccess: 68, manualSuccess: 47 },
];

const STRATEGY_DATA: StrategyPerformance[] = [
  { strategyName: 'Factual Dispute (Medical)', bureau: Bureau.EXPERIAN, successRate: 72, usageCount: 450, trend: 'UP' },
  { strategyName: 'Method of Verification', bureau: Bureau.EQUIFAX, successRate: 58, usageCount: 320, trend: 'FLAT' },
  { strategyName: 'Late Pay Goodwill', bureau: Bureau.TRANSUNION, successRate: 35, usageCount: 150, trend: 'DOWN' },
];

const RECENT_FEEDBACK: ModelFeedback[] = [
  { id: '1', originalInput: 'Dispute Chase late payment', aiOutput: 'Drafted Section 609 letter...', userCorrection: 'Changed to Goodwill approach due to account age.', rating: 'BAD', timestamp: '2 mins ago', status: 'PENDING' },
  { id: '2', originalInput: 'Client Q: How long does this take?', aiOutput: '30-45 days typically.', userCorrection: '', rating: 'GOOD', timestamp: '1 hour ago', status: 'LEARNED' },
];

const LearningCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'insights' | 'knowledge' | 'training' | 'lab'>('insights');
  
  // Knowledge Base State
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  // Feedback State
  const [feedbackQueue, setFeedbackQueue] = useState<ModelFeedback[]>(RECENT_FEEDBACK);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchKnowledgeBase(searchQuery);
    setArticles(results);
    setIsSearching(false);
  };

  const handleFeedbackAction = async (id: string, action: 'LEARN' | 'DISCARD') => {
    if (action === 'LEARN') {
      await submitModelFeedback({ id, status: 'LEARNED' });
    }
    setFeedbackQueue(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <BrainCircuit className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
            AI Learning Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Self-improving system that learns from outcomes and your expertise.
          </p>
        </div>
        
        <div className="flex gap-4 text-sm">
           <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block text-xs font-bold uppercase">Knowledge Nodes</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">1,240</span>
           </div>
           <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block text-xs font-bold uppercase">Model Accuracy</span>
              <span className="font-bold text-green-600 dark:text-green-400 text-lg">84%</span>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-6 overflow-x-auto">
        {[
          { id: 'insights', label: 'Model Insights', icon: BarChart2 },
          { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
          { id: 'training', label: 'Training Queue', icon: MessageSquare },
          { id: 'lab', label: 'Strategy Lab', icon: TestTube },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- INSIGHTS TAB --- */}
      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Performance Chart */}
           <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-white mb-6">AI vs Manual Success Rate</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={PERFORMANCE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="aiSuccess" name="AI Model" stroke="#4f46e5" strokeWidth={3} />
                    <Line type="monotone" dataKey="manualSuccess" name="Industry Avg" stroke="#94a3b8" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Strategy Leaderboard */}
           <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-white mb-6">Top Performing AI Strategies</h3>
              <div className="space-y-4">
                 {STRATEGY_DATA.map((strat, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-750 rounded-lg">
                       <div>
                          <div className="font-bold text-slate-800 dark:text-white">{strat.strategyName}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{strat.bureau} • {strat.usageCount} uses</div>
                       </div>
                       <div className="text-right">
                          <div className="text-xl font-bold text-green-600 dark:text-green-400">{strat.successRate}%</div>
                          <div className={`text-xs font-bold ${
                             strat.trend === 'UP' ? 'text-green-500' : strat.trend === 'DOWN' ? 'text-red-500' : 'text-slate-400'
                          }`}>
                             {strat.trend === 'UP' ? 'Trending Up' : strat.trend === 'DOWN' ? 'Needs Review' : 'Stable'}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* --- KNOWLEDGE BASE TAB --- */}
      {activeTab === 'knowledge' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
           <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">Semantic Search</h3>
              <div className="relative mb-4">
                 <input 
                    type="text" 
                    placeholder="Search regulations, scripts..." 
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-700 dark:text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                 />
                 <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
              <button 
                 onClick={handleSearch}
                 disabled={isSearching}
                 className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors mb-6"
              >
                 {isSearching ? 'Searching Neural Net...' : 'Search Knowledge Base'}
              </button>

              <div className="flex-1 overflow-y-auto space-y-2">
                 {articles.map((article) => (
                    <div 
                       key={article.id} 
                       onClick={() => setSelectedArticle(article)}
                       className={`p-3 rounded-lg cursor-pointer border transition-all ${
                          selectedArticle?.id === article.id 
                             ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-700' 
                             : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700'
                       }`}
                    >
                       <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-slate-600 dark:text-slate-300">
                             {article.category}
                          </span>
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                             {article.confidenceScore}% Match
                          </span>
                       </div>
                       <h4 className="font-bold text-sm text-slate-800 dark:text-white">{article.title}</h4>
                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{article.summary}</p>
                    </div>
                 ))}
                 {articles.length === 0 && !isSearching && (
                    <div className="text-center text-slate-400 mt-10">
                       <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-20" />
                       <p>Enter a query to search the AI Knowledge Base.</p>
                    </div>
                 )}
              </div>
           </div>

           <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-y-auto">
              {selectedArticle ? (
                 <article className="prose dark:prose-invert max-w-none">
                    <div className="flex items-center gap-2 mb-4">
                       <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          {selectedArticle.category}
                       </span>
                       <span className="text-slate-300 dark:text-slate-600">|</span>
                       <span className="text-xs text-slate-500 dark:text-slate-400">Updated {selectedArticle.lastUpdated}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">{selectedArticle.title}</h1>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border-l-4 border-indigo-500 mb-8 italic text-slate-700 dark:text-slate-300">
                       {selectedArticle.summary}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                       {selectedArticle.content}
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                       <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Related Tags</h4>
                       <div className="flex gap-2">
                          {selectedArticle.tags.map(tag => (
                             <span key={tag} className="text-xs bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full text-slate-600 dark:text-slate-300">
                                #{tag}
                             </span>
                          ))}
                       </div>
                    </div>
                 </article>
              ) : (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Scale className="w-16 h-16 mb-4 opacity-20" />
                    <p>Select an article to view full details.</p>
                 </div>
              )}
           </div>
        </div>
      )}

      {/* --- TRAINING QUEUE TAB --- */}
      {activeTab === 'training' && (
         <div className="grid grid-cols-1 gap-6">
            <div className="bg-indigo-600 rounded-xl p-6 text-white flex items-center justify-between">
               <div>
                  <h3 className="font-bold text-lg">Continuous Improvement Loop</h3>
                  <p className="text-indigo-100 opacity-90 text-sm max-w-xl">
                     Review instances where the AI needed manual correction. Approving corrections helps retrain the model for better future performance.
                  </p>
               </div>
               <div className="text-right">
                  <div className="text-3xl font-bold">{feedbackQueue.length}</div>
                  <div className="text-xs uppercase font-bold opacity-70">Pending Reviews</div>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
               <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {feedbackQueue.map((item) => (
                     <div key={item.id} className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                           <div className="flex-1 space-y-4">
                              <div>
                                 <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">User Input</h4>
                                 <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm text-slate-700 dark:text-slate-300 font-mono">
                                    {item.originalInput}
                                 </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                    <h4 className="text-xs font-bold text-red-400 uppercase mb-1 flex items-center">
                                       <Zap className="w-3 h-3 mr-1" /> Original AI Output
                                    </h4>
                                    <div className="p-3 border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                                       {item.aiOutput}
                                    </div>
                                 </div>
                                 <div>
                                    <h4 className="text-xs font-bold text-green-500 uppercase mb-1 flex items-center">
                                       <Edit2 className="w-3 h-3 mr-1" /> Human Correction
                                    </h4>
                                    <div className="p-3 border border-green-100 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10 rounded-lg text-sm text-slate-800 dark:text-white">
                                       {item.userCorrection || "(User flagged as bad without text correction)"}
                                    </div>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="flex md:flex-col justify-center gap-3 min-w-[150px]">
                              <button 
                                 onClick={() => handleFeedbackAction(item.id, 'LEARN')}
                                 className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                              >
                                 <Check className="w-4 h-4 mr-2" /> Train
                              </button>
                              <button 
                                 onClick={() => handleFeedbackAction(item.id, 'DISCARD')}
                                 className="flex-1 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center"
                              >
                                 <ArrowRight className="w-4 h-4 mr-2" /> Skip
                              </button>
                           </div>
                        </div>
                     </div>
                  ))}
                  {feedbackQueue.length === 0 && (
                     <div className="p-12 text-center text-slate-400">
                        <Check className="w-12 h-12 mx-auto mb-3 text-green-500" />
                        <h3 className="text-lg font-bold text-slate-700 dark:text-white">All Caught Up!</h3>
                        <p>No new training data to review.</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}

      {/* --- STRATEGY LAB TAB --- */}
      {activeTab === 'lab' && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
               <h3 className="font-bold text-slate-800 dark:text-white mb-2">A/B Testing Active Experiments</h3>
               <p className="text-sm text-slate-500 mb-6">Comparing dispute letter variations for effectiveness.</p>
               
               <div className="space-y-6">
                  <div>
                     <div className="flex justify-between text-sm mb-2">
                        <span className="font-bold text-slate-700 dark:text-slate-200">Experiment #442: Goodwill Intro Phrasing</span>
                        <span className="text-indigo-600 dark:text-indigo-400">Running (14 days left)</span>
                     </div>
                     <div className="space-y-2">
                        <div className="relative pt-1">
                           <div className="flex mb-2 items-center justify-between">
                              <span className="text-xs font-semibold inline-block text-slate-600 dark:text-slate-300">Variant A: "Respectful Request" (Control)</span>
                              <span className="text-xs font-semibold inline-block text-indigo-600 dark:text-indigo-400">32% Response</span>
                           </div>
                           <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-100 dark:bg-slate-700">
                              <div style={{ width: "32%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
                           </div>
                        </div>
                        <div className="relative pt-1">
                           <div className="flex mb-2 items-center justify-between">
                              <span className="text-xs font-semibold inline-block text-slate-600 dark:text-slate-300">Variant B: "Loyalty Emphasis" (Challenger)</span>
                              <span className="text-xs font-semibold inline-block text-green-600 dark:text-green-400">45% Response</span>
                           </div>
                           <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-100 dark:bg-slate-700">
                              <div style={{ width: "45%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
               <TestTube className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
               <h3 className="text-xl font-bold text-slate-800 dark:text-white">Create New Experiment</h3>
               <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
                  Test new dispute strategies or letter templates against your current best performers.
               </p>
               <button className="px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                  Launch Experiment
               </button>
            </div>
         </div>
      )}

    </div>
  );
};

export default LearningCenter;