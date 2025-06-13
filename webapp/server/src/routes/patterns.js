import express from 'express';
import { getUserPatterns, addCustomPattern, deleteCustomPattern } from '../controllers/patterns.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateAddPattern } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticateToken);

// Get user's custom patterns
router.get('/', getUserPatterns);

// Add new custom pattern
router.post('/', validateAddPattern, addCustomPattern);

// Delete custom pattern
router.delete('/:patternId', deleteCustomPattern);

export default router;
