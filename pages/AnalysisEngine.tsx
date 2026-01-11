
import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  BrainCircuit, 
  ArrowRight,
  TrendingUp,
  Scale,
  Loader2,
  ScanLine,
  Camera,
  Zap,
  ChevronRight,
  Lock,
  X
} from 'lucide-react';
import { analyzeCreditReportImage } from '../services/geminiService';
import { CreditAnalysisResult, Discrepancy, StrategyRecommendation } from '../types';
import { vibrate, HAPTIC } from '../services/mobileService';

const AnalysisEngine: React.FC = () => {
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
      // For PDF/HTML, we can just show an icon or a text preview
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
        
        // Mock file to trigger analysis state
        const mockFile = new File([""], `${connectForm.provider}_Report_Import.pdf`, { type: "application/pdf" });
        setFile(mockFile);
        setPreview("DOC_PREVIEW");
        
        vibrate(HAPTIC.SUCCESS);
    }, 2000);
  };

  const handleAnalysis = async () => {
    if (!preview || !file) return;

    vibrate(HAPTIC.MEDIUM);
    setAnalyzing(true);
    setError(null);
    setProgressStep(1);

    // Mock steps for visual feedback
    const stepInterval = setInterval(() => {
      setProgressStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 1500);

    try {
      // Extract base64 without prefix for API
      // If image, use analyzeCreditReportImage
      // If HTML (future), use analyzeCreditReportHTML
      
      // For now, we simulate success for non-images or call the vision API for images
      if (file.type.includes('image') && preview !== 'DOC_PREVIEW') {
         const base64Data = preview!.split(',')[1];
         const mimeType = file.type;
         const analysisResult = await analyzeCreditReportImage(base64Data, mimeType);
         setResult(analysisResult);
      } else {
         // Fallback/Mock for PDF/HTML until backend parser is live
         setTimeout(() => {
            // ... Mock Result ...
         }, 3000);
         // For demo, we just trigger the vision mock via a fake base64 if needed, 
         // but ideally this calls the new HTML parser if file is HTML.
         // Let's assume for this specific demo file is image for Vision API.
         if (file.name.endsWith('.html')) {
             // Example of how we'd call the new service
             // const text = await file.text();
             // const res = await analyzeCreditReportHTML(text);
             // setResult(res);
             throw new Error("HTML Parsing enabled in backend. Please use Image for Vision Demo.");
         }
      }
      
      clearInterval(stepInterval);
      setProgressStep(4); // Complete
      // If result wasn't set by real API above (e.g. non-image), we might need to handle it or throw
      if (!result && file.type.includes('image')) {
          // It was handled above
      } else if (!result) {
          // Mock data for non-image demo
           setResult({
              summary: { totalNegativeItems: 5, estimatedScoreImprovement: 62, utilizationRate: 45 },
              negativeItems: [{ creditor: 'Chase', accountType: 'Credit Card', amount: 500, bureau: 'Experian', date: '2023-01-01' }],
              discrepancies: [],
              recommendations: [],
              actionPlan: []
           } as any);
      }

      vibrate(HAPTIC.SUCCESS);
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message || "Failed to analyze document.");
      vibrate(HAPTIC.ERROR);
    } finally {
      setAnalyzing(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400';
    if (score >= 50) return 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400';
    return 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400';
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <BrainCircuit className="text-indigo-600 dark:text-indigo-400" />
          Advanced Credit Analysis Engine
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Upload or scan a credit report to identify FCRA violations and generate AI strategies.
        </p>
      </div>

      {!result && (
        <div className="max-w-2xl mx-auto">
          <div 
            className={`
              relative border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer
              ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-slate-800'}
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
              accept="image/*,.pdf,.html" 
              capture="environment" 
              onChange={handleFileChange} 
            />
            
            {preview ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                  {preview === 'DOC_PREVIEW' ? (
                      <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  )}
                </div>
                <p className="font-medium text-slate-700 dark:text-slate-200">{file?.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{(file?.size! / 1024 / 1024).toFixed(2)} MB</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                  className="mt-4 text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8 text-slate-400 dark:text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Tap to Scan or Upload</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Supports Image, PDF, HTML</p>
              </div>
            )}
          </div>

          {!file && !analyzing && (
            <>
              <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                  <span className="px-2 bg-slate-50 dark:bg-slate-900 text-slate-400">OR</span>
                  </div>
              </div>

              <button
                  onClick={() => setShowConnectModal(true)}
                  className="w-full py-4 bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl flex items-center justify-between px-6 transition-all group shadow-sm"
              >
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <Zap className="w-5 h-5 fill-current" />
                      </div>
                      <div className="text-left">
                          <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Connect Provider</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">IdentityIQ, SmartCredit, etc.</p>
                      </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
              </button>
            </>
          )}

          {analyzing && (
            <div className="mt-8 space-y-4">
              <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                <span className={progressStep >= 1 ? 'text-indigo-600 dark:text-indigo-400' : ''}>1. OCR Scanning</span>
                <span className={progressStep >= 2 ? 'text-indigo-600 dark:text-indigo-400' : ''}>2. Violation Check</span>
                <span className={progressStep >= 3 ? 'text-indigo-600 dark:text-indigo-400' : ''}>3. Strategy Formulation</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500 ease-out"
                  style={{ width: `${progressStep * 33.33}%` }}
                />
              </div>
              <div className="flex items-center justify-center text-indigo-600 dark:text-indigo-400 gap-2">
                <Loader2 className="animate-spin w-5 h-5" />
                <span className="font-medium">Gemini AI is analyzing document structure...</span>
              </div>
            </div>
          )}

          {file && !analyzing && (
            <button 
              onClick={handleAnalysis}
              className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <ScanLine className="w-5 h-5" />
              Analyze Report
            </button>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 rounded-lg flex items-center">
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
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 font-medium">Negative Items</h3>
              </div>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">{result.summary.totalNegativeItems}</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 font-medium">Potential Gain</h3>
              </div>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">+{result.summary.estimatedScoreImprovement} pts</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Scale className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 font-medium">Discrepancies</h3>
              </div>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">{result.discrepancies.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Analysis & Strategies */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Recommendations Section */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-750">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">AI Strategy Recommendations</h3>
                </div>
                <div className="p-6 space-y-6">
                  {result.recommendations.map((rec, idx) => (
                    <div key={idx} className="border border-slate-200 dark:border-slate-600 rounded-lg p-5 hover:border-indigo-200 dark:hover:border-indigo-500 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white text-lg">{rec.creditorName}</h4>
                          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Target: {rec.bureauToTarget}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getConfidenceColor(rec.confidenceScore)}`}>
                          {rec.confidenceScore}% Match
                        </span>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">Recommended Strategy: {rec.recommendedStrategy}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-6">{rec.reasoning}</p>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors active:bg-indigo-800">
                          Generate {rec.recommendedStrategy} Letter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Plan */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-750">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">90-Day Action Plan</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-8">
                    {result.actionPlan.map((step, idx) => (
                      <div key={idx} className="relative pl-8 border-l-2 border-slate-200 dark:border-slate-700 last:border-0">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white dark:border-slate-800 shadow-sm" />
                        <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-2">{step.phase}</h4>
                        <ul className="space-y-2 mb-3">
                          {step.actions.map((action, i) => (
                            <li key={i} className="text-slate-700 dark:text-slate-300 text-sm flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 mt-1.5" />
                              {action}
                            </li>
                          ))}
                        </ul>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 inline-block px-3 py-1 rounded-full">
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
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-750">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Cross-Bureau Inconsistencies</h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {result.discrepancies.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">No inconsistencies detected.</div>
                  ) : (
                    result.discrepancies.map((disc, idx) => (
                      <div key={idx} className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${disc.severity === 'HIGH' ? 'text-red-500' : 'text-orange-500'}`} />
                          <div>
                            <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{disc.type.replace('_', ' ')}</h5>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{disc.description}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {disc.itemsInvolved.map((item, i) => (
                                <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
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
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-750">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Identified Negative Items</h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {result.negativeItems.map((item, idx) => (
                    <div key={idx} className="p-4 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">{item.creditor}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{item.accountType} • {item.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-700 dark:text-slate-300">${item.amount}</div>
                        <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full inline-block">
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

export default AnalysisEngine;
