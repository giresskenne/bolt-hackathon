import { incrementUsage, getUserUsage, getMonthlyUsage } from '../services/usage.js';

export const trackUsage = async (req, res) => {
  try {
    const usage = await incrementUsage(req.user.id);
    res.json(usage);
  } catch (error) {
    if (error.message === 'Usage limit exceeded for current plan') {
      return res.status(429).json({ error: 'Usage limit exceeded' });
    }
    console.error('Track usage error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCurrentUsage = async (req, res) => {
  try {
    const usage = await getUserUsage(req.user.id);
    res.json(usage);
  } catch (error) {
    console.error('Get current usage error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUsageHistory = async (req, res) => {
  try {
    const history = await getMonthlyUsage(req.user.id);
    res.json(history);
  } catch (error) {
    console.error('Get usage history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
