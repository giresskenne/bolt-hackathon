/**
 * Stripe Connection Test Script
 * Run this to verify your Stripe configuration is working
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

async function testStripeConnection() {
  console.log('🧪 Testing Stripe Connection...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`STRIPE_PRO_PRICE_ID: ${process.env.STRIPE_PRO_PRICE_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`STRIPE_ENTERPRISE_PRICE_ID: ${process.env.STRIPE_ENTERPRISE_PRICE_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`STRIPE_WEBHOOK_SECRET: ${process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing'}\n`);

  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('❌ STRIPE_SECRET_KEY is required. Please set it in your .env file.');
    console.log('💡 Get your test key from: https://dashboard.stripe.com/test/apikeys\n');
    return;
  }

  // Initialize Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // Test 1: Basic API connection
    console.log('🔌 Testing Stripe API connection...');
    const account = await stripe.accounts.retrieve();
    console.log(`✅ Connected to Stripe account: ${account.display_name || account.id}`);
    console.log(`📧 Account email: ${account.email || 'Not set'}`);
    console.log(`🌍 Country: ${account.country}\n`);

    // Test 2: List existing customers
    console.log('👥 Testing customer operations...');
    const customers = await stripe.customers.list({ limit: 3 });
    console.log(`✅ Found ${customers.data.length} existing customers`);
    if (customers.data.length > 0) {
      console.log(`   Latest customer: ${customers.data[0].email || customers.data[0].id}`);
    }
    console.log();

    // Test 3: Create a test customer
    console.log('🆕 Creating test customer...');
    const testCustomer = await stripe.customers.create({
      email: 'test@prompt-scrubber.com',
      name: 'Test Customer',
      metadata: {
        source: 'stripe-connection-test',
        created_at: new Date().toISOString()
      }
    });
    console.log(`✅ Created test customer: ${testCustomer.id}`);
    console.log();

    // Test 4: Check if price IDs exist
    if (process.env.STRIPE_PRO_PRICE_ID) {
      console.log('💰 Testing Pro price ID...');
      try {
        const proPrice = await stripe.prices.retrieve(process.env.STRIPE_PRO_PRICE_ID);
        console.log(`✅ Pro price found: ${proPrice.unit_amount / 100} ${proPrice.currency.toUpperCase()}/${proPrice.recurring?.interval || 'one-time'}`);
      } catch (error) {
        console.log(`❌ Pro price ID invalid: ${error.message}`);
        console.log('💡 Create a product and price in your Stripe dashboard');
      }
    }

    if (process.env.STRIPE_ENTERPRISE_PRICE_ID) {
      console.log('🏢 Testing Enterprise price ID...');
      try {
        const enterprisePrice = await stripe.prices.retrieve(process.env.STRIPE_ENTERPRISE_PRICE_ID);
        console.log(`✅ Enterprise price found: ${enterprisePrice.unit_amount / 100} ${enterprisePrice.currency.toUpperCase()}/${enterprisePrice.recurring?.interval || 'one-time'}`);
      } catch (error) {
        console.log(`❌ Enterprise price ID invalid: ${error.message}`);
        console.log('💡 Create a product and price in your Stripe dashboard');
      }
    }
    console.log();

    // Test 5: Create a test checkout session
    console.log('🛒 Testing checkout session creation...');
    if (process.env.STRIPE_PRO_PRICE_ID) {
      try {
        const session = await stripe.checkout.sessions.create({
          customer: testCustomer.id,
          payment_method_types: ['card'],
          line_items: [{
            price: process.env.STRIPE_PRO_PRICE_ID,
            quantity: 1,
          }],
          mode: 'subscription',
          success_url: 'http://localhost:5173/dashboard?upgrade=success',
          cancel_url: 'http://localhost:5173/billing?upgrade=cancelled',
          metadata: {
            userId: 'test-user-123',
            plan: 'pro'
          }
        });
        console.log(`✅ Checkout session created: ${session.id}`);
        console.log(`🔗 Checkout URL: ${session.url}`);
      } catch (error) {
        console.log(`❌ Checkout session failed: ${error.message}`);
      }
    } else {
      console.log('⚠️  Skipping checkout test - STRIPE_PRO_PRICE_ID not set');
    }
    console.log();

    // Test 6: Webhook endpoint validation
    console.log('🪝 Webhook configuration:');
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      console.log('✅ Webhook secret is configured');
      console.log('💡 Make sure your webhook endpoint is set to: http://localhost:3001/webhook');
      console.log('📡 Required events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted');
    } else {
      console.log('⚠️  Webhook secret not configured');
      console.log('💡 Set up a webhook in your Stripe dashboard');
    }
    console.log();

    // Cleanup: Delete test customer
    console.log('🧹 Cleaning up test customer...');
    await stripe.customers.del(testCustomer.id);
    console.log('✅ Test customer deleted\n');

    console.log('🎉 All Stripe tests passed! Your integration is ready.');
    console.log('\n📋 Next steps:');
    console.log('1. Start your server: npm run dev');
    console.log('2. Start your frontend: npm run dev (in webapp directory)');
    console.log('3. Test the full signup and upgrade flow');
    console.log('4. Set up webhook forwarding with Stripe CLI or ngrok');

  } catch (error) {
    console.error('❌ Stripe test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your STRIPE_SECRET_KEY is correct');
    console.log('2. Make sure you\'re using test keys (sk_test_...)');
    console.log('3. Verify your Stripe account is active');
    console.log('4. Check your internet connection');
  }
}

// Run the test
testStripeConnection().catch(console.error);