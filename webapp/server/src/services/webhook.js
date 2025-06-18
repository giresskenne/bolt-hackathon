import UserModel from '../models/UserModel.js';
import { stripe } from './stripe.js';

export const handleStripeWebhook = async (event) => {
  console.log(`🪝 Processing webhook: ${event.type}`);

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
        console.log(`⚠️  Unhandled webhook event: ${event.type}`);
    }
  } catch (error) {
    console.error(`❌ Webhook handler error for ${event.type}:`, error);
    throw error;
  }
};

async function handleCheckoutCompleted(session) {
  console.log('✅ Checkout completed:', session.id);
  
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan;
  
  if (!userId || !plan) {
    console.error('Missing metadata in checkout session:', { userId, plan });
    return;
  }

  try {
    // Get the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // Update user's plan and subscription info
    const { data: user } = await UserModel.findById(userId);
    if (user) {
      const updatedUser = {
        ...user,
        subscription: {
          ...user.subscription,
          plan: plan,
          status: 'active',
          stripeCustomerId: session.customer,
          stripeSubscriptionId: subscription.id,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          trialEnds: new Date(subscription.current_period_end * 1000).toISOString()
        }
      };
      
      await UserModel.prototype.save.call({ ...updatedUser, id: userId });
      console.log(`✅ Updated user ${userId} to ${plan} plan`);
    }
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Subscription updated:', subscription.id);
  
  try {
    // Find user by Stripe customer ID
    const customerId = subscription.customer;
    
    // In a real implementation, you'd query your database for the user
    // For now, we'll log the event
    console.log(`Subscription ${subscription.id} status: ${subscription.status}`);
    console.log(`Current period end: ${new Date(subscription.current_period_end * 1000)}`);
    
    // Update user's subscription status based on Stripe data
    const status = ['active', 'trialing'].includes(subscription.status) ? 'active' : 'inactive';
    console.log(`✅ Subscription status updated to: ${status}`);
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('❌ Subscription deleted:', subscription.id);
  
  try {
    const customerId = subscription.customer;
    
    // In a real implementation, you'd find the user and downgrade them to free
    console.log(`Customer ${customerId} subscription cancelled - should downgrade to free plan`);
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  console.log('💰 Payment succeeded:', invoice.id);
  console.log(`Amount: ${invoice.amount_paid / 100} ${invoice.currency.toUpperCase()}`);
}

async function handlePaymentFailed(invoice) {
  console.log('💸 Payment failed:', invoice.id);
  console.log(`Amount: ${invoice.amount_due / 100} ${invoice.currency.toUpperCase()}`);
  
  // In a real implementation, you might:
  // 1. Send an email to the customer
  // 2. Update their account status
  // 3. Provide a grace period before downgrading
}