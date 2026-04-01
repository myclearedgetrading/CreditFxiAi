
import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, TrendingUp, DollarSign, Building2, 
  CheckCircle2, ArrowRight, AlertTriangle, Briefcase, 
  Lock, CreditCard, User, Download, FileSearch, MessageSquare, Plus, Clock3, Sparkles
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { RepairTask, Deadline } from '../types';
import { getUpcomingDeadlines, subscribeToRepairTasks, tenantCompanyId } from '../services/firebaseService';
import { featureFlags } from '../services/featureFlags';

const ScoreCircle = ({ bureau, score, prevScore }: { bureau: string, score: number, prevScore: number }) => {
  // Handle empty/zero score
  if (!score) {
    return (
        <div className="flex flex-col items-center p-2 sm:p-4">
            <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full border-4 border-slate-800 flex items-center justify-center mb-2 sm:mb-3">
                <span className="text-slate-600 text-xs sm:text-sm">No Data</span>
            </div>
            <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-500 uppercase font-bold">{bureau}</div>
        </div>
    );
  }

  const diff = score - prevScore;
  const color = score >= 700 ? 'text-green-500' : score >= 600 ? 'text-yellow-500' : 'text-red-500';
  const ringColor = score >= 700 ? 'stroke-green-500' : score >= 600 ? 'stroke-yellow-500' : 'stroke-red-500';
  const percentage = (score / 850) * 100;
  
  return (
    <div className="flex flex-col items-center p-2 sm:p-4">
      <div className="relative w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 flex items-center justify-center mb-2 sm:mb-3">
        <svg className="absolute w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
          <circle 
            cx="50%" cy="50%" r="45%"
            stroke="currentColor" strokeWidth="8" fill="transparent" 
            className={`${ringColor} transition-all duration-1000 ease-out`}
            strokeDasharray={`${percentage * 2.8} 280`} 
            strokeLinecap="round" 
          />
        </svg>
        <div className="text-center">
          <div className={`text-xl sm:text-2xl lg:text-3xl font-bold ${color}`}>{score || '-'}</div>
          <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-500 uppercase font-bold">{bureau}</div>
        </div>
      </div>
      <div className={`text-xs sm:text-sm font-medium ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {score ? `${diff > 0 ? '+' : ''}${diff} pts` : ''}
      </div>
    </div>
  );
};

const ActionCard = ({ title, desc, icon: Icon, onClick, cta, step }: any) => (
  <div 
    onClick={onClick}
    className="bg-[#0A0A0A] p-4 sm:p-5 rounded-xl border border-slate-800 shadow-sm hover:shadow-md hover:border-orange-500/50 transition-all cursor-pointer group relative overflow-hidden h-full flex flex-col justify-between"
  >
    {step && (
      <div className="absolute top-0 right-0 bg-slate-900 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg border-l border-b border-slate-800">
        {step}
      </div>
    )}
    <div>
      <div className="flex justify-between items-start mb-3">
        <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-orange-600 transition-colors border border-slate-800 group-hover:border-orange-500">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 group-hover:text-white" />
        </div>
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 group-hover:text-orange-500 transition-colors" />
      </div>
      <h4 className="font-bold text-white mb-1 text-sm sm:text-base">{title}</h4>
      <p className="text-xs text-slate-400 mb-3 leading-snug">{desc}</p>
    </div>
    <span className="text-[10px] sm:text-xs font-bold text-orange-500 uppercase tracking-wide block">{cta}</span>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [todayTasks, setTodayTasks] = useState<RepairTask[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Deadline[]>([]);

  // Empty default history
  const scoreHistory: any[] = [];

  useEffect(() => {
    if (!featureFlags.nextLevelDIY || !user.id) return;
    const companyId = tenantCompanyId(user);
    const unsubscribe = subscribeToRepairTasks(companyId, setTodayTasks);
    void getUpcomingDeadlines(companyId).then(setUpcomingDeadlines).catch(() => setUpcomingDeadlines([]));
    return () => unsubscribe();
  }, [user, featureFlags.nextLevelDIY]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {user.firstName ? `Hello, ${user.firstName}!` : 'Welcome back!'}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Track your credit repair journey and financial health.
          </p>
        </div>
        <button 
          onClick={() => navigate('/analysis')}
          className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-orange-900/20 transition-colors text-sm flex items-center justify-center"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Update Report
        </button>
      </div>

      <div className="bg-[#0A0A0A] rounded-xl shadow-sm border border-slate-800 p-4 sm:p-5">
        {user.lastReportAnalysisAt ? (
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 font-bold flex items-center gap-2">
                <Clock3 className="w-3.5 h-3.5 text-orange-500" />
                Last Report Analysis
              </p>
              <p className="text-sm text-slate-200 mt-1">
                {new Date(user.lastReportAnalysisAt).toLocaleString()} - {user.lastReportFileName || 'Uploaded report'} ({user.lastReportSource || 'UNKNOWN'})
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {user.lastNegativeItemCount ?? 0} negative item(s) detected, potential gain +{user.lastEstimatedScoreImprovement ?? 0} pts.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/analysis')}
                className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold"
              >
                Re-analyze
              </button>
              <button
                onClick={() => navigate('/disputes')}
                className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold"
              >
                Open Disputes
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 font-bold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                New AI Report Workflow
              </p>
              <p className="text-sm text-slate-300 mt-1">
                Upload a PDF or image credit report to auto-detect negative items and prep dispute letters.
              </p>
            </div>
            <button
              onClick={() => navigate('/analysis')}
              className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold"
            >
              Analyze my report
            </button>
          </div>
        )}
      </div>

      {/* Top Grid: Scores */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-[#0A0A0A] rounded-xl shadow-sm border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="font-bold text-white flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-green-500" />
              Personal Credit Profile
            </h3>
            <span className="text-xs text-slate-500">
                {user.creditScore.experian > 0 ? 'Last updated: Recent' : 'No data connected'}
            </span>
          </div>
          
          {user.creditScore.experian > 0 ? (
              <div className="grid grid-cols-3 gap-2 md:flex md:flex-row md:justify-around md:items-center">
                <ScoreCircle bureau="Equifax" score={user.creditScore.equifax} prevScore={user.creditScore.equifax} />
                <div className="hidden md:block w-px h-24 bg-slate-800"></div>
                <ScoreCircle bureau="Experian" score={user.creditScore.experian} prevScore={user.creditScore.experian} />
                <div className="hidden md:block w-px h-24 bg-slate-800"></div>
                <ScoreCircle bureau="TransUnion" score={user.creditScore.transunion} prevScore={user.creditScore.transunion} />
              </div>
          ) : (
              <div className="py-10 text-center">
                  <p className="text-slate-400 mb-4">Connect your credit report to see your scores.</p>
                  <button onClick={() => navigate('/analysis', { state: { openConnect: true } })} className="text-orange-500 hover:underline text-sm font-bold">Connect Report Now</button>
              </div>
          )}
        </div>
      </div>

      {/* Quick Actions / Journey Path */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Your Repair Journey</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <ActionCard 
            step="STEP 1"
            title="Update Profile" 
            desc="Verify your personal information." 
            icon={User} 
            onClick={() => navigate('/settings')}
            cta="Edit Info"
          />
          <ActionCard 
            step="STEP 2"
            title="Import Report" 
            desc="Pull latest data from monitoring." 
            icon={Download} 
            onClick={() => navigate('/analysis', { state: { openConnect: true } })}
            cta="Connect"
          />
          <ActionCard 
            step="STEP 3"
            title="Start Dispute" 
            desc="Challenge negative items found." 
            icon={MessageSquare} 
            onClick={() => navigate('/disputes')}
            cta="Create Letter"
          />
          <ActionCard 
            step="STEP 4"
            title="Credit Audit" 
            desc="AI deep analysis of results." 
            icon={FileSearch} 
            onClick={() => navigate('/analysis')}
            cta="View Audit"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Score History Chart */}
        <div className="lg:col-span-2 bg-[#0A0A0A] p-6 rounded-xl shadow-sm border border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white">Credit Score Growth</h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            {scoreHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreHistory}>
                    <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis domain={['dataMin - 20', 'dataMax + 20']} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="score" stroke="#f97316" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="text-center text-slate-500">
                    <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Not enough data for chart.</p>
                </div>
            )}
          </div>
        </div>

        {/* Priority Tasks */}
        <div className="lg:col-span-1 bg-[#0A0A0A] rounded-xl shadow-sm border border-slate-800 flex flex-col">
          <div className="p-5 border-b border-slate-800">
            <h3 className="font-bold text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              Action Required
            </h3>
          </div>
          <div className="p-4 space-y-3 flex-1 overflow-y-auto min-h-[200px]">
            {featureFlags.nextLevelDIY && todayTasks.length > 0 ? (
              <div className="space-y-3">
                {todayTasks.slice(0, 6).map((task) => (
                  <div key={task.id} className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{task.title}</p>
                        <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        task.priorityLabel === 'CRITICAL' ? 'bg-red-900/40 text-red-400' :
                        task.priorityLabel === 'HIGH' ? 'bg-orange-900/40 text-orange-400' :
                        task.priorityLabel === 'MEDIUM' ? 'bg-yellow-900/40 text-yellow-400' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {task.priorityLabel}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] text-green-400 font-bold">
                        Est. impact: +{task.estimatedScoreImpact} pts
                      </span>
                      <button
                        onClick={() => navigate('/disputes')}
                        className="text-xs text-orange-500 font-bold hover:underline"
                      >
                        Do now
                      </button>
                    </div>
                  </div>
                ))}
                {upcomingDeadlines.length > 0 && (
                  <div className="pt-3 border-t border-slate-800">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-2 font-bold">
                      Upcoming Deadlines
                    </p>
                    {upcomingDeadlines.slice(0, 2).map((d) => (
                      <p key={d.id} className="text-xs text-slate-400">
                        {new Date(d.dueAt).toLocaleDateString()} - {d.deadlineType}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <CheckCircle2 className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">You're all caught up!</p>
                  <button onClick={() => navigate('/analysis')} className="mt-2 text-xs text-orange-500 font-bold hover:underline flex items-center">
                      <Plus className="w-3 h-3 mr-1" /> Scan for Issues
                  </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
