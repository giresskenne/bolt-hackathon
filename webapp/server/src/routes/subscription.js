import express from 'express';
import { 
  getSubscriptionStatus, 
  createUpgradeSession, 
  createPortalSession 
} from '../controllers/subscription.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All subscription routes require authentication
router.use(authenticateToken);

// Get current subscription status
router.get('/status', getSubscriptionStatus);

// Create upgrade checkout session
router.post('/upgrade', createUpgradeSession);

// Create billing portal session
router.post('/portal', createPortalSession);

export default router;