
import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Shield, Zap, TrendingUp, CheckCircle2, 
  Upload, FileText, Loader2, Sparkles, User, Lock, AlertCircle,
  ChevronRight, Car, Home, X, ExternalLink, CreditCard, Mail, MapPin
} from 'lucide-react';
import { vibrate, HAPTIC } from '../services/mobileService';
import { registerWithEmail } from '../services/firebaseService';
import { useUser } from '../context/UserContext';
import { User as UserType } from '../types';
import {
  CREDIT_MONITORING_PROVIDER_CARDS,
  getCreditMonitoringAffiliateUrl,
  type CreditMonitoringProvider,
} from '../constants/creditMonitoringProviders';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useUser();
  const [step, setStep] = useState(1);
  /** User chose to explore the app without connecting/uploading a report */
  const [skippedCreditImport, setSkippedCreditImport] = useState(false);
  
  // Detailed Profile State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    street: '',
    city: '',
    state: '',
    zip: ''
  });

  const [goal, setGoal] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('Initializing AI...');
  
  // Connection Modal
  const [showConnect, setShowConnect] = useState(false);
  const [connectProvider, setConnectProvider] = useState<CreditMonitoringProvider>('SmartCredit');
  const [connectUser, setConnectUser] = useState('');
  const [connectPass, setConnectPass] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const skipImportAndFinish = () => {
    vibrate(HAPTIC.LIGHT);
    setSkippedCreditImport(true);
    setStep(4);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    vibrate(HAPTIC.LIGHT);
    setStep(prev => prev + 1);
  };

  const startAnalysis = () => {
    setStep(4);
    setIsAnalyzing(true);
    
    // Simulate complex AI analysis visualization (the actual processing happens later or via file upload)
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
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
      startAnalysis();
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      startAnalysis();
    }
  };

  const handleAffiliateClick = (provider: CreditMonitoringProvider) => {
    vibrate(HAPTIC.MEDIUM);
    window.open(getCreditMonitoringAffiliateUrl(provider), '_blank', 'noopener,noreferrer');
  };

  const completeOnboarding = async () => {
    setError(null);
    setIsRegistering(true);

    try {
      const newUserProfile: Partial<UserType> = {
        subscriptionTier: 'FREE',
        subscriptionStatus: 'NONE',
        disputeLettersGeneratedCount: 0,
        firstName: formData.firstName || 'Guest',
        lastName: formData.lastName || '',
        phone: '',
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip
        },
        creditScore: skippedCreditImport
          ? { equifax: 0, experian: 0, transunion: 0 }
          : {
              equifax: 524,
              experian: 538,
              transunion: 515
            },
        negativeItems: skippedCreditImport
          ? []
          : [
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
              }
            ]
      };

      // Create Firebase Auth User & Save to Firestore
      const fullUser = await registerWithEmail(formData.email, formData.password, newUserProfile);
      
      login(fullUser);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create account. Please try again.");
      setIsRegistering(false);
    }
  };

  // --- RENDER STEP 1: IDENTITY & ADDRESS ---
  const renderStep1 = () => (
    <div className="animate-fade-in flex flex-col h-full">
      <div className="flex-1 flex flex-col justify-center py-6 overflow-y-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Let's build your profile.</h1>
        <p className="text-slate-400 text-sm mb-8">Create your account to save your dispute progress securely.</p>

        <div className="space-y-6">
          
          {/* Identity Section */}
          <div className="bg-[#0F0F0F] p-5 rounded-2xl border border-slate-800 shadow-xl">
             <div className="flex items-center gap-2 mb-5 text-orange-500 font-bold text-sm uppercase tracking-wider">
                <User className="w-4 h-4" /> Account Details
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
                    className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-slate-700 transition-all focus:border-orange-500"
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
                    className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-slate-700 transition-all focus:border-orange-500"
                  />
                </div>
             </div>
             <div className="mb-4">
                <label className="block text-xs font-bold text-slate-400 mb-2">Email Address</label>
                <div className="relative">
                   <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-600" />
                   <input 
                     type="email" 
                     name="email"
                     value={formData.email}
                     onChange={handleInputChange}
                     placeholder="jane.doe@example.com"
                     className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 pl-10 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-slate-700 transition-all focus:border-orange-500"
                   />
                </div>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Create Password</label>
                <div className="relative">
                   <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-600" />
                   <input 
                     type="password" 
                     name="password"
                     value={formData.password}
                     onChange={handleInputChange}
                     placeholder="••••••••"
                     className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 pl-10 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-slate-700 transition-all focus:border-orange-500"
                   />
                </div>
             </div>
          </div>

          {/* Address Section */}
          <div className="bg-[#0F0F0F] p-5 rounded-2xl border border-slate-800 shadow-xl">
             <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2 text-orange-500 font-bold text-sm uppercase tracking-wider">
                   <MapPin className="w-4 h-4" /> Mailing Address
                </div>
                <span className="text-[10px] text-slate-400 bg-[#050505] border border-slate-800 px-2 py-1 rounded">Required for Letters</span>
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
                     className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-slate-700 transition-all focus:border-orange-500"
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
                        className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-slate-700 transition-all focus:border-orange-500"
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
                        className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-slate-700 transition-all focus:border-orange-500"
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
                        className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-slate-700 uppercase transition-all focus:border-orange-500"
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
          disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.street || !formData.zip}
          className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-[1.01]"
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
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all relative overflow-hidden group ${
                    goal === g.id 
                      ? 'bg-orange-600 border-orange-600 text-white shadow-xl shadow-orange-900/30 scale-[1.02] z-10' 
                      : 'bg-[#0F0F0F] border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900 hover:shadow-lg'
                  }`}
                >
                  <div className={`p-3 rounded-full transition-colors ${goal === g.id ? 'bg-white/20' : 'bg-slate-900 group-hover:bg-slate-800'}`}>
                    <g.icon className={`w-8 h-8 ${goal === g.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  </div>
                  <span className={`font-bold text-sm md:text-base ${goal === g.id ? 'text-white' : 'group-hover:text-slate-300'}`}>{g.label}</span>
                </button>
              ))}
            </div>
        </div>
      </div>

      <div className="pt-6">
        <button
          onClick={handleNext}
          disabled={!goal}
          className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01]"
        >
          Continue <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // --- RENDER STEP 3: SOURCE ---
  const renderStep3 = () => (
    <div className="animate-fade-in flex flex-col h-full">
      <div className="flex-1 flex flex-col justify-start py-4 overflow-y-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
            Upload your credit report to get started
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            We&apos;ll use AI to find negative items and prep dispute letters. PDF or HTML export from your bureau or monitoring site works best.
          </p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.html"
          onChange={handleFileUpload}
        />
        <button
          type="button"
          onClick={() => {
            vibrate(HAPTIC.MEDIUM);
            fileInputRef.current?.click();
          }}
          className="w-full py-4 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-orange-900/30 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] mb-6"
        >
          <Upload className="w-6 h-6" />
          Upload your credit report
        </button>

        <div className="space-y-3 mb-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide text-center">More ways to continue</p>
          <button
            type="button"
            onClick={() => setShowConnect(true)}
            className="w-full p-4 bg-[#0F0F0F] border border-slate-800 hover:border-orange-500/40 hover:bg-slate-900/50 rounded-xl flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#050505] rounded-lg text-orange-500 border border-slate-800">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-white text-sm">Connect monitoring</h3>
                <p className="text-slate-500 text-xs">SmartCredit or MyFreeScoreNow</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-orange-500" />
          </button>
        </div>

        <div className="space-y-3 mb-4">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex justify-between items-center">
            <span>Need a report first?</span>
            <span className="text-green-500 text-[10px] bg-green-900/20 px-2 py-0.5 rounded border border-green-900/30">Partner offers</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CREDIT_MONITORING_PROVIDER_CARDS.map((provider) => (
              <div
                key={provider.id}
                role="button"
                tabIndex={0}
                onClick={() => handleAffiliateClick(provider.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleAffiliateClick(provider.id)}
                className={`bg-[#0F0F0F] border border-slate-800 p-4 rounded-2xl cursor-pointer transition-all duration-300 group flex flex-col justify-between min-h-[7.5rem] relative overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${provider.hoverColor}`}
              >
                <div className="flex justify-between items-start z-10">
                  <div className="w-9 h-9 rounded-full bg-[#050505] flex items-center justify-center border border-slate-800 group-hover:border-slate-700 transition-colors">
                    <Shield className={`w-5 h-5 ${provider.color}`} />
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-white transition-colors" />
                </div>
                <div className="z-10">
                  <h4 className="font-bold text-white text-sm truncate mb-1">{provider.id}</h4>
                  <p className="text-[10px] text-slate-500 leading-tight mb-2 line-clamp-2">{provider.desc}</p>
                  <span className="inline-block bg-orange-500/10 text-orange-400 text-[10px] font-bold px-2 py-1 rounded border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
                    {provider.offer}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80 mt-auto">
        <button
          type="button"
          onClick={skipImportAndFinish}
          className="w-full py-3 text-slate-500 hover:text-slate-300 text-sm font-medium rounded-xl transition-colors"
        >
          I&apos;ll upload my report later — continue
        </button>
        <p className="text-center text-[11px] text-slate-600 mt-2 px-2">
          After signup, open <span className="text-slate-400 font-semibold">Credit Audit</span> from the menu to upload anytime.
        </p>
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
      ) : skippedCreditImport ? (
        <div className="max-w-sm w-full animate-scale-in">
          <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-900/20">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">You&apos;re all set</h1>
          <p className="text-slate-400 mb-6 text-sm leading-relaxed">
            Create your account, then go to <span className="text-white font-semibold">Credit Audit</span> and{' '}
            <span className="text-orange-400 font-semibold">upload your credit report</span> to run AI analysis and unlock disputes.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-900 rounded-lg text-red-400 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <button
            onClick={completeOnboarding}
            disabled={isRegistering}
            className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-900/20 transition-all hover:scale-[1.02] hover:shadow-orange-900/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegistering ? (
                <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating Account...
                </>
            ) : "Create account — then upload in Credit Audit"}
          </button>
        </div>
      ) : (
        <div className="max-w-sm w-full animate-scale-in">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-900/20">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Preview complete</h1>
          <p className="text-slate-400 mb-4">
            We found <span className="text-white font-bold">2 negative items</span> in this demo. After signup, upload a real report in{' '}
            <span className="text-white font-semibold">Credit Audit</span> for live AI analysis.
          </p>

          <div className="bg-[#0F0F0F] rounded-2xl p-5 border border-slate-800 mb-8 text-left shadow-xl">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-slate-400">Current Score Estimate</span>
              <span className="text-white font-bold">524</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Potential Increase</span>
              <span className="text-green-400 font-bold">+85 points</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-900 rounded-lg text-red-400 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <button
            onClick={completeOnboarding}
            disabled={isRegistering}
            className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-900/20 transition-all hover:scale-[1.02] hover:shadow-orange-900/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegistering ? (
                <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating Account...
                </>
            ) : "Create account & open dashboard"}
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
                    onChange={e => setConnectProvider(e.target.value as CreditMonitoringProvider)}
                    className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="SmartCredit">SmartCredit</option>
                    <option value="MyFreeScoreNow">MyFreeScoreNow</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Username</label>
                  <input 
                    type="text"
                    value={connectUser}
                    onChange={e => setConnectUser(e.target.value)}
                    className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500"
                    placeholder="Username"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Password</label>
                  <input 
                    type="password"
                    value={connectPass}
                    onChange={e => setConnectPass(e.target.value)}
                    className="w-full bg-[#050505] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isConnecting || !connectUser || !connectPass}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {isConnecting ? 'Verifying...' : 'Secure Connect'}
                </button>
              </form>
            </div>
            <div className="bg-[#050505] p-3 text-center border-t border-slate-800">
              <button onClick={() => setShowConnect(false)} className="text-sm text-slate-400 hover:text-white">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
