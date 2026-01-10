import React, { useState } from 'react';
import { MOCK_CLIENTS } from '../constants';
import { Bureau, DisputeStrategy, NegativeItem } from '../types';
import { generateDisputeLetter } from '../services/geminiService';
import { Wand2, Send, Download, AlertCircle, CheckCircle2, Loader2, Clock, FileCheck } from 'lucide-react';
import { useUser } from '../context/UserContext';

const ClientDisputeTracker = () => {
  const client = MOCK_CLIENTS[0]; // Logic for demo purposes to pick "current" client

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Disputes</h1>
        <p className="text-slate-500 dark:text-slate-400">Track the status of your ongoing disputes with the bureaus.</p>
      </div>

      {!client || !client.negativeItems || client.negativeItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-12 text-center">
          <FileCheck className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Active Disputes</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            You don't have any disputes in progress yet. Complete your onboarding or analysis to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {client.negativeItems.map(item => (
            <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-750">
                <span className="font-bold text-slate-700 dark:text-slate-200">{item.creditor}</span>
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                  item.status === 'Open' ? 'bg-orange-100 text-orange-700' :
                  item.status === 'Disputed' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {item.status}
                </span>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Balance</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">${item.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Account #</span>
                  <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{item.accountNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Bureaus</span>
                  <div className="flex gap-1">
                    {item.bureau.map(b => (
                      <span key={b} className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
                        {b.substring(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div className="w-0.5 h-6 bg-slate-200 dark:bg-slate-700"></div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Round 1 Dispute Sent</p>
                        <p className="text-[10px] text-slate-400">Oct 15, 2024</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full ${item.status === 'Disputed' ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`}></div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Awaiting Bureau Response</p>
                        <p className="text-[10px] text-slate-400">Est. completion: Nov 15, 2024</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DisputeGenerator: React.FC = () => {
  const { role } = useUser();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [strategy, setStrategy] = useState<DisputeStrategy>(DisputeStrategy.FACTUAL);
  const [targetBureau, setTargetBureau] = useState<Bureau>(Bureau.EQUIFAX);
  const [generatedLetter, setGeneratedLetter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (role === 'CLIENT') {
    return <ClientDisputeTracker />;
  }

  const selectedClient = MOCK_CLIENTS.find(c => c.id === selectedClientId);
  const selectedItem = selectedClient?.negativeItems?.find(i => i.id === selectedItemId);

  const handleGenerate = async () => {
    if (!selectedClient || !selectedItem) return;

    setIsLoading(true);
    setError(null);
    setGeneratedLetter('');

    try {
      const letter = await generateDisputeLetter({
        client: selectedClient,
        item: selectedItem,
        strategy,
        targetBureau
      });
      setGeneratedLetter(letter);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
            <Wand2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">AI Dispute Generator</h1>
          <p className="text-slate-500 dark:text-slate-400">Generate legal dispute letters in seconds using Gemini 3.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-5 transition-colors">
            <h2 className="font-semibold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">1. Letter Details</h2>
            
            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Client</label>
              <select 
                className="w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-700 dark:text-white"
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  setSelectedItemId('');
                }}
              >
                <option value="">-- Choose Client --</option>
                {MOCK_CLIENTS.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                ))}
              </select>
            </div>

            {/* Negative Item Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Negative Item</label>
              <select 
                className="w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 bg-white dark:bg-slate-700 dark:text-white"
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                disabled={!selectedClientId}
              >
                <option value="">-- Choose Item to Dispute --</option>
                {selectedClient?.negativeItems?.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.creditor} - ${item.amount} ({item.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Strategy Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Dispute Strategy</label>
              <select 
                className="w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-700 dark:text-white"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as DisputeStrategy)}
              >
                {Object.values(DisputeStrategy).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

             {/* Bureau Selection */}
             <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Bureau</label>
              <div className="flex space-x-2">
                {Object.values(Bureau).map((b) => (
                  <button
                    key={b}
                    onClick={() => setTargetBureau(b)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border ${
                      targetBureau === b 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300' 
                        : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={!selectedItem || isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate Letter
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-2">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col transition-colors">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-750 rounded-t-xl">
                 <h2 className="font-semibold text-slate-700 dark:text-slate-200">Generated Preview</h2>
                 {generatedLetter && (
                    <div className="flex space-x-2">
                       <button className="flex items-center px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-md transition-colors">
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                       </button>
                       <button className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors shadow-sm">
                          <Send className="w-4 h-4 mr-2" />
                          Send to Bureau
                       </button>
                    </div>
                 )}
              </div>
              
              <div className="flex-1 p-6 relative">
                 {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg flex items-center">
                       <AlertCircle className="w-5 h-5 mr-3" />
                       {error}
                    </div>
                 )}

                 {!generatedLetter && !isLoading && !error && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 min-h-[400px]">
                       <Wand2 className="w-16 h-16 opacity-20" />
                       <p className="text-center">Select details and click generate to see the AI magic happen.</p>
                    </div>
                 )}

                 {isLoading && (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 min-h-[400px]">
                      <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
                      <p className="text-slate-600 dark:text-slate-300 animate-pulse">Consulting FCRA regulations...</p>
                    </div>
                 )}

                 {generatedLetter && (
                    <textarea 
                      className="w-full h-full min-h-[500px] p-4 font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 focus:outline-none resize-none"
                      value={generatedLetter}
                      onChange={(e) => setGeneratedLetter(e.target.value)}
                    />
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DisputeGenerator;