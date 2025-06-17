import express from 'express';
import { createPortalSession, createSubscription, stripe } from '../services/stripe.js';
import { authenticateToken } from '../middleware/auth.js';
import UserModel from '../models/UserModel.js';
import Subscription from '../models/Subscription.js';
import mongoose from 'mongoose';
import { STRIPE_PRICE_ID } from '../config/constants.js';

const router = express.Router();

// Get subscription status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    console.log('Getting subscription status for userId:', req.user.userId);
    
    const [user, subscription] = await Promise.all([
      UserModel.findById(req.user.userId),
      Subscription.findOne({ userId: req.user.userId })
    ]);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    const response = {
      success: true,
      subscription: {
        plan: subscription?.plan || 'free',
        status: subscription?.status || 'active',
        currentPeriodEnd: subscription?.currentPeriodEnd,
        stripeCustomerId: subscription?.stripeCustomerId,
        stripeSubscriptionId: subscription?.stripeSubscriptionId
      }
    };

    console.log('Sending response:', response);
    return res.json(response);

  } catch (error) {
    console.error('Get subscription status error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Server error',
      details: error.message 
    });
  }
});

// Create subscription checkout session
router.post('/upgrade', authenticateToken, async (req, res) => {
  try {
    const { plan } = req.body;
    const user = await UserModel.findById(req.user.userId);
    console.log('Upgrading subscription for user:', user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Set trial end date (e.g., 30 days from now)
    const trialEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Retrieve or create subscription
    let subscription = await Subscription.findOne({ userId: user._id });
    if (!subscription) {
      subscription = await Subscription.create({
        userId: user._id,
        plan: 'free',
        status: 'active',
        currentPeriodEnd: trialEndDate
      });
      console.log('Created new subscription:', subscription);
    }
    
    // If the subscription exists but currentPeriodEnd is missing, set it
    if (!subscription.currentPeriodEnd) {
      subscription.currentPeriodEnd = trialEndDate;
      console.log('Setting missing currentPeriodEnd:', trialEndDate);
      await subscription.save();
    }

    // If downgrading to free
    if (plan === 'free') {
      if (subscription.stripeSubscriptionId) {
        await stripe.subscriptions.del(subscription.stripeSubscriptionId);
      }
      
      subscription.plan = 'free';
      subscription.status = 'active';
      subscription.currentPeriodEnd = trialEndDate;
      await subscription.save();
      
      return res.json({ success: true, subscription });
    }

    // Handle pro/enterprise upgrade
    let customerId = subscription.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user._id.toString() }
      });
      customerId = customer.id;
      subscription.stripeCustomerId = customerId;
      await subscription.save();
    }

    // Update subscription status before creating checkout
    subscription.status = 'pending';
    subscription.plan = plan;
    await subscription.save();
    console.log('Updated subscription:', subscription);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: plan === 'pro' ? 
          process.env.STRIPE_PRO_PRICE_ID : 
          process.env.STRIPE_ENTERPRISE_PRICE_ID,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?upgrade=success`,
      cancel_url: `${process.env.FRONTEND_URL}/billing?upgrade=cancelled`,
      metadata: {
        userId: user._id.toString(),
        plan,
        subscriptionId: subscription._id.toString()
      }
    });

    return res.json({
      success: true,
      checkoutUrl: session.url,
      subscription
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Server error',
      details: error.message 
    });
  }
});

export default router;