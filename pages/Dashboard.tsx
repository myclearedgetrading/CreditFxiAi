
import React, { useState } from 'react';
import { 
  ShieldCheck, TrendingUp, DollarSign, Building2, 
  CheckCircle2, ArrowRight, AlertTriangle, Briefcase, 
  Lock, CreditCard, User, Download, FileSearch, MessageSquare
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { HAPTIC, vibrate } from '../services/mobileService';

const ScoreCircle = ({ bureau, score, prevScore }: { bureau: string, score: number, prevScore: number }) => {
  const diff = score - prevScore;
  const color = score >= 700 ? 'text-green-500' : score >= 600 ? 'text-yellow-500' : 'text-red-500';
  const ringColor = score >= 700 ? 'stroke-green-500' : score >= 600 ? 'stroke-yellow-500' : 'stroke-red-500';
  const percentage = (score / 850) * 100;
  
  return (
    <div className="flex flex-col items-center p-4">
      <div className="relative w-28 h-28 lg:w-32 lg:h-32 flex items-center justify-center mb-3">
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
          <div className={`text-2xl lg:text-3xl font-bold ${color}`}>{score || '-'}</div>
          <div className="text-[10px] lg:text-xs text-slate-500 uppercase font-bold">{bureau}</div>
        </div>
      </div>
      <div className={`text-sm font-medium ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {score ? `${diff > 0 ? '+' : ''}${diff} pts` : 'No Data'}
      </div>
    </div>
  );
};

const FundingReadinessCard = ({ percentage }: { percentage: number }) => (
  <div className="bg-gradient-to-br from-orange-900/80 to-slate-900 rounded-xl p-6 text-white relative overflow-hidden border border-orange-900/30">
    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-5 h-5 text-orange-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-orange-300">Funding Readiness</span>
        </div>
        <h3 className="text-2xl font-bold mb-1">{percentage}% Compliant</h3>
        <p className="text-sm text-slate-400">Your business is almost ready for Tier 2 Funding.</p>
      </div>
      
      <div className="mt-6">
        <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
          <div className="bg-orange-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Tier 1 (Complete)</span>
          <span>Target: Tier 2</span>
        </div>
      </div>
    </div>
  </div>
);

const ActionCard = ({ title, desc, icon: Icon, onClick, cta, step }: any) => (
  <div 
    onClick={onClick}
    className="bg-[#0A0A0A] p-5 rounded-xl border border-slate-800 shadow-sm hover:shadow-md hover:border-orange-500/50 transition-all cursor-pointer group relative overflow-hidden"
  >
    {step && (
      <div className="absolute top-0 right-0 bg-slate-900 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg border-l border-b border-slate-800">
        {step}
      </div>
    )}
    <div className="flex justify-between items-start mb-3">
      <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-orange-600 transition-colors border border-slate-800 group-hover:border-orange-500">
        <Icon className="w-6 h-6 text-orange-500 group-hover:text-white" />
      </div>
      <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-orange-500 transition-colors" />
    </div>
    <h4 className="font-bold text-white mb-1">{title}</h4>
    <p className="text-xs text-slate-400 mb-3">{desc}</p>
    <span className="text-xs font-bold text-orange-500 uppercase tracking-wide">{cta}</span>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  // Mock Score History
  const scoreHistory = [
    { month: 'Jun', score: 580 }, { month: 'Jul', score: 595 },
    { month: 'Aug', score: 610 }, { month: 'Sep', score: 605 },
    { month: 'Oct', score: 625 }, { month: 'Nov', score: 642 },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Hello, {user.firstName}!
          </h1>
          <p className="text-slate-400">
            Follow the steps below to repair your credit.
          </p>
        </div>
        <button 
          onClick={() => navigate('/analysis')}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-orange-900/20 transition-colors text-sm flex items-center"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Update Report
        </button>
      </div>

      {/* Top Grid: Scores & Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Personal Credit Scores */}
        <div className="lg:col-span-2 bg-[#0A0A0A] rounded-xl shadow-sm border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="font-bold text-white flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-green-500" />
              Personal Credit Profile
            </h3>
            <span className="text-xs text-slate-500">Last updated: Today</span>
          </div>
          <div className="flex flex-col md:flex-row justify-around items-center">
            <ScoreCircle bureau="Equifax" score={user.creditScore.equifax} prevScore={630} />
            <div className="hidden md:block w-px h-24 bg-slate-800"></div>
            <ScoreCircle bureau="Experian" score={user.creditScore.experian} prevScore={635} />
            <div className="hidden md:block w-px h-24 bg-slate-800"></div>
            <ScoreCircle bureau="TransUnion" score={user.creditScore.transunion} prevScore={640} />
          </div>
        </div>

        {/* Business Funding Readiness */}
        <div className="lg:col-span-1">
          <FundingReadinessCard percentage={65} />
        </div>
      </div>

      {/* Quick Actions / Journey Path */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Your Repair Journey</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            onClick={() => navigate('/onboarding', { state: { step: 2 } })}
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
            <select className="text-xs border-slate-700 rounded-lg p-1 bg-slate-900 text-white">
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="h-64">
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
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800 hover:border-orange-500/30 transition-colors">
              <div className="mt-1">
                <Lock className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Unfreeze Experian</p>
                <p className="text-xs text-slate-400">Required before applying for Chase Ink.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800 hover:border-orange-500/30 transition-colors">
              <div className="mt-1">
                <Building2 className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Get DUNS Number</p>
                <p className="text-xs text-slate-400">Step 2 of Business Foundation.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800 hover:border-orange-500/30 transition-colors">
              <div className="mt-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Dispute Letter Ready</p>
                <p className="text-xs text-slate-400">Review and print for Equifax.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
