import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Use test-secret in test environment
    const secret = process.env.NODE_ENV === 'test' ? 'test-secret' : process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    const user = await User.findOne({ apiKey });

    if (!user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Check if user's subscription is active
    if (user.subscription.status !== 'active' && user.subscription.status !== 'trial') {
      return res.status(403).json({ error: 'Subscription required' });
    }

    // Check usage quota
    if (user.usageCount >= user.usageQuota) {
      return res.status(429).json({ error: 'Usage quota exceeded' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};
