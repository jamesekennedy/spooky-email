/**
 * SpookyEmail Orders Worker
 * Creates orders in Neon Postgres when payment succeeds
 */

import { neon } from '@neondatabase/serverless';

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

    try {
      const body = await request.json();
      const { email, template, csvHeaders, csvData, emailsPerContact, amountCents } = body;

      // Validate required fields
      if (!email || !isValidEmail(email)) {
        return new Response(JSON.stringify({ error: 'Invalid email address' }), {
          status: 400,
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
        });
      }

      if (!template || !csvHeaders || !csvData || !Array.isArray(csvData)) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
        });
      }

      // Connect to Neon
      const sql = neon(env.DATABASE_URL);

      // Insert order
      const contactCount = csvData.length;
      const totalEmails = contactCount * (emailsPerContact || 3);

      const result = await sql`
        INSERT INTO orders (
          email,
          template,
          csv_headers,
          csv_data,
          emails_per_contact,
          contact_count,
          total_emails,
          amount_cents
        ) VALUES (
          ${email},
          ${template},
          ${JSON.stringify(csvHeaders)},
          ${JSON.stringify(csvData)},
          ${emailsPerContact || 3},
          ${contactCount},
          ${totalEmails},
          ${amountCents || 0}
        )
        RETURNING id, created_at
      `;

      const order = result[0];

      return new Response(JSON.stringify({
        success: true,
        orderId: order.id,
        createdAt: order.created_at,
      }), {
        status: 201,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Order creation error:', error);
      return new Response(JSON.stringify({ error: 'Failed to create order' }), {
        status: 500,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      });
    }
  },
};
