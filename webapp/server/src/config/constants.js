export const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
export const JWT_EXPIRES_IN = '7d';

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;

export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    maxRequests: 100,
    features: ['Basic detection patterns', 'Manual scrubbing']
  },
  PRO: {
    name: 'Pro',
    maxRequests: 1000,
    features: ['Advanced detection patterns', 'Auto-scrubbing', 'Custom patterns']
  },
  ENTERPRISE: {
    name: 'Enterprise',
    maxRequests: Infinity,
    features: ['Unlimited detection', 'Priority support', 'Custom integration']
  }
};
