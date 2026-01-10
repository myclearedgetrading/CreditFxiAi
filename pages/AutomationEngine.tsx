import React, { useState } from 'react';
import { 
  Bot, Workflow, Mail, CalendarClock, Zap, Plus, 
  PlayCircle, PauseCircle, Trash2, ArrowRight, MessageSquare, 
  CheckCircle2, AlertCircle, Wand2, Loader2, FileCheck, Layers,
  FileSearch, Upload, ScanText, History
} from 'lucide-react';
import { analyzeInboundEmail, suggestAutomationWorkflow, classifyDocument, parseBureauResponse } from '../services/geminiService';
import { AutomationWorkflow, EmailAnalysisResult, DocumentClassification, BureauResponseResult } from '../types';

// Mock Existing Workflows
const INITIAL_WORKFLOWS: AutomationWorkflow[] = [
  {
    id: 'wf-1',
    name: 'Score Improvement Celebration',
    description: 'Sends a congratulatory email when score increases by 20+ points.',
    trigger: 'SCORE_CHANGE',
    conditions: [{ field: 'score_increase', operator: 'GREATER_THAN', value: 20 }],
    actions: [{ type: 'SEND_EMAIL', config: { template: 'celebration_email' } }],
    isActive: true,
    stats: { runsLast30Days: 45, hoursSaved: 12 }
  },
  {
    id: 'wf-2',
    name: 'Dormant Client Re-engagement',
    description: 'Nudges client if no login detected for 14 days.',
    trigger: 'NO_LOGIN_DETECTED',
    conditions: [{ field: 'days_inactive', operator: 'GREATER_THAN', value: 14 }],
    actions: [{ type: 'SEND_EMAIL', config: { template: 'miss_you_email' } }, { type: 'CREATE_TASK', config: { title: 'Check inactive client' } }],
    isActive: true,
    stats: { runsLast30Days: 12, hoursSaved: 4 }
  }
];

const MOCK_LOGS = [
  { id: 1, time: '10:42 AM', action: 'Workflow Triggered', details: 'Score Improvement Celebration for Client #104', status: 'SUCCESS' },
  { id: 2, time: '09:15 AM', action: 'Email Analyzed', details: 'Classified as "Inquiry" - High Priority', status: 'SUCCESS' },
  { id: 3, time: 'Yesterday', action: 'Batch Scheduler', details: 'Scheduled 24 disputes for Equifax', status: 'SUCCESS' },
  { id: 4, time: 'Yesterday', action: 'Document Upload', details: 'Failed to OCR "IMG_4421.jpg" - Low Resolution', status: 'FAILURE' },
];

const AutomationEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workflows' | 'email-ai' | 'scheduler' | 'doc-intelligence' | 'logs'>('workflows');
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>(INITIAL_WORKFLOWS);
  
  // Workflow Creator State
  const [isCreating, setIsCreating] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [isGeneratingWorkflow, setIsGeneratingWorkflow] = useState(false);

  // Email AI State
  const [emailInput, setEmailInput] = useState('');
  const [isAnalyzingEmail, setIsAnalyzingEmail] = useState(false);
  const [emailAnalysis, setEmailAnalysis] = useState<EmailAnalysisResult | null>(null);

  // Document Intelligence State
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [docClassification, setDocClassification] = useState<DocumentClassification | null>(null);
  const [bureauResponse, setBureauResponse] = useState<BureauResponseResult | null>(null);
  const [isParsingResponse, setIsParsingResponse] = useState(false);

  const handleGenerateWorkflow = async () => {
    if (!goalInput.trim()) return;
    setIsGeneratingWorkflow(true);
    try {
      const suggested = await suggestAutomationWorkflow(goalInput);
      if (suggested.name) {
        const newWorkflow: AutomationWorkflow = {
          id: `wf-${Date.now()}`,
          name: suggested.name || 'New Workflow',
          description: suggested.description || '',
          trigger: suggested.trigger as any,
          conditions: suggested.conditions as any || [],
          actions: suggested.actions as any || [],
          isActive: true,
          stats: { runsLast30Days: 0, hoursSaved: 0 }
        };
        setWorkflows([...workflows, newWorkflow]);
        setIsCreating(false);
        setGoalInput('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingWorkflow(false);
    }
  };

  const handleAnalyzeEmail = async () => {
    if (!emailInput.trim()) return;
    setIsAnalyzingEmail(true);
    try {
      const result = await analyzeInboundEmail(emailInput);
      setEmailAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingEmail(false);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocFile(file);
      setIsClassifying(true);
      setDocClassification(null);
      setBureauResponse(null);
      
      try {
        const result = await classifyDocument(file.name);
        setDocClassification(result);
        
        // If it's a bureau response, simulate parsing content
        if (result.category === 'BUREAU_RESPONSE') {
          setIsParsingResponse(true);
          // Mocking text content for the simulation since we don't actually upload
          const mockContent = `
            Equifax Information Services LLC
            Date: 2024-02-15
            
            Results of your dispute:
            1. Chase Bank - Account 1234 - DELETED
            2. Midland Funding - Account 5678 - VERIFIED
            3. Capital One - Account 9999 - UPDATED
          `;
          const responseResult = await parseBureauResponse(mockContent);
          setBureauResponse(responseResult);
          setIsParsingResponse(false);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsClassifying(false);
      }
    }
  };

  const toggleWorkflow = (id: string) => {
    setWorkflows(workflows.map(wf => 
      wf.id === id ? { ...wf, isActive: !wf.isActive } : wf
    ));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <Bot className="text-teal-600 dark:text-teal-400 w-8 h-8" />
            Automation Engine
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Build intelligent workflows, automate responses, and schedule disputes efficiently.
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-4">
          <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center">
             <span className="text-xs text-slate-400 uppercase font-bold">Hours Saved</span>
             <span className="text-xl font-bold text-teal-600 dark:text-teal-400">142h</span>
          </div>
          <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center">
             <span className="text-xs text-slate-400 uppercase font-bold">Active Rules</span>
             <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{workflows.filter(w => w.isActive).length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-6 overflow-x-auto">
        {[
          { id: 'workflows', label: 'Workflow Builder', icon: Workflow },
          { id: 'email-ai', label: 'AI Email Assistant', icon: Mail },
          { id: 'scheduler', label: 'Smart Scheduler', icon: CalendarClock },
          { id: 'doc-intelligence', label: 'Doc Intelligence', icon: FileSearch },
          { id: 'logs', label: 'System Logs', icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- WORKFLOW BUILDER TAB --- */}
      {activeTab === 'workflows' && (
        <div className="space-y-6">
          {/* Creator Panel */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                <Wand2 className="w-5 h-5 mr-2 text-teal-500" />
                AI Workflow Generator
              </h3>
            </div>
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Describe your automation goal (e.g., 'If payment fails, send email and notify admin on Slack')"
                className="flex-1 p-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white dark:bg-slate-700 dark:text-white"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateWorkflow()}
              />
              <button 
                onClick={handleGenerateWorkflow}
                disabled={isGeneratingWorkflow || !goalInput}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium shadow-sm flex items-center"
              >
                {isGeneratingWorkflow ? <Loader2 className="animate-spin w-5 h-5" /> : <Zap className="w-5 h-5 mr-2" />}
                Generate Rule
              </button>
            </div>
          </div>

          {/* Workflow List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workflows.map((wf) => (
              <div key={wf.id} className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-6 transition-all ${wf.isActive ? 'border-slate-200 dark:border-slate-700' : 'border-slate-100 dark:border-slate-800 opacity-75'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white">{wf.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{wf.description}</p>
                  </div>
                  <button onClick={() => toggleWorkflow(wf.id)} className={`transition-colors ${wf.isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-300 dark:text-slate-600'}`}>
                    {wf.isActive ? <PlayCircle className="w-8 h-8" /> : <PauseCircle className="w-8 h-8" />}
                  </button>
                </div>

                {/* Visual Flow */}
                <div className="bg-slate-50 dark:bg-slate-750 rounded-lg p-4 space-y-3 relative overflow-hidden border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Zap className="w-4 h-4 mr-2 text-amber-500" />
                    WHEN: {wf.trigger}
                  </div>
                  {wf.conditions.map((cond, i) => (
                    <div key={i} className="flex items-center text-xs text-slate-500 dark:text-slate-400 ml-6">
                      <ArrowRight className="w-3 h-3 mr-2" />
                      IF {cond.field} is {cond.operator} {cond.value}
                    </div>
                  ))}
                  {wf.actions.map((act, i) => (
                    <div key={i} className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 ml-6 pl-2 border-l-2 border-teal-200 dark:border-teal-800">
                      <div className="w-2 h-2 rounded-full bg-teal-500 mr-2 -ml-[13px]" />
                      THEN: {act.type}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex gap-3">
                    <span>Runs: {wf.stats.runsLast30Days}</span>
                    <span>Saved: {wf.stats.hoursSaved}h</span>
                  </div>
                  <button className="text-red-400 hover:text-red-600 flex items-center">
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- EMAIL AI TAB --- */}
      {activeTab === 'email-ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-250px)]">
          {/* Input */}
          <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-blue-500" />
              Incoming Email Simulator
            </h3>
            <textarea 
              className="flex-1 p-4 border border-slate-200 dark:border-slate-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 dark:bg-slate-700 dark:text-white"
              placeholder="Paste a client email here to test the AI..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleAnalyzeEmail}
                disabled={isAnalyzingEmail || !emailInput}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm flex items-center"
              >
                {isAnalyzingEmail ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Bot className="w-4 h-4 mr-2" />}
                Analyze & Draft Response
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 overflow-y-auto">
            {!emailAnalysis ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                <p>Waiting for email input...</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Meta Data */}
                <div className="flex flex-wrap gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    emailAnalysis.priority === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {emailAnalysis.priority} PRIORITY
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    Category: {emailAnalysis.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                    Sentiment: {emailAnalysis.sentiment}
                  </span>
                </div>

                {/* Draft */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">AI Suggested Draft</h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {emailAnalysis.suggestedResponse}
                  </div>
                  <div className="flex gap-2">
                     <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Copy to Clipboard</button>
                     <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Edit Draft</button>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">Recommended Actions</h4>
                  <ul className="space-y-2">
                    {emailAnalysis.actionItems.map((item, idx) => (
                      <li key={idx} className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-teal-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SCHEDULER TAB (Simple Visual) --- */}
      {activeTab === 'scheduler' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 text-center">
          <CalendarClock className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Smart Batch Scheduler</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-lg mx-auto">
            The system automatically batches disputes to avoid bureau red flags and optimize delivery times (avoiding weekends and holidays).
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-4xl mx-auto text-left">
            {[0, 1, 2, 3, 4].map((day) => (
              <div key={day} className={`border rounded-lg p-4 ${day === 2 ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-700' : 'border-slate-200 dark:border-slate-700'}`}>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][day]}
                </div>
                {day === 2 ? (
                  <div className="space-y-2">
                     <div className="bg-white dark:bg-slate-750 p-2 rounded border border-teal-200 dark:border-teal-800 text-xs shadow-sm">
                       <span className="font-bold text-teal-700 dark:text-teal-400">Batch #402</span>
                       <div className="text-slate-500 dark:text-slate-400">24 Letters</div>
                     </div>
                     <div className="bg-white dark:bg-slate-750 p-2 rounded border border-teal-200 dark:border-teal-800 text-xs shadow-sm">
                       <span className="font-bold text-teal-700 dark:text-teal-400">Batch #403</span>
                       <div className="text-slate-500 dark:text-slate-400">12 Letters</div>
                     </div>
                  </div>
                ) : day === 4 ? (
                  <div className="text-xs text-slate-400 italic">No batches scheduled (Holiday)</div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded text-xs text-slate-400">
                    Optimizing...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- DOCUMENT INTELLIGENCE TAB --- */}
      {activeTab === 'doc-intelligence' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Simulation */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
             <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center">
               <FileSearch className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
               Document Analysis
             </h3>
             <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors relative cursor-pointer">
               <input 
                 type="file" 
                 className="absolute inset-0 opacity-0 cursor-pointer" 
                 onChange={handleDocUpload}
                 accept=".pdf,.jpg,.png"
               />
               <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
               <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Upload Document</p>
               <p className="text-xs text-slate-400 mt-1">Simulate incoming client files or bureau letters</p>
             </div>

             {isClassifying && (
               <div className="mt-6 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm">
                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                 Categorizing with Gemini...
               </div>
             )}
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-2 space-y-6">
            {!docClassification ? (
              <div className="h-64 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
                <ScanText className="w-12 h-12 mb-3 opacity-20" />
                <p>Upload a document to test auto-classification and parsing</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 dark:text-white">Classification Results</h3>
                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold">
                    {docClassification.confidence}% Confidence
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-750 p-4 rounded-lg mb-6 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Detected Category</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{docClassification.category}</p>
                </div>

                {docClassification.category === 'BUREAU_RESPONSE' && (
                  <div className="space-y-4">
                     <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center">
                       <FileCheck className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                       Automated Result Parsing
                     </h4>
                     
                     {isParsingResponse ? (
                       <div className="flex items-center text-sm text-slate-500">
                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                         Extracting dispute outcomes...
                       </div>
                     ) : bureauResponse ? (
                       <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                         <div className="bg-slate-100 dark:bg-slate-750 px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 flex justify-between">
                            <span>{bureauResponse.bureau} Letter</span>
                            <span>{bureauResponse.date}</span>
                         </div>
                         <div className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                            {bureauResponse.outcomes.map((item, i) => (
                              <div key={i} className="p-3 flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-medium text-slate-800 dark:text-white">{item.creditor}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">#{item.accountNumber}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                  item.outcome === 'DELETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  item.outcome === 'VERIFIED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                  {item.outcome}
                                </span>
                              </div>
                            ))}
                         </div>
                       </div>
                     ) : null}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- LOGS TAB --- */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
             <h3 className="font-bold text-slate-800 dark:text-white">Automation Execution Logs</h3>
             <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Export CSV</button>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-750 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Details</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {MOCK_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                  <td className="px-6 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{log.time}</td>
                  <td className="px-6 py-3 font-medium text-slate-800 dark:text-white">{log.action}</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{log.details}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.status === 'SUCCESS' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AutomationEngine;