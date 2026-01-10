import React, { useState } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend
} from 'recharts';
import { 
  BrainCircuit, TrendingUp, AlertTriangle, Users, Target, ArrowUpRight, 
  HelpCircle, Play, RefreshCw, Sparkles, BarChart3, UserMinus
} from 'lucide-react';
import { predictDisputeOutcome, forecastCreditScore } from '../services/geminiService';
import { DisputePrediction, ScoreForecastPoint, ChurnRiskProfile, DisputeStrategy } from '../types';

// Mock Churn Data (since we can't predict on live data yet)
const MOCK_CHURN_RISKS: ChurnRiskProfile[] = [
  { clientId: '101', clientName: 'James Robinson', riskScore: 78, primaryRiskFactor: 'Low Engagement', suggestedRetentionAction: 'Schedule check-in call' },
  { clientId: '102', clientName: 'Sarah Connor', riskScore: 12, primaryRiskFactor: 'None', suggestedRetentionAction: 'Send success summary' },
  { clientId: '103', clientName: 'Michael Scott', riskScore: 65, primaryRiskFactor: 'No deletions in 45 days', suggestedRetentionAction: 'Offer discount on next month' },
];

const PredictiveAnalytics: React.FC = () => {
  // Tabs: 'dispute', 'score', 'churn', 'business'
  const [activeTab, setActiveTab] = useState('dispute');

  // Dispute Predictor State
  const [itemType, setItemType] = useState('Collection');
  const [itemAge, setItemAge] = useState('1-2 Years');
  const [bureau, setBureau] = useState('Equifax');
  const [strategy, setStrategy] = useState(DisputeStrategy.FACTUAL);
  const [prediction, setPrediction] = useState<DisputePrediction | null>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  // Score Forecast State
  const [currentScore, setCurrentScore] = useState(580);
  const [negItems, setNegItems] = useState(5);
  const [utilization, setUtilization] = useState(30);
  const [forecast, setForecast] = useState<ScoreForecastPoint[]>([]);
  const [loadingForecast, setLoadingForecast] = useState(false);

  const handlePredictDispute = async () => {
    setLoadingPrediction(true);
    try {
      const result = await predictDisputeOutcome(itemType, itemAge, bureau, strategy);
      setPrediction(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPrediction(false);
    }
  };

  const handleForecastScore = async () => {
    setLoadingForecast(true);
    try {
      const result = await forecastCreditScore(currentScore, negItems, utilization);
      setForecast(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingForecast(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score > 70) return 'text-red-600 bg-red-50 border-red-100';
    if (score > 40) return 'text-orange-600 bg-orange-50 border-orange-100';
    return 'text-green-600 bg-green-50 border-green-100';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <Sparkles className="text-purple-600 w-6 h-6" />
          Predictive Intelligence Center
        </h1>
        <p className="text-slate-500 mt-2">
          Leverage AI to forecast outcomes, reduce churn, and optimize strategies.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 overflow-x-auto">
        {[
          { id: 'dispute', label: 'Dispute Success', icon: Target },
          { id: 'score', label: 'Score Simulator', icon: TrendingUp },
          { id: 'churn', label: 'Client Retention', icon: UserMinus },
          { id: 'business', label: 'Business Forecast', icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-purple-600 text-purple-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- TAB CONTENT: DISPUTE SUCCESS --- */}
      {activeTab === 'dispute' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Simulator Parameters</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Negative Item Type</label>
                <select 
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  value={itemType} onChange={e => setItemType(e.target.value)}
                >
                  <option>Collection</option>
                  <option>Late Payment (30 days)</option>
                  <option>Late Payment (90+ days)</option>
                  <option>Charge Off</option>
                  <option>Inquiry</option>
                  <option>Bankruptcy</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Item Age</label>
                <select 
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  value={itemAge} onChange={e => setItemAge(e.target.value)}
                >
                  <option>Less than 1 Year</option>
                  <option>1-2 Years</option>
                  <option>3-5 Years</option>
                  <option>5+ Years (Near Statute)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Bureau</label>
                <select 
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  value={bureau} onChange={e => setBureau(e.target.value)}
                >
                  <option>Equifax</option>
                  <option>Experian</option>
                  <option>TransUnion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Proposed Strategy</label>
                <select 
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  value={strategy} onChange={e => setStrategy(e.target.value as DisputeStrategy)}
                >
                  {Object.values(DisputeStrategy).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <button 
                onClick={handlePredictDispute}
                disabled={loadingPrediction}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex justify-center items-center"
              >
                {loadingPrediction ? <RefreshCw className="animate-spin w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                Run Prediction Model
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            {!prediction ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <BrainCircuit className="w-16 h-16 text-slate-300 mb-4" />
                <p className="text-slate-500">Configure parameters and run the model to see AI predictions.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 h-full">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                  <div className="text-center md:text-left">
                    <h2 className="text-slate-500 font-medium">Predicted Success Rate</h2>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-slate-800">{prediction.probability}%</span>
                      <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                        prediction.probability > 60 ? 'bg-green-100 text-green-700' : 
                        prediction.probability > 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {prediction.confidenceLevel} Confidence
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">Est. {prediction.estimatedDaysToResult} days to result</p>
                  </div>
                  
                  <div className="w-48 h-48 mt-6 md:mt-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart 
                        innerRadius="80%" 
                        outerRadius="100%" 
                        data={[{ name: 'Success', value: prediction.probability, fill: '#9333ea' }]} 
                        startAngle={180} 
                        endAngle={0}
                      >
                        <RadialBar background dataKey="value" cornerRadius={10} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800">Key Influencing Factors</h3>
                  <div className="grid gap-3">
                    {prediction.keyFactors.map((factor, idx) => (
                      <div key={idx} className="flex items-start p-3 bg-slate-50 rounded-lg">
                        <ArrowUpRight className="w-5 h-5 text-purple-600 mr-3 mt-0.5" />
                        <p className="text-sm text-slate-700">{factor}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: SCORE SIMULATOR --- */}
      {activeTab === 'score' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
            <h3 className="font-bold text-slate-800">Current Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Current Score</label>
                <input 
                  type="number" className="w-full p-2 border border-slate-200 rounded-lg"
                  value={currentScore} onChange={e => setCurrentScore(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1"># Negative Items</label>
                <input 
                  type="number" className="w-full p-2 border border-slate-200 rounded-lg"
                  value={negItems} onChange={e => setNegItems(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Credit Utilization %</label>
                <input 
                  type="number" className="w-full p-2 border border-slate-200 rounded-lg"
                  value={utilization} onChange={e => setUtilization(Number(e.target.value))}
                />
              </div>
              <button 
                onClick={handleForecastScore}
                disabled={loadingForecast}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                {loadingForecast ? 'Simulating...' : 'Generate Forecast'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h3 className="font-bold text-slate-800 mb-6">6-Month Score Trajectory (AI Forecast)</h3>
             {forecast.length === 0 ? (
               <div className="h-80 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                 No forecast data generated yet.
               </div>
             ) : (
               <div className="h-80">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={forecast} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorBest" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                         <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorLikely" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                         <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <XAxis dataKey="month" stroke="#94a3b8" />
                     <YAxis domain={['dataMin - 20', 'dataMax + 20']} stroke="#94a3b8" />
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <RechartsTooltip />
                     <Area type="monotone" dataKey="bestCase" stroke="#22c55e" fillOpacity={1} fill="url(#colorBest)" name="Best Case" strokeWidth={2} />
                     <Area type="monotone" dataKey="likelyCase" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLikely)" name="Likely Case" strokeWidth={2} />
                     <Area type="monotone" dataKey="worstCase" stroke="#ef4444" fill="none" name="Worst Case" strokeWidth={2} strokeDasharray="5 5" />
                   </AreaChart>
                 </ResponsiveContainer>
                 <div className="flex justify-center gap-6 mt-4 text-sm">
                    <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span> Best Case</div>
                    <div className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span> Likely Case</div>
                    <div className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span> Worst Case</div>
                 </div>
               </div>
             )}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: CLIENT CHURN & BUSINESS --- */}
      {(activeTab === 'churn' || activeTab === 'business') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center">
                <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" /> 
                At-Risk Clients (AI Detected)
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {MOCK_CHURN_RISKS.map((risk) => (
                <div key={risk.clientId} className={`p-4 rounded-lg border ${getRiskColor(risk.riskScore)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold">{risk.clientName}</h4>
                      <p className="text-xs opacity-80 mt-1">Risk Factor: {risk.primaryRiskFactor}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold">{risk.riskScore}%</span>
                      <p className="text-[10px] uppercase font-bold tracking-wide">Churn Prob.</p>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-60 p-2 rounded text-sm mt-2 flex items-center">
                    <BrainCircuit className="w-4 h-4 mr-2 opacity-70" />
                    <span className="font-medium">AI Suggestion: {risk.suggestedRetentionAction}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <h3 className="font-bold text-slate-800 mb-4">Revenue Forecast (Next 3 Months)</h3>
               <div className="flex items-end space-x-2 h-48">
                  {/* Mock Forecast Bars */}
                  <div className="flex-1 bg-slate-100 rounded-t-lg relative group h-[60%] hover:h-[65%] transition-all">
                    <div className="absolute bottom-2 left-0 right-0 text-center text-xs font-bold text-slate-600">Current</div>
                  </div>
                  <div className="flex-1 bg-purple-100 rounded-t-lg relative group h-[70%] hover:h-[75%] transition-all">
                    <div className="absolute bottom-2 left-0 right-0 text-center text-xs font-bold text-purple-700">Month +1</div>
                  </div>
                  <div className="flex-1 bg-purple-200 rounded-t-lg relative group h-[80%] hover:h-[85%] transition-all">
                    <div className="absolute bottom-2 left-0 right-0 text-center text-xs font-bold text-purple-800">Month +2</div>
                  </div>
                  <div className="flex-1 bg-purple-300 rounded-t-lg relative group h-[90%] hover:h-[95%] transition-all">
                    <div className="absolute bottom-2 left-0 right-0 text-center text-xs font-bold text-purple-900">Month +3</div>
                  </div>
               </div>
               <p className="text-center text-sm text-slate-500 mt-4">Projected 15% Growth based on current lead velocity.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <h3 className="font-bold text-slate-800 mb-2">Specialist Performance AI Coach</h3>
               <div className="p-4 bg-indigo-50 rounded-lg text-indigo-900 text-sm">
                  <p className="font-semibold mb-2">💡 Weekly Optimization Tip:</p>
                  <p>"Sarah Connor has a 20% higher deletion rate with 'Factual Disputes' on Medical Collections than the team average. Suggest team training session led by Sarah."</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveAnalytics;
