/**
 * SpookyEmail Notification Worker
 * Sends email notifications via Postmark when generation completes
 */

const ALLOWED_ORIGINS = [
  'https://spookyemail.com',
  'https://www.spookyemail.com',
  'http://localhost:3000',
  'http://localhost:5173',
];

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function buildEmailBody(contactCount, emailCount, successCount) {
  const errorCount = (contactCount * emailCount) - successCount;

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .ghost { font-size: 48px; }
    .title { color: #f97316; font-size: 24px; font-weight: bold; margin: 10px 0; }
    .card { background: #f8fafc; border-radius: 12px; padding: 24px; margin: 20px 0; }
    .stat { display: inline-block; margin: 0 20px; text-align: center; }
    .stat-number { font-size: 32px; font-weight: bold; color: #f97316; }
    .stat-label { font-size: 14px; color: #64748b; }
    .cta { display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    .footer { text-align: center; margin-top: 40px; color: #94a3b8; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="ghost">👻</div>
      <div class="title">Your emails are ready!</div>
    </div>

    <p>Great news! Your SpookyEmail generation has completed.</p>

    <div class="card" style="text-align: center;">
      <div class="stat">
        <div class="stat-number">${contactCount}</div>
        <div class="stat-label">Contacts</div>
      </div>
      <div class="stat">
        <div class="stat-number">${successCount}</div>
        <div class="stat-label">Emails Generated</div>
      </div>
      ${errorCount > 0 ? `
      <div class="stat">
        <div class="stat-number" style="color: #ef4444;">${errorCount}</div>
        <div class="stat-label">Errors</div>
      </div>
      ` : ''}
    </div>

    <p><strong>Next step:</strong> Check your downloads folder for the CSV file containing all your personalized email sequences.</p>

    <p>You can import this CSV into your favorite email tool (Gmail, Mailchimp, etc.) and start sending!</p>

    <div style="text-align: center;">
      <a href="https://spookyemail.com" class="cta">Generate More Emails</a>
    </div>

    <div class="footer">
      <p>SpookyEmail - Hauntingly Good Outreach</p>
      <p>You received this email because you requested a notification when your email generation completed.</p>
    </div>
  </div>
</body>
</html>
`;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      });
    }

    // Verify origin
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      });
    }

    try {
      const body = await request.json();
      const { email, contactCount, emailCount, successCount } = body;

      // Validate required fields
      if (!email || !isValidEmail(email)) {
        return new Response(JSON.stringify({ error: 'Invalid email address' }), {
          status: 400,
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
        });
      }

      if (typeof contactCount !== 'number' || typeof successCount !== 'number') {
        return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
          status: 400,
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
        });
      }

      // Send email via Postmark
      const postmarkResponse = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Postmark-Server-Token': env.POSTMARK_API_KEY,
        },
        body: JSON.stringify({
          From: 'ghostwriter@spookyemail.com',
          To: email,
          Subject: 'Your SpookyEmail sequences are ready! 👻',
          HtmlBody: buildEmailBody(contactCount, emailCount || 1, successCount),
          MessageStream: 'outbound',
        }),
      });

      if (!postmarkResponse.ok) {
        const errorData = await postmarkResponse.json();
        console.error('Postmark error:', errorData);
        return new Response(JSON.stringify({ error: 'Failed to send email' }), {
          status: 500,
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      });
    }
  },
};
