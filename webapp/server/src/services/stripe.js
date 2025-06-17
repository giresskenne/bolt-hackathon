import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, STRIPE_PRICE_ID } from '../config/constants.js';

const stripe = new Stripe(STRIPE_SECRET_KEY);

export { stripe }; // Export the initialized stripe instance

export const createStripeCustomer = async ({ email, name }) => {
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      source: 'prompt-scrubber'
    }
  });
};

export const createSubscription = async ({ customerId, priceId = STRIPE_PRICE_ID }) => {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent']
  });
};

export const cancelSubscription = async (subscriptionId) => {
  return await stripe.subscriptions.cancel(subscriptionId);
};

export const createPortalSession = async (customerId) => {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.FRONTEND_URL}/dashboard`
  });
};

export const handleSubscriptionChange = async (subscription) => {
  // Update user subscription status based on Stripe webhook event
  const status = subscription.status === 'active' || subscription.status === 'trialing' 
    ? 'active' 
    : 'inactive';

  return {
    status,
    planId: subscription.plan.id,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000)
  };
};
