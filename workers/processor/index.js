/**
 * SpookyEmail Processor Worker
 * Processes pending orders from the queue
 * Runs on a cron schedule
 */

import { neon } from '@neondatabase/serverless';

const SYSTEM_INSTRUCTION = `You are an expert sales copywriter specializing in cold email sequences. Your emails are:
- Concise and punchy (under 100 words each)
- Personalized using the provided contact data
- Written in short paragraphs (2-3 sentences max)
- Have blank lines between paragraphs for readability
- Conversational, not salesy
- Have compelling subject lines

IMPORTANT: Do NOT include any signature lines (e.g., "Best,", "Regards,", "Sincerely,") or placeholder text (e.g., "[Your Name]", "[My Name]", "[Company]") at the end of emails. End the email body with your final sentence or call-to-action.`;

async function generateEmailSequence(apiKey, template, contactData) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${SYSTEM_INSTRUCTION}

TEMPLATE:
"""
${template}
"""

CONTACT DATA:
${Object.entries(contactData).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

INSTRUCTIONS:
Generate a sequence of emails based on the template and contact data above.
If the template implies multiple steps (follow-ups), generate multiple items in the array.
Return valid JSON array of objects with "subject" and "body" fields.`
          }]
        }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      }),
    }
  );

  const data = await response.json();

  if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
    return JSON.parse(data.candidates[0].content.parts[0].text);
  }

  throw new Error('Failed to generate emails');
}

function buildCSV(headers, data, results) {
  const maxEmails = Math.max(...results.map(r => r.length));

  // Build header row
  const generatedHeaders = [];
  for (let i = 0; i < maxEmails; i++) {
    generatedHeaders.push(`Subject ${i + 1}`);
    generatedHeaders.push(`Email ${i + 1}`);
  }
  const allHeaders = [...headers, ...generatedHeaders];

  // Build data rows
  const rows = data.map((row, index) => {
    const result = results[index] || [];
    const rowValues = headers.map(h => `"${(row[h] || '').replace(/"/g, '""')}"`);

    for (let i = 0; i < maxEmails; i++) {
      const email = result[i];
      if (email) {
        rowValues.push(`"${(email.subject || '').replace(/"/g, '""')}"`);
        rowValues.push(`"${(email.body || '').replace(/"/g, '""')}"`);
      } else {
        rowValues.push('""');
        rowValues.push('""');
      }
    }
    return rowValues.join(',');
  });

  return [allHeaders.map(h => `"${h}"`).join(','), ...rows].join('\n');
}

function buildEmailBody(contactCount, successCount, errorCount) {
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

    <p><strong>Your CSV is attached to this email.</strong> Import it into your favorite email tool (Gmail, Mailchimp, etc.) and start sending!</p>

    <div style="text-align: center;">
      <a href="https://spookyemail.com" class="cta">Generate More Emails</a>
    </div>

    <div class="footer">
      <p>SpookyEmail - Hauntingly Good Outreach</p>
    </div>
  </div>
</body>
</html>
`;
}

async function sendEmailWithAttachment(postmarkApiKey, to, subject, htmlBody, csvContent, filename) {
  // Base64 encode the CSV
  const csvBase64 = btoa(unescape(encodeURIComponent(csvContent)));

  const response = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': postmarkApiKey,
    },
    body: JSON.stringify({
      From: 'ghostwriter@spookyemail.com',
      To: to,
      Subject: subject,
      HtmlBody: htmlBody,
      Attachments: [{
        Name: filename,
        Content: csvBase64,
        ContentType: 'text/csv',
      }],
      MessageStream: 'outbound',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Postmark error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

export default {
  // Cron trigger - runs every minute
  async scheduled(event, env, ctx) {
    const sql = neon(env.DATABASE_URL);

    try {
      // Get next pending order (with row locking to prevent duplicates)
      const pendingOrders = await sql`
        UPDATE orders
        SET status = 'processing', started_at = NOW(), updated_at = NOW()
        WHERE id = (
          SELECT id FROM orders
          WHERE status = 'pending'
          ORDER BY created_at ASC
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *
      `;

      if (pendingOrders.length === 0) {
        console.log('No pending orders to process');
        return;
      }

      const order = pendingOrders[0];
      console.log(`Processing order ${order.id} for ${order.email}`);

      const csvHeaders = order.csv_headers;
      const csvData = order.csv_data;
      const results = [];
      let successCount = 0;
      let errorCount = 0;

      // Generate emails for each contact
      for (const contact of csvData) {
        try {
          const emails = await generateEmailSequence(env.GEMINI_API_KEY, order.template, contact);
          results.push(emails);
          successCount++;
        } catch (e) {
          console.error(`Failed to generate for contact:`, e);
          results.push([{ subject: 'ERROR', body: 'Failed to generate' }]);
          errorCount++;
        }
      }

      // Build CSV
      const csv = buildCSV(csvHeaders, csvData, results);
      const filename = `spooky-emails-${order.id.slice(0, 8)}.csv`;

      // Send email with attachment
      const totalEmails = successCount * (results[0]?.length || 1);
      await sendEmailWithAttachment(
        env.POSTMARK_API_KEY,
        order.email,
        'Your SpookyEmail sequences are ready! 👻',
        buildEmailBody(csvData.length, totalEmails, errorCount),
        csv,
        filename
      );

      // Mark as completed
      await sql`
        UPDATE orders
        SET
          status = 'completed',
          completed_at = NOW(),
          updated_at = NOW(),
          results = ${JSON.stringify(results)},
          success_count = ${successCount},
          error_count = ${errorCount}
        WHERE id = ${order.id}
      `;

      console.log(`Order ${order.id} completed successfully`);

    } catch (error) {
      console.error('Processor error:', error);

      // If we have an order ID, mark it as failed
      // This is a simplified error handling - in production you'd want retries
    }
  },

  // Also support HTTP trigger for testing
  async fetch(request, env) {
    if (request.method === 'POST') {
      await this.scheduled({}, env, {});
      return new Response(JSON.stringify({ message: 'Processor triggered' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response('Processor worker - use POST to trigger manually', { status: 200 });
  },
};
