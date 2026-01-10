import React, { useState, useEffect } from 'react';
import { Layout } from './components/ui/Layout';
import { StepUpload, StepTemplate, StepPreview, StepGenerate, ThankYou } from './components/Steps';
import { AppStep, ContactRow, GeneratedEmail } from './types';
import { downloadCSV } from './utils/csvHelper';
import { initAnalytics, trackStepViewed, track, trackPaymentCompleted } from './services/analytics';

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

// Check if we're on thank-you page
const isThankYouPage = () => {
  if (typeof window === 'undefined') return false;
  return window.location.pathname === '/thank-you';
};

// Fetch order details from Stripe session
const fetchOrderFromSession = async (sessionId: string) => {
  try {
    const response = await fetch(`https://spooky-email-stripe.domains-f63.workers.dev/order?session_id=${sessionId}`);
    if (response.ok) {
      const data = await response.json();
      if (data.order) {
        return {
          orderId: data.order.id,
          email: data.order.email,
          contactCount: data.order.contact_count,
          totalEmails: data.order.total_emails,
        };
      }
    }
  } catch (e) {
    console.error('Failed to fetch order:', e);
  }
  return null;
};

const App: React.FC = () => {
  // Check if we're on the thank-you page
  const [thankYouParams, setThankYouParams] = useState<{
    orderId: string;
    email: string;
    contactCount: number;
    totalEmails: number;
  } | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(isThankYouPage());

  // Fetch order details on thank-you page
  useEffect(() => {
    if (!isThankYouPage()) return;

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const orderId = params.get('orderId');

    if (sessionId) {
      // Stripe redirect - fetch order from session
      fetchOrderFromSession(sessionId).then((order) => {
        setThankYouParams(order);
        setLoadingOrder(false);
      });
    } else if (orderId) {
      // Direct params (legacy)
      setThankYouParams({
        orderId,
        email: params.get('email') || '',
        contactCount: parseInt(params.get('contacts') || '0', 10),
        totalEmails: parseInt(params.get('emails') || '0', 10),
      });
      setLoadingOrder(false);
    } else {
      setLoadingOrder(false);
    }
  }, []);

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
  }, []);

  // Track thank-you page view and fire conversion (when order is loaded)
  useEffect(() => {
    if (thankYouParams) {
      // Track page view
      track('thank_you_page_viewed', {
        order_id: thankYouParams.orderId,
        email: thankYouParams.email,
        contact_count: thankYouParams.contactCount,
        total_emails: thankYouParams.totalEmails,
      });

      // Fire Google Ads conversion (calculates price from emails at $0.05 each)
      const amount = thankYouParams.totalEmails * 0.05;
      trackPaymentCompleted(amount, thankYouParams.totalEmails);
    }
  }, [thankYouParams]);

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
    <Layout currentStep={(thankYouParams || loadingOrder) ? -1 : step} onLogoClick={handleLogoClick}>
      {/* Thank You Page - Loading */}
      {loadingOrder && (
        <div className="max-w-2xl mx-auto text-center space-y-8 pt-10 md:pt-16">
          <div className="h-24 w-24 bg-orange-900/20 text-orange-500 rounded-full flex items-center justify-center mx-auto border border-orange-900/30 animate-pulse">
            <svg className="h-12 w-12 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100">Loading your order...</h2>
        </div>
      )}

      {/* Thank You Page */}
      {!loadingOrder && thankYouParams && (
        <ThankYou
          orderId={thankYouParams.orderId}
          email={thankYouParams.email}
          contactCount={thankYouParams.contactCount}
          totalEmails={thankYouParams.totalEmails}
          onStartNew={handleStartNew}
        />
      )}

      {!loadingOrder && !thankYouParams && step === AppStep.UPLOAD && (
        <StepUpload
          onDataLoaded={(headers, data) => {
            setCsvHeaders(headers);
            setCsvData(data);
          }}
          onUseSampleData={loadSampleData}
          next={() => setStep(AppStep.TEMPLATE)}
        />
      )}

      {!loadingOrder && !thankYouParams && step === AppStep.TEMPLATE && (
        <StepTemplate
          template={template}
          setTemplate={setTemplate}
          headers={csvHeaders}
          next={() => setStep(AppStep.PREVIEW)}
          back={() => setStep(AppStep.UPLOAD)}
        />
      )}

      {!loadingOrder && !thankYouParams && step === AppStep.PREVIEW && (
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

      {!loadingOrder && !thankYouParams && step === AppStep.GENERATE && (
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