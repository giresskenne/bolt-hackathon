/**
 * Minimal License & Billing Backend for Prompt-Scrubber SaaS
 * Handles subscription validation, license pings, and Stripe webhooks
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { globalLimiter, authLimiter, apiLimiter, licensePingLimiter } from './rateLimit.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000']
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: true,
  frameguard: { action: "deny" },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
}));

// Configure CORS with more restrictive options
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 600 // Reduce preflight caching to 10 minutes
}));

// Parse JSON with size limits and validation
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.raw({ 
  type: 'application/json', 
  limit: '10mb',
  verify: (req, res, buf) => {
    if (buf.length === 0) return;
    try {
      JSON.parse(buf);
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }
}));

// Apply global rate limiter to all routes
app.use(globalLimiter);

// Apply authentication rate limiter to auth routes
app.use('/api/auth', authLimiter);

// Apply API rate limiter with path exclusions
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/auth/') || req.path.startsWith('/webhooks/')) {
    return next();
  }
  apiLimiter(req, res, next);
});

// In-memory storage (replace with database in production)
const users = new Map();
const subscriptions = new Map();
const licensePings = new Map();

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      plan: user.plan 
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Helper function to get plan limits
const getPlanLimits = (plan) => {
  const limits = {
    free: {
      scrubsPerMonth: 800,
      customRules: 25,
      patterns: 20
    },
    pro: {
      scrubsPerMonth: -1, // unlimited
      customRules: 100,
      patterns: 100
    },
    enterprise: {
      scrubsPerMonth: -1,
      customRules: -1,
      patterns: -1
    }
  };
  return limits[plan] || limits.free;
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, plan = 'free' } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        fields: {
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        fields: { email: 'Please enter a valid email address' }
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password too short',
        fields: { password: 'Password must be at least 8 characters long' }
      });
    }

    // Check for common passwords
    const commonPasswords = ['password', 'password123', '123456', 'qwerty'];
    if (commonPasswords.includes(password.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Password too weak',
        fields: { password: 'Please choose a stronger password' }
      });
    }

    // Validate plan
    if (!['free', 'pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Check if user already exists
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      // Add random delay to prevent user enumeration
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const user = {
      id: userId,
      email,
      password: hashedPassword,
      plan,
      createdAt: new Date().toISOString(),
      stripeCustomerId: null
    };

    users.set(userId, user);

    // Create Stripe customer for paid plans
    if (plan !== 'free') {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId }
      });
      user.stripeCustomerId = customer.id;
    }

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      recordFailedAttempt(req.ip);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Add delay to prevent timing attacks
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password with constant-time comparison
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      recordFailedAttempt(req.ip);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Add delay to prevent timing attacks
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      plan: user.plan,
      createdAt: user.createdAt
    }
  });
});

// License Ping Route
app.post('/api/license/ping', authenticateToken, licensePingLimiter, (req, res) => {
  try {
    const { userId, plan, scrubCountThisMonth, timestamp, version } = req.body;
    const user = users.get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Store ping data for analytics
    const pingId = uuidv4();
    licensePings.set(pingId, {
      userId: user.id,
      plan: user.plan,
      scrubCountThisMonth,
      timestamp,
      version,
      receivedAt: new Date().toISOString()
    });

    // Validate subscription status
    const subscription = subscriptions.get(user.id);
    const isValidSubscription = !subscription || 
      (subscription.status === 'active' && new Date(subscription.currentPeriodEnd) > new Date());

    // Return current plan limits and status
    const limits = getPlanLimits(user.plan);
    
    res.json({
      valid: isValidSubscription,
      plan: user.plan,
      limits,
      renewalDate: subscription?.currentPeriodEnd || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('License ping error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Subscription Routes
app.post('/api/subscription/upgrade', authenticateToken, async (req, res) => {
  try {
    const { plan } = req.body;
    const user = users.get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (plan === 'free') {
      // Downgrade to free
      user.plan = 'free';
      subscriptions.delete(user.id);
      
      return res.json({
        success: true,
        plan: 'free',
        message: 'Downgraded to free plan'
      });
    }

    // Create Stripe customer if doesn't exist
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id }
      });
      user.stripeCustomerId = customer.id;
    }

    // Create checkout session for paid plans
    const priceId = plan === 'pro' ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_ENTERPRISE_PRICE_ID;
    
    const session = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?upgrade=success`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?upgrade=cancelled`,
      metadata: {
        userId: user.id,
        plan
      }
    });

    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });
  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/subscription/portal', authenticateToken, async (req, res) => {
  try {
    const user = users.get(req.user.id);

    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({
      success: true,
      url: session.url
    });
  } catch (error) {
    console.error('Portal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stripe Webhook Handler
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      handleCheckoutCompleted(event.data.object);
      break;
    case 'customer.subscription.updated':
      handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      handleSubscriptionDeleted(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      handlePaymentSucceeded(event.data.object);
      break;
    case 'invoice.payment_failed':
      handlePaymentFailed(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Webhook handlers
async function handleCheckoutCompleted(session) {
  const userId = session.metadata.userId;
  const plan = session.metadata.plan;
  const user = users.get(userId);

  if (user) {
    user.plan = plan;
    
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    subscriptions.set(userId, {
      id: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      plan
    });

    console.log(`User ${userId} upgraded to ${plan}`);
  }
}

async function handleSubscriptionUpdated(subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer);
  const userId = customer.metadata.userId;

  if (userId && subscriptions.has(userId)) {
    subscriptions.set(userId, {
      id: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      plan: subscriptions.get(userId).plan
    });

    console.log(`Subscription updated for user ${userId}`);
  }
}

async function handleSubscriptionDeleted(subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer);
  const userId = customer.metadata.userId;
  const user = users.get(userId);

  if (user) {
    user.plan = 'free';
    subscriptions.delete(userId);
    console.log(`User ${userId} downgraded to free plan`);
  }
}

function handlePaymentSucceeded(invoice) {
  console.log(`Payment succeeded for invoice ${invoice.id}`);
}

function handlePaymentFailed(invoice) {
  console.log(`Payment failed for invoice ${invoice.id}`);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    users: users.size,
    subscriptions: subscriptions.size
  });
});

// Analytics endpoint (basic)
app.get('/api/analytics', authenticateToken, (req, res) => {
  // Only allow admin users in production
  const pings = Array.from(licensePings.values());
  const totalUsers = users.size;
  const activeSubscriptions = subscriptions.size;
  
  res.json({
    totalUsers,
    activeSubscriptions,
    totalPings: pings.length,
    recentPings: pings.slice(-10)
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Only start the server if this file is run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;