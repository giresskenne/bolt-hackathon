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