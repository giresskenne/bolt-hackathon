import express from 'express';
import { body, validationResult } from 'express-validator';
import { signup, login, getMe } from '../controllers/auth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

// Register route
router.post('/signup', [
  body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .isString()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('plan')
    .optional()
    .isIn(['free', 'pro', 'enterprise'])
    .withMessage('Invalid plan type'),
  validate
], signup);

// Login route
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .exists()
    .withMessage('Password is required'),
  validate
], login);

// Me route
router.get('/me', authenticateToken, getMe);

export default router;