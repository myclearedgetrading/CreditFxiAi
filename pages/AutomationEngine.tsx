
import React, { useState } from 'react';
import { 
  Bot, Workflow, Mail, CalendarClock, Zap, Plus, 
  PlayCircle, PauseCircle, Trash2, ArrowRight, MessageSquare, 
  CheckCircle2, AlertCircle, Wand2, Loader2, FileCheck, Layers,
  FileSearch, Upload, ScanText, History, X
} from 'lucide-react';
import { analyzeInboundEmail, suggestAutomationWorkflow, classifyDocument, parseBureauResponse } from '../services/geminiService';
import { AutomationWorkflow, EmailAnalysisResult, DocumentClassification, BureauResponseResult } from '../types';

const AutomationEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workflows' | 'email-ai' | 'scheduler' | 'doc-intelligence' | 'logs'>('workflows');
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  
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
        
        // Simulating parsing only if classified
        if (result.category === 'BUREAU_RESPONSE') {
          setIsParsingResponse(true);
          // In a real app, send actual file content
          const responseResult = await parseBureauResponse("Sample content for demo parsing.");
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

  const deleteWorkflow = (id: string) => {
    setWorkflows(workflows.filter(wf => wf.id !== id));
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
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-6 overflow-x-auto">
        {[
          { id: 'workflows', label: 'Workflow Builder', icon: Workflow },
          { id: 'email-ai', label: 'AI Email Assistant', icon: Mail },
          { id: 'doc-intelligence', label: 'Doc Intelligence', icon: FileSearch },
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
          <div className="bg-white dark:bg-[#0A0A0A] p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
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
                className="flex-1 p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white dark:bg-[#111] dark:text-white"
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
            {workflows.length === 0 ? (
                <div className="col-span-full text-center py-10 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    <Workflow className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No active workflows. Generate one above to get started.</p>
                </div>
            ) : (
                workflows.map((wf) => (
                <div key={wf.id} className={`bg-white dark:bg-[#0A0A0A] rounded-xl shadow-sm border p-6 transition-all ${wf.isActive ? 'border-slate-200 dark:border-slate-800' : 'border-slate-100 dark:border-slate-800 opacity-75'}`}>
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
                    <div className="bg-slate-50 dark:bg-[#111] rounded-lg p-4 space-y-3 relative overflow-hidden border border-slate-100 dark:border-slate-800">
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

                    <div className="mt-4 flex items-center justify-end text-xs text-slate-400">
                    <button onClick={() => deleteWorkflow(wf.id)} className="text-red-400 hover:text-red-600 flex items-center">
                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </button>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* --- EMAIL AI TAB --- */}
      {activeTab === 'email-ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-250px)]">
          {/* Input */}
          <div className="flex flex-col h-full bg-white dark:bg-[#0A0A0A] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-blue-500" />
              Incoming Email Simulator
            </h3>
            <textarea 
              className="flex-1 p-4 border border-slate-200 dark:border-slate-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 dark:bg-[#111] dark:text-white"
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
          <div className="bg-white dark:bg-[#0A0A0A] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 overflow-y-auto">
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
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Category: {emailAnalysis.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                    Sentiment: {emailAnalysis.sentiment}
                  </span>
                </div>

                {/* Draft */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">AI Suggested Draft</h4>
                  <div className="p-4 bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {emailAnalysis.suggestedResponse}
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

      {/* --- DOCUMENT INTELLIGENCE TAB --- */}
      {activeTab === 'doc-intelligence' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Simulation */}
          <div className="lg:col-span-1 bg-white dark:bg-[#0A0A0A] p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
             <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center">
               <FileSearch className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
               Document Analysis
             </h3>
             <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-[#111] transition-colors relative cursor-pointer">
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
              <div className="h-64 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0A0A0A] rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                <ScanText className="w-12 h-12 mb-3 opacity-20" />
                <p>Upload a document to test auto-classification and parsing</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#0A0A0A] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 dark:text-white">Classification Results</h3>
                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold">
                    {docClassification.confidence}% Confidence
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-[#111] p-4 rounded-lg mb-6 border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Detected Category</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{docClassification.category}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationEngine;
