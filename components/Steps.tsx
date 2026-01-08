import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, ArrowRight, ArrowLeft, Check, AlertCircle, Play, Download, Loader2, RefreshCw, Sparkles, Ghost, Key } from 'lucide-react';
import { ContactRow, MappingState, GeneratedEmail } from '../types';
import { parseCSV } from '../utils/csvHelper';
import { generateEmailSequence } from '../services/geminiService';

// --- STEP 1: UPLOAD ---
interface StepUploadProps {
  onDataLoaded: (headers: string[], data: ContactRow[]) => void;
  next: () => void;
}

export const StepUpload: React.FC<StepUploadProps> = ({ onDataLoaded, next }) => {
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
      onDataLoaded(headers, data);
      next();
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-800 text-center">
        <div className="h-16 w-16 bg-slate-800 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
          <Upload className="h-8 w-8" />
        </div>
        <h2 className="text-xl md:text-2xl font-semibold text-slate-100 mb-2">Upload your victims... err, contacts</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm md:text-base">
          Upload a CSV file containing your contact list. Make sure it has headers like Name, Company, Role, etc.
        </p>

        <div className="relative inline-block w-full md:w-auto">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <button className="w-full md:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg shadow-lg shadow-orange-900/20 transition-all flex items-center justify-center gap-2 mx-auto">
            <FileText className="h-5 w-5" />
            Select CSV File
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-900/20 text-red-400 text-sm rounded-lg inline-flex items-center gap-2 border border-red-900/30">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}
      </div>

      <div className="bg-slate-900 p-4 md:p-6 rounded-2xl shadow-xl border border-slate-800">
        <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          Sample CSV Format
        </h3>
        <div className="overflow-x-auto bg-slate-950 rounded-lg border border-slate-800 p-4">
          <code className="text-xs md:text-sm font-mono text-slate-400 whitespace-pre">
            Name,Company,Role,Pain_Point<br/>
            John Doe,Acme Inc,CEO,"Struggling with slow sales cycles"<br/>
            Jane Smith,TechCorp,VP Marketing,"Needs better lead attribution"
          </code>
        </div>
      </div>
    </div>
  );
};

// --- STEP 2: TEMPLATE ---
interface StepTemplateProps {
  template: string;
  setTemplate: (t: string) => void;
  next: () => void;
  back: () => void;
}

const DEFAULT_TEMPLATE = `Subject: Quick question about {{Company}}

Hi {{Name}},

I noticed that {{Company}} is currently expanding its engineering team.

As a {{Role}}, you likely face challenges with...

Let me know if you'd be open to a chat.`;

export const StepTemplate: React.FC<StepTemplateProps> = ({ template, setTemplate, next, back }) => {
  useEffect(() => {
    if (!template.trim()) {
      setTemplate(DEFAULT_TEMPLATE);
    }
  }, []);

  return (
    <div className="space-y-4 md:space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100">Draft your email spell</h2>
          <p className="text-sm md:text-base text-slate-400">Use {'{{Variable}}'} syntax to insert dynamic content from your CSV.</p>
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

      <div className="flex-1 bg-slate-900 rounded-xl shadow-xl border border-slate-800 overflow-hidden flex flex-col min-h-[300px]">
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-start md:items-center gap-2 text-xs text-slate-400 font-mono">
          <Ghost className="h-4 w-4 text-purple-500 shrink-0 mt-0.5 md:mt-0" />
          <span>Tip: Ask for a sequence by instructing: "Write a 3-email sequence..."</span>
        </div>
        <textarea
          className="flex-1 w-full p-4 md:p-6 focus:outline-none bg-slate-900 text-slate-100 font-mono text-sm resize-none placeholder-slate-600"
          placeholder="Write your email prompt here..."
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        />
      </div>
    </div>
  );
};

// --- STEP 3: MAPPING ---
interface StepMappingProps {
  headers: string[];
  template: string;
  mapping: MappingState;
  setMapping: (m: MappingState) => void;
  next: () => void;
  back: () => void;
}

export const StepMapping: React.FC<StepMappingProps> = ({ headers, template, mapping, setMapping, next, back }) => {
  const [detectedVars, setDetectedVars] = useState<string[]>([]);

  useEffect(() => {
    const regex = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;
    const matches = Array.from(template.matchAll(regex), m => m[1]);
    const unique = Array.from(new Set(matches));
    setDetectedVars(unique);

    const newMapping = { ...mapping };
    unique.forEach(v => {
      if (!newMapping[v]) {
        const exactMatch = headers.find(h => h.toLowerCase() === v.toLowerCase());
        if (exactMatch) newMapping[v] = exactMatch;
      }
    });
    setMapping(newMapping);
  }, [template, headers]);

  const allMapped = detectedVars.every(v => mapping[v]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100">Map Variables</h2>
          <p className="text-sm md:text-base text-slate-400">Connect your template placeholders to CSV columns.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={back} className="flex-1 md:flex-none px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors border border-slate-800 md:border-transparent text-center">
            Back
          </button>
          <button 
            onClick={next} 
            disabled={!allMapped}
            className={`flex-1 md:flex-none px-6 py-2 font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 ${allMapped ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-900/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
          >
            Next <span className="hidden md:inline">Step</span> <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl shadow-xl border border-slate-800 overflow-hidden">
        {detectedVars.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No variables detected in your template. Go back and add some using {'{{Variable}}'} syntax.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {detectedVars.map(variable => (
              <div key={variable} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-900/20 text-orange-500 flex items-center justify-center font-mono font-bold text-sm border border-orange-900/30 shrink-0">
                    {'{'}
                    {'}'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-200 truncate">{`{{${variable}}}`}</p>
                    <p className="text-xs text-slate-500">Template Variable</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 md:gap-4 pl-12 md:pl-0 w-full md:w-auto">
                  <ArrowRight className="h-4 w-4 text-slate-600 hidden md:block" />
                  <select
                    className="block w-full md:w-64 rounded-md border-slate-700 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2.5 bg-slate-950 text-slate-200"
                    value={mapping[variable] || ""}
                    onChange={(e) => setMapping({ ...mapping, [variable]: e.target.value })}
                  >
                    <option value="" disabled className="text-slate-500">Select CSV Column...</option>
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- STEP 4: PREVIEW ---
interface StepPreviewProps {
  apiKey: string;
  template: string;
  mapping: MappingState;
  data: ContactRow[];
  next: () => void;
  back: () => void;
}

export const StepPreview: React.FC<StepPreviewProps> = ({ apiKey, template, mapping, data, next, back }) => {
  const [loading, setLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<GeneratedEmail[] | null>(null);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generatePreview = async () => {
    setLoading(true);
    setError(null);
    setPreviewResult(null);

    const row = data[sampleIndex];
    const vars: Record<string, string> = {};
    Object.entries(mapping).forEach(([key, colName]) => {
      vars[key] = row[colName as string];
    });

    try {
      const results = await generateEmailSequence(apiKey, template, vars, Object.keys(mapping));
      setPreviewResult(results);
    } catch (err) {
      setError("Failed to generate preview. Check your API Key and try again.");
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
              {Object.entries(mapping).map(([key, col]) => (
                 <div key={key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-800 pb-1 last:border-0 gap-1">
                   <span className="text-slate-500">{`{{${key}}}`}</span>
                   <span className="font-medium text-slate-300 text-left sm:text-right truncate w-full sm:max-w-[150px]">{data[sampleIndex][col as string]}</span>
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

// --- STEP 5: GENERATE (Batch) ---
interface StepGenerateProps {
  template: string;
  mapping: MappingState;
  data: ContactRow[];
  back: () => void;
  onFinish: (results: GeneratedEmail[][]) => void;
}

export const StepGenerate: React.FC<StepGenerateProps> = ({ template, mapping, data, back, onFinish }) => {
  const [userApiKey, setUserApiKey] = useState(() =>
    localStorage.getItem("gemini_api_key") || ""
  );
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<GeneratedEmail[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSaveKey = () => {
    if (userApiKey.trim().length > 10) {
      localStorage.setItem("gemini_api_key", userApiKey);
    }
  };

  const processBatch = async () => {
    handleSaveKey();
    setIsProcessing(true);
    const allResults: GeneratedEmail[][] = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const vars: Record<string, string> = {};
      Object.entries(mapping).forEach(([key, colName]) => {
        vars[key] = row[colName as string];
      });

      try {
        const emailSequence = await generateEmailSequence(userApiKey, template, vars, Object.keys(mapping));
        allResults.push(emailSequence);
      } catch (e) {
        allResults.push([{ subject: "ERROR", body: "Failed to generate" }]);
      }
      
      setResults([...allResults]);
      setProgress(Math.round(((i + 1) / data.length) * 100));
    }
    
    setIsProcessing(false);
    setIsComplete(true);
    onFinish(allResults);
  };

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 pt-6 md:pt-10">
      {!isProcessing && !isComplete && (
        <div className="space-y-6">
          <div className="h-20 w-20 bg-orange-900/20 text-orange-500 rounded-full flex items-center justify-center mx-auto animate-pulse border border-orange-900/30">
            <Ghost className="h-10 w-10" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100">Ready to Unleash?</h2>
          <p className="text-slate-400 text-base md:text-lg">
            We are about to generate {data.length} email sequences. <br className="hidden md:inline"/>
            This might take a few minutes depending on the list size.
          </p>

          {/* API Key Input */}
          <div className="max-w-md mx-auto bg-slate-900 rounded-xl p-6 border border-slate-800">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Your Gemini API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={userApiKey}
                onChange={(e) => setUserApiKey(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-white placeholder-slate-600"
                placeholder="AIzaSy..."
              />
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Your key is stored in your browser for convenience.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
             <button onClick={back} className="px-6 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors border border-slate-800 sm:border-transparent">
              Go Back
            </button>
            <button
              onClick={processBatch}
              disabled={userApiKey.trim().length < 10}
              className="px-8 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg shadow-orange-900/20 hover:shadow-orange-900/40 disabled:shadow-none transition-all transform hover:-translate-y-1 disabled:transform-none flex items-center justify-center gap-2"
            >
              Start Generation <ArrowRight className="h-5 w-5" />
            </button>
          </div>
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

          {isComplete && (
            <div className="flex flex-col items-center gap-6">
              <div className="p-6 bg-green-900/20 border border-green-900/30 rounded-xl w-full">
                 <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                 <h3 className="text-xl font-bold text-green-400 mb-2">Success!</h3>
                 <p className="text-green-300 mb-6">Your email sequences have been generated successfully.</p>
                 <p className="text-xs text-green-500/70 mt-2">Check your downloads folder for the results.</p>
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