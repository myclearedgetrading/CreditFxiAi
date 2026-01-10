import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  Users, FileCheck, TrendingUp, DollarSign, 
  Clock, CheckCircle, AlertTriangle, Zap,
  Activity, MoreHorizontal, ArrowRight, Camera, MessageSquare, Shield, CreditCard, Mic,
  Target, Award
} from 'lucide-react';
import { MOCK_STATS, MOCK_TASKS, MOCK_ACTIVITIES, MOCK_CLIENTS } from '../constants';
import { Task, ActivityLog } from '../types';
import { vibrate, HAPTIC, startVoiceListening } from '../services/mobileService';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

// ... (Existing Charts config remains same)
const revenueData = [
  { name: 'Jan', revenue: 12000 },
  { name: 'Feb', revenue: 15000 },
  { name: 'Mar', revenue: 14500 },
  { name: 'Apr', revenue: 18000 },
  { name: 'May', revenue: 21500 },
  { name: 'Jun', revenue: 24500 },
];

const disputeData = [
  { name: 'Deleted', value: 35, color: '#22c55e' },
  { name: 'Updated', value: 25, color: '#3b82f6' },
  { name: 'Verified', value: 40, color: '#64748b' },
];

// Client specific data
const scoreHistory = [
  { month: 'Jul', score: 580 },
  { month: 'Aug', score: 585 },
  { month: 'Sep', score: 602 },
  { month: 'Oct', score: 615 },
  { month: 'Nov', score: 624 },
  { month: 'Dec', score: 642 },
];

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
          <div className={`text-3xl font-bold ${color}`}>{score}</div>
          <div className="text-xs text-slate-400 uppercase font-bold">{bureau}</div>
        </div>
      </div>
      <div className={`text-sm font-medium ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {diff > 0 ? '+' : ''}{diff} pts
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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome back, James!</h1>
          <p className="text-slate-500 dark:text-slate-400">Here is your credit health overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.</p>
        </div>

        {/* Client Score Cards */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Credit Scores</h3>
          <div className="flex flex-col md:flex-row justify-around items-center">
            <ScoreCircle bureau="Equifax" score={642} prevScore={620} />
            <div className="hidden md:block w-px h-32 bg-slate-100 dark:bg-slate-700"></div>
            <ScoreCircle bureau="Experian" score={638} prevScore={635} />
            <div className="hidden md:block w-px h-32 bg-slate-100 dark:bg-slate-700"></div>
            <ScoreCircle bureau="TransUnion" score={645} prevScore={615} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Score History</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreHistory}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis domain={['dataMin - 10', 'dataMax + 10']} axisLine={false} tickLine={false} />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action Items */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Next Steps</h3>
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-indigo-700 dark:text-indigo-300 text-sm">Upload Utility Bill</h4>
                  <Camera className="w-4 h-4 text-indigo-500" />
                </div>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Required for address verification.</p>
                <button className="mt-2 text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Upload Now</button>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-600 opacity-70">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Watch "Credit Basics"</h4>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Completed yesterday</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Recent Wins & Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full text-green-600 dark:text-green-200">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-green-800 dark:text-green-300 text-sm">Collection Removed</h4>
                  <p className="text-xs text-green-700 dark:text-green-400">Midland Funding account deleted from Equifax.</p>
                </div>
              </div>
              <span className="text-xs font-bold text-green-600 dark:text-green-400">2 days ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 border-b border-slate-50 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-white text-sm">Dispute Letter Sent</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Round 2 challenge sent to TransUnion.</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">5 days ago</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD (Existing)
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
          trend="+1 this week"
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
          trend="+5% vs avg"
        />
        <StatCard 
          title="Est. Revenue" 
          value={`$${MOCK_STATS.revenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-emerald-600"
          trend="+8% this mo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area - Revenue */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Revenue Trend (MRR)</h3>
            <select className="text-sm border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 focus:ring-indigo-500 bg-white dark:bg-slate-700">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `$${value/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dispute Outcome Chart */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Dispute Outcomes</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Results from last 30 days</p>
          <div className="h-48">
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
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {disputeData.map((item) => (
              <div key={item.name} className="flex items-center text-xs">
                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span className="text-slate-600 dark:text-slate-300">{item.name} ({item.value}%)</span>
              </div>
            ))}
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
            <span className="bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-full">3 Overdue</span>
          </div>
          <div className="flex-1 overflow-auto max-h-[300px]">
            {MOCK_TASKS.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
          <button className="p-3 text-sm text-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border-t border-slate-100 dark:border-slate-700 rounded-b-xl active:bg-slate-100 dark:active:bg-slate-700">
            View All Tasks
          </button>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
             <h3 className="text-lg font-bold text-slate-800 dark:text-white">Live Activity</h3>
             <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
          </div>
          <div className="p-6 flex-1 overflow-auto max-h-[300px]">
             <div className="space-y-2">
                {MOCK_ACTIVITIES.map((log) => (
                  <ActivityItem key={log.id} log={log} />
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;