const NOTIFICATION_WORKER_URL = import.meta.env.VITE_NOTIFICATION_WORKER_URL as string | undefined;
const IS_DEV = import.meta.env.DEV;

interface NotificationParams {
  email: string;
  contactCount: number;
  emailCount: number;
  successCount: number;
}

export const sendCompletionNotification = async (params: NotificationParams): Promise<boolean> => {
  if (!NOTIFICATION_WORKER_URL) {
    if (IS_DEV) {
      console.log('[Notification] Worker URL not configured, skipping notification');
    }
    return false;
  }

  try {
    const response = await fetch(NOTIFICATION_WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Notification] Failed to send:', error);
      return false;
    }

    if (IS_DEV) {
      console.log('[Notification] Email sent successfully to:', params.email);
    }
    return true;
  } catch (error) {
    console.error('[Notification] Error sending notification:', error);
    return false;
  }
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
