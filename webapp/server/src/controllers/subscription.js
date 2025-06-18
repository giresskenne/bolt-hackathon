import { stripe } from '../services/stripe.js';
import UserModel from '../models/UserModel.js';
import SubscriptionModel from '../models/Subscription.js';
import { STRIPE_PRICE_ID } from '../config/constants.js';

// Get subscription status
export const getSubscriptionStatus = async (req, res) => {
  try {
    console.log('Getting subscription status for userId:', req.user.userId);
    
    const { data: user } = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // For now, return the user's plan from their profile
    // In a full implementation, you'd check the subscription table
    const response = {
      success: true,
      subscription: {
        plan: user.subscription?.plan || 'free',
        status: user.subscription?.status || 'active',
        currentPeriodEnd: user.subscription?.trialEnds,
        stripeCustomerId: user.subscription?.stripeCustomerId,
        stripeSubscriptionId: user.subscription?.stripeSubscriptionId
      }
    };

    console.log('Sending subscription response:', response);
    return res.json(response);

  } catch (error) {
    console.error('Get subscription status error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Server error',
      details: error.message 
    });
  }
};

// Create subscription checkout session
export const createUpgradeSession = async (req, res) => {
  try {
    const { plan } = req.body;
    console.log('Creating upgrade session for plan:', plan);

    if (!['pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan. Must be "pro" or "enterprise"'
      });
    }

    const { data: user } = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    console.log('Found user:', user.email);

    // Get the correct price ID
    const priceId = plan === 'pro' ? 
      process.env.STRIPE_PRO_PRICE_ID : 
      process.env.STRIPE_ENTERPRISE_PRICE_ID;

    if (!priceId) {
      console.error(`Missing price ID for plan: ${plan}`);
      return res.status(500).json({
        success: false,
        error: `Price ID not configured for ${plan} plan`
      });
    }

    console.log('Using price ID:', priceId);

    // Create or get Stripe customer
    let customerId = user.subscription?.stripeCustomerId;
    
    if (!customerId) {
      console.log('Creating new Stripe customer...');
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { 
          userId: user.id,
          source: 'prompt-scrubber-webapp'
        }
      });
      customerId = customer.id;
      console.log('Created Stripe customer:', customerId);

      // Update user with customer ID
      const updatedUser = {
        ...user,
        subscription: {
          ...user.subscription,
          stripeCustomerId: customerId
        }
      };
      await UserModel.prototype.save.call({ ...updatedUser, id: user.id });
    }

    // Create checkout session
    console.log('Creating checkout session...');
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/account/billing?upgrade=cancelled`,
      metadata: {
        userId: user.id,
        plan: plan,
        userEmail: user.email
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required'
    });

    console.log('Checkout session created:', session.id);

    return res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Create upgrade session error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to create checkout session',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create billing portal session
export const createPortalSession = async (req, res) => {
  try {
    const { data: user } = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    const customerId = user.subscription?.stripeCustomerId;
    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: 'No Stripe customer found. Please upgrade to a paid plan first.'
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/account/billing`,
    });

    return res.json({
      success: true,
      url: session.url
    });

  } catch (error) {
    console.error('Create portal session error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to create billing portal session',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};