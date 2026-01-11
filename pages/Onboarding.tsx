
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle2, ChevronRight, Upload, Shield, CreditCard, 
  FileText, User, Home, Car, TrendingUp, AlertCircle, 
  ArrowLeft, Lock, Loader2, Sparkles, Zap, Check, X, ArrowRight,
  ScrollText, PenTool, Scale
} from 'lucide-react';
import { vibrate, HAPTIC } from '../services/mobileService';

const STORAGE_KEY = 'creditfix_onboarding_state';

const LEGAL_DOCS = {
  AGREEMENT: `CREDIT REPAIR SERVICE AGREEMENT

1. PARTIES
This Service Agreement ("Agreement") is entered into by and between the undersigned ("Client") and CreditFix AI ("Provider").

2. SERVICES
Provider agrees to analyze Client's credit reports, identify negative items, and generate dispute correspondence ("Services"). Client understands that Provider is an AI-powered software platform and not a law firm.

3. CLIENT OBLIGATIONS
Client agrees to provide accurate identification documents and credit monitoring credentials. Client agrees to forward any correspondence received from credit bureaus to Provider immediately.

4. FEES
Services are provided on a monthly subscription basis. Client may cancel at any time via the dashboard.

5. DISCLAIMER OF GUARANTEE
Provider cannot guarantee specific outcomes or score increases. Credit repair results vary based on individual circumstances.

6. ELECTRONIC SIGNATURE
By signing this Agreement, Client consents to the use of electronic signatures and records.`,

  CROA: `CONSUMER CREDIT FILE RIGHTS UNDER STATE AND FEDERAL LAW (CROA DISCLOSURE)

You have a right to dispute inaccurate information in your credit report by contacting the credit bureau directly. However, neither you nor any "credit repair" company or credit repair organization has the right to have accurate, current, and verifiable information removed from your credit report. The credit bureau must remove accurate, negative information from your report only if it is over 7 years old. Bankruptcy information can be reported for 10 years.

You have a right to obtain a copy of your credit report from a credit bureau. You may be charged a reasonable fee. There is no fee, however, if you have been turned down for credit, employment, insurance, or a rental dwelling because of information in your credit report within the preceding 60 days. The credit bureau must provide someone to help you interpret the information in your credit file. You are entitled to receive a free copy of your credit report if you are unemployed and intend to apply for employment in the next 60 days, if you are a recipient of public welfare assistance, or if you have reason to believe that there is inaccurate information in your credit report due to fraud.

You have a right to sue a credit repair organization that violates the Credit Repair Organizations Act. This law prohibits deceptive practices by credit repair organizations.

You have the right to cancel your contract with any credit repair organization for any reason within 3 business days from the date you signed it.`,

  LPOA: `LIMITED POWER OF ATTORNEY

I, the undersigned Client, hereby grant CreditFix AI ("Agent") a Limited Power of Attorney to act on my behalf for the specific and limited purpose of:

1. Requesting and obtaining consumer credit reports from Equifax, Experian, and TransUnion.
2. Preparing, signing, and submitting dispute letters and challenges regarding inaccurate, unfair, or unsubstantiated items on my credit reports.
3. Communicating with creditors, collection agencies, and credit bureaus regarding my accounts.

This Limited Power of Attorney shall remain in effect until my subscription with CreditFix AI is terminated. I understand I may revoke this power of attorney at any time by providing written notice.`
};

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  
  // Legal State
  const [activeLegalTab, setActiveLegalTab] = useState<'AGREEMENT' | 'CROA' | 'LPOA'>('AGREEMENT');
  
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
    goal: '', 
    reportProvider: '',
    reportFile: null as string | null,
    agreedToTerms: false,
    signature: ''
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

    if (location.state && (location.state as any).step) {
      setStep((location.state as any).step);
      if (savedState?.formData) {
        setFormData(savedState.formData);
      }
    } else if (savedState) {
      setStep(savedState.step || 1);
      setFormData(savedState.formData || formData);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, formData }));
  }, [step, formData]);

  const totalSteps = 4;

  const handleNext = () => {
    if (step === 1 && (!formData.firstName.trim() || !formData.goal)) {
      vibrate(HAPTIC.ERROR);
      return; 
    }
    
    if (step === 3 && (!formData.signature || !formData.agreedToTerms)) {
        vibrate(HAPTIC.ERROR);
        return;
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
    setTimeout(() => {
        setAnalyzing(false);
        setAnalysisComplete(true);
        vibrate(HAPTIC.SUCCESS);
    }, 2500);
  };

  const renderStep1_Personalize = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Let's start your journey.</h2>
        <p className="text-slate-400">We'll build a custom dispute strategy for you.</p>
      </div>

      <div className="space-y-4">
        <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">What should we call you?</label>
            <input 
              type="text" 
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              placeholder="Your First Name"
              className="w-full p-4 text-lg border border-slate-600 rounded-xl bg-slate-800 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-sm"
              autoFocus
            />
        </div>

        <div>
            <label className="block text-sm font-bold text-slate-300 mb-3">What is your #1 goal?</label>
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
                        ? 'border-orange-500 bg-orange-900/30 shadow-[0_0_10px_rgba(234,88,12,0.3)] transform scale-[1.02]'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-800'
                    }`}
                >
                    <div className={`p-2 rounded-full ${formData.goal === item.id ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-500'}`}>
                    <item.icon className="w-6 h-6" />
                    </div>
                    <span className={`font-bold text-sm ${formData.goal === item.id ? 'text-orange-200' : 'text-slate-300'}`}>
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
        <h2 className="text-3xl font-bold text-white mb-2">Connect your report.</h2>
        <p className="text-slate-400">We need your credit data to find errors. Securely connect or upload a file.</p>
      </div>

      <div className="space-y-4">
        <div 
            onClick={() => {
                vibrate(HAPTIC.LIGHT);
                setShowConnectModal(true);
            }}
            className="group relative overflow-hidden bg-slate-800 border-2 border-slate-700 hover:border-orange-500 rounded-2xl p-6 cursor-pointer transition-all shadow-sm hover:shadow-md"
        >
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-900/50 rounded-full flex items-center justify-center text-orange-500">
                        <Zap className="w-6 h-6 fill-current" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-lg text-white group-hover:text-orange-500 transition-colors">Instant Connect</h3>
                        <p className="text-sm text-slate-400">IdentityIQ, SmartCredit, etc.</p>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500" />
            </div>
        </div>

        <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
            <span className="px-2 bg-slate-900 text-slate-400">OR</span>
            </div>
        </div>

        <div 
            onClick={() => document.getElementById('report-upload')?.click()}
            className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-slate-600 hover:bg-slate-800 cursor-pointer transition-colors"
        >
            <input 
              type="file" 
              id="report-upload" 
              className="hidden" 
              accept=".pdf,.html" 
              onChange={handleManualUpload}
            />
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-slate-500">
                <Upload className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-sm text-slate-300">Upload Manually (PDF/HTML)</h3>
                <p className="text-xs text-slate-500">Best for: Right-click "Save As" HTML</p>
            </div>
        </div>

        <div className="pt-2">
            <button 
                onClick={handleSkip}
                className="w-full py-3 rounded-xl font-semibold bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
                Skip for now <ArrowRight className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );

  const renderStep3_Legal = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Service Agreement</h2>
            <p className="text-slate-400 text-sm">Please review and sign the required legal documents to proceed.</p>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-700">
                {[
                    { id: 'AGREEMENT', label: 'Service Contract', icon: ScrollText },
                    { id: 'CROA', label: 'CROA Rights', icon: Scale },
                    { id: 'LPOA', label: 'Power of Attorney', icon: FileText }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveLegalTab(tab.id as any)}
                        className={`flex-1 py-3 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-colors ${
                            activeLegalTab === tab.id 
                                ? 'bg-slate-700 text-white border-b-2 border-orange-500' 
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Document Content */}
            <div className="p-4 h-64 overflow-y-auto bg-slate-900/50 text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-mono custom-scrollbar">
                {LEGAL_DOCS[activeLegalTab]}
            </div>
        </div>

        {/* Signature Section */}
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-orange-500" /> Digital Signature
                </label>
                <input 
                    type="text" 
                    value={formData.signature}
                    onChange={(e) => setFormData({...formData, signature: e.target.value})}
                    placeholder="Type your full legal name"
                    className="w-full p-3 border border-slate-600 rounded-lg bg-slate-800 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none font-script text-xl"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                    By typing your name, you agree your electronic signature is the legal equivalent of your manual signature.
                </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg border border-slate-700 cursor-pointer" onClick={() => setFormData({...formData, agreedToTerms: !formData.agreedToTerms})}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.agreedToTerms ? 'bg-green-500 border-green-500' : 'border-slate-500'}`}>
                    {formData.agreedToTerms && <Check className="w-3 h-3 text-white" />}
                </div>
                <label className="text-sm text-slate-300 cursor-pointer select-none">
                    I have read and agree to the Service Agreement, CROA Disclosure, and Limited Power of Attorney.
                </label>
            </div>

            <button 
                onClick={handleNext}
                disabled={!formData.signature || !formData.agreedToTerms}
                className={`w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    formData.signature && formData.agreedToTerms
                    ? 'bg-orange-600 hover:bg-orange-700 shadow-[0_0_15px_rgba(234,88,12,0.3)]' 
                    : 'bg-slate-700 cursor-not-allowed'
                }`}
            >
                Accept & Continue <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    </div>
  );

  const renderStep4_Analyze = () => (
    <div className="space-y-8 animate-fade-in text-center">
      {!analysisComplete && !analyzing && (
          <div className="py-10">
             <div className="w-24 h-24 bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-orange-500" />
             </div>
             <h2 className="text-3xl font-bold text-white mb-4">Ready to analyze?</h2>
             <p className="text-slate-400 mb-8 max-w-sm mx-auto">
               Our AI will scan your profile for negative items, errors, and improvement opportunities.
             </p>
             <button 
                onClick={runAiScan}
                className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:scale-[1.02] transition-transform"
             >
                Start AI Scan
             </button>
          </div>
      )}

      {analyzing && (
          <div className="py-20 flex flex-col items-center">
             <Loader2 className="w-16 h-16 text-orange-600 animate-spin mb-6" />
             <h2 className="text-2xl font-bold text-white mb-2">Analyzing Profile...</h2>
             <p className="text-slate-500 animate-pulse">Checking for collections...</p>
          </div>
      )}

      {analysisComplete && (
          <div className="animate-fade-in">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/30 text-green-400 text-xs font-bold uppercase tracking-wider mb-6">
                <CheckCircle2 className="w-3 h-3" /> Scan Complete
             </div>
             <h2 className="text-3xl font-bold text-white mb-6">We found 5 items to fix!</h2>
             
             <div className="bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700 mb-8 text-left">
                <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-4">
                    <span className="font-bold text-slate-300">Potential Score Boost</span>
                    <span className="text-green-400 font-bold text-xl">+40-100 pts</span>
                </div>
                <ul className="space-y-3">
                    <li className="flex items-center text-sm text-slate-400">
                        <AlertCircle className="w-4 h-4 text-red-500 mr-2" /> 2 Collections Found
                    </li>
                    <li className="flex items-center text-sm text-slate-400">
                        <AlertCircle className="w-4 h-4 text-orange-500 mr-2" /> 1 Late Payment Found
                    </li>
                    <li className="flex items-center text-sm text-slate-400">
                        <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" /> 2 Inquiries to Challenge
                    </li>
                </ul>
             </div>

             <button 
                onClick={completeOnboarding}
                className="w-full py-4 bg-green-600 text-white hover:bg-green-700 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                Fix My Credit Now <ChevronRight className="w-5 h-5" />
            </button>
          </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col relative">
      {/* Header Progress */}
      <div className="bg-[#0A0A0A] px-6 py-4 shadow-sm border-b border-slate-800 flex justify-between items-center sticky top-0 z-50">
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
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          {/* Simple Dots Progress */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${step >= i ? 'bg-orange-600' : 'bg-slate-700'}`} />
            ))}
          </div>
        </div>
        <div className="text-sm font-bold text-orange-500">
            {step === 1 ? 'Start' : step === 2 ? 'Connect' : step === 3 ? 'Legal' : 'Analyze'}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-md w-full mx-auto p-6 pb-32 flex flex-col justify-center">
        {step === 1 && renderStep1_Personalize()}
        {step === 2 && renderStep2_Connect()}
        {step === 3 && renderStep3_Legal()}
        {step === 4 && renderStep4_Analyze()}
      </div>

      {/* Footer Actions (Only for Step 1, others have inline buttons) */}
      {step === 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A] p-6 border-t border-slate-800 flex justify-center">
            <div className="max-w-md w-full">
                <button 
                onClick={handleNext}
                disabled={!formData.firstName || !formData.goal}
                className={`w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    formData.firstName && formData.goal
                    ? 'bg-orange-600 hover:bg-orange-700 shadow-[0_0_15px_rgba(234,88,12,0.3)]' 
                    : 'bg-slate-700 cursor-not-allowed'
                }`}
                >
                Continue <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {showConnectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#0A0A0A] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-700">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">Connect Report</h3>
                    <button onClick={() => setShowConnectModal(false)} className="text-slate-400 hover:text-slate-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleConnectSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-1">Provider</label>
                        <select 
                            value={connectForm.provider}
                            onChange={(e) => setConnectForm({...connectForm, provider: e.target.value})}
                            className="w-full p-3 border border-slate-600 rounded-xl bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="IdentityIQ">IdentityIQ</option>
                            <option value="SmartCredit">SmartCredit</option>
                            <option value="PrivacyGuard">PrivacyGuard</option>
                            <option value="MyScoreIQ">MyScoreIQ</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-1">Username / Email</label>
                        <input 
                            type="text" 
                            placeholder="Enter username"
                            value={connectForm.username}
                            onChange={(e) => setConnectForm({...connectForm, username: e.target.value})}
                            className="w-full p-3 border border-slate-600 rounded-xl bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-1">Password</label>
                        <div className="relative">
                            <input 
                                type="password" 
                                placeholder="Enter password"
                                value={connectForm.password}
                                onChange={(e) => setConnectForm({...connectForm, password: e.target.value})}
                                className="w-full p-3 border border-slate-600 rounded-xl bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <Lock className="absolute right-3 top-3.5 w-4 h-4 text-slate-400" />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-xs text-green-400 font-medium py-1">
                        <Lock className="w-3 h-3" /> 256-bit Bank Level Encryption
                    </div>

                    <button 
                        type="submit"
                        disabled={connectLoading || !connectForm.username || !connectForm.password}
                        className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
