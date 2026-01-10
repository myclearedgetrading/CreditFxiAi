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

// --- MOCK DATA FOR DIY USER ---

const SCORE_HISTORY = [
  { month: 'Jan', equifax: 580, experian: 585, transunion: 578 },
  { month: 'Feb', equifax: 592, experian: 595, transunion: 585 },
  { month: 'Mar', equifax: 605, experian: 610, transunion: 600 },
  { month: 'Apr', equifax: 615, experian: 622, transunion: 610 },
  { month: 'May', equifax: 630, experian: 635, transunion: 628 },
  { month: 'Jun', equifax: 642, experian: 645, transunion: 640 },
];

const DISPUTE_STATUS = [
  { name: 'Deleted', value: 4, color: '#22c55e' }, // Green
  { name: 'In Progress', value: 3, color: '#3b82f6' }, // Blue
  { name: 'Verified', value: 2, color: '#ef4444' }, // Red
  { name: 'Drafting', value: 5, color: '#94a3b8' }, // Slate
];

const RECENT_ACTIVITY = [
  { id: 1, date: 'June 15', title: 'Score Update', description: 'Equifax score increased by +12 points.', type: 'POSITIVE' },
  { id: 2, date: 'June 10', title: 'Item Deleted', description: 'Midland Credit collection removed from TransUnion.', type: 'POSITIVE' },
  { id: 3, date: 'June 01', title: 'Dispute Sent', description: 'Round 2 "Method of Verification" letters sent to Experian.', type: 'NEUTRAL' },
  { id: 4, date: 'May 20', title: 'Inquiry Removed', description: 'Chase unauthorized inquiry removed from Equifax.', type: 'POSITIVE' },
  { id: 5, date: 'May 15', title: 'Report Uploaded', description: 'New IdentityIQ report processed.', type: 'NEUTRAL' },
];

const Reports: React.FC = () => {
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    loadPersonalSummary();
  }, []);

  const loadPersonalSummary = async () => {
    setLoadingSummary(true);
    // Simulating AI analyzing personal data
    try {
      const summary = await generateExecutiveSummary({
        userType: 'DIY_CONSUMER',
        startScore: 580,
        currentScore: 642,
        totalDeleted: 4,
        timeframe: '6 months'
      });
      setAiSummary(summary || "Great progress! You've increased your score by 62 points in 6 months. Focus on lowering utilization next.");
    } catch (e) {
      setAiSummary("Great progress! You've increased your score by 62 points in 6 months. Focus on lowering utilization next.");
    }
    setLoadingSummary(false);
  };

  const totalPointsGained = SCORE_HISTORY[SCORE_HISTORY.length - 1].equifax - SCORE_HISTORY[0].equifax;

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
        
        <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-bold flex items-center shadow-sm">
          <ArrowUp className="w-5 h-5 mr-1" />
          +{totalPointsGained} Points Total
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
              {aiSummary}
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
          <p className="text-2xl font-bold text-slate-800 dark:text-white">4</p>
          <p className="text-xs text-slate-400 mt-1">Valued at ~$2,400 debt</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold uppercase">Active Disputes</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">3</p>
          <p className="text-xs text-slate-400 mt-1">Round 2 in progress</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
            <Shield className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-bold uppercase">Current Score</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">642</p>
          <p className="text-xs text-green-500 mt-1 font-bold">+12 this month</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold uppercase">Est. Completion</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">Oct '24</p>
          <p className="text-xs text-slate-400 mt-1">Based on current pace</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Score History Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white">Score History (6 Months)</h3>
            <div className="flex gap-4 text-xs font-medium">
              <div className="flex items-center"><div className="w-3 h-3 bg-indigo-500 rounded-full mr-1"/> Equifax</div>
              <div className="flex items-center"><div className="w-3 h-3 bg-purple-500 rounded-full mr-1"/> Experian</div>
              <div className="flex items-center"><div className="w-3 h-3 bg-blue-400 rounded-full mr-1"/> TransUnion</div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SCORE_HISTORY}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis domain={['dataMin - 20', 'dataMax + 20']} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="equifax" stroke="#6366f1" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="experian" stroke="#a855f7" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="transunion" stroke="#60a5fa" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dispute Status Pie */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">Dispute Outcome Funnel</h3>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DISPUTE_STATUS}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {DISPUTE_STATUS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="text-3xl font-bold text-slate-800 dark:text-white">14</span>
                <p className="text-xs text-slate-500 uppercase">Total Items</p>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {DISPUTE_STATUS.map((status, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                  <span className="text-slate-600 dark:text-slate-300">{status.name}</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-white">{status.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <h3 className="font-bold text-slate-800 dark:text-white mb-6">Recent Wins & Activity</h3>
        <div className="space-y-6 relative before:absolute before:left-[19px] before:top-10 before:bottom-0 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-700">
          {RECENT_ACTIVITY.map((item) => (
            <div key={item.id} className="relative flex items-start gap-4">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-4 border-white dark:border-slate-800
                ${item.type === 'POSITIVE' ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}
              `}>
                {item.type === 'POSITIVE' ? <TrendingUp className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.title}</h4>
                  <span className="text-xs text-slate-400">{item.date}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Reports;
