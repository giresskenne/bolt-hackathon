import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: join(__dirname, '../../', envFile) });

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY'
];

// Add production-only required variables
if (process.env.NODE_ENV !== 'test') {
  requiredEnvVars.push(
    'STRIPE_SECRET_KEY',
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

// Export Supabase configuration
export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Export Stripe configuration
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET; // Ensure webhook secret is set
export const STRIPE_PRICE_ID = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID
};

// Log loaded configuration
console.log('Stripe configuration loaded:', {
  STRIPE_SECRET_KEY_PREFIX: STRIPE_SECRET_KEY?.substring(0, 10) + '...',
  STRIPE_PRO_PRICE_ID: STRIPE_PRICE_ID.pro,
  STRIPE_ENTERPRISE_PRICE_ID: STRIPE_PRICE_ID.enterprise
});

export const JWT_SECRET = process.env.JWT_SECRET;

// Add price lookup helper
export const getStripePriceId = (plan) => {
  switch (plan.toLowerCase()) {
    case 'pro':
      return STRIPE_PRICE_ID.pro;
    case 'enterprise':
      return STRIPE_PRICE_ID.enterprise;
    default:
      throw new Error(`Invalid plan: ${plan}`);
  }
};