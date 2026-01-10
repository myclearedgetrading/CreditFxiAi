import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, ChevronRight, Upload, Shield, CreditCard, 
  FileText, User, Home, Car, TrendingUp, AlertCircle, 
  ArrowLeft, Lock, PenTool, Loader2, X, Check
} from 'lucide-react';
import { vibrate, HAPTIC } from '../services/mobileService';

const STORAGE_KEY = 'creditfix_onboarding_state';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const [formData, setFormData] = useState({
    goals: [] as string[],
    firstName: '',
    lastName: '',
    dob: '',
    ssn: '',
    idFile: null as string | null,
    utilityFile: null as string | null,
    reportFile: null as string | null,
    reportProvider: '',
    agreedToTerms: false
  });

  // Load state from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStep(parsed.step || 1);
        setFormData(parsed.formData || formData);
      } catch (e) {
        console.error("Failed to load onboarding state", e);
      }
    }
  }, []);

  // Save state to local storage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, formData }));
  }, [step, formData]);

  const totalSteps = 5;

  const validateStep = () => {
    switch(step) {
      case 1: return formData.goals.length > 0;
      case 2: return formData.firstName && formData.lastName && formData.dob && formData.ssn.length >= 4;
      case 3: return !!formData.idFile && !!formData.utilityFile;
      case 4: return !!formData.reportProvider || !!formData.reportFile;
      case 5: return formData.agreedToTerms;
      default: return false;
    }
  };

  const handleNext = () => {
    if (!validateStep()) {
      vibrate(HAPTIC.ERROR);
      alert("Please complete all required fields.");
      return;
    }
    vibrate(HAPTIC.LIGHT);
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    vibrate(HAPTIC.LIGHT);
    if (step > 1) setStep(step - 1);
  };

  const completeOnboarding = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowConfetti(true);
      vibrate(HAPTIC.SUCCESS);
      
      // Clear storage after success
      localStorage.removeItem(STORAGE_KEY);
      
      setTimeout(() => {
        navigate('/');
      }, 2500);
    }, 2000);
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal) 
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const simulateUpload = (field: 'idFile' | 'utilityFile' | 'reportFile') => {
    vibrate(HAPTIC.MEDIUM);
    // Simulate file selection with generic names
    const mockNames = {
      idFile: 'photo_id.jpg',
      utilityFile: 'proof_of_address.pdf',
      reportFile: 'credit_report.pdf'
    };
    setFormData(prev => ({ ...prev, [field]: mockNames[field] }));
  };

  const renderStep1_Goals = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">What are your financial goals?</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Select at least one. This helps us prioritize your disputes.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { id: 'mortgage', label: 'Buy a House', icon: Home },
          { id: 'auto', label: 'Buy a Car', icon: Car },
          { id: 'card', label: 'Get Credit Cards', icon: CreditCard },
          { id: 'score', label: '700+ Score', icon: TrendingUp },
          { id: 'clean', label: 'Remove Collections', icon: FileText },
          { id: 'identity', label: 'Fix Identity Theft', icon: Shield },
        ].map((item) => (
          <div 
            key={item.id}
            onClick={() => toggleGoal(item.id)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
              formData.goals.includes(item.id)
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-500'
                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
            }`}
          >
            <div className={`p-2 rounded-full ${formData.goals.includes(item.id) ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className={`font-semibold ${formData.goals.includes(item.id) ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-300'}`}>
              {item.label}
            </span>
            {formData.goals.includes(item.id) && <CheckCircle2 className="ml-auto w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep2_Profile = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Confirm Your Details</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Ensure this matches your government ID exactly.</p>
      </div>

      <div className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              placeholder="Enter first name"
              className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              placeholder="Enter last name"
              className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date of Birth <span className="text-red-500">*</span></label>
          <input 
            type="date" 
            value={formData.dob}
            onChange={(e) => setFormData({...formData, dob: e.target.value})}
            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Social Security Number <span className="text-red-500">*</span></label>
          <div className="relative">
            <input 
              type="password" 
              placeholder="XXX-XX-XXXX"
              value={formData.ssn}
              onChange={(e) => setFormData({...formData, ssn: e.target.value})}
              className="w-full p-3 pl-10 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 dark:text-white tracking-widest"
            />
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center">
            <Shield className="w-3 h-3 mr-1" /> Encrypted with AES-256
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3_Identity = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Verify Identity</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Required by the credit bureaus to process disputes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photo ID Upload */}
        <div 
          onClick={() => simulateUpload('idFile')}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
            formData.idFile 
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
              : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-800/50'
          }`}
        >
          {formData.idFile ? (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-green-700 dark:text-green-300">ID Uploaded</h3>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 mb-4">{formData.idFile}</p>
              <button 
                onClick={(e) => { e.stopPropagation(); setFormData({...formData, idFile: null}); }}
                className="text-xs text-red-500 hover:underline"
              >
                Remove
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate-200">Photo ID</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Driver's License or Passport</p>
              <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg">Upload Photo</button>
            </>
          )}
        </div>

        {/* Proof of Address Upload */}
        <div 
          onClick={() => simulateUpload('utilityFile')}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
            formData.utilityFile
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
              : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-800/50'
          }`}
        >
          {formData.utilityFile ? (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-green-700 dark:text-green-300">Proof Uploaded</h3>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 mb-4">{formData.utilityFile}</p>
              <button 
                onClick={(e) => { e.stopPropagation(); setFormData({...formData, utilityFile: null}); }}
                className="text-xs text-red-500 hover:underline"
              >
                Remove
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4">
                <Home className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate-200">Proof of Address</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Utility Bill or Bank Statement</p>
              <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">Upload Photo</button>
            </>
          )}
        </div>
      </div>
      
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Make sure all 4 corners of the document are visible and the text is clear. Addresses must match your profile.
        </p>
      </div>
    </div>
  );

  const renderStep4_CreditReport = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Import Credit Report</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Connect a monitoring service to automatically import your data.</p>
      </div>

      <div className="space-y-3">
        {['IdentityIQ', 'SmartCredit', 'PrivacyGuard', 'MyScoreIQ'].map((provider) => (
          <div 
            key={provider}
            onClick={() => setFormData(prev => ({...prev, reportProvider: provider, reportFile: null}))}
            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
              formData.reportProvider === provider 
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-500' 
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs">
                LOGO
              </div>
              <span className="font-semibold text-slate-800 dark:text-white">{provider}</span>
            </div>
            {formData.reportProvider === provider ? (
              <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                <CheckCircle2 className="w-5 h-5 mr-1" /> Connected
              </div>
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
          </div>
        ))}
      </div>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-slate-50 dark:bg-slate-900 text-slate-500">Or manually upload</span>
        </div>
      </div>

      <button 
        onClick={() => simulateUpload('reportFile')}
        className={`w-full py-3 border border-dashed rounded-xl transition-colors flex items-center justify-center gap-2 ${
          formData.reportFile
            ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
            : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
        }`}
      >
        {formData.reportFile ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Uploaded: {formData.reportFile}
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            Upload PDF Report
          </>
        )}
      </button>
    </div>
  );

  const renderStep5_Agreement = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Service Agreement</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Please review and sign to authorize us to work on your behalf.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl h-64 overflow-y-auto text-sm text-slate-600 dark:text-slate-300 leading-relaxed shadow-inner">
        <p className="font-bold mb-2">LIMITED POWER OF ATTORNEY</p>
        <p className="mb-4">
          I, {formData.firstName || '[First Name]'} {formData.lastName || '[Last Name]'}, hereby grant CreditFix AI Limited Power of Attorney for the sole purpose of drafting and sending correspondence to credit bureaus (Equifax, Experian, TransUnion), creditors, and collection agencies...
        </p>
        <p className="font-bold mb-2">SERVICE TERMS</p>
        <p className="mb-4">
          Services provided are for credit education and document preparation. No specific results are guaranteed as per CROA regulations...
        </p>
        <p>[... Full Legal Text ...]</p>
      </div>

      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <input 
          type="checkbox" 
          id="agree"
          checked={formData.agreedToTerms}
          onChange={(e) => setFormData({...formData, agreedToTerms: e.target.checked})}
          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
        />
        <label htmlFor="agree" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
          I have read and agree to the Service Agreement and grant Limited Power of Attorney.
        </label>
      </div>

      <div className="border border-slate-300 dark:border-slate-600 rounded-xl p-4 bg-white dark:bg-slate-800">
        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Digital Signature</label>
        <div className="h-20 flex items-center justify-center text-4xl font-cursive text-indigo-900 dark:text-indigo-300 italic opacity-80 border-b border-dashed border-slate-200">
          {formData.agreedToTerms ? `${formData.firstName} ${formData.lastName}` : ''}
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
          <span>Signed: {new Date().toLocaleDateString()}</span>
          <div className="flex items-center gap-1 text-indigo-600 cursor-pointer">
            <PenTool className="w-3 h-3" /> Redraw
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-slate-900 animate-fade-in">
        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Setting Up Your Dashboard</h2>
        <p className="text-slate-500 mt-2">AI is analyzing your credit profile...</p>
      </div>
    );
  }

  if (showConfetti) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-slate-900 animate-fade-in relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
           {/* Simple CSS-only confetti effect simulation */}
           {[...Array(20)].map((_, i) => (
             <div key={i} className={`absolute animate-bounce`} style={{
               left: `${Math.random() * 100}%`,
               top: `${Math.random() * 50}%`,
               animationDelay: `${Math.random()}s`,
               fontSize: '24px'
             }}>
               {['🎉', '✨', '🚀', '✅'][i % 4]}
             </div>
           ))}
        </div>
        <CheckCircle2 className="w-24 h-24 text-green-500 mb-6 animate-pulse" />
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">All Set!</h2>
        <p className="text-slate-500 text-lg">Welcome to CreditFix AI.</p>
        <p className="text-sm text-slate-400 mt-2">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Header Progress */}
      <div className="bg-white dark:bg-slate-800 px-6 py-4 shadow-sm border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          {step > 1 && (
            <button onClick={handleBack} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="font-bold text-lg text-slate-800 dark:text-white">Onboarding</h1>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          Step {step} of {totalSteps}
          <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-2xl w-full mx-auto p-6 pb-32">
        {step === 1 && renderStep1_Goals()}
        {step === 2 && renderStep2_Profile()}
        {step === 3 && renderStep3_Identity()}
        {step === 4 && renderStep4_CreditReport()}
        {step === 5 && renderStep5_Agreement()}
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 p-6 border-t border-slate-100 dark:border-slate-700 flex justify-center">
        <div className="max-w-2xl w-full flex gap-4">
          {step < totalSteps ? (
            <button 
              onClick={handleNext}
              className={`w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                validateStep() 
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none' 
                  : 'bg-slate-300 cursor-not-allowed dark:bg-slate-700'
              }`}
            >
              Continue <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={completeOnboarding}
              disabled={!formData.agreedToTerms}
              className={`w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                formData.agreedToTerms
                  ? 'bg-green-600 hover:bg-green-700 shadow-green-200 dark:shadow-none'
                  : 'bg-slate-300 cursor-not-allowed dark:bg-slate-700'
              }`}
            >
              Complete Setup <CheckCircle2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;