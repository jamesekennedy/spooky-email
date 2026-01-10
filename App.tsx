import React, { useState, useEffect } from 'react';
import { Layout } from './components/ui/Layout';
import { StepUpload, StepTemplate, StepPreview, StepGenerate, ThankYou } from './components/Steps';
import { AppStep, ContactRow, GeneratedEmail } from './types';
import { downloadCSV } from './utils/csvHelper';
import { initAnalytics, trackStepViewed, track } from './services/analytics';

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

// Parse thank-you page params from URL
const getThankYouParams = () => {
  if (typeof window === 'undefined') return null;
  if (window.location.pathname !== '/thank-you') return null;

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId');
  const email = params.get('email');
  const contacts = params.get('contacts');
  const emails = params.get('emails');

  if (!orderId || !email) return null;

  return {
    orderId,
    email,
    contactCount: parseInt(contacts || '0', 10),
    totalEmails: parseInt(emails || '0', 10),
  };
};

const App: React.FC = () => {
  // Check if we're on the thank-you page
  const [thankYouParams, setThankYouParams] = useState(getThankYouParams);

  // App Flow State
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);

  // Data State
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<ContactRow[]>([]);
  const [template, setTemplate] = useState<string>("");
  const [emailsPerContact, setEmailsPerContact] = useState<number>(1);

  // Initialize analytics on mount
  useEffect(() => {
    initAnalytics();

    // Track thank-you page view for conversions
    if (thankYouParams) {
      track('thank_you_page_viewed', {
        order_id: thankYouParams.orderId,
        email: thankYouParams.email,
        contact_count: thankYouParams.contactCount,
        total_emails: thankYouParams.totalEmails,
      });
    }
  }, []);

  // Track step changes
  useEffect(() => {
    trackStepViewed(step, STEP_NAMES[step]);
  }, [step]);

  const loadSampleData = () => {
    setCsvHeaders(SAMPLE_DATA.headers);
    setCsvData(SAMPLE_DATA.rows);
    setStep(AppStep.TEMPLATE);
  };

  const handleGenerationFinish = (results: GeneratedEmail[][]) => {
    // Automatically download CSV on finish
    downloadCSV(csvData, results, `outbound-ai-results-${Date.now()}.csv`);
  };

  const handleLogoClick = () => {
    // If on thank-you page, navigate back to home
    if (thankYouParams) {
      window.location.href = '/';
      return;
    }
    setStep(AppStep.UPLOAD);
    setCsvHeaders([]);
    setCsvData([]);
    setTemplate("");
    setEmailsPerContact(1);
  };

  const handleStartNew = () => {
    window.location.href = '/';
  };

  return (
    <Layout currentStep={thankYouParams ? -1 : step} onLogoClick={handleLogoClick}>
      {/* Thank You Page */}
      {thankYouParams && (
        <ThankYou
          orderId={thankYouParams.orderId}
          email={thankYouParams.email}
          contactCount={thankYouParams.contactCount}
          totalEmails={thankYouParams.totalEmails}
          onStartNew={handleStartNew}
        />
      )}

      {!thankYouParams && step === AppStep.UPLOAD && (
        <StepUpload
          onDataLoaded={(headers, data) => {
            setCsvHeaders(headers);
            setCsvData(data);
          }}
          onUseSampleData={loadSampleData}
          next={() => setStep(AppStep.TEMPLATE)}
        />
      )}

      {!thankYouParams && step === AppStep.TEMPLATE && (
        <StepTemplate
          template={template}
          setTemplate={setTemplate}
          headers={csvHeaders}
          next={() => setStep(AppStep.PREVIEW)}
          back={() => setStep(AppStep.UPLOAD)}
        />
      )}

      {!thankYouParams && step === AppStep.PREVIEW && (
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

      {!thankYouParams && step === AppStep.GENERATE && (
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