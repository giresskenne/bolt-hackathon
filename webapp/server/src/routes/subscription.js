import express from 'express';
import { createPortalSession, createSubscription } from '../services/stripe.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get subscription status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const { subscription } = req.user;
    res.json({ subscription });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create subscription
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { priceId } = req.body;
    const subscription = await createSubscription({
      customerId: req.user.subscription.stripeCustomerId,
      priceId
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create Stripe Portal session
router.post('/portal', authenticateToken, async (req, res) => {
  try {
    const portalSession = await createPortalSession(
      req.user.subscription.stripeCustomerId
    );
    res.json({ url: portalSession.url });
  } catch (error) {
    console.error('Create portal session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
