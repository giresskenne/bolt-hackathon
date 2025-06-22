import express from 'express';
import { stripe } from '../config/stripe.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

// Stripe webhook handler
router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

async function handleCheckoutCompleted(session) {
  console.log('Checkout completed:', session.id);
  
  const userId = session.metadata.user_id;
  const plan = session.metadata.plan;
  
  if (!userId || !plan) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Update user's plan and subscription status
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      plan: plan,
      subscription_status: 'active',
      stripe_subscription_id: session.subscription
    })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update user after checkout:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  
  const customerId = subscription.customer;
  
  // Find user by customer ID
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (userError || !user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Determine plan from subscription items
  const priceId = subscription.items.data[0]?.price?.id;
  let plan = 'free';
  
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    plan = 'pro';
  } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
    plan = 'enterprise';
  }

  // Update user subscription
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      plan: plan,
      subscription_status: subscription.status,
      stripe_subscription_id: subscription.id
    })
    .eq('id', user.id);

  if (error) {
    console.error('Failed to update subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  const customerId = subscription.customer;
  
  // Find user by customer ID
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (userError || !user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Downgrade to free plan
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      plan: 'free',
      subscription_status: 'cancelled',
      stripe_subscription_id: null
    })
    .eq('id', user.id);

  if (error) {
    console.error('Failed to downgrade user:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded:', invoice.id);
  // Could log successful payments or send confirmation emails
}

async function handlePaymentFailed(invoice) {
  console.log('Payment failed:', invoice.id);
  
  const customerId = invoice.customer;
  
  // Find user by customer ID
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single();

  if (userError || !user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Update subscription status to indicate payment issues
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      subscription_status: 'past_due'
    })
    .eq('id', user.id);

  if (error) {
    console.error('Failed to update payment status:', error);
  }

  // Here you could send an email notification about the failed payment
}

export default router;