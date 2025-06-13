import User from '../models/User.js';
import { handleSubscriptionChange } from '../services/stripe.js';
import { updateUserQuota } from '../services/usage.js';

export const handleStripeWebhook = async (event) => {
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer;

        const user = await User.findOne({
          'subscription.stripeCustomerId': stripeCustomerId
        });

        if (!user) {
          throw new Error('User not found');
        }

        const updatedSubscription = await handleSubscriptionChange(subscription);
        user.subscription = {
          ...user.subscription,
          ...updatedSubscription
        };

        // Update usage quota based on subscription plan
        if (subscription.status === 'active') {
          const planName = subscription.plan.nickname || 'PRO';
          await updateUserQuota(user._id, planName);
        }

        await user.save();
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        // Handle successful payment
        // You might want to send a confirmation email or update payment history
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const stripeCustomerId = invoice.customer;

        const user = await User.findOne({
          'subscription.stripeCustomerId': stripeCustomerId
        });

        if (user) {
          // You might want to notify the user about the failed payment
          // Send email or update user's subscription status
        }
        break;
      }
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
    throw error;
  }
};
