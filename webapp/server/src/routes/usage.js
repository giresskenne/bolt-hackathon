import express from 'express';
import { trackUsage, getCurrentUsage, getUsageHistory } from '../controllers/usage.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Track scrub usage
router.post('/track', trackUsage);

// Get current month's usage
router.get('/current', getCurrentUsage);

// Get usage history
router.get('/history', getUsageHistory);

export default router;
