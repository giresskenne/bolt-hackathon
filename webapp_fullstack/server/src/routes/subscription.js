import express from 'express';
import { stripe, STRIPE_PRICE_IDS } from '../config/stripe.js';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Get subscription status
router.get('/status', authenticateUser, async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      plan: profile.plan,
      subscription_status: profile.subscription_status,
      trial_ends_at: profile.trial_ends_at,
      stripe_customer_id: profile.stripe_customer_id,
      stripe_subscription_id: profile.stripe_subscription_id
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Get billing history (invoices)
router.get('/invoices', authenticateUser, async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!profile.stripe_customer_id) {
      // User doesn't have a Stripe customer ID yet, return empty array
      return res.json([]);
    }

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: profile.stripe_customer_id,
      limit: 20, // Get last 20 invoices
      status: 'paid' // Only get paid invoices
    });

    // Transform Stripe invoice data to our format
    const billingHistory = invoices.data.map(invoice => ({
      id: invoice.id,
      date: new Date(invoice.created * 1000).toISOString().split('T')[0], // Convert timestamp to YYYY-MM-DD
      amount: `$${(invoice.amount_paid / 100).toFixed(2)}`, // Convert cents to dollars
      status: invoice.status,
      description: invoice.lines.data[0]?.description || 'Subscription payment',
      invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf
    }));

    res.json(billingHistory);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to get billing history' });
  }
});

// Get payment methods
router.get('/payment-methods', authenticateUser, async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!profile.stripe_customer_id) {
      // User doesn't have a Stripe customer ID yet, return null
      return res.json(null);
    }

    // Fetch payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: profile.stripe_customer_id,
      type: 'card'
    });

    if (paymentMethods.data.length === 0) {
      return res.json(null);
    }

    // Get the default payment method or the first one
    const defaultPaymentMethod = paymentMethods.data[0];
    const card = defaultPaymentMethod.card;

    const paymentMethodData = {
      id: defaultPaymentMethod.id,
      type: 'card',
      last4: card.last4,
      brand: card.brand,
      expiryMonth: card.exp_month,
      expiryYear: card.exp_year,
      funding: card.funding
    };

    res.json(paymentMethodData);
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: 'Failed to get payment methods' });
  }
});
// Create checkout session for upgrade
router.post('/create-checkout', authenticateUser, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan || !STRIPE_PRICE_IDS[plan]) {
      return res.status(400).json({ error: 'Invalid plan specified' });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (profileError) {
      return res.status(404).json({ error: 'User not found' });
    }

    let customerId = profile.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        metadata: {
          user_id: req.user.id
        }
      });
      customerId = customer.id;

      // Update user with customer ID
      await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', req.user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICE_IDS[plan],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/account/billing?upgrade=cancelled`,
      metadata: {
        user_id: req.user.id,
        plan: plan
      }
    });

    res.json({
      checkout_url: session.url,
      session_id: session.id
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create billing portal session
router.post('/create-portal', authenticateUser, async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    let customerId = profile.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        metadata: {
          user_id: req.user.id
        }
      });
      customerId = customer.id;

      // Update user with customer ID
      await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', req.user.id);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/account/billing`,
    });

    res.json({
      portal_url: session.url
    });
  } catch (error) {
    console.error('Create portal error:', error);
    res.status(500).json({ error: 'Failed to create billing portal session' });
  }
});

export default router;