import React, { useState, useEffect } from 'react';
import { Layout } from './components/ui/Layout';
import { StepUpload, StepTemplate, StepMapping, StepPreview, StepGenerate } from './components/Steps';
import { User, AppStep, ContactRow, MappingState, GeneratedEmail } from './types';
import { downloadCSV } from './utils/csvHelper';
import { Lock, Ghost, Key } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [apiKey, setApiKey] = useState<string>("");
  const [tempKey, setTempKey] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);

  // App Flow State
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);

  // Data State
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<ContactRow[]>([]);
  const [template, setTemplate] = useState<string>("");
  const [mapping, setMapping] = useState<MappingState>({});

  // Check LocalStorage on Mount
  useEffect(() => {
    const storedKey = localStorage.getItem("gemini_api_key");
    if (storedKey) {
      setApiKey(storedKey);
      setUser({ username: "GhostWriter", isAuthenticated: true });
    }
  }, []);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempKey.trim().length > 10) {
      setApiKey(tempKey);
      localStorage.setItem("gemini_api_key", tempKey);
      setUser({ username: "GhostWriter", isAuthenticated: true });
    } else {
      alert("Please enter a valid API Key");
    }
  };

  const handleLogout = () => {
    // Clear Key
    setApiKey("");
    localStorage.removeItem("gemini_api_key");
    setUser(null);
    
    // Reset state
    setStep(AppStep.UPLOAD);
    setCsvData([]);
    setCsvHeaders([]);
    setTemplate("");
    setMapping({});
    setTempKey("");
  };

  const handleGenerationFinish = (results: GeneratedEmail[][]) => {
    // Automatically download CSV on finish
    downloadCSV(csvData, results, `outbound-ai-results-${Date.now()}.csv`);
  };

  // Login Screen
  if (!apiKey || !user) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-slate-100">
         <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-2xl p-8 space-y-6 border border-slate-800">
           <div className="text-center">
              <div className="h-16 w-16 bg-slate-800 text-orange-500 rounded-full mx-auto flex items-center justify-center mb-4 border border-slate-700">
                <Ghost className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold text-white">SpookyEmail Login</h1>
              <p className="text-slate-400 mt-2">Enter your Gemini API Key to summon the AI.</p>
           </div>
           <form onSubmit={handleLogin} className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-slate-300 mb-1">Google Gemini API Key</label>
               <div className="relative">
                 <input 
                   type="password" 
                   value={tempKey}
                   onChange={(e) => setTempKey(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-white placeholder-slate-600"
                   placeholder="AIzaSy..."
                   required
                 />
                 <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
               </div>
               <p className="text-xs text-slate-500 mt-2">
                 Your key is stored securely in your browser's local storage.
               </p>
             </div>
             <button 
               type="submit"
               className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-lg shadow-orange-900/20 transition-colors"
             >
               Enter the Crypt
             </button>
           </form>
            <div className="text-center text-xs text-slate-600">
             Powered by Google Gemini 2.5 Flash
           </div>
         </div>
       </div>
     );
  }

  // Main App
  return (
    <Layout user={user} onLogout={handleLogout} currentStep={step}>
      {step === AppStep.UPLOAD && (
        <StepUpload 
          onDataLoaded={(headers, data) => {
            setCsvHeaders(headers);
            setCsvData(data);
          }}
          next={() => setStep(AppStep.TEMPLATE)}
        />
      )}

      {step === AppStep.TEMPLATE && (
        <StepTemplate 
          template={template}
          setTemplate={setTemplate}
          next={() => setStep(AppStep.MAPPING)}
          back={() => setStep(AppStep.UPLOAD)}
        />
      )}

      {step === AppStep.MAPPING && (
        <StepMapping 
          headers={csvHeaders}
          template={template}
          mapping={mapping}
          setMapping={setMapping}
          next={() => setStep(AppStep.PREVIEW)}
          back={() => setStep(AppStep.TEMPLATE)}
        />
      )}

      {step === AppStep.PREVIEW && (
        <StepPreview 
          apiKey={apiKey}
          template={template}
          mapping={mapping}
          data={csvData}
          next={() => setStep(AppStep.GENERATE)}
          back={() => setStep(AppStep.MAPPING)}
        />
      )}

      {step === AppStep.GENERATE && (
        <StepGenerate 
          apiKey={apiKey}
          template={template}
          mapping={mapping}
          data={csvData}
          back={() => setStep(AppStep.PREVIEW)}
          onFinish={handleGenerationFinish}
        />
      )}
    </Layout>
  );
};

export default App;