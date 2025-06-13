import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/auth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty()
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authenticateToken, getMe);

export default router;
