
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Bureau, DisputeStrategy, NegativeItem } from '../types';
import { generateDisputeLetter } from '../services/geminiService';
import { Wand2, Send, Download, AlertCircle, Loader2, FileCheck, Check, Paperclip, FileText, X } from 'lucide-react';

// Mock negative items for the DIY user context
const MY_NEGATIVE_ITEMS: NegativeItem[] = [
  { id: '1', creditor: 'Chase Bank', type: 'Late Payment', accountNumber: '****4421', amount: 450, dateReported: '2023-05-15', bureau: [Bureau.EXPERIAN], status: 'Open' },
  { id: '2', creditor: 'Midland Credit', type: 'Collection', accountNumber: '****9921', amount: 1250, dateReported: '2022-11-01', bureau: [Bureau.EQUIFAX, Bureau.TRANSUNION], status: 'Disputed' },
];

const DisputeGenerator: React.FC = () => {
  const { user } = useUser();
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [strategy, setStrategy] = useState<DisputeStrategy>(DisputeStrategy.FACTUAL);
  const [targetBureau, setTargetBureau] = useState<Bureau>(Bureau.EQUIFAX);
  const [generatedLetter, setGeneratedLetter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Attachment State
  const [includeID, setIncludeID] = useState(true);
  const [includeSSN, setIncludeSSN] = useState(true);
  const [includeAddress, setIncludeAddress] = useState(true);
  const [additionalProof, setAdditionalProof] = useState<File | null>(null);

  const selectedItem = MY_NEGATIVE_ITEMS.find(i => i.id === selectedItemId);

  const handleGenerate = async () => {
    if (!selectedItem) return;

    setIsLoading(true);
    setError(null);
    setGeneratedLetter('');

    try {
      const letter = await generateDisputeLetter({
        client: user as any, // Cast to any to fit types temporarily
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAdditionalProof(e.target.files[0]);
    }
  };

  const calculateTotalPages = () => {
    let pages = 1; // Letter itself
    if (includeID) pages++;
    if (includeSSN) pages++;
    if (includeAddress) pages++;
    if (additionalProof) pages++;
    return pages;
  };

  const handleDownload = () => {
    if (!generatedLetter) return;
    alert(`Downloading PDF package (${calculateTotalPages()} pages). Includes selected identity documents.`);
  };

  const handleMail = () => {
    if (!generatedLetter) return;
    const cost = 2 + (calculateTotalPages() - 1) * 0.5;
    if(confirm(`Send via USPS Certified Mail?\n\nTotal Pages: ${calculateTotalPages()}\nEstimated Cost: $${cost.toFixed(2)}`)) {
        alert("Letter queued for mailing!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-orange-900/20 rounded-xl">
            <Wand2 className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">DIY Dispute Generator</h1>
          <p className="text-slate-400">Select an item from your report and let AI write the legal challenge.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0A0A0A] p-6 rounded-xl shadow-sm border border-slate-800 space-y-5 transition-colors">
            
            {/* Step 1 */}
            <div>
                <h2 className="font-semibold text-white border-b border-slate-800 pb-2 mb-3">1. Select Item to Dispute</h2>
                <div className="space-y-2">
                {MY_NEGATIVE_ITEMS.map(item => (
                    <div 
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedItemId === item.id 
                        ? 'border-orange-500 bg-orange-900/20' 
                        : 'border-slate-800 hover:border-orange-500/50'
                    }`}
                    >
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-white">{item.creditor}</span>
                        {selectedItemId === item.id && <Check className="w-4 h-4 text-orange-500" />}
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-slate-400">
                        <span>{item.type}</span>
                        <span>${item.amount}</span>
                    </div>
                    </div>
                ))}
                </div>
            </div>

            {/* Step 2 */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">2. Choose Strategy</label>
              <select 
                className="w-full p-2.5 border border-slate-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-900 text-white text-sm"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as DisputeStrategy)}
              >
                {Object.values(DisputeStrategy).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

             {/* Step 3 */}
             <div>
              <label className="block text-sm font-semibold text-white mb-2">3. Target Bureau</label>
              <div className="flex space-x-2">
                {Object.values(Bureau).map((b) => (
                  <button
                    key={b}
                    onClick={() => setTargetBureau(b)}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                      targetBureau === b 
                        ? 'bg-orange-900/30 border-orange-700 text-orange-300' 
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Attachments */}
            <div>
                <label className="block text-sm font-semibold text-white mb-2 flex justify-between">
                    4. Attach Evidence
                    <span className="text-xs text-slate-400 font-normal">Required for identification</span>
                </label>
                <div className="space-y-2 bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={includeID} onChange={e => setIncludeID(e.target.checked)} className="rounded text-orange-600 focus:ring-orange-500" />
                        <span className="flex-1">Government Photo ID</span>
                        {includeID && <span className="text-[10px] bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded">Attached</span>}
                    </label>
                    <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={includeSSN} onChange={e => setIncludeSSN(e.target.checked)} className="rounded text-orange-600 focus:ring-orange-500" />
                        <span className="flex-1">Social Security Card</span>
                        {includeSSN && <span className="text-[10px] bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded">Attached</span>}
                    </label>
                    <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={includeAddress} onChange={e => setIncludeAddress(e.target.checked)} className="rounded text-orange-600 focus:ring-orange-500" />
                        <span className="flex-1">Proof of Address</span>
                        {includeAddress && <span className="text-[10px] bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded">Attached</span>}
                    </label>
                    
                    <div className="pt-2 border-t border-slate-800 mt-2">
                        {additionalProof ? (
                            <div className="flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-700">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    <span className="text-xs text-slate-300 truncate">{additionalProof.name}</span>
                                </div>
                                <button onClick={() => setAdditionalProof(null)} className="text-slate-400 hover:text-red-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex items-center justify-center gap-2 w-full py-2 border border-dashed border-slate-700 rounded text-xs text-slate-400 hover:bg-slate-800 cursor-pointer transition-colors">
                                <Paperclip className="w-3 h-3" /> Add Additional Proof
                                <input type="file" className="hidden" onChange={handleFileUpload} />
                            </label>
                        )}
                    </div>
                </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={!selectedItem || isLoading}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Writing Letter...
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
           <div className="bg-[#0A0A0A] rounded-xl shadow-sm border border-slate-800 h-full flex flex-col transition-colors">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-xl">
                 <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-slate-200">Letter Preview</h2>
                    {generatedLetter && (
                        <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                            {calculateTotalPages()} Pages Total
                        </span>
                    )}
                 </div>
                 
                 {generatedLetter && (
                    <div className="flex space-x-2">
                       <button 
                         onClick={handleDownload}
                         className="flex items-center px-3 py-1.5 text-sm text-slate-300 hover:text-orange-400 hover:bg-slate-800 rounded-md transition-colors"
                       >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                       </button>
                       <button 
                         onClick={handleMail}
                         className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors shadow-sm"
                       >
                          <Send className="w-4 h-4 mr-2" />
                          Mail It For Me
                       </button>
                    </div>
                 )}
              </div>
              
              <div className="flex-1 p-6 relative">
                 {error && (
                    <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 rounded-lg flex items-center">
                       <AlertCircle className="w-5 h-5 mr-3" />
                       {error}
                    </div>
                 )}

                 {!generatedLetter && !isLoading && !error && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 min-h-[400px]">
                       <FileCheck className="w-16 h-16 opacity-20" />
                       <p className="text-center">Select an item to dispute on the left to begin.</p>
                    </div>
                 )}

                 {isLoading && (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 min-h-[400px]">
                      <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                      <p className="text-slate-300 animate-pulse">Drafting legal challenge...</p>
                    </div>
                 )}

                 {generatedLetter && (
                    <textarea 
                      className="w-full h-full min-h-[500px] p-4 font-mono text-sm leading-relaxed text-slate-300 bg-[#0A0A0A] focus:outline-none resize-none"
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
