import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query;

  // Handle different API endpoints
  if (Array.isArray(path)) {
    const endpoint = path.join('/');

    // Stripe payments endpoints
    if (endpoint.startsWith('payments/')) {
      return handleStripePayments(req, res, endpoint);
    }

    // Webhook endpoints
    if (endpoint.startsWith('webhook/')) {
      return handleStripeWebhook(req, res, endpoint);
    }

    // Lead/contact endpoints
    if (endpoint === 'leads') {
      return handleLeads(req, res);
    }
  }

  // Default response for unhandled endpoints
  res.status(404).json({
    error: 'Endpoint not implemented',
    message: 'This API endpoint is not yet available in the deployed version.',
    path: req.url
  });
}

// Simple Stripe payments handler (mock for now)
function handleStripePayments(req: VercelRequest, res: VercelResponse, endpoint: string) {
  if (req.method === 'POST' && endpoint === 'payments/create-checkout-session') {
    res.json({
      url: 'https://checkout.stripe.com/test_session_placeholder',
      message: 'Stripe integration coming soon - contact support for beta access'
    });
  } else if (req.method === 'GET' && endpoint === 'payments/subscription-status') {
    res.json({
      status: 'trialing',
      plan: 'Starter',
      trial: true,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false
    });
  } else {
    res.status(404).json({ error: 'Payment endpoint not found' });
  }
}

// Simple webhook handler (mock)
function handleStripeWebhook(req: VercelRequest, res: VercelResponse, endpoint: string) {
  res.json({ received: true, endpoint });
}

// Simple leads handler
function handleLeads(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    res.json({
      success: true,
      message: 'Thank you for your inquiry. We will contact you within 24 hours.',
      id: 'lead_' + Date.now()
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}