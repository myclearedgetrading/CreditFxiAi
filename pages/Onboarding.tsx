
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Shield, Zap, TrendingUp, CheckCircle2, 
  Upload, FileText, Loader2, Sparkles, User, Lock, AlertCircle,
  ChevronRight, Car, Home, X, ExternalLink, CreditCard, Mail, MapPin
} from 'lucide-react';
import { vibrate, HAPTIC } from '../services/mobileService';
import { useUser } from '../context/UserContext';
import { User as UserType } from '../types';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [step, setStep] = useState(1);
  
  // Detailed Profile State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zip: ''
  });

  const [goal, setGoal] = useState('');
  
  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('Initializing AI...');
  
  // Connection Modal
  const [showConnect, setShowConnect] = useState(false);
  const [connectProvider, setConnectProvider] = useState('IdentityIQ');
  const [connectUser, setConnectUser] = useState('');
  const [connectPass, setConnectPass] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Data Mode (Real vs Demo)
  const [dataMode, setDataMode] = useState<'REAL' | 'DEMO'>('REAL');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    vibrate(HAPTIC.LIGHT);
    setStep(prev => prev + 1);
  };

  const startAnalysis = (mode: 'REAL' | 'DEMO') => {
    setDataMode(mode);
    setStep(3);
    setIsAnalyzing(true);
    
    // Simulate complex AI analysis
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2; // 50 ticks * 60ms = 3000ms total
      setAnalysisProgress(progress);
      
      if (progress < 20) setAnalysisStep('Scanning for negative items...');
      else if (progress < 40) setAnalysisStep('Checking statute of limitations...');
      else if (progress < 60) setAnalysisStep('Identifying factual discrepancies...');
      else if (progress < 80) setAnalysisStep('Formulating Metro 2 challenges...');
      else setAnalysisStep('Finalizing dispute strategy...');

      if (progress >= 100) {
        clearInterval(interval);
        setIsAnalyzing(false);
        vibrate(HAPTIC.SUCCESS);
      }
    }, 60);
  };

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setShowConnect(false);
      startAnalysis('REAL');
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      startAnalysis('REAL');
    }
  };

  const handleAffiliateClick = (providerName: string) => {
    vibrate(HAPTIC.MEDIUM);
    // In production, these would be real affiliate links
    let url = '#';
    switch (providerName) {
      case 'IdentityIQ': url = 'https://www.identityiq.com'; break;
      case 'SmartCredit': url = 'https://www.smartcredit.com'; break;
      case 'MyFreeScoreNow': url = 'https://www.myfreescorenow.com'; break;
      case 'PrivacyGuard': url = 'https://www.privacyguard.com'; break;
    }
    window.open(url, '_blank');
  };

  const completeOnboarding = () => {
    // Generate User Profile based on mode
    const isDemo = dataMode === 'DEMO';
    
    const newUser: UserType = {
      id: `user-${Date.now()}`,
      firstName: formData.firstName || 'Guest',
      lastName: formData.lastName || '',
      email: formData.email || 'user@example.com',
      phone: '',
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip: formData.zip
      },
      role: 'USER',
      creditScore: {
        equifax: isDemo ? 580 : 524,
        experian: isDemo ? 595 : 538,
        transunion: isDemo ? 590 : 515
      },
      negativeItems: [
        { 
          id: 'item-1', 
          type: 'Collection', 
          creditor: 'Midland Funding', 
          accountNumber: '****4921', 
          amount: 1250, 
          dateReported: '2023-05-15', 
          bureau: ['Equifax' as any, 'Experian' as any], 
          status: 'Open' as const
        },
        { 
          id: 'item-2', 
          type: 'Late Payment', 
          creditor: 'Capital One', 
          accountNumber: '****9999', 
          amount: 0, 
          dateReported: '2023-01-20', 
          bureau: ['TransUnion' as any], 
          status: 'Open' as const 
        },
        ...(isDemo ? [
          { 
            id: 'item-3', 
            type: 'Charge Off', 
            creditor: 'Chase Bank', 
            accountNumber: '****1234', 
            amount: 4500, 
            dateReported: '2022-11-01', 
            bureau: ['Experian' as any], 
            status: 'Open' as const
          }
        ] : [])
      ]
    };

    login(newUser);
    navigate('/dashboard');
  };

  // --- RENDER STEP 1: IDENTITY & ADDRESS ---
  const renderStep1 = () => (
    <div className="animate-fade-in flex flex-col h-full">
      <div className="flex-1 flex flex-col justify-center py-6 overflow-y-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Let's build your profile.</h1>
        <p className="text-slate-400 text-sm mb-8">We need accurate details to generate valid legal dispute letters.</p>

        <div className="space-y-6">
          
          {/* Identity Section */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
             <div className="flex items-center gap-2 mb-4 text-orange-500 font-bold text-sm uppercase tracking-wider">
                <User className="w-4 h-4" /> Identity
             </div>
             <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">First Name</label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Jane"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-slate-700"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-slate-700"
                  />
                </div>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Email Address</label>
                <div className="relative">
                   <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-600" />
                   <input 
                     type="email" 
                     name="email"
                     value={formData.email}
                     onChange={handleInputChange}
                     placeholder="jane.doe@example.com"
                     className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-slate-700"
                   />
                </div>
             </div>
          </div>

          {/* Address Section */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
             <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-orange-500 font-bold text-sm uppercase tracking-wider">
                   <MapPin className="w-4 h-4" /> Mailing Address
                </div>
                <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded">Required for Letters</span>
             </div>
             
             <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-2">Street Address</label>
                   <input 
                     type="text" 
                     name="street"
                     value={formData.street}
                     onChange={handleInputChange}
                     placeholder="123 Main St, Apt 4B"
                     className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-slate-700"
                   />
                </div>
                <div className="grid grid-cols-3 gap-3">
                   <div className="col-span-1">
                      <label className="block text-xs font-bold text-slate-400 mb-2">Zip Code</label>
                      <input 
                        type="text" 
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        placeholder="90210"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-slate-700"
                      />
                   </div>
                   <div className="col-span-1">
                      <label className="block text-xs font-bold text-slate-400 mb-2">City</label>
                      <input 
                        type="text" 
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Beverly Hills"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-slate-700"
                      />
                   </div>
                   <div className="col-span-1">
                      <label className="block text-xs font-bold text-slate-400 mb-2">State</label>
                      <input 
                        type="text" 
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="CA"
                        maxLength={2}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-slate-700 uppercase"
                      />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button
          onClick={handleNext}
          disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.street || !formData.zip}
          className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-white/10"
        >
          Confirm Details <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // --- RENDER STEP 2: GOALS ---
  const renderStep2 = () => (
    <div className="animate-fade-in flex flex-col h-full">
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-white mb-2">What is your primary goal?</h1>
        <p className="text-slate-400 text-lg mb-8">We'll customize your dispute strategy based on this.</p>

        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'score', label: 'Boost Credit Score', icon: TrendingUp },
                { id: 'clean', label: 'Remove Collections', icon: Shield },
                { id: 'home', label: 'Buy a Home', icon: Home },
                { id: 'auto', label: 'Buy a Car', icon: Car },
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
                    goal === g.id 
                      ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-900/20 scale-[1.02]' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-800/80'
                  }`}
                >
                  <g.icon className={`w-8 h-8 ${goal === g.id ? 'text-white' : 'text-slate-500'}`} />
                  <span className="font-bold text-sm md:text-base">{g.label}</span>
                </button>
              ))}
            </div>
        </div>
      </div>

      <div className="pt-6">
        <button
          onClick={handleNext}
          disabled={!goal}
          className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Continue <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // --- RENDER STEP 3: SOURCE ---
  const renderStep3 = () => (
    <div className="animate-fade-in flex flex-col h-full">
      <div className="flex-1 flex flex-col justify-start py-6 overflow-y-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Import your credit.</h1>
          <p className="text-slate-400 text-sm">We need your report to identify negative items.</p>
        </div>

        {/* Existing Accounts */}
        <div className="space-y-3 mb-8">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">I have a report</label>
          <button
            onClick={() => setShowConnect(true)}
            className="w-full p-4 bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-xl flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-950 rounded-lg text-orange-500 border border-slate-800">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-white text-sm">Connect Monitoring</h3>
                <p className="text-slate-500 text-xs">IdentityIQ, SmartCredit, etc.</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-orange-500" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-950 rounded-lg text-slate-400 border border-slate-800">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-white text-sm">Upload File</h3>
                <p className="text-slate-500 text-xs">PDF or HTML report</p>
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.html" onChange={handleFileUpload} />
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white" />
          </button>
        </div>

        {/* Affiliate Options */}
        <div className="space-y-3 mb-8">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex justify-between">
            <span>I need a report</span>
            <span className="text-green-500 text-[10px]">Best for Metro 2</span>
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'IdentityIQ', offer: 'Get for $1', desc: 'Detailed 3-Bureau Report', color: 'text-blue-400' },
              { name: 'SmartCredit', offer: 'Get for $1', desc: 'Best for Score Tracking', color: 'text-green-400' },
              { name: 'MyFreeScoreNow', offer: 'Free Trial', desc: 'Fastest Updates', color: 'text-red-400' },
              { name: 'PrivacyGuard', offer: 'Get for $1', desc: 'Identity Protection', color: 'text-purple-400' },
            ].map((provider) => (
              <div 
                key={provider.name}
                onClick={() => handleAffiliateClick(provider.name)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-600 p-3 rounded-xl cursor-pointer transition-all group flex flex-col justify-between h-32"
              >
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                    <Shield className={`w-4 h-4 ${provider.color}`} />
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm truncate">{provider.name}</h4>
                  <p className="text-[10px] text-slate-500 leading-tight mb-2">{provider.desc}</p>
                  <span className="inline-block bg-orange-900/30 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-900/50">
                    {provider.offer}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Mode */}
        <div className="text-center pt-2">
          <button
            onClick={() => startAnalysis('DEMO')}
            className="text-slate-500 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 mx-auto py-2"
          >
            <Sparkles className="w-3 h-3" /> Just exploring? Use Demo Data
          </button>
        </div>
      </div>
    </div>
  );

  // --- RENDER STEP 4: ANALYSIS ---
  const renderStep4 = () => (
    <div className="animate-fade-in flex flex-col h-full justify-center items-center text-center">
      {isAnalyzing ? (
        <div className="max-w-xs w-full">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
            <div 
              className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"
              style={{ animationDuration: '1.5s' }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{Math.round(analysisProgress)}%</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Analyzing Profile</h2>
          <p className="text-slate-400 text-sm animate-pulse">{analysisStep}</p>
        </div>
      ) : (
        <div className="max-w-sm w-full animate-scale-in">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-900/20">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Analysis Complete!</h1>
          <p className="text-slate-400 mb-8">
            We found <span className="text-white font-bold">3 negative items</span> hurting your score. We can help you remove them.
          </p>

          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 mb-8 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Current Score Estimate</span>
              <span className="text-white font-bold">{dataMode === 'DEMO' ? '580' : '524'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Potential Increase</span>
              <span className="text-green-400 font-bold">+85 points</span>
            </div>
          </div>

          <button
            onClick={completeOnboarding}
            className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-900/20 transition-all hover:scale-[1.02]"
          >
            View My Dashboard
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col p-6 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 z-10">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === step ? 'w-8 bg-orange-500' : i < step ? 'w-4 bg-orange-900' : 'w-4 bg-slate-800'
              }`} 
            />
          ))}
        </div>
        {step < 4 && (
          <button onClick={() => navigate('/')} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Steps */}
      <div className="flex-1 max-w-lg w-full mx-auto relative z-10">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>

      {/* Connect Modal */}
      {showConnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0A0A0A] border border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Connect Provider</h3>
              <form onSubmit={handleConnectSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Provider</label>
                  <select 
                    value={connectProvider}
                    onChange={e => setConnectProvider(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option>IdentityIQ</option>
                    <option>SmartCredit</option>
                    <option>PrivacyGuard</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Username</label>
                  <input 
                    type="text"
                    value={connectUser}
                    onChange={e => setConnectUser(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500"
                    placeholder="Username"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Password</label>
                  <input 
                    type="password"
                    value={connectPass}
                    onChange={e => setConnectPass(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isConnecting || !connectUser || !connectPass}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {isConnecting ? 'Verifying...' : 'Secure Connect'}
                </button>
              </form>
            </div>
            <div className="bg-slate-900 p-3 text-center border-t border-slate-800">
              <button onClick={() => setShowConnect(false)} className="text-sm text-slate-400 hover:text-white">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
