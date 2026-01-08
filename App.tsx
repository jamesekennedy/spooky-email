import React, { useState, useEffect } from 'react';
import { Layout } from './components/ui/Layout';
import { StepUpload, StepTemplate, StepPreview, StepGenerate } from './components/Steps';
import { AppStep, ContactRow, GeneratedEmail } from './types';
import { downloadCSV } from './utils/csvHelper';
import { initAnalytics, trackStepViewed } from './services/analytics';

// Sample data for "Try without CSV" feature
const SAMPLE_DATA = {
  headers: ["Name", "Company", "Role", "Industry"],
  rows: [
    { Name: "Sarah Chen", Company: "TechFlow Inc", Role: "VP of Engineering", Industry: "SaaS" },
    { Name: "Marcus Johnson", Company: "GreenLeaf Energy", Role: "CEO", Industry: "Clean Energy" },
    { Name: "Emily Rodriguez", Company: "HealthFirst", Role: "Head of Operations", Industry: "Healthcare" },
    { Name: "David Kim", Company: "DataSync Labs", Role: "CTO", Industry: "Data Analytics" },
    { Name: "Rachel Thompson", Company: "RetailPro", Role: "Director of Sales", Industry: "E-commerce" }
  ]
};

const STEP_NAMES: Record<AppStep, string> = {
  [AppStep.UPLOAD]: 'Upload CSV',
  [AppStep.TEMPLATE]: 'Write Template',
  [AppStep.PREVIEW]: 'Preview',
  [AppStep.GENERATE]: 'Generate',
};

const App: React.FC = () => {
  // App Flow State
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);

  // Initialize analytics on mount
  useEffect(() => {
    initAnalytics();
  }, []);

  // Track step changes
  useEffect(() => {
    trackStepViewed(step, STEP_NAMES[step]);
  }, [step]);

  // Data State
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<ContactRow[]>([]);
  const [template, setTemplate] = useState<string>("");
  const [emailsPerContact, setEmailsPerContact] = useState<number>(1);

  const loadSampleData = () => {
    setCsvHeaders(SAMPLE_DATA.headers);
    setCsvData(SAMPLE_DATA.rows);
    setStep(AppStep.TEMPLATE);
  };

  const handleGenerationFinish = (results: GeneratedEmail[][]) => {
    // Automatically download CSV on finish
    downloadCSV(csvData, results, `outbound-ai-results-${Date.now()}.csv`);
  };

  return (
    <Layout currentStep={step}>
      {step === AppStep.UPLOAD && (
        <StepUpload
          onDataLoaded={(headers, data) => {
            setCsvHeaders(headers);
            setCsvData(data);
          }}
          onUseSampleData={loadSampleData}
          next={() => setStep(AppStep.TEMPLATE)}
        />
      )}

      {step === AppStep.TEMPLATE && (
        <StepTemplate
          template={template}
          setTemplate={setTemplate}
          headers={csvHeaders}
          next={() => setStep(AppStep.PREVIEW)}
          back={() => setStep(AppStep.UPLOAD)}
        />
      )}

      {step === AppStep.PREVIEW && (
        <StepPreview
          apiKey={process.env.GEMINI_API_KEY || ""}
          template={template}
          headers={csvHeaders}
          data={csvData}
          onEmailCountDetected={setEmailsPerContact}
          next={() => setStep(AppStep.GENERATE)}
          back={() => setStep(AppStep.TEMPLATE)}
        />
      )}

      {step === AppStep.GENERATE && (
        <StepGenerate
          template={template}
          headers={csvHeaders}
          data={csvData}
          emailsPerContact={emailsPerContact}
          back={() => setStep(AppStep.PREVIEW)}
          onFinish={handleGenerationFinish}
        />
      )}
    </Layout>
  );
};

export default App;