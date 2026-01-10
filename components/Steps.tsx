import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, ArrowRight, ArrowLeft, Check, AlertCircle, AlertTriangle, Play, Download, Loader2, RefreshCw, Sparkles, Ghost, Key, CreditCard, Mail } from 'lucide-react';
import { ContactRow, GeneratedEmail } from '../types';
import { parseCSV } from '../utils/csvHelper';
import { generateEmailSequence } from '../services/geminiService';
import {
  trackCsvUploaded,
  trackSampleDataUsed,
  trackTemplateEdited,
  trackVariableInserted,
  trackPreviewGenerated,
  trackPreviewFailed,
  trackPaymentOptionViewed,
  trackFreeOptionSelected,
  trackPaidOptionSelected,
  trackPaymentSubmitted,
  trackPaymentCompleted,
  trackGenerationStarted,
  trackGenerationCompleted,
  identifyUser,
} from '../services/analytics';
import { sendCompletionNotification, isValidEmail } from '../services/notificationService';

// --- STEP 1: UPLOAD ---
interface StepUploadProps {
  onDataLoaded: (headers: string[], data: ContactRow[]) => void;
  onUseSampleData: () => void;
  next: () => void;
}

export const StepUpload: React.FC<StepUploadProps> = ({ onDataLoaded, onUseSampleData, next }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      setError("Please upload a valid CSV file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { headers, data } = parseCSV(text);

      if (headers.length === 0 || data.length === 0) {
        setError("CSV file appears to be empty or invalid.");
        return;
      }
      trackCsvUploaded(data.length, headers.length);
      onDataLoaded(headers, data);
      next();
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Hero headline */}
      <div className="text-center mb-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-3">
          Generate Personalized Outreach with AI
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-4">
          Upload your contacts, write a prompt, and get a CSV of personalized emails ready to send with Gmail, Mailchimp, or any mail tool.
        </p>
        {/* Testimonial */}
        <div className="max-w-xl mx-auto mt-2">
          <p className="text-slate-400 text-sm italic">
            "AI customised email is a must in 2026, but it's harder than it should be. This is the tool we use to get 20%+ open rates. See if you can beat me."
          </p>
          <p className="text-slate-500 text-xs mt-2">
            — James Kennedy, CEO at ProcurementExpress.com
          </p>
        </div>
      </div>

      <div className="bg-slate-900 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-800 text-center">
        <div className="h-16 w-16 bg-slate-800 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
          <Upload className="h-8 w-8" />
        </div>
        <h2 className="text-xl md:text-2xl font-semibold text-slate-100 mb-2">See it in action</h2>
        <p className="text-slate-400 mb-4 max-w-md mx-auto text-sm md:text-base">
          Try with sample data to see how it works — no signup required.
        </p>

        {/* Free badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-900/20 text-green-400 text-xs font-medium rounded-full border border-green-900/30 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
          Free to use • No signup required
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Primary CTA - Sample Data */}
          <button
            onClick={() => {
              trackSampleDataUsed();
              onUseSampleData();
            }}
            className="w-full sm:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg shadow-lg shadow-orange-900/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="h-5 w-5" />
            Try with Sample Data
          </button>

          <span className="text-slate-500 text-sm">or</span>

          {/* Secondary CTA - Upload CSV */}
          <div className="relative inline-block w-full sm:w-auto">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg border border-slate-700 transition-all flex items-center justify-center gap-2">
              <FileText className="h-5 w-5" />
              Upload Your CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-900/20 text-red-400 text-sm rounded-lg inline-flex items-center gap-2 border border-red-900/30">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}
      </div>

      {/* Before/After Example */}
      <div className="bg-slate-900 p-4 md:p-6 rounded-2xl shadow-xl border border-slate-800">
        <h3 className="font-semibold text-slate-200 mb-4 text-center">From spreadsheet to personalized emails in seconds</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Before - CSV Row */}
          <div className="bg-slate-950 rounded-lg border border-slate-800 p-4">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Your Contact List</span>
            <div className="mt-2 text-sm text-slate-300 space-y-1">
              <p><span className="text-slate-500">Name:</span> Sarah Chen</p>
              <p><span className="text-slate-500">Company:</span> TechFlow Inc</p>
              <p><span className="text-slate-500">Role:</span> VP of Engineering</p>
            </div>
          </div>
          {/* After - Generated Email */}
          <div className="bg-slate-950 rounded-lg border border-orange-900/30 p-4">
            <span className="text-xs font-medium text-orange-500 uppercase tracking-wide">CSV Output</span>
            <div className="mt-2 text-sm text-slate-300">
              <p className="font-medium text-slate-200 mb-1">Subject: Quick question for TechFlow's engineering team</p>
              <p className="text-slate-400 text-xs leading-relaxed">Hi Sarah, I noticed TechFlow Inc is scaling its engineering org. As VP of Engineering, you're probably dealing with...</p>
            </div>
          </div>
        </div>
        <p className="text-center text-slate-500 text-xs mt-4">Download your results as a CSV and import into Gmail, Mailchimp, Instantly, or any email tool</p>
      </div>
    </div>
  );
};

// --- STEP 2: TEMPLATE ---
interface StepTemplateProps {
  template: string;
  setTemplate: (t: string) => void;
  headers: string[];
  next: () => void;
  back: () => void;
}

const buildDefaultTemplate = (headers: string[]) => `Write a 3-email outreach sequence for this contact.

Available data:
${headers.map(h => `- ${h}: {{${h}}}`).join('\n')}

Email 1: Initial outreach - reference their role and company specifically
Email 2: Follow-up with a value proposition or case study
Email 3: Final gentle nudge with a clear CTA

Requirements:
- Keep each email under 100 words
- Use short paragraphs (2-3 sentences max per paragraph)
- Add blank lines between paragraphs for readability
- Be conversational, not salesy`;

export const StepTemplate: React.FC<StepTemplateProps> = ({ template, setTemplate, headers, next, back }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!template.trim()) {
      setTemplate(buildDefaultTemplate(headers));
    }
  }, []);

  const insertVariable = (header: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const variable = `{{${header}}}`;
    const newTemplate = template.substring(0, start) + variable + template.substring(end);
    setTemplate(newTemplate);
    trackVariableInserted(header);

    // Set cursor position after inserted variable
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  // Track template edits (debounced)
  const templateEditTracked = useRef(false);
  useEffect(() => {
    if (template && !templateEditTracked.current) {
      templateEditTracked.current = true;
      trackTemplateEdited();
    }
  }, [template]);

  return (
    <div className="space-y-4 md:space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100">Draft your email spell</h2>
          <p className="text-sm md:text-base text-slate-400">Click a variable below or type it to personalize your email.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={back} className="flex-1 md:flex-none px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors border border-slate-800 md:border-transparent text-center">
            Back
          </button>
          <button onClick={next} className="flex-1 md:flex-none px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg shadow-lg shadow-orange-900/20 transition-colors flex items-center justify-center gap-2">
            Next <span className="hidden md:inline">Step</span> <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Variable chips from CSV headers */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-500 self-center mr-1">Your variables:</span>
        {headers.map((header) => (
          <button
            key={header}
            onClick={() => insertVariable(header)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-orange-400 text-sm font-mono rounded-lg border border-slate-700 hover:border-orange-500/50 transition-all"
          >
            {`{{${header}}}`}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-slate-900 rounded-xl shadow-xl border border-slate-800 overflow-hidden flex flex-col min-h-[300px]">
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-start md:items-center gap-2 text-xs text-slate-400 font-mono">
          <Ghost className="h-4 w-4 text-purple-500 shrink-0 mt-0.5 md:mt-0" />
          <span>Tip: Ask for a sequence by instructing: "Write a 3-email sequence..."</span>
        </div>
        <textarea
          ref={textareaRef}
          className="flex-1 w-full p-4 md:p-6 focus:outline-none bg-slate-900 text-slate-100 font-mono text-sm resize-none placeholder-slate-600"
          placeholder="Write your email prompt here..."
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        />
      </div>
    </div>
  );
};

// --- STEP 3: PREVIEW ---
interface StepPreviewProps {
  apiKey: string;
  template: string;
  headers: string[];
  data: ContactRow[];
  onEmailCountDetected: (count: number) => void;
  next: () => void;
  back: () => void;
}

export const StepPreview: React.FC<StepPreviewProps> = ({ apiKey, template, headers, data, onEmailCountDetected, next, back }) => {
  const [loading, setLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<GeneratedEmail[] | null>(null);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generatePreview = async () => {
    setLoading(true);
    setError(null);
    setPreviewResult(null);

    const row = data[sampleIndex];
    // Build vars directly from CSV headers
    const vars: Record<string, string> = {};
    headers.forEach(header => {
      vars[header] = row[header];
    });

    try {
      const results = await generateEmailSequence(apiKey, template, vars, headers);
      setPreviewResult(results);
      onEmailCountDetected(results.length);
      trackPreviewGenerated(results.length);
    } catch (err) {
      const errorMessage = "Failed to generate preview. Check your API Key and try again.";
      setError(errorMessage);
      trackPreviewFailed(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100">Test Generation</h2>
          <p className="text-sm md:text-base text-slate-400">Generate a sample to ensure quality.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={back} className="flex-1 md:flex-none px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors border border-slate-800 md:border-transparent text-center">
            Back
          </button>
          <button 
            onClick={next}
            disabled={!previewResult} 
            className={`flex-1 md:flex-none px-6 py-2 font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 ${previewResult ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-900/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
          >
            <span className="hidden md:inline">Looks Good,</span> Run All <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 lg:min-h-0">
        {/* Left: Controls & Data */}
        <div className="lg:col-span-1 space-y-4 lg:overflow-y-auto pr-0 lg:pr-2">
          <div className="bg-slate-900 p-4 rounded-xl shadow-xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-200">Sample Data</h3>
              <button 
                 onClick={() => setSampleIndex(prev => (prev + 1) % data.length)}
                 className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Next Row
              </button>
            </div>
            <div className="bg-slate-950 rounded-lg p-3 text-xs font-mono space-y-2 border border-slate-800 max-h-[200px] overflow-y-auto">
              {headers.map((header) => (
                 <div key={header} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-800 pb-1 last:border-0 gap-1">
                   <span className="text-slate-500">{`{{${header}}}`}</span>
                   <span className="font-medium text-slate-300 text-left sm:text-right truncate w-full sm:max-w-[150px]">{data[sampleIndex][header]}</span>
                 </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={generatePreview}
            disabled={loading}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg shadow-lg shadow-orange-900/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
            {loading ? 'Conjuring...' : 'Generate Preview'}
          </button>

          {error && (
             <div className="p-3 bg-red-900/20 text-red-400 text-sm rounded-lg border border-red-900/30">
               {error}
             </div>
          )}
        </div>

        {/* Right: Output */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl shadow-xl border border-slate-800 flex flex-col overflow-hidden min-h-[500px] lg:h-auto">
          <div className="p-4 border-b border-slate-800 bg-slate-950 font-medium text-slate-300 flex justify-between items-center">
             <span>Preview Output</span>
             {previewResult && <span className="text-xs bg-green-900/30 text-green-400 border border-green-900/50 px-2 py-1 rounded-full whitespace-nowrap">{previewResult.length} Emails</span>}
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {!previewResult && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                <Ghost className="h-12 w-12 mb-3 text-slate-700" />
                <p>Click "Generate Preview" to see the magic.</p>
              </div>
            )}
            
            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-orange-500">
                <Loader2 className="h-12 w-12 animate-spin mb-3" />
                <p>Consulting the spirits...</p>
              </div>
            )}

            {previewResult && previewResult.map((email, idx) => (
              <div key={idx} className="border border-slate-700 rounded-lg overflow-hidden">
                <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Email #{idx + 1}
                </div>
                <div className="p-4 bg-slate-900">
                  <div className="mb-3 pb-3 border-b border-slate-800">
                    <span className="text-slate-500 text-sm mr-2 block sm:inline">Subject:</span>
                    <span className="font-medium text-slate-200">{email.subject}</span>
                  </div>
                  <div className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed font-sans">
                    {email.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STEP 4: GENERATE (Batch) ---
interface StepGenerateProps {
  template: string;
  headers: string[];
  data: ContactRow[];
  emailsPerContact: number;
  back: () => void;
  onFinish: (results: GeneratedEmail[][]) => void;
}

const PRICE_PER_EMAIL = 0.05;

export const StepGenerate: React.FC<StepGenerateProps> = ({ template, headers, data, emailsPerContact, back, onFinish }) => {
  const [userApiKey, setUserApiKey] = useState(() =>
    localStorage.getItem("gemini_api_key") || ""
  );
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<GeneratedEmail[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Payment state
  const [hasPaid, setHasPaid] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Notification state
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notificationSent, setNotificationSent] = useState(false);

  const totalEmails = data.length * emailsPerContact;
  const totalPrice = (totalEmails * PRICE_PER_EMAIL).toFixed(2);

  // Track payment options viewed on mount
  useEffect(() => {
    trackPaymentOptionViewed();
  }, []);

  const handleSaveKey = () => {
    if (userApiKey.trim().length > 10) {
      localStorage.setItem("gemini_api_key", userApiKey);
    }
  };

  const handleMockPayment = async () => {
    trackPaymentSubmitted(parseFloat(totalPrice), totalEmails);
    setPaymentProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setPaymentProcessing(false);
    setHasPaid(true);
    trackPaymentCompleted(parseFloat(totalPrice), totalEmails);
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2);
    }
    return digits;
  };

  const isCardValid = isValidEmail(notifyEmail) &&
    cardNumber.replace(/\s/g, '').length === 16 &&
    cardExpiry.length === 5 &&
    cardCvc.length >= 3;

  const processBatch = async () => {
    if (!hasPaid) {
      handleSaveKey();
    }
    setIsProcessing(true);
    const allResults: GeneratedEmail[][] = [];
    const apiKeyToUse = hasPaid ? (process.env.GEMINI_API_KEY || "") : userApiKey;

    const startTime = Date.now();
    trackGenerationStarted(data.length, emailsPerContact, hasPaid);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      // Build vars directly from CSV headers
      const vars: Record<string, string> = {};
      headers.forEach(header => {
        vars[header] = row[header];
      });

      try {
        const emailSequence = await generateEmailSequence(apiKeyToUse, template, vars, headers);
        allResults.push(emailSequence);
        successCount++;
      } catch (e) {
        allResults.push([{ subject: "ERROR", body: "Failed to generate" }]);
        errorCount++;
      }

      setResults([...allResults]);
      setProgress(Math.round(((i + 1) / data.length) * 100));
    }

    const durationMs = Date.now() - startTime;
    trackGenerationCompleted(successCount, errorCount, durationMs);

    // Send notification email if requested
    if (notifyEmail && isValidEmail(notifyEmail)) {
      const sent = await sendCompletionNotification({
        email: notifyEmail,
        contactCount: data.length,
        emailCount: emailsPerContact,
        successCount,
      });
      setNotificationSent(sent);
    }

    setIsProcessing(false);
    setIsComplete(true);
    onFinish(allResults);
  };

  return (
    <div className="max-w-3xl mx-auto text-center space-y-8 pt-6 md:pt-10">
      {!isProcessing && !isComplete && !hasPaid && (
        <div className="space-y-6">
          <div className="h-20 w-20 bg-orange-900/20 text-orange-500 rounded-full flex items-center justify-center mx-auto animate-pulse border border-orange-900/30">
            <Ghost className="h-10 w-10" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100">Ready to Unleash?</h2>
          <p className="text-slate-400 text-base md:text-lg">
            Generate {data.length} contacts × {emailsPerContact} emails = <span className="text-orange-400 font-semibold">{totalEmails} total emails</span>
          </p>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            {/* Option 1: Free with own API key */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Key className="h-5 w-5 text-slate-400" />
                <h3 className="font-semibold text-slate-200">Use Your Own Key</h3>
                <span className="ml-auto text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">Free</span>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="password"
                    value={userApiKey}
                    onChange={(e) => setUserApiKey(e.target.value)}
                    onFocus={() => trackFreeOptionSelected()}
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-white placeholder-slate-600 text-sm"
                    placeholder="Your Gemini API Key..."
                  />
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                </div>
                <button
                  onClick={processBatch}
                  disabled={userApiKey.trim().length < 10}
                  className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all disabled:text-slate-500 flex items-center justify-center gap-2"
                >
                  Generate Free <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Option 2: Pay to generate */}
            <div className="bg-slate-900 rounded-xl p-6 border-2 border-orange-600/50 relative">
              <div className="absolute -top-3 left-4 bg-orange-600 text-white text-xs font-semibold px-2 py-1 rounded">
                Recommended
              </div>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-orange-400" />
                <h3 className="font-semibold text-slate-200">Pay & Generate</h3>
                <span className="ml-auto text-lg font-bold text-orange-400">${totalPrice}</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                {data.length} contacts × {emailsPerContact} emails × $0.05
              </p>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    onBlur={() => {
                      if (isValidEmail(notifyEmail)) {
                        identifyUser(notifyEmail);
                      }
                    }}
                    onFocus={() => trackPaidOptionSelected()}
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-white placeholder-slate-600 text-sm"
                    placeholder="your@email.com"
                  />
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-white placeholder-slate-600 text-sm"
                    placeholder="4242 4242 4242 4242"
                  />
                  <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-white placeholder-slate-600 text-sm"
                    placeholder="MM/YY"
                  />
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-white placeholder-slate-600 text-sm"
                    placeholder="CVC"
                  />
                </div>
                <button
                  onClick={handleMockPayment}
                  disabled={!isCardValid || paymentProcessing}
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg shadow-orange-900/20 transition-all disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {paymentProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      Pay ${totalPrice} & Generate <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <button onClick={back} className="px-6 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            Go Back
          </button>
        </div>
      )}

      {/* Payment successful - ready to generate */}
      {!isProcessing && !isComplete && hasPaid && (
        <div className="space-y-6">
          <div className="h-20 w-20 bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-900/30">
            <Check className="h-10 w-10" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100">Payment Successful!</h2>
          <p className="text-slate-400 text-base md:text-lg">
            Ready to generate {totalEmails} emails for {data.length} contacts.
          </p>
          <button
            onClick={processBatch}
            className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-lg shadow-orange-900/20 hover:shadow-orange-900/40 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 mx-auto"
          >
            Start Generation <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {(isProcessing || isComplete) && (
        <div className="space-y-8">
           <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-orange-900 bg-orange-200">
                  {isComplete ? "Completed" : "Processing"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-orange-500">
                  {progress}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-slate-800">
              <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-600 transition-all duration-300"></div>
            </div>
            <p className="text-slate-400 text-sm md:text-base">
               {isComplete
                 ? "All done! Your sequences are ready."
                 : `Generating ${results.length} of ${data.length} sequences...`}
            </p>
          </div>

          {/* Warning and notification during processing */}
          {isProcessing && (
            <>
              <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-amber-200 font-medium">Watch out!</p>
                  <p className="text-amber-300/70 text-sm">Don't close this browser tab until generation is complete.</p>
                </div>
              </div>

              {notifyEmail ? (
                <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                  <Mail className="h-4 w-4" />
                  <span>We'll email <span className="text-slate-200">{notifyEmail}</span> when complete, so you can check back on this tab.</span>
                </div>
              ) : (
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
                  <p className="text-slate-300 text-sm mb-3">Want to be notified when it's done?</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="email"
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        onBlur={() => {
                          if (isValidEmail(notifyEmail)) {
                            identifyUser(notifyEmail);
                          }
                        }}
                        className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-white placeholder-slate-600 text-sm"
                        placeholder="your@email.com"
                      />
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {isComplete && (
            <div className="flex flex-col items-center gap-6">
              <div className="p-6 bg-green-900/20 border border-green-900/30 rounded-xl w-full">
                 <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                 <h3 className="text-xl font-bold text-green-400 mb-2">Success!</h3>
                 <p className="text-green-300 mb-6">Your email sequences have been generated successfully.</p>
                 <p className="text-xs text-green-500/70 mt-2">Check your downloads folder for the results.</p>
                 {notificationSent && (
                   <p className="text-xs text-green-400 mt-3 flex items-center justify-center gap-1">
                     <Mail className="h-3 w-3" />
                     Confirmation sent to {notifyEmail}
                   </p>
                 )}
              </div>

               <button
                  onClick={back}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors border border-slate-700 flex items-center gap-2 shadow-lg"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Edit Campaign
                </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};