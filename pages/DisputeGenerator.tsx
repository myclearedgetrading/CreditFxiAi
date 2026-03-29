
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Bureau, DisputeStrategy, NegativeItem } from '../types';
import { generateDisputeLetter } from '../services/geminiService';
import { Wand2, Download, AlertCircle, Loader2, FileCheck, Check, Paperclip, FileText, X, Layers, ShieldCheck, Printer, ExternalLink, Mail } from 'lucide-react';

/** Escape text for safe insertion into a print HTML document */
const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Consumer-facing print-and-mail services (CreditFix AI is not affiliated; links open in a new tab). */
const MAILING_PARTNER_OPTIONS: { name: string; description: string; url: string }[] = [
  {
    name: 'Click2Mail',
    description: 'Upload your letter, choose USPS options (including certified), and have them print and mail it.',
    url: 'https://www.click2mail.com',
  },
  {
    name: 'LetterStream',
    description: 'Send letters and documents online with tracking and mailing options.',
    url: 'https://www.letterstream.com',
  },
];

const DisputeGenerator: React.FC = () => {
  const { user } = useUser();
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [strategy, setStrategy] = useState<DisputeStrategy>(DisputeStrategy.FACTUAL);
  
  // Changed from single target to array for multi-select
  const [selectedBureaus, setSelectedBureaus] = useState<Bureau[]>([Bureau.EQUIFAX]);
  
  const [generatedLetter, setGeneratedLetter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Attachment State
  const [includeID, setIncludeID] = useState(false);
  const [includeSSN, setIncludeSSN] = useState(false);
  const [includeAddress, setIncludeAddress] = useState(false);
  const [additionalProof, setAdditionalProof] = useState<File | null>(null);

  const myNegativeItems = user.negativeItems || [];
  const selectedItem = myNegativeItems.find(i => i.id === selectedItemId);

  // Effect to load saved documents preferences from User Profile
  useEffect(() => {
    if (user.verificationDocuments) {
        if (user.verificationDocuments.idCard) setIncludeID(true);
        if (user.verificationDocuments.ssnCard) setIncludeSSN(true);
        if (user.verificationDocuments.proofOfAddress) setIncludeAddress(true);
    }
  }, [user]);

  const toggleBureau = (b: Bureau) => {
    setSelectedBureaus(prev => {
      if (prev.includes(b)) {
        // Prevent deselecting the last one for UX stability, or allow it but validate on generate
        if (prev.length === 1) return prev;
        return prev.filter(item => item !== b);
      }
      return [...prev, b];
    });
  };

  const selectAllBureaus = () => {
    setSelectedBureaus(Object.values(Bureau));
  };

  const handleGenerate = async () => {
    if (!selectedItem || selectedBureaus.length === 0) return;

    setIsLoading(true);
    setError(null);
    setGeneratedLetter('');

    try {
      const generatedParts = [];
      
      // Generate a letter for each selected bureau
      for (const bureau of selectedBureaus) {
        const letterContent = await generateDisputeLetter({
          client: user,
          item: selectedItem,
          strategy,
          targetBureau: bureau
        });
        
        // Add a header for clarity in the preview text area
        let fullLetter = `----------------------------------------\nLETTER TO: ${bureau.toUpperCase()}\n----------------------------------------\n\n${letterContent}`;
        
        // Append Documents section if selected
        if (includeID || includeSSN || includeAddress || additionalProof) {
            fullLetter += `\n\n\n----------------------------------------\nAPPENDIX: ATTACHED DOCUMENTS\n(These are attached as the last page)\n----------------------------------------\n`;
            if (includeID) fullLetter += `[X] COPY OF GOVERNMENT ID (Loaded from Profile)\n`;
            if (includeSSN) fullLetter += `[X] COPY OF SOCIAL SECURITY CARD (Loaded from Profile)\n`;
            if (includeAddress) fullLetter += `[X] PROOF OF ADDRESS (Loaded from Profile)\n`;
            if (additionalProof) fullLetter += `[X] ADDITIONAL EVIDENCE: ${additionalProof.name}\n`;
        }

        generatedParts.push(fullLetter);
      }

      setGeneratedLetter(generatedParts.join('\n\n\n'));
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
    let pagesPerLetter = 1; // Base letter
    // If any docs are attached, they usually take up 1-2 extra pages depending on layout
    if (includeID || includeSSN || includeAddress || additionalProof) {
        pagesPerLetter += 1; 
    }
    
    // Total is pages per letter * number of bureaus targeted
    return pagesPerLetter * selectedBureaus.length;
  };

  const handlePrintLetters = () => {
    if (!generatedLetter) return;
    const w = window.open('', '_blank', 'noopener,noreferrer');
    if (!w) {
      setError('Pop-up blocked. Allow pop-ups for this site to print, or use Download instead.');
      return;
    }
    const body = escapeHtml(generatedLetter);
    const fromName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Your name';
    const addr = user.address;
    const addrLine = addr
      ? [addr.street, [addr.city, addr.state, addr.zip].filter(Boolean).join(', ')].filter(Boolean).join(' · ')
      : 'Add your return address before mailing.';
    w.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Dispute letter — print</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; padding: 0.75in; max-width: 8.5in; margin: 0 auto; color: #111; }
    .meta { font-size: 11px; color: #444; border-bottom: 1px solid #ccc; padding-bottom: 12px; margin-bottom: 16px; }
    pre { white-space: pre-wrap; word-wrap: break-word; font-family: inherit; font-size: 12px; line-height: 1.5; margin: 0; }
    @media print {
      body { padding: 0.5in; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <p class="no-print meta"><strong>Tip:</strong> Use your browser’s Print dialog (Ctrl/Cmd+P). Add correct bureau mailing addresses on the envelope or in the letter header if needed.</p>
  <div class="meta">
    <div><strong>From:</strong> ${escapeHtml(fromName)}</div>
    <div>${escapeHtml(addrLine)}</div>
  </div>
  <pre>${body}</pre>
  <script>window.onload = function() { window.focus(); }</script>
</body>
</html>`);
    w.document.close();
    w.focus();
    setTimeout(() => {
      try {
        w.print();
      } catch {
        /* user can print manually from the new tab */
      }
    }, 250);
  };

  const handleDownloadTxt = () => {
    if (!generatedLetter) return;
    const blob = new Blob([generatedLetter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dispute-letters-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-20">
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
                {myNegativeItems.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {myNegativeItems.map(item => (
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
                ) : (
                    <div className="text-center py-4 bg-slate-900/50 rounded-lg border border-dashed border-slate-800">
                        <p className="text-xs text-slate-500 mb-2">No negative items found.</p>
                        <p className="text-[10px] text-slate-600">Import your credit report to begin.</p>
                    </div>
                )}
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
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-white">3. Target Bureau(s)</label>
                <button 
                  onClick={selectAllBureaus}
                  className="text-[10px] text-orange-500 hover:text-orange-400 font-bold uppercase tracking-wide"
                >
                  Select All
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {Object.values(Bureau).map((b) => {
                  const isSelected = selectedBureaus.includes(b);
                  return (
                    <button
                      key={b}
                      onClick={() => toggleBureau(b)}
                      className={`flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-orange-900/30 border-orange-700 text-orange-300 shadow-[0_0_10px_rgba(234,88,12,0.1)]' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600"></div>}
                        {b}
                      </span>
                      {isSelected && <span className="text-[10px] bg-orange-900/50 px-1.5 py-0.5 rounded text-orange-200">Targeted</span>}
                    </button>
                  );
                })}
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
                        {user.verificationDocuments?.idCard && includeID ? (
                            <span className="text-[10px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Profile
                            </span>
                        ) : includeID && (
                            <span className="text-[10px] bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded">Manual</span>
                        )}
                    </label>
                    <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={includeSSN} onChange={e => setIncludeSSN(e.target.checked)} className="rounded text-orange-600 focus:ring-orange-500" />
                        <span className="flex-1">Social Security Card</span>
                        {user.verificationDocuments?.ssnCard && includeSSN ? (
                            <span className="text-[10px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Profile
                            </span>
                        ) : includeSSN && (
                            <span className="text-[10px] bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded">Manual</span>
                        )}
                    </label>
                    <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={includeAddress} onChange={e => setIncludeAddress(e.target.checked)} className="rounded text-orange-600 focus:ring-orange-500" />
                        <span className="flex-1">Proof of Address</span>
                        {user.verificationDocuments?.proofOfAddress && includeAddress ? (
                            <span className="text-[10px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Profile
                            </span>
                        ) : includeAddress && (
                            <span className="text-[10px] bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded">Manual</span>
                        )}
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
              disabled={!selectedItem || isLoading || selectedBureaus.length === 0}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Writing {selectedBureaus.length} Letters...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate {selectedBureaus.length > 1 ? 'All Letters' : 'Letter'}
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
                        <div className="flex gap-2">
                            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Layers className="w-3 h-3" /> {selectedBureaus.length} Versions
                            </span>
                            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full hidden sm:block">
                                {calculateTotalPages()} Pages Total
                            </span>
                        </div>
                    )}
                 </div>
                 
                 {generatedLetter && (
                    <div className="flex flex-wrap gap-2 justify-end">
                       <button 
                         type="button"
                         onClick={handlePrintLetters}
                         className="flex items-center px-3 py-1.5 text-sm text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
                       >
                          <Printer className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Print to mail</span>
                          <span className="sm:hidden">Print</span>
                       </button>
                       <button 
                         type="button"
                         onClick={handleDownloadTxt}
                         className="flex items-center px-3 py-1.5 text-sm text-slate-300 hover:text-orange-400 hover:bg-slate-800 rounded-md transition-colors"
                       >
                          <Download className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Download (.txt)</span>
                          <span className="sm:hidden">Save</span>
                       </button>
                    </div>
                 )}
              </div>
              
              <div className="flex-1 p-4 sm:p-6 relative">
                 {error && (
                    <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 rounded-lg flex items-center">
                       <AlertCircle className="w-5 h-5 mr-3" />
                       {error}
                    </div>
                 )}

                 {!generatedLetter && !isLoading && !error && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 min-h-[300px] lg:min-h-[400px]">
                       <FileCheck className="w-16 h-16 opacity-20" />
                       <p className="text-center">
                         {myNegativeItems.length > 0 
                           ? "Select an item to dispute on the left to begin." 
                           : "No negative items found on your profile."}
                       </p>
                    </div>
                 )}

                 {isLoading && (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 min-h-[300px] lg:min-h-[400px]">
                      <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                      <p className="text-slate-300 animate-pulse">Drafting legal challenge...</p>
                    </div>
                 )}

                 {generatedLetter && (
                    <>
                    <textarea 
                      className="w-full h-full min-h-[300px] lg:min-h-[420px] p-4 font-mono text-sm leading-relaxed text-slate-300 bg-[#0A0A0A] focus:outline-none resize-none"
                      value={generatedLetter}
                      onChange={(e) => setGeneratedLetter(e.target.value)}
                    />

                    <div className="mt-6 space-y-4 border-t border-slate-800 pt-6">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Mail className="w-4 h-4 text-orange-500" />
                        Send your dispute by mail
                      </h3>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Option 1 — You mail it</p>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            Print the letter, sign if needed, attach copies of ID or documents you selected, and send to the correct bureau or furnisher address (use certified mail if you want proof of delivery).
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={handlePrintLetters}
                              className="inline-flex items-center px-3 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg"
                            >
                              <Printer className="w-4 h-4 mr-2" />
                              Print letters
                            </button>
                            <button
                              type="button"
                              onClick={handleDownloadTxt}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-300 border border-slate-700 hover:bg-slate-800 rounded-lg"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download .txt
                            </button>
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Option 2 — Third-party mailing</p>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            CreditFix AI does not mail letters for you. These independent services can print and mail for a fee — you upload your letter (e.g. after downloading), choose mailing options, and pay them directly.
                          </p>
                          <ul className="space-y-2">
                            {MAILING_PARTNER_OPTIONS.map((p) => (
                              <li key={p.name}>
                                <a
                                  href={p.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-start gap-2 rounded-lg border border-slate-800 bg-[#0A0A0A] p-3 hover:border-orange-900/50 transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                                  <span>
                                    <span className="font-semibold text-white group-hover:text-orange-400">{p.name}</span>
                                    <span className="block text-xs text-slate-500 mt-0.5">{p.description}</span>
                                  </span>
                                </a>
                              </li>
                            ))}
                          </ul>
                          <p className="text-[11px] text-slate-600 leading-snug">
                            We are not affiliated with these providers. Compare pricing, certified-mail options, and privacy policies before you send personal information.
                          </p>
                        </div>
                      </div>
                    </div>
                    </>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DisputeGenerator;
