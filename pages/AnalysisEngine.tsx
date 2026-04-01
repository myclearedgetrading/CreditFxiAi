
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  UploadCloud, FileText, AlertTriangle, CheckCircle2, BrainCircuit, 
  ArrowRight, TrendingUp, Scale, Loader2, ScanLine, Camera, Zap, 
  ChevronRight, Lock, X, ExternalLink, Shield, Crown
} from 'lucide-react';
import { analyzeCreditReportImage, analyzeCreditReportPdf } from '../services/geminiService';
import { Bureau, CreditAnalysisResult, NegativeItem } from '../types';
import { vibrate, HAPTIC } from '../services/mobileService';
import { useUser } from '../context/UserContext';
import { saveUserToFirestore } from '../services/firebaseService';

const readFileAsDataUrl = (f: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read selected file.'));
    reader.readAsDataURL(f);
  });

const parseBureaus = (source: string): Bureau[] => {
  const s = source.toLowerCase();
  const bureaus: Bureau[] = [];
  if (s.includes('equifax')) bureaus.push(Bureau.EQUIFAX);
  if (s.includes('experian')) bureaus.push(Bureau.EXPERIAN);
  if (s.includes('transunion') || s.includes('trans union')) bureaus.push(Bureau.TRANSUNION);
  return bureaus.length > 0 ? bureaus : [Bureau.EQUIFAX];
};

const toDisputableItems = (analysis: CreditAnalysisResult): NegativeItem[] => {
  return (analysis.negativeItems || []).map((item, idx) => ({
    id: `parsed-${Date.now()}-${idx}`,
    type: item.accountType || 'Negative Item',
    creditor: item.creditor || 'Unknown Creditor',
    accountNumber: '****',
    amount: Number(item.amount || 0),
    dateReported: item.date || new Date().toISOString().slice(0, 10),
    bureau: parseBureaus(item.bureau || ''),
    status: 'Open',
  }));
};

const MAX_PDF_SIZE_BYTES = 4.5 * 1024 * 1024;

const AnalysisEngine: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<CreditAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState(0);

  // Connect Modal State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectForm, setConnectForm] = useState({
    provider: 'IdentityIQ',
    username: '',
    password: ''
  });
  const hasPremiumAccess =
    user.role === 'ADMIN'
    || user.role === 'SUPER_ADMIN'
    || user.subscriptionTier === 'PRO'
    || user.subscriptionStatus === 'ACTIVE'
    || user.subscriptionStatus === 'TRIAL';

  const persistAnalysisToProfile = async (
    analysisResult: CreditAnalysisResult,
    selectedFile: File,
    source: 'PDF' | 'IMAGE' | 'PROVIDER'
  ) => {
    const disputableItems = toDisputableItems(analysisResult);
    const profileUpdate = {
      negativeItems: disputableItems,
      creditScore: {
        equifax: user.creditScore.equifax || 0,
        experian: user.creditScore.experian || 0,
        transunion: user.creditScore.transunion || 0,
      },
      lastReportAnalysisAt: new Date().toISOString(),
      lastReportFileName: selectedFile.name,
      lastReportSource: source,
      lastEstimatedScoreImprovement: analysisResult.summary?.estimatedScoreImprovement || 0,
      lastNegativeItemCount: analysisResult.summary?.totalNegativeItems || disputableItems.length,
    } as const;

    updateUser(profileUpdate);
    if (user.id) {
      await saveUserToFirestore({ ...user, ...profileUpdate });
    }
  };

  useEffect(() => {
    if (location.state && (location.state as any).openConnect) {
      setShowConnectModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    vibrate(HAPTIC.LIGHT);
    if (selectedFile.type === 'application/pdf' && selectedFile.size > MAX_PDF_SIZE_BYTES) {
      setError('PDF is too large for direct analysis. Please upload a PDF under 4.5 MB or split/export fewer pages.');
      setFile(null);
      setPreview(null);
      return;
    }
    setFile(selectedFile);
    setError(null);
    setResult(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    if (selectedFile.type.includes('image')) {
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview('DOC_PREVIEW');
    }
  };

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectForm.username || !connectForm.password) return;

    setConnectLoading(true);
    vibrate(HAPTIC.MEDIUM);

    setTimeout(() => {
        setConnectLoading(false);
        setShowConnectModal(false);
        // This would call a backend service to scrape/fetch the report
        alert("Integrations are currently disabled. Please upload a file manually.");
        vibrate(HAPTIC.WARNING);
    }, 2000);
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

  const handleAnalysis = async () => {
    if (!preview || !file) return;

    vibrate(HAPTIC.MEDIUM);
    setAnalyzing(true);
    setError(null);
    setProgressStep(1);

    const stepInterval = setInterval(() => {
      setProgressStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 1500);

    try {
      if (file.type.includes('image') && preview !== 'DOC_PREVIEW') {
         const base64Data = preview!.split(',')[1];
         const mimeType = file.type;
         const analysisResult = await analyzeCreditReportImage(base64Data, mimeType);
         setResult(analysisResult);
         await persistAnalysisToProfile(analysisResult, file, 'IMAGE');
      } else if (file.type === 'application/pdf') {
         const dataUrl = await readFileAsDataUrl(file);
         const base64Data = dataUrl.split(',')[1];
         if (!base64Data) {
           throw new Error('Could not read the PDF file. Please try again.');
         }
         const analysisResult = await analyzeCreditReportPdf(base64Data, 'application/pdf');
         setResult(analysisResult);
         await persistAnalysisToProfile(analysisResult, file, 'PDF');
      } else {
         throw new Error('Unsupported file type. Please upload a JPG, PNG, WEBP, or PDF report.');
      }
      
      clearInterval(stepInterval);
      setProgressStep(4); 
      vibrate(HAPTIC.SUCCESS);
    } catch (err: any) {
      clearInterval(stepInterval);
      const message = String(err?.message || '');
      if (message.includes('500')) {
        setError('We could not process this PDF format yet. Try a smaller/text-based PDF or upload clear screenshots of each report section.');
      } else {
        setError(message || 'Failed to analyze document.');
      }
      vibrate(HAPTIC.ERROR);
    } finally {
      setAnalyzing(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-900/30';
    if (score >= 50) return 'text-orange-400 bg-orange-900/30';
    return 'text-red-400 bg-red-900/30';
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <BrainCircuit className="text-orange-500" />
          Advanced Credit Analysis Engine
        </h1>
        <p className="text-slate-400 mt-2">
          Upload or scan a credit report to identify FCRA violations and generate AI strategies.
        </p>
      </div>

      {!result && (
        <div className="max-w-2xl mx-auto">
          <div 
            className={`
              relative border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer
              ${isDragging ? 'border-orange-500 bg-orange-900/20' : 'border-slate-700 hover:border-orange-500 bg-[#0A0A0A]'}
              ${analyzing ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <input 
              type="file" 
              id="fileInput" 
              className="hidden" 
              accept="image/*,.pdf,application/pdf" 
              capture="environment" 
              onChange={handleFileChange} 
            />
            
            {preview ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-orange-900/30 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                  {preview === 'DOC_PREVIEW' ? (
                      <FileText className="w-8 h-8 text-orange-500" />
                  ) : (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  )}
                </div>
                <p className="font-medium text-white">{file?.name}</p>
                <p className="text-sm text-slate-400 mt-1">{(file?.size! / 1024 / 1024).toFixed(2)} MB</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                  className="mt-4 text-sm text-red-400 hover:text-red-300 font-medium"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Tap to Scan or Upload</h3>
                <p className="text-slate-400 mt-1">Supports JPG, PNG, WEBP, and PDF reports</p>
              </div>
            )}
          </div>

          {!file && !analyzing && (
            <>
              <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                  <span className="px-2 bg-[#050505] text-slate-500">OR</span>
                  </div>
              </div>

              <button
                  onClick={() => setShowConnectModal(true)}
                  className="w-full py-4 bg-[#0A0A0A] border-2 border-slate-800 hover:border-orange-500 rounded-xl flex items-center justify-between px-6 transition-all group shadow-sm mb-8"
              >
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-900/30 rounded-full flex items-center justify-center text-orange-500">
                          <Zap className="w-5 h-5 fill-current" />
                      </div>
                      <div className="text-left">
                          <h3 className="font-bold text-white group-hover:text-orange-500">Connect Provider</h3>
                          <p className="text-sm text-slate-400">IdentityIQ, SmartCredit, etc.</p>
                      </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-orange-500" />
              </button>

              <div className="border-t border-slate-800 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Don't have a report?</h3>
                    <span className="text-[10px] text-green-500 bg-green-900/20 px-2 py-0.5 rounded border border-green-900/30">Get for $1</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                {[
                    { name: 'IdentityIQ', offer: 'Get for $1', desc: 'Detailed 3-Bureau Report', color: 'text-blue-400', hoverColor: 'hover:border-blue-500/30 hover:shadow-blue-500/10' },
                    { name: 'SmartCredit', offer: 'Get for $1', desc: 'Best for Score Tracking', color: 'text-green-400', hoverColor: 'hover:border-green-500/30 hover:shadow-green-500/10' },
                    { name: 'MyFreeScoreNow', offer: 'Free Trial', desc: 'Fastest Updates', color: 'text-red-400', hoverColor: 'hover:border-red-500/30 hover:shadow-red-500/10' },
                    { name: 'PrivacyGuard', offer: 'Get for $1', desc: 'Identity Protection', color: 'text-purple-400', hoverColor: 'hover:border-purple-500/30 hover:shadow-purple-500/10' },
                ].map((provider) => (
                    <div 
                    key={provider.name}
                    onClick={() => handleAffiliateClick(provider.name)}
                    className={`bg-[#0A0A0A] border border-slate-800 p-4 rounded-xl cursor-pointer transition-all duration-300 group flex flex-col justify-between h-32 relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 ${provider.hoverColor}`}
                    >
                    <div className="flex justify-between items-start z-10">
                        <div className="w-8 h-8 rounded-full bg-[#050505] flex items-center justify-center border border-slate-800 group-hover:border-slate-700 transition-colors">
                        <Shield className={`w-4 h-4 ${provider.color}`} />
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="z-10">
                        <h4 className="font-bold text-white text-xs truncate mb-1">{provider.name}</h4>
                        <span className="inline-block bg-slate-900 text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-800 group-hover:border-slate-700 transition-colors">
                        {provider.offer}
                        </span>
                    </div>
                    </div>
                ))}
                </div>
              </div>
            </>
          )}

          {analyzing && (
            <div className="mt-8 space-y-4">
              <div className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                <span className={progressStep >= 1 ? 'text-orange-500' : ''}>1. OCR Scanning</span>
                <span className={progressStep >= 2 ? 'text-orange-500' : ''}>2. Violation Check</span>
                <span className={progressStep >= 3 ? 'text-orange-500' : ''}>3. Strategy Formulation</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-600 transition-all duration-500 ease-out"
                  style={{ width: `${progressStep * 33.33}%` }}
                />
              </div>
              <div className="flex items-center justify-center text-orange-500 gap-2">
                <Loader2 className="animate-spin w-5 h-5" />
                <span className="font-medium">Gemini AI is analyzing document structure...</span>
              </div>
            </div>
          )}

          {file && !analyzing && (
            <button 
              onClick={handleAnalysis}
              className="mt-6 w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <ScanLine className="w-5 h-5" />
              Analyze Report
            </button>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-900 text-red-400 rounded-lg flex items-center">
              <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-8 animate-fade-in pb-20">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0A0A0A] p-6 rounded-xl shadow-sm border border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-slate-400 font-medium">Negative Items</h3>
              </div>
              <p className="text-3xl font-bold text-white">{result.summary.totalNegativeItems}</p>
            </div>
            
            <div className="bg-[#0A0A0A] p-6 rounded-xl shadow-sm border border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-slate-400 font-medium">Potential Gain</h3>
              </div>
              <p className="text-3xl font-bold text-white">+{result.summary.estimatedScoreImprovement} pts</p>
            </div>

            <div className="bg-[#0A0A0A] p-6 rounded-xl shadow-sm border border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-900/30 rounded-lg">
                  <Scale className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-slate-400 font-medium">Discrepancies</h3>
              </div>
              <p className="text-3xl font-bold text-white">{result.discrepancies.length}</p>
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 font-bold">Report Processed</p>
              <p className="text-sm text-slate-200 mt-1">
                {file?.name || 'Uploaded report'} analyzed and saved to your profile.
              </p>
            </div>
            <div className="flex gap-2">
              {hasPremiumAccess ? (
                <button
                  onClick={() => navigate('/disputes')}
                  className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold"
                >
                  Generate Dispute Letters
                </button>
              ) : (
                <button
                  onClick={() => navigate('/settings')}
                  className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-semibold inline-flex items-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade to Unlock Letters
                </button>
              )}
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm border border-slate-700 hover:bg-slate-800 text-slate-200 rounded-lg font-semibold"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Analysis & Strategies */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Recommendations Section */}
              <div className="bg-[#0A0A0A] rounded-xl shadow-sm border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                  <h3 className="text-lg font-bold text-white">AI Strategy Recommendations</h3>
                </div>
                <div className="p-6 space-y-6">
                  {result.recommendations.map((rec, idx) => (
                    <div key={idx} className="border border-slate-700 rounded-lg p-5 hover:border-orange-500 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-white text-lg">{rec.creditorName}</h4>
                          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Target: {rec.bureauToTarget}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getConfidenceColor(rec.confidenceScore)}`}>
                          {rec.confidenceScore}% Match
                        </span>
                      </div>
                      
                      <div className="bg-slate-800 p-4 rounded-lg mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-semibold text-orange-200">Recommended Strategy: {rec.recommendedStrategy}</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed pl-6">{rec.reasoning}</p>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => navigate('/disputes', {
                            state: {
                              prefillStrategy: rec.recommendedStrategy,
                              prefillBureau: rec.bureauToTarget,
                              prefillCreditor: rec.creditorName,
                            },
                          })}
                          className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors active:bg-orange-800"
                        >
                          Generate {rec.recommendedStrategy} Letter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Plan */}
              <div className="bg-[#0A0A0A] rounded-xl shadow-sm border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                  <h3 className="text-lg font-bold text-white">90-Day Action Plan</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-8">
                    {result.actionPlan.map((step, idx) => (
                      <div key={idx} className="relative pl-8 border-l-2 border-slate-700 last:border-0">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-orange-600 border-4 border-[#0A0A0A] shadow-sm" />
                        <h4 className="text-sm font-bold text-orange-500 uppercase mb-2">{step.phase}</h4>
                        <ul className="space-y-2 mb-3">
                          {step.actions.map((action, i) => (
                            <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5" />
                              {action}
                            </li>
                          ))}
                        </ul>
                        <div className="text-xs font-medium text-slate-400 bg-slate-800 inline-block px-3 py-1 rounded-full">
                          Goal: {step.expectedOutcome}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Discrepancies & Stats */}
            <div className="space-y-6">
              <div className="bg-[#0A0A0A] rounded-xl shadow-sm border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                  <h3 className="text-lg font-bold text-white">Cross-Bureau Inconsistencies</h3>
                </div>
                <div className="divide-y divide-slate-800">
                  {result.discrepancies.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">No inconsistencies detected.</div>
                  ) : (
                    result.discrepancies.map((disc, idx) => (
                      <div key={idx} className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${disc.severity === 'HIGH' ? 'text-red-500' : 'text-orange-500'}`} />
                          <div>
                            <h5 className="text-sm font-semibold text-slate-200">{disc.type.replace('_', ' ')}</h5>
                            <p className="text-xs text-slate-400 mt-1">{disc.description}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {disc.itemsInvolved.map((item, i) => (
                                <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Parsed Items List */}
              <div className="bg-[#0A0A0A] rounded-xl shadow-sm border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                  <h3 className="text-lg font-bold text-white">Identified Negative Items</h3>
                </div>
                <div className="divide-y divide-slate-800">
                  {result.negativeItems.map((item, idx) => (
                    <div key={idx} className="p-4 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-slate-200">{item.creditor}</div>
                        <div className="text-xs text-slate-400">{item.accountType} • {item.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-300">${item.amount}</div>
                        <div className="text-[10px] font-bold text-orange-400 bg-orange-900/30 px-2 py-0.5 rounded-full inline-block">
                          {item.bureau}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONNECT MODAL */}
      {showConnectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#0A0A0A] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-700">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">Connect Report</h3>
                    <button onClick={() => setShowConnectModal(false)} className="text-slate-400 hover:text-white">
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

export default AnalysisEngine;
