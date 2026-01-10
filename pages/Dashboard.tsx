import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, FileCheck, TrendingUp, DollarSign, 
  Clock, CheckCircle, Zap,
  Activity, MoreHorizontal, ArrowRight, Camera, MessageSquare, Shield, CreditCard, Mic,
  Inbox
} from 'lucide-react';
import { MOCK_STATS, MOCK_TASKS, MOCK_ACTIVITIES, MOCK_CLIENTS } from '../constants';
import { Task, ActivityLog } from '../types';
import { vibrate, HAPTIC, startVoiceListening } from '../services/mobileService';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

// Empty Data Placeholders
const revenueData: any[] = [];
const disputeData: any[] = [];
const scoreHistory: any[] = [];

const StatCard = ({ title, value, icon: Icon, color, trend }: { title: string, value: string, icon: any, color: string, trend?: string }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between transition-colors">
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-full ${color} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')} dark:text-white`} />
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{value}</h3>
      </div>
    </div>
    {trend && (
      <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
        {trend}
      </span>
    )}
  </div>
);

const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
  const priorityColor = 
    task.priority === 'HIGH' ? 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' : 
    task.priority === 'MEDIUM' ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400' : 
    'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';

  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors active:bg-slate-100 dark:active:bg-slate-700" onClick={() => vibrate(HAPTIC.LIGHT)}>
      <div className="flex items-start space-x-3">
        <button className="mt-1 text-slate-300 dark:text-slate-600 hover:text-green-500 dark:hover:text-green-400 transition-colors">
          <CheckCircle className="w-5 h-5" />
        </button>
        <div>
          <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">{task.title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">{task.clientName} • <span className={task.dueDate === 'Overdue' ? 'text-red-500 dark:text-red-400 font-bold' : ''}>{task.dueDate}</span></p>
        </div>
      </div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${priorityColor}`}>
        {task.priority}
      </span>
    </div>
  );
};

const ActivityItem: React.FC<{ log: ActivityLog }> = ({ log }) => {
  const Icon = log.type === 'AI' ? Zap : log.type === 'USER' ? Users : Activity;
  const color = log.type === 'AI' ? 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400' : log.type === 'USER' ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400' : 'text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-400';

  return (
    <div className="flex items-start space-x-3 py-3">
      <div className={`p-2 rounded-lg ${color} mt-1`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{log.action}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{log.description}</p>
      </div>
      <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">{log.timestamp}</span>
    </div>
  );
};

const QuickActionButton = ({ icon: Icon, label, color, onClick }: any) => (
  <button 
    onClick={() => { vibrate(HAPTIC.MEDIUM); onClick(); }}
    className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 active:scale-95 transition-transform"
  >
    <div className={`p-3 rounded-full ${color} bg-opacity-10 dark:bg-opacity-20 mb-2`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')} dark:text-white`} />
    </div>
    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
  </button>
);

const ScoreCircle = ({ bureau, score, prevScore }: { bureau: string, score: number, prevScore: number }) => {
  const diff = score - prevScore;
  const color = score >= 700 ? 'text-green-500' : score >= 600 ? 'text-yellow-500' : 'text-red-500';
  const ringColor = score >= 700 ? 'stroke-green-500' : score >= 600 ? 'stroke-yellow-500' : 'stroke-red-500';
  const percentage = (score / 850) * 100;
  
  return (
    <div className="flex flex-col items-center p-4">
      <div className="relative w-32 h-32 flex items-center justify-center mb-3">
        <svg className="absolute w-full h-full -rotate-90">
          <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-700" />
          <circle 
            cx="64" cy="64" r="56" 
            stroke="currentColor" strokeWidth="8" fill="transparent" 
            className={`${ringColor} transition-all duration-1000 ease-out`}
            strokeDasharray={`${percentage * 3.51} 351`} 
            strokeLinecap="round" 
          />
        </svg>
        <div className="text-center">
          <div className={`text-3xl font-bold ${color}`}>{score || '-'}</div>
          <div className="text-xs text-slate-400 uppercase font-bold">{bureau}</div>
        </div>
      </div>
      <div className={`text-sm font-medium ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {score ? `${diff > 0 ? '+' : ''}${diff} pts` : 'No Data'}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const { role } = useUser();

  const handleVoiceCommand = () => {
    setListening(true);
    vibrate(HAPTIC.MEDIUM);
    startVoiceListening((text) => {
      setListening(false);
      alert(`Voice Command Recognized: "${text}"\n(Simulating Action...)`);
      if (text.includes('chat') || text.includes('message')) navigate('/communication');
      if (text.includes('score') || text.includes('report')) navigate('/reports');
      if (text.includes('scan') || text.includes('upload')) navigate('/analysis');
    });
  };

  if (role === 'CLIENT') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome!</h1>
          <p className="text-slate-500 dark:text-slate-400">Complete your onboarding to see your credit health overview.</p>
        </div>

        {/* Onboarding Banner Trigger */}
        <div 
          onClick={() => navigate('/onboarding')}
          className="bg-indigo-600 text-white rounded-xl p-6 shadow-lg cursor-pointer transform hover:scale-[1.01] transition-all relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded">ACTION REQUIRED</span>
              </div>
              <h3 className="text-xl font-bold mb-1">Complete Your Setup</h3>
              <p className="text-indigo-100 text-sm max-w-md">
                We need a few more details to start challenging negative items. Finish your profile to begin the dispute process.
              </p>
            </div>
            <div className="bg-white text-indigo-600 p-3 rounded-full shadow-sm">
              <ArrowRight className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Client Score Cards */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Credit Scores</h3>
          <div className="flex flex-col md:flex-row justify-around items-center">
            <ScoreCircle bureau="Equifax" score={0} prevScore={0} />
            <div className="hidden md:block w-px h-32 bg-slate-100 dark:bg-slate-700"></div>
            <ScoreCircle bureau="Experian" score={0} prevScore={0} />
            <div className="hidden md:block w-px h-32 bg-slate-100 dark:bg-slate-700"></div>
            <ScoreCircle bureau="TransUnion" score={0} prevScore={0} />
          </div>
        </div>

        {/* Action Items - Empty State */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Next Steps</h3>
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <Inbox className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm">No pending actions. You're all caught up!</p>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD (Clean State)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Overview of your credit repair business.</p>
        </div>
        <button 
          onClick={handleVoiceCommand}
          className={`flex items-center p-3 rounded-full shadow-md transition-all ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'}`}
        >
          <Mic className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Quick Actions Grid */}
      <div className="grid grid-cols-4 gap-3 lg:hidden">
        <QuickActionButton icon={Camera} label="Scan Doc" color="bg-indigo-600" onClick={() => navigate('/analysis')} />
        <QuickActionButton icon={Shield} label="Dispute" color="bg-green-600" onClick={() => navigate('/disputes')} />
        <QuickActionButton icon={MessageSquare} label="Chat" color="bg-blue-600" onClick={() => navigate('/communication')} />
        <QuickActionButton icon={CreditCard} label="Pay" color="bg-orange-600" onClick={() => alert('Opening Payment Gateway')} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Clients" 
          value={MOCK_CLIENTS.length.toString()} 
          icon={Users} 
          color="bg-blue-600"
        />
        <StatCard 
          title="Disputes Sent" 
          value={MOCK_STATS.disputesSent.toString()} 
          icon={FileCheck} 
          color="bg-indigo-600" 
        />
        <StatCard 
          title="Items Deleted" 
          value={MOCK_STATS.itemsDeleted.toString()} 
          icon={TrendingUp} 
          color="bg-green-600"
        />
        <StatCard 
          title="Est. Revenue" 
          value={`$${MOCK_STATS.revenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area - Revenue */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Revenue Trend (MRR)</h3>
            <select className="text-sm border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 focus:ring-indigo-500 bg-white dark:bg-slate-700">
              <option>This Year</option>
            </select>
          </div>
          <div className="h-80 flex items-center justify-center">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `$${value/1000}k`} />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-center">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No revenue data available yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Dispute Outcome Chart */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Dispute Outcomes</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Results from last 30 days</p>
          <div className="h-48 flex items-center justify-center">
            {disputeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={disputeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {disputeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-center">
                <FileCheck className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No disputes processed yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Widget */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
              <Clock className="w-5 h-5 mr-2 text-slate-400" />
              Action Required
            </h3>
          </div>
          <div className="flex-1 overflow-auto max-h-[300px] min-h-[150px] flex items-center justify-center">
            {MOCK_TASKS.length > 0 ? (
              <div className="w-full">
                {MOCK_TASKS.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="text-slate-400 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>All tasks completed.</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
             <h3 className="text-lg font-bold text-slate-800 dark:text-white">Live Activity</h3>
          </div>
          <div className="p-6 flex-1 overflow-auto max-h-[300px] min-h-[150px] flex items-center justify-center">
             {MOCK_ACTIVITIES.length > 0 ? (
                <div className="space-y-2 w-full">
                  {MOCK_ACTIVITIES.map((log) => (
                    <ActivityItem key={log.id} log={log} />
                  ))}
                </div>
             ) : (
               <div className="text-slate-400 text-center">
                 <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
                 <p>No recent activity.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;