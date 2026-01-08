import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const IS_DEV = import.meta.env.DEV;

export const initAnalytics = () => {
  if (POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: 'https://us.i.posthog.com',
      capture_pageview: false,
      persistence: 'localStorage',
    });
  }
};

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
