import Usage from '../models/Usage.js';
import Subscription from '../models/Subscription.js';
import { format } from 'date-fns';

const USAGE_LIMITS = {
  free: 100,
  pro: 1000,
  enterprise: Infinity
};

export const incrementUsage = async (userId) => {
  try {
    const currentMonth = format(new Date(), 'yyyy-MM');
    
    // Check subscription status and limits
    const subscription = await Subscription.findOne({ userId, status: 'active' });
    const plan = subscription?.plan || 'free';
    
    // Get current usage
    const usage = await Usage.findOne({ userId, month: currentMonth });
    const currentCount = usage?.scrubCount || 0;
    
    // Check if user has exceeded their limit
    if (currentCount >= USAGE_LIMITS[plan]) {
      throw new Error('Usage limit exceeded for current plan');
    }

    // Increment usage count
    const updatedUsage = await Usage.findOneAndUpdate(
      { userId, month: currentMonth },
      { $inc: { scrubCount: 1 } },
      { upsert: true, new: true }
    );

    return {
      month: currentMonth,
      scrubCount: updatedUsage.scrubCount,
      limit: USAGE_LIMITS[plan],
      remaining: USAGE_LIMITS[plan] - updatedUsage.scrubCount
    };
  } catch (error) {
    console.error('Increment usage error:', error);
    throw error;
  }
};

export const getUserUsage = async (userId) => {
  try {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const subscription = await Subscription.findOne({ userId, status: 'active' });
    const plan = subscription?.plan || 'free';
    
    const usage = await Usage.findOne({ userId, month: currentMonth });
    const scrubCount = usage?.scrubCount || 0;

    return {
      month: currentMonth,
      scrubCount,
      limit: USAGE_LIMITS[plan],
      remaining: USAGE_LIMITS[plan] - scrubCount,
      plan
    };
  } catch (error) {
    console.error('Get usage error:', error);
    throw error;
  }
};

export const getMonthlyUsage = async (userId) => {
  try {
    const usageHistory = await Usage.find({ userId })
      .sort({ month: -1 })
      .limit(12);
    
    return usageHistory.map(usage => ({
      month: usage.month,
      scrubCount: usage.scrubCount
    }));
  } catch (error) {
    console.error('Get monthly usage error:', error);
    throw error;
  }
};

export const resetUsage = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.usageCount = 0;
    await user.save();

    return {
      usageCount: 0,
      usageQuota: user.usageQuota
    };
  } catch (error) {
    console.error('Reset usage error:', error);
    throw error;
  }
};

export const updateUserQuota = async (userId, tier) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const tierConfig = SUBSCRIPTION_TIERS[tier.toUpperCase()];
    if (!tierConfig) {
      throw new Error('Invalid subscription tier');
    }

    user.usageQuota = tierConfig.maxRequests;
    await user.save();

    return {
      usageQuota: user.usageQuota,
      tier
    };
  } catch (error) {
    console.error('Update user quota error:', error);
    throw error;
  }
};
