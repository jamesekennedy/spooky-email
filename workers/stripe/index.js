/**
 * SpookyEmail Stripe Worker
 * Handles Stripe Checkout and webhooks
 */

import { neon } from '@neondatabase/serverless';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
};

// Stripe API helper
async function stripeRequest(endpoint, apiKey, body) {
  const response = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body).toString(),
  });
  return response.json();
}

// Create Stripe Checkout Session
async function createCheckoutSession(env, data) {
  const { email, template, csvHeaders, csvData, emailsPerContact, amountCents } = data;

  const successUrl = `https://spookyemail.com/thank-you?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = 'https://spookyemail.com/';

  // Store order data in metadata (Stripe has 500 char limit per value)
  // We'll store a reference and save full data to DB as 'pending_payment'
  const sql = neon(env.DATABASE_URL);

  // Create pending order first
  const orderResult = await sql`
    INSERT INTO orders (
      email, template, csv_headers, csv_data, emails_per_contact,
      contact_count, total_emails, amount_cents, status
    ) VALUES (
      ${email},
      ${template},
      ${JSON.stringify(csvHeaders)},
      ${JSON.stringify(csvData)},
      ${emailsPerContact},
      ${csvData.length},
      ${csvData.length * emailsPerContact},
      ${amountCents},
      'pending_payment'
    )
    RETURNING id
  `;

  const orderId = orderResult[0].id;

  // Create Stripe Checkout Session
  const session = await stripeRequest('/checkout/sessions', env.STRIPE_SECRET_KEY, {
    'payment_method_types[]': 'card',
    'mode': 'payment',
    'success_url': successUrl,
    'cancel_url': cancelUrl,
    'customer_email': email,
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][product_data][name]': `SpookyEmail - ${csvData.length} contacts × ${emailsPerContact} emails`,
    'line_items[0][price_data][unit_amount]': amountCents.toString(),
    'line_items[0][quantity]': '1',
    'metadata[order_id]': orderId,
  });

  if (session.error) {
    // Clean up pending order
    await sql`DELETE FROM orders WHERE id = ${orderId}`;
    throw new Error(session.error.message);
  }

  // Update order with Stripe session ID
  await sql`
    UPDATE orders
    SET stripe_session_id = ${session.id}
    WHERE id = ${orderId}
  `;

  return { checkoutUrl: session.url, sessionId: session.id, orderId };
}

// Verify Stripe webhook signature
async function verifyWebhookSignature(payload, signature, secret) {
  const encoder = new TextEncoder();
  const parts = signature.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=');
    acc[key] = value;
    return acc;
  }, {});

  const timestamp = parts.t;
  const signatures = Object.entries(parts)
    .filter(([k]) => k.startsWith('v1'))
    .map(([, v]) => v);

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const expectedSignature = Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return signatures.includes(expectedSignature);
}

// Handle successful payment
async function handlePaymentSuccess(env, session) {
  const sql = neon(env.DATABASE_URL);
  const orderId = session.metadata?.order_id;

  if (!orderId) {
    console.error('No order_id in session metadata');
    return;
  }

  // Update order status to pending (ready for processing)
  await sql`
    UPDATE orders
    SET status = 'pending',
        stripe_payment_id = ${session.payment_intent},
        updated_at = NOW()
    WHERE id = ${orderId} AND status = 'pending_payment'
  `;

  console.log(`Order ${orderId} marked as pending for processing`);
}

// Handle webhook events
async function handleWebhook(env, request) {
  const signature = request.headers.get('Stripe-Signature');
  const payload = await request.text();

  // Verify signature
  const isValid = await verifyWebhookSignature(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  if (!isValid) {
    return new Response('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(payload);

  switch (event.type) {
    case 'checkout.session.completed':
      await handlePaymentSuccess(env, event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response('OK', { status: 200 });
}

// Get order details for thank-you page
async function getOrderBySession(env, sessionId) {
  const sql = neon(env.DATABASE_URL);

  const orders = await sql`
    SELECT id, email, contact_count, total_emails, status
    FROM orders
    WHERE stripe_session_id = ${sessionId}
    LIMIT 1
  `;

  return orders[0] || null;
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    try {
      // Create checkout session
      if (url.pathname === '/checkout' && request.method === 'POST') {
        const data = await request.json();
        const result = await createCheckoutSession(env, data);
        return new Response(JSON.stringify(result), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      // Stripe webhook
      if (url.pathname === '/webhook' && request.method === 'POST') {
        return handleWebhook(env, request);
      }

      // Get order by session ID (for thank-you page)
      if (url.pathname === '/order' && request.method === 'GET') {
        const sessionId = url.searchParams.get('session_id');
        if (!sessionId) {
          return new Response(JSON.stringify({ error: 'Missing session_id' }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }
        const order = await getOrderBySession(env, sessionId);
        return new Response(JSON.stringify({ order }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      return new Response('SpookyEmail Stripe Worker', { status: 200 });
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
  },
};
