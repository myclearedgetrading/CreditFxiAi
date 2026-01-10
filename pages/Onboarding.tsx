
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle2, ChevronRight, Upload, Shield, CreditCard, 
  FileText, User, Home, Car, TrendingUp, AlertCircle, 
  ArrowLeft, Lock, Loader2, Sparkles, Zap, Check, X, ArrowRight
} from 'lucide-react';
import { vibrate, HAPTIC } from '../services/mobileService';

const STORAGE_KEY = 'creditfix_onboarding_state';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  
  // Connect Modal State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectForm, setConnectForm] = useState({
    provider: 'IdentityIQ',
    username: '',
    password: ''
  });
  
  const [formData, setFormData] = useState({
    firstName: '',
    goal: '', // Simplified to single string for primary goal
    reportProvider: '',
    reportFile: null as string | null,
    agreedToTerms: false
  });

  // Load state
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let savedState = null;
    if (saved) {
      try {
        savedState = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load onboarding state", e);
      }
    }

    // Check for direct navigation state override
    if (location.state && (location.state as any).step) {
      setStep((location.state as any).step);
      // Preserve saved form data if exists, otherwise keep default
      if (savedState?.formData) {
        setFormData(savedState.formData);
      }
    } else if (savedState) {
      setStep(savedState.step || 1);
      setFormData(savedState.formData || formData);
    }
  }, []);

  // Save state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, formData }));
  }, [step, formData]);

  const totalSteps = 3;

  const handleNext = () => {
    if (step === 1 && (!formData.firstName.trim() || !formData.goal)) {
      vibrate(HAPTIC.ERROR);
      return; // Validation handled by UI state usually
    }
    
    vibrate(HAPTIC.LIGHT);
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    vibrate(HAPTIC.MEDIUM);
    setFormData(prev => ({
      ...prev,
      reportProvider: 'Skipped',
      reportFile: null
    }));
    handleNext();
  };

  const handleBack = () => {
    vibrate(HAPTIC.LIGHT);
    if (step > 1) setStep(step - 1);
  };

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectForm.username || !connectForm.password) {
        vibrate(HAPTIC.ERROR);
        return;
    }

    setConnectLoading(true);
    vibrate(HAPTIC.MEDIUM);

    // Simulate API Connection (Backend Scraper)
    setTimeout(() => {
        setConnectLoading(false);
        setShowConnectModal(false);
        setFormData(prev => ({
            ...prev,
            reportProvider: connectForm.provider,
            reportFile: null
        }));
        vibrate(HAPTIC.SUCCESS);
        handleNext();
    }, 2000);
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      vibrate(HAPTIC.MEDIUM);
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev, 
        reportFile: file.name, 
        reportProvider: 'Manual Upload'
      }));
      handleNext();
    }
  };

  const completeOnboarding = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      vibrate(HAPTIC.SUCCESS);
      localStorage.removeItem(STORAGE_KEY);
      navigate('/dashboard');
    }, 1500);
  };

  const runAiScan = () => {
    setAnalyzing(true);
    vibrate(HAPTIC.MEDIUM);
    // Simulate AI Scan
    setTimeout(() => {
        setAnalyzing(false);
        setAnalysisComplete(true);
        vibrate(HAPTIC.SUCCESS);
    }, 2500);
  };

  const renderStep1_Personalize = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Let's start your journey.</h2>
        <p className="text-slate-500 dark:text-slate-400">We'll build a custom dispute strategy for you.</p>
      </div>

      <div className="space-y-4">
        <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">What should we call you?</label>
            <input 
              type="text" 
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              placeholder="Your First Name"
              className="w-full p-4 text-lg border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
              autoFocus
            />
        </div>

        <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">What is your #1 goal?</label>
            <div className="grid grid-cols-2 gap-3">
                {[
                { id: 'score', label: 'Boost Score', icon: TrendingUp },
                { id: 'clean', label: 'Remove Items', icon: Shield },
                { id: 'mortgage', label: 'Buy a House', icon: Home },
                { id: 'auto', label: 'Buy a Car', icon: Car },
                ].map((item) => (
                <div 
                    key={item.id}
                    onClick={() => {
                        setFormData({...formData, goal: item.id});
                        vibrate(HAPTIC.LIGHT);
                    }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center h-32 ${
                    formData.goal === item.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-500 shadow-md transform scale-[1.02]'
                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                >
                    <div className={`p-2 rounded-full ${formData.goal === item.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                    <item.icon className="w-6 h-6" />
                    </div>
                    <span className={`font-bold text-sm ${formData.goal === item.id ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-300'}`}>
                    {item.label}
                    </span>
                </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );

  const renderStep2_Connect = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Connect your report.</h2>
        <p className="text-slate-500 dark:text-slate-400">We need your credit data to find errors. Securely connect or upload a file.</p>
      </div>

      <div className="space-y-4">
        <div 
            onClick={() => {
                vibrate(HAPTIC.LIGHT);
                setShowConnectModal(true);
            }}
            className="group relative overflow-hidden bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-6 cursor-pointer transition-all shadow-sm hover:shadow-md"
        >
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Zap className="w-6 h-6 fill-current" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Instant Connect</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">IdentityIQ, SmartCredit, etc.</p>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
            </div>
        </div>

        <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
            <span className="px-2 bg-slate-50 dark:bg-slate-900 text-slate-400">OR</span>
            </div>
        </div>

        <div 
            onClick={() => document.getElementById('report-upload')?.click()}
            className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
        >
            <input 
              type="file" 
              id="report-upload" 
              className="hidden" 
              accept=".pdf,.html" 
              onChange={handleManualUpload}
            />
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-500">
                <Upload className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Upload Manualy (PDF/HTML)</h3>
                <p className="text-xs text-slate-500">Best for: Right-click "Save As" HTML</p>
            </div>
        </div>

        <div className="pt-2">
            <button 
                onClick={handleSkip}
                className="w-full py-3 rounded-xl font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
                Skip for now <ArrowRight className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );

  const renderStep3_Analyze = () => (
    <div className="space-y-8 animate-fade-in text-center">
      {!analysisComplete && !analyzing && (
          <div className="py-10">
             <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
             </div>
             <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Ready to analyze?</h2>
             <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
               Our AI will scan your profile for negative items, errors, and improvement opportunities.
             </p>
             <button 
                onClick={runAiScan}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 dark:shadow-none hover:scale-[1.02] transition-transform"
             >
                Start AI Scan
             </button>
          </div>
      )}

      {analyzing && (
          <div className="py-20 flex flex-col items-center">
             <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
             <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Analyzing Profile...</h2>
             <p className="text-slate-500 animate-pulse">Checking for collections...</p>
          </div>
      )}

      {analysisComplete && (
          <div className="animate-fade-in">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold uppercase tracking-wider mb-6">
                <CheckCircle2 className="w-3 h-3" /> Scan Complete
             </div>
             <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">We found 5 items to fix!</h2>
             
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mb-8 text-left">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Potential Score Boost</span>
                    <span className="text-green-600 dark:text-green-400 font-bold text-xl">+40-100 pts</span>
                </div>
                <ul className="space-y-3">
                    <li className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                        <AlertCircle className="w-4 h-4 text-red-500 mr-2" /> 2 Collections Found
                    </li>
                    <li className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                        <AlertCircle className="w-4 h-4 text-orange-500 mr-2" /> 1 Late Payment Found
                    </li>
                    <li className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                        <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" /> 2 Inquiries to Challenge
                    </li>
                </ul>
             </div>

             <div className="flex items-center gap-3 mb-6 justify-center">
                <input 
                type="checkbox" 
                id="agree"
                checked={formData.agreedToTerms}
                onChange={(e) => setFormData({...formData, agreedToTerms: e.target.checked})}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="agree" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer text-left">
                I agree to the <span className="underline">Terms</span> and grant Limited Power of Attorney.
                </label>
            </div>

             <button 
                onClick={completeOnboarding}
                disabled={!formData.agreedToTerms}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    formData.agreedToTerms
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-200 dark:shadow-none'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700'
                }`}
                >
                Fix My Credit Now <ChevronRight className="w-5 h-5" />
            </button>
          </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col relative">
      {/* Header Progress */}
      <div className="bg-white dark:bg-slate-800 px-6 py-4 shadow-sm border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (step > 1) {
                handleBack();
              } else {
                vibrate(HAPTIC.LIGHT);
                navigate('/');
              }
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          {/* Simple Dots Progress */}
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${step >= i ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
            ))}
          </div>
        </div>
        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {step === 1 ? 'Start' : step === 2 ? 'Connect' : 'Analyze'}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-md w-full mx-auto p-6 pb-32 flex flex-col justify-center">
        {step === 1 && renderStep1_Personalize()}
        {step === 2 && renderStep2_Connect()}
        {step === 3 && renderStep3_Analyze()}
      </div>

      {/* Footer Actions (Only for Step 1, others have inline buttons) */}
      {step === 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 p-6 border-t border-slate-100 dark:border-slate-700 flex justify-center">
            <div className="max-w-md w-full">
                <button 
                onClick={handleNext}
                disabled={!formData.firstName || !formData.goal}
                className={`w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    formData.firstName && formData.goal
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none' 
                    : 'bg-slate-300 cursor-not-allowed dark:bg-slate-700'
                }`}
                >
                Continue <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {showConnectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Connect Report</h3>
                    <button onClick={() => setShowConnectModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleConnectSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Provider</label>
                        <select 
                            value={connectForm.provider}
                            onChange={(e) => setConnectForm({...connectForm, provider: e.target.value})}
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="IdentityIQ">IdentityIQ</option>
                            <option value="SmartCredit">SmartCredit</option>
                            <option value="PrivacyGuard">PrivacyGuard</option>
                            <option value="MyScoreIQ">MyScoreIQ</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Username / Email</label>
                        <input 
                            type="text" 
                            placeholder="Enter username"
                            value={connectForm.username}
                            onChange={(e) => setConnectForm({...connectForm, username: e.target.value})}
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                        <div className="relative">
                            <input 
                                type="password" 
                                placeholder="Enter password"
                                value={connectForm.password}
                                onChange={(e) => setConnectForm({...connectForm, password: e.target.value})}
                                className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <Lock className="absolute right-3 top-3.5 w-4 h-4 text-slate-400" />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium py-1">
                        <Lock className="w-3 h-3" /> 256-bit Bank Level Encryption
                    </div>

                    <button 
                        type="submit"
                        disabled={connectLoading || !connectForm.username || !connectForm.password}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {connectLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Zap className="w-5 h-5" />}
                        {connectLoading ? 'Verifying...' : 'Secure Connect'}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
