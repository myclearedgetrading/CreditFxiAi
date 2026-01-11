
import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, CheckCircle2, Clock, AlertTriangle, 
  Sparkles, ArrowUp, Activity, Calendar, Shield
} from 'lucide-react';
import { generateExecutiveSummary } from '../services/geminiService';
import { useUser } from '../context/UserContext';

const Reports: React.FC = () => {
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    // Only load summary if there is meaningful data
    if (user.creditScore.equifax > 0) {
      loadPersonalSummary();
    }
  }, [user]);

  const loadPersonalSummary = async () => {
    setLoadingSummary(true);
    try {
      const summary = await generateExecutiveSummary({
        userType: 'DIY_CONSUMER',
        startScore: user.creditScore.equifax, // Simplified logic for demo
        currentScore: user.creditScore.equifax,
        totalDeleted: 0,
        timeframe: 'current'
      });
      setAiSummary(summary || "Welcome! Once you import your credit report, this AI coach will analyze your trends and suggest improvements.");
    } catch (e) {
      setAiSummary("Ready to analyze. Connect your credit report to begin tracking progress.");
    }
    setLoadingSummary(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <TrendingUp className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
            My Progress Tracker
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track your credit repair journey, score improvements, and dispute wins.
          </p>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex items-start gap-4 z-10 relative">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg shadow-sm">
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1 flex items-center">
              AI Coach Insight
              {loadingSummary && <span className="ml-2 text-xs font-normal opacity-70 animate-pulse">Analyzing...</span>}
            </h3>
            <p className="text-indigo-100 text-sm leading-relaxed max-w-3xl">
              {aiSummary || "Welcome! Once you import your credit report, this AI coach will analyze your trends and suggest improvements."}
            </p>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xs font-bold uppercase">Items Deleted</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">0</p>
          <p className="text-xs text-slate-400 mt-1">Total removed</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold uppercase">Active Disputes</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">0</p>
          <p className="text-xs text-slate-400 mt-1">In progress</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
            <Shield className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-bold uppercase">Current Score</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{user.creditScore.experian || '-'}</p>
          <p className="text-xs text-green-500 mt-1 font-bold">Experian</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold uppercase">Est. Completion</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">-</p>
          <p className="text-xs text-slate-400 mt-1">Pending analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Score History Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white">Score History</h3>
          </div>
          <div className="h-72 flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
             <div className="text-center text-slate-400">
               <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
               <p>No history data available yet.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
