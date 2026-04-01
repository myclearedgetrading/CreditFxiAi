
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Bureau, DisputeStrategy, DisputeRound, DisputeStatus, NegativeItem, ResponseIngestion, DisputeTemplate } from '../types';
import { generateDisputeLetter } from '../services/geminiService';
import { Wand2, Download, AlertCircle, Loader2, FileCheck, Check, Paperclip, FileText, X, Layers, ShieldCheck, Printer, ExternalLink, Mail } from 'lucide-react';
import {
  createDeadline,
  createDisputeRecord,
  createDisputeRound,
  createResponseIngestion,
  createRepairTask,
  createDisputeTemplate,
  createTemplateExposure,
  getDisputeTemplates,
  getDisputeRounds,
  getResponseIngestions,
  getTemplateExperiments,
  tenantCompanyId,
  updateDisputeRound,
} from '../services/firebaseService';
import { runDisputeOrchestration } from '../services/disputeOrchestratorService';
import { featureFlags } from '../services/featureFlags';

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

type LetterLibraryCategory = 'ALL' | 'CREDIT_BUREAUS' | 'CREDITORS' | 'DATA_FURNISHERS' | 'CFPB';

type LetterLibraryTemplate = DisputeTemplate & {
  category: LetterLibraryCategory;
  source: 'BUILT_IN' | 'CUSTOM';
};

const LETTER_LIBRARY_CATEGORIES: { id: LetterLibraryCategory; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'CREDIT_BUREAUS', label: 'Credit Bureaus' },
  { id: 'CREDITORS', label: 'Creditors' },
  { id: 'DATA_FURNISHERS', label: 'Data Furnishers' },
  { id: 'CFPB', label: 'CFPB' },
];

const BUILT_IN_LIBRARY_TEMPLATES: LetterLibraryTemplate[] = [
  {
    id: 'built-in-bureau-factual',
    category: 'CREDIT_BUREAUS',
    source: 'BUILT_IN',
    name: 'Bureau Investigation Request (FCRA 611)',
    strategy: DisputeStrategy.FACTUAL,
    roundType: 'INITIAL',
    bureau: 'ANY',
    content:
      `{{TODAY_DATE}}

{{CLIENT_NAME}}
{{CLIENT_ADDRESS}}

To: {{TARGET_BUREAU}}

Subject: Request for Investigation Under FCRA Section 611

I am writing to dispute inaccurate information in my credit file. The account below contains data I believe is incomplete, inaccurate, or unverifiable.

Creditor/Furnisher: {{CREDITOR_NAME}}
Account Number: {{ACCOUNT_NUMBER}}
Amount Reported: {{ACCOUNT_AMOUNT}}
Date Reported: {{DATE_REPORTED}}

Please conduct a reasonable reinvestigation and delete or correct any information that cannot be verified within the required timeframe. Send me an updated copy of my credit report after your investigation is complete.

Sincerely,
{{CLIENT_NAME}}`,
    version: 1,
    isActive: true,
    createdAt: '1970-01-01T00:00:00.000Z',
    updatedAt: '1970-01-01T00:00:00.000Z',
  },
  {
    id: 'built-in-creditor-validation',
    category: 'CREDITORS',
    source: 'BUILT_IN',
    name: 'Creditor Direct Dispute (FCRA 623)',
    strategy: DisputeStrategy.VALIDATION,
    roundType: 'INITIAL',
    furnisher: 'Creditor',
    content:
      `{{TODAY_DATE}}

{{CLIENT_NAME}}
{{CLIENT_ADDRESS}}

To: {{CREDITOR_NAME}}

Subject: Direct Dispute of Furnished Information (FCRA 623)

I am submitting a direct dispute regarding the account listed below. I believe the reported data is inaccurate and request a documented investigation.

Account Number: {{ACCOUNT_NUMBER}}
Amount Reported: {{ACCOUNT_AMOUNT}}
Date Reported: {{DATE_REPORTED}}
Issue: Information appears inaccurate, incomplete, or unsupported by records available to me.

Please investigate this dispute, correct or delete inaccurate data, and notify all consumer reporting agencies to which you furnished this account.

Sincerely,
{{CLIENT_NAME}}`,
    version: 1,
    isActive: true,
    createdAt: '1970-01-01T00:00:00.000Z',
    updatedAt: '1970-01-01T00:00:00.000Z',
  },
  {
    id: 'built-in-data-furnisher',
    category: 'DATA_FURNISHERS',
    source: 'BUILT_IN',
    name: 'Data Furnisher Validation and Method Request',
    strategy: DisputeStrategy.METRO2,
    roundType: 'FOLLOW_UP',
    furnisher: 'Data Furnisher',
    content:
      `{{TODAY_DATE}}

{{CLIENT_NAME}}
{{CLIENT_ADDRESS}}

To: {{CREDITOR_NAME}}

Subject: Validation and Reporting Accuracy Request

This is a follow-up regarding your furnishing of information related to the account below.

Account Number: {{ACCOUNT_NUMBER}}
Date Reported: {{DATE_REPORTED}}

Please provide documentation supporting your reporting accuracy, including the records used to validate this tradeline and any updates sent to consumer reporting agencies.

If you are unable to validate the accuracy and completeness of this information, please instruct all bureaus to delete the tradeline.

Sincerely,
{{CLIENT_NAME}}`,
    version: 1,
    isActive: true,
    createdAt: '1970-01-01T00:00:00.000Z',
    updatedAt: '1970-01-01T00:00:00.000Z',
  },
  {
    id: 'built-in-cfpb-complaint',
    category: 'CFPB',
    source: 'BUILT_IN',
    name: 'CFPB Escalation Complaint Draft',
    strategy: DisputeStrategy.FACTUAL,
    roundType: 'ESCALATION',
    furnisher: 'CFPB',
    content:
      `{{TODAY_DATE}}

Consumer Financial Protection Bureau

Subject: Credit Reporting Complaint - {{CREDITOR_NAME}}

I am submitting this complaint after unsuccessful attempts to resolve inaccurate credit reporting.

Creditor/Furnisher: {{CREDITOR_NAME}}
Account Number: {{ACCOUNT_NUMBER}}
Bureau(s): {{TARGET_BUREAU}}
Issue Summary:
{{DISPUTE_REASON}}

I requested correction/investigation directly and through the credit bureaus, but inaccurate reporting remains. I request supervisory review and corrective action.

Consumer Name:
{{CLIENT_NAME}}

Contact:
{{CLIENT_EMAIL}}
{{CLIENT_PHONE}}

Sincerely,
{{CLIENT_NAME}}`,
    version: 1,
    isActive: true,
    createdAt: '1970-01-01T00:00:00.000Z',
    updatedAt: '1970-01-01T00:00:00.000Z',
  },
];

const inferTemplateCategory = (template: DisputeTemplate): LetterLibraryCategory => {
  const signal = `${template.name} ${template.furnisher || ''} ${template.content}`.toLowerCase();
  if (signal.includes('cfpb') || signal.includes('consumer financial protection bureau')) return 'CFPB';
  if (template.bureau && template.bureau !== 'ANY') return 'CREDIT_BUREAUS';
  if (
    signal.includes('furnisher')
    || signal.includes('metro 2')
    || signal.includes('data reporting')
  ) return 'DATA_FURNISHERS';
  if (
    signal.includes('creditor')
    || signal.includes('collector')
    || signal.includes('collection')
    || signal.includes('debt')
  ) return 'CREDITORS';
  if (template.bureau === 'ANY') return 'CREDIT_BUREAUS';
  return 'CREDITORS';
};

const DisputeGenerator: React.FC = () => {
  const location = useLocation();
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
  const [disputeId, setDisputeId] = useState<string>('');
  const [currentRound, setCurrentRound] = useState(1);
  const [roundStatus, setRoundStatus] = useState<DisputeStatus>('DRAFT');
  const [roundDueDate, setRoundDueDate] = useState('');
  const [timeline, setTimeline] = useState<DisputeRound[]>([]);
  const [responseIngestions, setResponseIngestions] = useState<ResponseIngestion[]>([]);
  const [responseFile, setResponseFile] = useState<File | null>(null);
  const [responseText, setResponseText] = useState('');
  const [orchestrationLoading, setOrchestrationLoading] = useState(false);
  const [orchestrationResult, setOrchestrationResult] = useState<null | {
    nextStatus: string;
    nextAction: string;
    likelyImpact: number;
    parsedSummary: string;
  }>(null);
  const [libraryTemplates, setLibraryTemplates] = useState<LetterLibraryTemplate[]>(BUILT_IN_LIBRARY_TEMPLATES);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryCategory, setLibraryCategory] = useState<LetterLibraryCategory>('ALL');
  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedLibraryTemplateId, setSelectedLibraryTemplateId] = useState<string>(BUILT_IN_LIBRARY_TEMPLATES[0]?.id || '');
  const [saveTemplateName, setSaveTemplateName] = useState('');
  const [saveTemplateCategory, setSaveTemplateCategory] = useState<LetterLibraryCategory>('CREDIT_BUREAUS');
  const [saveTemplateRoundType, setSaveTemplateRoundType] = useState<'INITIAL' | 'FOLLOW_UP' | 'ESCALATION'>('INITIAL');
  const [savingTemplate, setSavingTemplate] = useState(false);

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

  useEffect(() => {
    const navState = (location.state || {}) as {
      prefillStrategy?: string;
      prefillBureau?: string;
      prefillCreditor?: string;
    };
    if (navState.prefillStrategy) {
      const matchedStrategy = Object.values(DisputeStrategy).find((s) => s === navState.prefillStrategy);
      if (matchedStrategy) setStrategy(matchedStrategy);
    }
    if (navState.prefillBureau) {
      const matchedBureau = Object.values(Bureau).find((b) => b === navState.prefillBureau);
      if (matchedBureau) setSelectedBureaus([matchedBureau]);
    }
    if (navState.prefillCreditor && myNegativeItems.length) {
      const matchItem = myNegativeItems.find((i) =>
        i.creditor.toLowerCase().includes(navState.prefillCreditor!.toLowerCase())
      );
      if (matchItem) setSelectedItemId(matchItem.id);
    }
  }, [location.state, myNegativeItems]);

  useEffect(() => {
    if (!featureFlags.nextLevelDIY || !disputeId || !user.id) return;
    const companyId = tenantCompanyId(user);
    void getDisputeRounds(companyId, disputeId).then(setTimeline).catch(() => setTimeline([]));
    void getResponseIngestions(companyId, disputeId).then(setResponseIngestions).catch(() => setResponseIngestions([]));
  }, [disputeId, user, featureFlags.nextLevelDIY]);

  useEffect(() => {
    let cancelled = false;
    const loadTemplateLibrary = async () => {
      if (!user.id) return;
      setLibraryLoading(true);
      try {
        const companyId = tenantCompanyId(user);
        const customTemplates = await getDisputeTemplates(companyId);
        if (cancelled) return;

        const normalizedCustomTemplates: LetterLibraryTemplate[] = customTemplates.map((t) => ({
          ...t,
          category: inferTemplateCategory(t),
          source: 'CUSTOM',
        }));

        setLibraryTemplates([...normalizedCustomTemplates, ...BUILT_IN_LIBRARY_TEMPLATES]);
        setSelectedLibraryTemplateId((prev) =>
          prev || normalizedCustomTemplates[0]?.id || BUILT_IN_LIBRARY_TEMPLATES[0]?.id || ''
        );
      } catch {
        if (!cancelled) {
          setLibraryTemplates(BUILT_IN_LIBRARY_TEMPLATES);
          setSelectedLibraryTemplateId(BUILT_IN_LIBRARY_TEMPLATES[0]?.id || '');
        }
      } finally {
        if (!cancelled) setLibraryLoading(false);
      }
    };

    void loadTemplateLibrary();
    return () => {
      cancelled = true;
    };
  }, [user.id, user.companyId]);

  const applyTemplatePlaceholders = (
    templateBody: string,
    overrides?: { bureau?: Bureau; creditorName?: string }
  ) => {
    const address = user.address
      ? [user.address.street, `${user.address.city}, ${user.address.state} ${user.address.zip}`].filter(Boolean).join('\n')
      : 'Address not provided';
    const bureauName = overrides?.bureau || selectedBureaus[0] || Bureau.EQUIFAX;
    const creditorName = overrides?.creditorName || selectedItem?.creditor || 'Creditor/Furnisher';
    const reasonLine = selectedItem
      ? `Inaccurate or unverifiable reporting for ${selectedItem.type} account with ${selectedItem.creditor}.`
      : 'Inaccurate or unverifiable reporting remains after prior dispute attempts.';
    const tokens: Record<string, string> = {
      TODAY_DATE: new Date().toLocaleDateString(),
      CLIENT_NAME: `${user.firstName} ${user.lastName}`.trim() || 'Client Name',
      CLIENT_EMAIL: user.email || 'client@email.com',
      CLIENT_PHONE: user.phone || 'Phone number',
      CLIENT_ADDRESS: address,
      TARGET_BUREAU: bureauName,
      CREDITOR_NAME: creditorName,
      ACCOUNT_NUMBER: selectedItem?.accountNumber || 'XXXX-XXXX',
      ACCOUNT_AMOUNT: typeof selectedItem?.amount === 'number' ? `$${selectedItem.amount}` : 'N/A',
      DATE_REPORTED: selectedItem?.dateReported || 'Unknown',
      DISPUTE_REASON: reasonLine,
    };
    return Object.entries(tokens).reduce((acc, [key, value]) => {
      const pattern = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      return acc.replace(pattern, value);
    }, templateBody);
  };

  const visibleLibraryTemplates = libraryTemplates.filter((template) => {
    const categoryOk = libraryCategory === 'ALL' || template.category === libraryCategory;
    if (!categoryOk) return false;
    const search = librarySearch.trim().toLowerCase();
    if (!search) return true;
    const corpus = `${template.name} ${template.strategy} ${template.content} ${template.furnisher || ''}`.toLowerCase();
    return corpus.includes(search);
  });

  const selectedLibraryTemplate =
    visibleLibraryTemplates.find((t) => t.id === selectedLibraryTemplateId)
    || libraryTemplates.find((t) => t.id === selectedLibraryTemplateId)
    || visibleLibraryTemplates[0]
    || libraryTemplates[0]
    || null;

  const handleApplyLibraryTemplate = () => {
    if (!selectedLibraryTemplate) return;
    setStrategy(selectedLibraryTemplate.strategy);

    const multiBureauTemplate = selectedLibraryTemplate.category === 'CREDIT_BUREAUS'
      || selectedLibraryTemplate.bureau === 'ANY'
      || !!selectedLibraryTemplate.bureau;

    if (multiBureauTemplate) {
      const parts = selectedBureaus.map((bureau) => {
        const body = applyTemplatePlaceholders(selectedLibraryTemplate.content, { bureau });
        return `----------------------------------------\nLETTER TO: ${bureau.toUpperCase()}\n----------------------------------------\n\n${body}`;
      });
      setGeneratedLetter(parts.join('\n\n\n'));
      return;
    }

    const body = applyTemplatePlaceholders(selectedLibraryTemplate.content, {
      creditorName: selectedLibraryTemplate.furnisher || selectedItem?.creditor,
    });
    setGeneratedLetter(body);
  };

  const handleSaveCurrentLetterTemplate = async () => {
    if (!generatedLetter.trim()) {
      setError('Generate or paste a letter before saving it as a template.');
      return;
    }
    if (!saveTemplateName.trim()) {
      setError('Enter a template name before saving.');
      return;
    }

    setSavingTemplate(true);
    setError(null);
    try {
      const companyId = tenantCompanyId(user);
      const resolvedBureau =
        saveTemplateCategory === 'CREDIT_BUREAUS'
          ? (selectedBureaus[0] || 'ANY')
          : undefined;
      const resolvedFurnisher =
        saveTemplateCategory === 'CFPB'
          ? 'CFPB'
          : saveTemplateCategory === 'DATA_FURNISHERS'
            ? (selectedItem?.creditor || 'Data Furnisher')
            : saveTemplateCategory === 'CREDITORS'
              ? (selectedItem?.creditor || 'Creditor')
              : undefined;

      const created = await createDisputeTemplate(companyId, {
        name: saveTemplateName.trim(),
        strategy,
        roundType: saveTemplateRoundType,
        bureau: resolvedBureau || 'ANY',
        furnisher: resolvedFurnisher,
        content: generatedLetter.trim(),
        version: 1,
        isActive: true,
      });

      const savedTemplate: LetterLibraryTemplate = {
        id: created.id,
        name: saveTemplateName.trim(),
        strategy,
        roundType: saveTemplateRoundType,
        bureau: resolvedBureau || 'ANY',
        furnisher: resolvedFurnisher,
        content: generatedLetter.trim(),
        version: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        companyId,
        category: saveTemplateCategory,
        source: 'CUSTOM',
      };

      setLibraryTemplates((prev) => {
        const withoutBuiltInCollision = prev.filter((t) => t.id !== savedTemplate.id);
        return [savedTemplate, ...withoutBuiltInCollision];
      });
      setSelectedLibraryTemplateId(savedTemplate.id);
      setSaveTemplateName('');
    } catch {
      setError('Unable to save template. Only tenant admins can create templates under current security rules.');
    } finally {
      setSavingTemplate(false);
    }
  };

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

      const fullBundle = generatedParts.join('\n\n\n');
      setGeneratedLetter(fullBundle);

      if (featureFlags.nextLevelDIY) {
        // Create or update dispute + current round records for closed-loop tracking.
        const companyId = tenantCompanyId(user);
        const dueIn30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        setRoundDueDate(dueIn30);

        let activeDisputeId = disputeId;
        if (!activeDisputeId) {
          const disputeRef = await createDisputeRecord(companyId, {
            clientId: user.id,
            negativeItemId: selectedItem.id,
            strategy,
            targetBureaus: selectedBureaus,
            furnisher: selectedItem.creditor,
            currentRoundNumber: currentRound,
            overallStatus: 'DRAFT',
            outcome: 'PENDING',
            estimatedScoreImpact: 25,
            nextAction: 'Print, sign, and mail round 1 dispute letter.',
            nextActionDueAt: dueIn30,
          });
          activeDisputeId = disputeRef.id;
          setDisputeId(activeDisputeId);
        }

        const roundRef = await createDisputeRound(companyId, {
          clientId: user.id,
          disputeId: activeDisputeId,
          roundNumber: currentRound,
          strategy,
          targetBureaus: selectedBureaus,
          status: 'READY_TO_SEND',
          responseDueAt: dueIn30,
          outcome: 'PENDING',
          generatedLetter: fullBundle,
          summary: `Round ${currentRound} ready for delivery`,
          createdByUserId: user.id,
        });

        // Template intelligence: assign active experiment variant when available.
        if (featureFlags.templateExperiments) {
          const experiments = await getTemplateExperiments(companyId);
          const runningExperiment = experiments.find((e) => e.status === 'RUNNING' && e.variants.length > 0);
          if (runningExperiment) {
            const random = Math.random() * 100;
            let cumulative = 0;
            const selectedVariant = runningExperiment.variants.find((v) => {
              cumulative += v.trafficPct;
              return random <= cumulative;
            }) || runningExperiment.variants[0];
            await createTemplateExposure(companyId, {
              experimentId: runningExperiment.id,
              variantId: selectedVariant.variantId,
              templateId: selectedVariant.templateId,
              disputeId: activeDisputeId,
              disputeRoundId: roundRef.id,
              clientId: user.id,
              assignedAt: new Date().toISOString(),
            });
          } else {
            const templates = await getDisputeTemplates(companyId);
            const firstTemplate = templates.find((t) =>
              t.strategy === strategy && (t.bureau === 'ANY' || t.bureau === selectedBureaus[0])
            );
            if (firstTemplate) {
              await createTemplateExposure(companyId, {
                experimentId: 'baseline',
                variantId: 'A',
                templateId: firstTemplate.id,
                disputeId: activeDisputeId,
                disputeRoundId: roundRef.id,
                clientId: user.id,
                assignedAt: new Date().toISOString(),
              });
            }
          }
        }

        await createRepairTask(companyId, {
          clientId: user.id,
          disputeId: activeDisputeId,
          disputeRoundId: roundRef.id,
          title: `Send dispute round ${currentRound}`,
          description: `Send ${selectedBureaus.length} letter(s) for ${selectedItem.creditor} and retain delivery proof.`,
          taskType: 'DISPUTE_SEND',
          status: 'OPEN',
          dueAt: dueIn30,
          priorityLabel: 'HIGH',
          estimatedScoreImpact: 30,
          confidenceScoreImpact: 0.65,
          urgencyScore: 78,
          effortScore: 35,
        });
        await createDeadline(companyId, {
          clientId: user.id,
          entityType: 'DISPUTE_ROUND',
          entityId: roundRef.id,
          deadlineType: 'BUREAU_RESPONSE',
          dueAt: dueIn30,
          status: 'OPEN',
          severity: 'HIGH',
        });
        setRoundStatus('SENT');
        await updateDisputeRound(roundRef.id, { status: 'SENT', sentAt: new Date().toISOString() });
        setTimeline((prev) => ([
          ...prev,
          {
            id: roundRef.id,
            companyId,
            clientId: user.id,
            disputeId: activeDisputeId,
            roundNumber: currentRound,
            strategy,
            targetBureaus: selectedBureaus,
            status: 'SENT',
            sentAt: new Date().toISOString(),
            responseDueAt: dueIn30,
            outcome: 'PENDING',
            generatedLetter: fullBundle,
            summary: `Round ${currentRound} sent`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]));
      }
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

  const handleResponseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResponseFile(e.target.files[0]);
    }
  };

  const handleRunOrchestration = async () => {
    if (!featureFlags.nextLevelDIY) {
      setError('Closed-loop orchestration is currently disabled for this environment.');
      return;
    }
    if (!disputeId || !user.id || !responseText.trim()) {
      setError('Upload or paste a bureau response before running next-step orchestration.');
      return;
    }

    setOrchestrationLoading(true);
    setError(null);
    try {
      const companyId = tenantCompanyId(user);
      const latestRound = timeline[timeline.length - 1];
      if (!latestRound) {
        throw new Error('Generate and send a dispute round first.');
      }
      const orchestration = await runDisputeOrchestration({
        disputeId,
        companyId,
        clientId: user.id,
        disputeRoundId: latestRound.id,
        currentStatus: roundStatus,
        currentRoundNumber: latestRound.roundNumber,
        responseText,
        bureau: selectedBureaus[0],
        furnisher: selectedItem?.creditor,
        currentScore: user.creditScore.experian || 620,
        negativeItemsRemaining: myNegativeItems.length,
        strategy,
        clientName: `${user.firstName} ${user.lastName}`.trim() || 'Client',
      });

      await createResponseIngestion(companyId, {
        clientId: user.id,
        disputeId,
        disputeRoundId: latestRound.id,
        source: 'UPLOAD',
        fileName: responseFile?.name || 'response-text',
        mimeType: responseFile?.type || 'text/plain',
        parseStatus: 'SUCCESS',
        ocrStatus: 'SUCCESS',
        parseConfidence: orchestration.orchestration.parsedResponse.confidence || 0,
        summary: orchestration.orchestration.parsedResponse.summary,
        outcomes: (orchestration.orchestration as any).parsedResponse.outcomes || [],
        errors: [],
        processedAt: new Date().toISOString(),
      });

      setOrchestrationResult({
        nextStatus: orchestration.orchestration.workflow.nextStatus,
        nextAction: orchestration.orchestration.workflow.nextActions?.[0]?.label || 'Review workflow recommendations',
        likelyImpact: orchestration.orchestration.scoreImpact.likelyCase || 0,
        parsedSummary: orchestration.orchestration.parsedResponse.summary,
      });
      setRoundStatus(orchestration.orchestration.workflow.nextStatus as DisputeStatus);
      setCurrentRound(orchestration.nextRoundNumber);

      const refreshedRounds = await getDisputeRounds(companyId, disputeId);
      setTimeline(refreshedRounds);
      const refreshedIngestions = await getResponseIngestions(companyId, disputeId);
      setResponseIngestions(refreshedIngestions);
    } catch (err: any) {
      setError(err.message || 'Failed to process response orchestration.');
    } finally {
      setOrchestrationLoading(false);
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

            <div>
              <label className="block text-sm font-semibold text-white mb-2">4. Letter Library (Optional)</label>
              <div className="space-y-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="grid grid-cols-2 gap-2">
                  {LETTER_LIBRARY_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setLibraryCategory(category.id)}
                      className={`text-[11px] px-2 py-1.5 rounded border transition-colors ${
                        libraryCategory === category.id
                          ? 'bg-orange-900/30 border-orange-700 text-orange-300'
                          : 'bg-[#0A0A0A] border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>

                <input
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full bg-[#0A0A0A] border border-slate-800 rounded px-2 py-2 text-xs text-slate-200 placeholder-slate-500"
                />

                <div className="max-h-44 overflow-y-auto space-y-2">
                  {libraryLoading && (
                    <p className="text-xs text-slate-500">Loading saved templates...</p>
                  )}
                  {!libraryLoading && visibleLibraryTemplates.length === 0 && (
                    <p className="text-xs text-slate-500">No templates match this filter.</p>
                  )}
                  {!libraryLoading && visibleLibraryTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setSelectedLibraryTemplateId(template.id)}
                      className={`w-full text-left p-2 rounded border transition-colors ${
                        selectedLibraryTemplateId === template.id
                          ? 'border-orange-600 bg-orange-900/20'
                          : 'border-slate-800 bg-[#0A0A0A] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-white truncate">{template.name}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          template.source === 'CUSTOM'
                            ? 'bg-blue-900/30 text-blue-300'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {template.source === 'CUSTOM' ? 'Saved' : 'Built-in'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{template.strategy}</p>
                    </button>
                  ))}
                </div>

                {selectedLibraryTemplate && (
                  <div className="border border-slate-800 rounded p-2 bg-[#0A0A0A] space-y-2">
                    <p className="text-[11px] text-slate-500 uppercase tracking-wide">Template Preview</p>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {applyTemplatePlaceholders(selectedLibraryTemplate.content)
                        .slice(0, 420)}
                      {selectedLibraryTemplate.content.length > 420 ? '...' : ''}
                    </p>
                    <button
                      type="button"
                      onClick={handleApplyLibraryTemplate}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-semibold rounded"
                    >
                      Use this template in editor
                    </button>
                  </div>
                )}

                <div className="border border-slate-800 rounded p-2 bg-[#0A0A0A] space-y-2">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wide">Save Current Editor As Template</p>
                  <input
                    value={saveTemplateName}
                    onChange={(e) => setSaveTemplateName(e.target.value)}
                    placeholder="Template name (e.g. Bureau Round 1 - Factual)"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-2 text-xs text-slate-200 placeholder-slate-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={saveTemplateCategory}
                      onChange={(e) => setSaveTemplateCategory(e.target.value as LetterLibraryCategory)}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-2 text-xs text-slate-200"
                    >
                      <option value="CREDIT_BUREAUS">Credit Bureaus</option>
                      <option value="CREDITORS">Creditors</option>
                      <option value="DATA_FURNISHERS">Data Furnishers</option>
                      <option value="CFPB">CFPB</option>
                    </select>
                    <select
                      value={saveTemplateRoundType}
                      onChange={(e) => setSaveTemplateRoundType(e.target.value as 'INITIAL' | 'FOLLOW_UP' | 'ESCALATION')}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-2 text-xs text-slate-200"
                    >
                      <option value="INITIAL">Initial</option>
                      <option value="FOLLOW_UP">Follow-up</option>
                      <option value="ESCALATION">Escalation</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    disabled={savingTemplate || !generatedLetter.trim() || !saveTemplateName.trim()}
                    onClick={handleSaveCurrentLetterTemplate}
                    className="w-full py-2 bg-orange-700 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold rounded"
                  >
                    {savingTemplate ? 'Saving template...' : 'Save current letter as template'}
                  </button>
                </div>
              </div>
            </div>

            {featureFlags.nextLevelDIY && (
              <div>
                  <label className="block text-sm font-semibold text-white mb-2">5. Round Lifecycle</label>
                  <div className="space-y-2 bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 uppercase tracking-wide">Current round</span>
                          <span className="text-sm font-bold text-white">Round {currentRound}</span>
                      </div>
                      <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 uppercase tracking-wide">Status</span>
                          <span className="text-xs font-bold bg-orange-900/30 text-orange-400 px-2 py-1 rounded">
                            {roundStatus}
                          </span>
                      </div>
                      <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 uppercase tracking-wide">Response due</span>
                          <span className="text-xs text-slate-200">
                            {roundDueDate ? new Date(roundDueDate).toLocaleDateString() : 'Set after generation'}
                          </span>
                      </div>
                      {orchestrationResult && (
                        <div className="border-t border-slate-800 pt-2 mt-2">
                          <p className="text-[11px] text-slate-400">Next-best action</p>
                          <p className="text-xs text-white font-semibold">{orchestrationResult.nextAction}</p>
                          <p className="text-[11px] text-green-400 mt-1">
                            Estimated likely impact: +{orchestrationResult.likelyImpact} pts
                          </p>
                        </div>
                      )}
                  </div>
              </div>
            )}

            {/* Step 5: Attachments */}
            <div>
                <label className="block text-sm font-semibold text-white mb-2 flex justify-between">
                    {featureFlags.nextLevelDIY ? '6. Attach Evidence' : '5. Attach Evidence'}
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

                      {featureFlags.nextLevelDIY && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Response Ingestion</p>
                          <p className="text-sm text-slate-400">
                            Upload or paste bureau/furnisher response text to auto-determine the next round actions.
                          </p>
                          {responseFile ? (
                            <div className="text-xs text-slate-300 bg-slate-800 rounded px-2 py-1">{responseFile.name}</div>
                          ) : (
                            <label className="flex items-center justify-center gap-2 w-full py-2 border border-dashed border-slate-700 rounded text-xs text-slate-400 hover:bg-slate-800 cursor-pointer transition-colors">
                              <Paperclip className="w-3 h-3" /> Upload Response File
                              <input type="file" className="hidden" onChange={handleResponseUpload} />
                            </label>
                          )}
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Paste bureau response text here (or OCR output) ..."
                            className="w-full min-h-[120px] text-xs bg-[#0A0A0A] border border-slate-800 rounded p-2 text-slate-200"
                          />
                          <button
                            onClick={handleRunOrchestration}
                            disabled={orchestrationLoading || !responseText.trim()}
                            className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                          >
                            {orchestrationLoading ? 'Analyzing Response...' : 'Run Next-Step Orchestration'}
                          </button>
                          {orchestrationResult && (
                            <div className="text-xs text-slate-300 border border-slate-800 rounded p-2 bg-[#0A0A0A]">
                              <p className="font-bold text-orange-400">Status: {orchestrationResult.nextStatus}</p>
                              <p className="mt-1">{orchestrationResult.parsedSummary}</p>
                            </div>
                          )}
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Packet + Timeline</p>
                          <div className="text-sm text-slate-400 space-y-1">
                            <p>Packet checklist:</p>
                            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                              <li>Signed dispute letter(s)</li>
                              <li>Government ID copy</li>
                              <li>SSN card copy</li>
                              <li>Proof of address</li>
                              <li>Supporting evidence documents</li>
                            </ul>
                          </div>
                          <div className="pt-2 border-t border-slate-800">
                            <p className="text-xs text-slate-500 mb-2">Dispute timeline</p>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {timeline.length === 0 && (
                                <p className="text-xs text-slate-500">No rounds yet. Generate your first round to begin.</p>
                              )}
                              {timeline.map((round) => (
                                <div key={round.id} className="text-xs border border-slate-800 rounded p-2 bg-[#0A0A0A]">
                                  <p className="text-white font-semibold">Round {round.roundNumber} - {round.status}</p>
                                  <p className="text-slate-500">Outcome: {round.outcome}</p>
                                  <p className="text-slate-500">
                                    {round.sentAt ? `Sent ${new Date(round.sentAt).toLocaleDateString()}` : 'Not sent yet'}
                                  </p>
                                </div>
                              ))}
                            </div>
                            {responseIngestions.length > 0 && (
                              <p className="text-[11px] text-slate-500 mt-2">
                                Response ingestions: {responseIngestions.length}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      )}
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
