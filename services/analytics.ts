import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const GOOGLE_ADS_CONVERSION_ID = import.meta.env.VITE_GOOGLE_ADS_CONVERSION_ID as string | undefined;
const GOOGLE_ADS_CONVERSION_LABEL = import.meta.env.VITE_GOOGLE_ADS_CONVERSION_LABEL as string | undefined;
const IS_DEV = import.meta.env.DEV;

// Extend window type for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const initAnalytics = () => {
  // Initialize PostHog
  if (POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: 'https://us.i.posthog.com',
      capture_pageview: false,
      persistence: 'localStorage',
    });
  }

  // Initialize Google Ads gtag
  if (GOOGLE_ADS_CONVERSION_ID) {
    // Load gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_CONVERSION_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', GOOGLE_ADS_CONVERSION_ID);

    if (IS_DEV) {
      console.log('[Google Ads] Initialized with ID:', GOOGLE_ADS_CONVERSION_ID);
    }
  }
};

// Extend window for dataLayer
declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export const track = (event: string, properties?: Record<string, unknown>) => {
  if (POSTHOG_KEY) {
    posthog.capture(event, properties);
  }
  if (IS_DEV) {
    console.log('[Analytics]', event, properties);
  }
};

// Step tracking
export const trackStepViewed = (stepNumber: number, stepName: string) => {
  track('step_viewed', { step_number: stepNumber, step_name: stepName });
};

// Upload step events
export const trackCsvUploaded = (rowCount: number, columnCount: number) => {
  track('csv_uploaded', { row_count: rowCount, column_count: columnCount });
};

export const trackSampleDataUsed = () => {
  track('sample_data_used');
};

// Template step events
export const trackTemplateEdited = () => {
  track('template_edited');
};

export const trackVariableInserted = (variableName: string) => {
  track('variable_inserted', { variable_name: variableName });
};

// Preview step events
export const trackPreviewGenerated = (emailCount: number) => {
  track('preview_generated', { email_count: emailCount });
};

export const trackPreviewFailed = (error: string) => {
  track('preview_failed', { error });
};

// Payment funnel events
export const trackPaymentOptionViewed = () => {
  track('payment_option_viewed');
};

export const trackFreeOptionSelected = () => {
  track('free_option_selected');
};

export const trackPaidOptionSelected = () => {
  track('paid_option_selected');
};

export const trackPaymentSubmitted = (amount: number, emailCount: number) => {
  track('payment_submitted', { amount, email_count: emailCount });
};

export const trackPaymentCompleted = (amount: number, emailCount: number) => {
  track('payment_completed', { amount, email_count: emailCount });

  // Push to GTM dataLayer for Google Ads conversion
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'purchase',
      value: amount,
      currency: 'USD',
      email_count: emailCount,
    });
    if (IS_DEV) {
      console.log('[GTM] Purchase event pushed', { amount, currency: 'USD', emailCount });
    }
  }

  // Fire Google Ads conversion directly via gtag
  if (window.gtag) {
    window.gtag('event', 'conversion', {
      'send_to': 'AW-977435889/JW8FCLzcqeAbEPH5IdlD',
      'value': amount,
      'currency': 'USD',
      'transaction_id': `spooky-${Date.now()}`
    });
    if (IS_DEV) {
      console.log('[Google Ads] Conversion fired', { amount, currency: 'USD' });
    }
  }
};

// Generation events
export const trackGenerationStarted = (contactCount: number, emailsPerContact: number, isPaid: boolean) => {
  track('generation_started', {
    contact_count: contactCount,
    emails_per_contact: emailsPerContact,
    total_emails: contactCount * emailsPerContact,
    is_paid: isPaid,
  });
};

export const trackGenerationCompleted = (successCount: number, errorCount: number, durationMs: number) => {
  track('generation_completed', {
    success_count: successCount,
    error_count: errorCount,
    duration_ms: durationMs,
  });
};
