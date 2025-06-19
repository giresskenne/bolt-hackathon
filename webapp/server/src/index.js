import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables before other imports
dotenv.config({ path: join(__dirname, '..', '.env') });

// Debug environment variables
console.log('Environment variables loaded:', {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...',
  NODE_ENV: process.env.NODE_ENV,
  ENV_FILE: join(__dirname, '..', '.env')
});

// Validate env vars BEFORE importing any that depend on them
import { validateEnvVars } from './config/constants.js';
validateEnvVars();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import subscriptionRoutes from './routes/subscription.js';
import usageRoutes from './routes/usage.js';
import healthRoutes from './routes/health.js';
import { authenticateToken } from './middleware/auth.js';
import { handleStripeWebhook } from './services/webhook.js';
import { authRateLimit, apiRateLimit, licenseRateLimit } from './middleware/rateLimit.js';

// Connect to Supabase
await connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.method === 'POST' ? req.body : '');
  next();
});

// Route-specific middleware
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Add a test route to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Routes with auth and rate limiting
app.use('/api/auth', authRoutes);
app.use('/api/subscription', authenticateToken, apiRateLimit, subscriptionRoutes);
app.use('/api/usage', apiRateLimit, usageRoutes);

// Health endpoint with optional auth
app.use('/api/health', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    authenticateToken(req, res, next);
  } else {
    next();
  }
}, apiRateLimit, healthRoutes);

// License endpoint with rate limiting
app.post('/api/license/ping', licenseRateLimit, (req, res) => {
  res.json({ status: 'ok' });
});

// Stripe webhook
// app.post('/webhook', async (req, res) => {
//   const sig = req.headers['stripe-signature'];
//   try {
//     const event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       getStripeWebhookSecret()
//     );
//     await handleStripeWebhook(event);
//     res.json({ received: true });
//   } catch (err) {
//     console.error('Webhook Error:', err.message);
//     res.status(400).send(`Webhook Error: ${err.message}`);
//   }
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

const PORT = process.env.PORT || 3001;

// Only start the server if this file is run directly (not in tests)
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT)
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Trying ${PORT + 1}...`);
        server.listen(PORT + 1);
      } else {
        console.error('Server error:', err);
      }
    })
    .on('listening', () => {
      const address = server.address();
      console.log(`Server running on port ${address.port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

export { app };
