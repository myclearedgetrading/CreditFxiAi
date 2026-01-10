import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, ComposedChart, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { 
  FileText, TrendingUp, Users, DollarSign, Download, Filter, 
  PieChart as PieIcon, BarChart3, Presentation, Plus, Sparkles, Printer
} from 'lucide-react';
import { generateExecutiveSummary } from '../services/geminiService';

// --- MOCK DATA ---

const MRR_DATA = [
  { month: 'Jan', mrr: 12500, newRevenue: 2000, churn: 500 },
  { month: 'Feb', mrr: 14000, newRevenue: 2500, churn: 1000 },
  { month: 'Mar', mrr: 15500, newRevenue: 2200, churn: 700 },
  { month: 'Apr', mrr: 17800, newRevenue: 2800, churn: 500 },
  { month: 'May', mrr: 21000, newRevenue: 3500, churn: 300 },
  { month: 'Jun', mrr: 24500, newRevenue: 4000, churn: 500 },
];

const BUREAU_PERFORMANCE = [
  { bureau: 'Equifax', deleted: 45, verified: 30, updated: 25 },
  { bureau: 'Experian', deleted: 38, verified: 42, updated: 20 },
  { bureau: 'TransUnion', deleted: 52, verified: 28, updated: 20 },
];

const DISPUTE_STRATEGY_STATS = [
  { strategy: 'Factual', success: 65, volume: 120 },
  { strategy: 'Validation', success: 45, volume: 80 },
  { strategy: 'Goodwill', success: 30, volume: 40 },
  { strategy: 'Identity Theft', success: 85, volume: 15 },
  { strategy: 'Late Payment', success: 55, volume: 60 },
];

const SPECIALIST_STATS = [
  { name: 'Sarah C.', revenue: 12500, disputes: 145, success: 62 },
  { name: 'James R.', revenue: 9800, disputes: 110, success: 55 },
  { name: 'Michael S.', revenue: 4200, disputes: 45, success: 40 },
];

const REVENUE_MIX = [
  { name: 'Monthly Sub', value: 65, color: '#4f46e5' },
  { name: 'Pay Per Delete', value: 25, color: '#10b981' },
  { name: 'Consulting', value: 10, color: '#f59e0b' },
];

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'executive' | 'disputes' | 'financial' | 'builder'>('executive');
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Custom Report Builder State
  const [reportConfig, setReportConfig] = useState({
    name: 'New Custom Report',
    metrics: ['revenue', 'active_clients'],
    dateRange: 'LAST_30_DAYS',
    visualization: 'BAR'
  });

  useEffect(() => {
    if (activeTab === 'executive') {
      loadExecutiveSummary();
    }
  }, [activeTab]);

  const loadExecutiveSummary = async () => {
    setLoadingSummary(true);
    const summary = await generateExecutiveSummary({
      mrr: 24500,
      growth: '15%',
      churn: '2.1%',
      topBureau: 'TransUnion'
    });
    setAiSummary(summary);
    setLoadingSummary(false);
  };

  const handleExport = () => {
    alert("Exporting report to PDF... (Simulation)");
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <Presentation className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
            Enterprise Reporting
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Real-time business intelligence and performance analytics.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center text-sm font-medium shadow-sm transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center text-sm font-medium shadow-sm transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-6 overflow-x-auto">
        {[
          { id: 'executive', label: 'Executive Dashboard', icon: BarChart3 },
          { id: 'disputes', label: 'Dispute Analytics', icon: TrendingUp },
          { id: 'financial', label: 'Financial Reports', icon: DollarSign },
          { id: 'builder', label: 'Custom Report Builder', icon: FileText },
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

      {/* --- EXECUTIVE DASHBOARD --- */}
      {activeTab === 'executive' && (
        <div className="space-y-6">
          {/* AI Insight */}
          <div className="bg-gradient-to-r from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border border-indigo-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
            <div className="flex items-start gap-4 z-10 relative">
              <div className="p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-indigo-900 dark:text-indigo-200 font-bold mb-1">AI Executive Summary</h3>
                <p className="text-indigo-800 dark:text-slate-300 text-sm leading-relaxed">
                  {loadingSummary ? "Generating insights..." : aiSummary}
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Monthly Recurring Revenue</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">$24,500</h3>
              <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full mt-2 inline-block">+15% vs last mo</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Clients</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">142</h3>
              <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full mt-2 inline-block">+8 Net New</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Churn Rate</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">2.1%</h3>
              <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full mt-2 inline-block">-0.5% Improved</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Lifetime Value</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">$850</h3>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full mt-2 inline-block">Stable</span>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-white mb-6">Revenue Growth Trajectory</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MRR_DATA}>
                    <defs>
                      <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} tick={{fill: '#94a3b8'}} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                    <Area type="monotone" dataKey="mrr" stroke="#6366f1" fillOpacity={1} fill="url(#colorMrr)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">Acquisition vs Churn</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Net growth analysis</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MRR_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                    <Bar dataKey="newRevenue" name="New Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="churn" name="Churn" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- DISPUTE ANALYTICS --- */}
      {activeTab === 'disputes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-white mb-6">Success Rate by Bureau</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BUREAU_PERFORMANCE} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#f1f5f9" className="dark:stroke-slate-700" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="bureau" type="category" axisLine={false} tickLine={false} width={100} tick={{fill: '#94a3b8'}} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="deleted" name="Deleted %" stackId="a" fill="#22c55e" barSize={30} />
                  <Bar dataKey="verified" name="Verified %" stackId="a" fill="#ef4444" barSize={30} />
                  <Bar dataKey="updated" name="Updated %" stackId="a" fill="#3b82f6" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-white mb-6">Strategy Performance Matrix</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={DISPUTE_STRATEGY_STATS}>
                  <PolarGrid stroke="#94a3b8" />
                  <PolarAngleAxis dataKey="strategy" tick={{fill: '#94a3b8', fontSize: 10}} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Success Rate" dataKey="success" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Legend />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
             <h3 className="font-bold text-slate-800 dark:text-white mb-4">Specialist Performance Leaderboard</h3>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                   <tr>
                     <th className="p-4">Specialist</th>
                     <th className="p-4">Disputes Managed</th>
                     <th className="p-4">Success Rate</th>
                     <th className="p-4">Revenue Generated</th>
                     <th className="p-4">Performance</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                   {SPECIALIST_STATS.map((spec, idx) => (
                     <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                       <td className="p-4 font-medium text-slate-800 dark:text-white">{spec.name}</td>
                       <td className="p-4 text-slate-600 dark:text-slate-300">{spec.disputes}</td>
                       <td className="p-4">
                         <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                           <div className="w-16 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-500" style={{ width: `${spec.success}%` }} />
                           </div>
                           <span>{spec.success}%</span>
                         </div>
                       </td>
                       <td className="p-4 font-bold text-slate-700 dark:text-slate-200">${spec.revenue.toLocaleString()}</td>
                       <td className="p-4">
                         {spec.success > 60 ? (
                           <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold">Top Performer</span>
                         ) : (
                           <span className="px-2 py-1 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 rounded-full text-xs font-bold">Standard</span>
                         )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      )}

      {/* --- FINANCIAL REPORTS --- */}
      {activeTab === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
             <h3 className="font-bold text-slate-800 dark:text-white mb-6">Revenue Mix</h3>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={REVENUE_MIX}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {REVENUE_MIX.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                   <Legend verticalAlign="bottom" height={36} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
           </div>

           <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 dark:text-white">Recent Transactions</h3>
                <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">View All</button>
              </div>
              <table className="w-full text-sm">
                <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                   <tr>
                     <th className="text-left pb-3">Client</th>
                     <th className="text-left pb-3">Date</th>
                     <th className="text-left pb-3">Type</th>
                     <th className="text-right pb-3">Amount</th>
                     <th className="text-right pb-3">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                   {[1, 2, 3, 4, 5].map((i) => (
                     <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                       <td className="py-3 text-slate-800 dark:text-white">Client #{100+i}</td>
                       <td className="py-3 text-slate-500 dark:text-slate-400">Oct {10+i}, 2024</td>
                       <td className="py-3 text-slate-600 dark:text-slate-300">Monthly Subscription</td>
                       <td className="py-3 text-right font-medium text-slate-800 dark:text-white">$99.00</td>
                       <td className="py-3 text-right">
                         <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs font-bold">Paid</span>
                       </td>
                     </tr>
                   ))}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {/* --- REPORT BUILDER --- */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Report Configuration
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Report Name</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-sm bg-white dark:bg-slate-700 dark:text-white"
                  value={reportConfig.name}
                  onChange={e => setReportConfig({...reportConfig, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Metrics</label>
                <div className="space-y-2">
                   {['Revenue', 'Active Clients', 'Dispute Success', 'Churn Rate'].map(m => (
                     <label key={m} className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                       <input type="checkbox" className="mr-2 rounded text-indigo-600 focus:ring-indigo-500" defaultChecked />
                       {m}
                     </label>
                   ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date Range</label>
                <select className="w-full border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-sm bg-white dark:bg-slate-700 dark:text-white">
                  <option>Last 30 Days</option>
                  <option>Last Quarter</option>
                  <option>Year to Date</option>
                  <option>All Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Visualization</label>
                <div className="grid grid-cols-3 gap-2">
                   {['Bar', 'Line', 'Pie'].map(type => (
                     <button 
                        key={type}
                        className={`py-2 text-xs font-bold rounded border transition-colors ${reportConfig.visualization.toUpperCase() === type.toUpperCase() ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}
                        onClick={() => setReportConfig({...reportConfig, visualization: type.toUpperCase() as any})}
                     >
                       {type}
                     </button>
                   ))}
                </div>
              </div>

              <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium shadow hover:bg-indigo-700">
                 Generate Report
              </button>
           </div>

           <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center min-h-[400px] border-dashed">
              <div className="text-center space-y-4">
                 <div className="bg-white dark:bg-slate-700 p-4 rounded-full shadow-sm inline-block">
                    <PieIcon className="w-12 h-12 text-indigo-300 dark:text-indigo-400" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Report Preview</h3>
                 <p className="text-slate-500 dark:text-slate-400 max-w-md">
                    Configure your report settings on the left to generate a custom visualization of your business data.
                 </p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Reports;