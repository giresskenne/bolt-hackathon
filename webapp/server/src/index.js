import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import Stripe from 'stripe';
import authRoutes from './routes/auth.js';
import subscriptionRoutes from './routes/subscription.js';
import usageRoutes from './routes/usage.js';
import { authenticateToken } from './middleware/auth.js';
import { handleStripeWebhook } from './services/webhook.js';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from './config/constants.js';

dotenv.config();

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY);

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Route-specific middleware
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscription', authenticateToken, subscriptionRoutes);
app.use('/api/usage', usageRoutes);

// Stripe webhook
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
    await handleStripeWebhook(event);
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook Error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3001;

// Only start the server if this file is run directly (not in tests)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export { app };
