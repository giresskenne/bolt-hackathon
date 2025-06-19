// Validate required environment variables
export function validateEnvVars() {
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ];

  if (process.env.NODE_ENV !== 'test') {
    requiredEnvVars.push(
      'STRIPE_SECRET_KEY',
      'STRIPE_PRICE_ID', // Fallback for legacy support
      'STRIPE_PRO_PRICE_ID',
      'STRIPE_ENTERPRISE_PRICE_ID',
      'STRIPE_WEBHOOK_SECRET'
    );
  }

  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    process.exit(1);
  }
}

// Always use functions to access env vars to avoid undefined issues
export function getSupabaseUrl() {
  return process.env.SUPABASE_URL;
}
export function getSupabaseAnonKey() {
  return process.env.SUPABASE_ANON_KEY;
}
export function getStripeSecretKey() {
  return process.env.STRIPE_SECRET_KEY;
}
export function getStripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET;
}
export function getJwtSecret() {
  return process.env.JWT_SECRET;
}
export function getStripePriceId(plan) {
  switch (plan?.toLowerCase()) {
    case 'pro':
      return process.env.STRIPE_PRO_PRICE_ID;
    case 'enterprise':
      return process.env.STRIPE_ENTERPRISE_PRICE_ID;
    default:
      return process.env.STRIPE_PRICE_ID; // fallback
  }
}

// Log loaded configuration for debugging
console.log('Stripe configuration loaded:', {
  STRIPE_SECRET_KEY_PREFIX: getStripeSecretKey()?.substring(0, 10) + '...',
  STRIPE_PRO_PRICE_ID: getStripePriceId('pro'),
  STRIPE_ENTERPRISE_PRICE_ID: getStripePriceId('enterprise')
});