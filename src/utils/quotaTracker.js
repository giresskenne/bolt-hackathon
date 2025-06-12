/**
 * QuotaTracker - Client-side quota management and license ping utility
 */

import { EncryptedStore } from './encryptedStore.js';

class QuotaTracker {
  constructor() {
    this.store = new EncryptedStore('quota');
    this.lastPing = null;
    this.pingInterval = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Get current usage data
   */
  async getCurrentUsage() {
    const usage = await this.store.get('usage') || {
      scrubsThisMonth: 0,
      customRules: 0,
      lastReset: new Date().toISOString(),
      plan: 'free'
    };

    // Check if we need to reset monthly counters
    const lastReset = new Date(usage.lastReset);
    const now = new Date();
    
    if (now.getMonth() !== lastReset.getMonth() || 
        now.getFullYear() !== lastReset.getFullYear()) {
      usage.scrubsThisMonth = 0;
      usage.lastReset = now.toISOString();
      await this.store.set('usage', usage);
    }

    return usage;
  }

  /**
   * Update usage counters
   */
  async incrementUsage(type, amount = 1) {
    const usage = await this.getCurrentUsage();
    
    switch (type) {
      case 'scrub':
        usage.scrubsThisMonth += amount;
        break;
      case 'customRule':
        usage.customRules += amount;
        break;
      default:
        console.warn('Unknown usage type:', type);
        return;
    }

    await this.store.set('usage', usage);
    
    // Trigger license ping if needed
    await this.maybePing();
    
    return usage;
  }

  /**
   * Check if user can perform an action based on their plan
   */
  async canPerformAction(action) {
    const usage = await this.getCurrentUsage();
    const limits = this.getPlanLimits(usage.plan);

    switch (action) {
      case 'scrub':
        return limits.scrubsPerMonth === -1 || 
               usage.scrubsThisMonth < limits.scrubsPerMonth;
      
      case 'addCustomRule':
        return limits.customRules === -1 || 
               usage.customRules < limits.customRules;
      
      default:
        return true;
    }
  }

  /**
   * Get plan limits
   */
  getPlanLimits(plan) {
    const limits = {
      free: {
        scrubsPerMonth: 800,
        customRules: 25,
        patterns: 20,
        history: '24h',
        sites: ['chatgpt', 'claude', 'gemini', 'copilot']
      },
      pro: {
        scrubsPerMonth: -1, // unlimited
        customRules: 100,
        patterns: 100,
        history: '90d',
        sites: 'allowlist'
      },
      enterprise: {
        scrubsPerMonth: -1,
        customRules: -1,
        patterns: -1,
        history: 'custom',
        sites: 'policy'
      }
    };

    return limits[plan] || limits.free;
  }

  /**
   * Get usage percentage for a specific metric
   */
  async getUsagePercentage(type) {
    const usage = await this.getCurrentUsage();
    const limits = this.getPlanLimits(usage.plan);
    
    let current, limit;
    
    switch (type) {
      case 'scrubs':
        current = usage.scrubsThisMonth;
        limit = limits.scrubsPerMonth;
        break;
      case 'customRules':
        current = usage.customRules;
        limit = limits.customRules;
        break;
      default:
        return 0;
    }

    if (limit === -1) return 0; // unlimited
    return Math.min((current / limit) * 100, 100);
  }

  /**
   * Perform license ping to validate subscription
   */
  async performLicensePing() {
    try {
      const usage = await this.getCurrentUsage();
      const userId = await this.getUserId();
      
      const pingData = {
        userId,
        plan: usage.plan,
        scrubCountThisMonth: usage.scrubsThisMonth,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };

      const response = await fetch('/api/license/ping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify(pingData)
      });

      if (!response.ok) {
        throw new Error(`License ping failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Update local plan info if server says it's different
      if (result.plan !== usage.plan) {
        usage.plan = result.plan;
        await this.store.set('usage', usage);
      }

      // Store last ping time
      await this.store.set('lastPing', new Date().toISOString());
      
      return result;
    } catch (error) {
      console.error('License ping failed:', error);
      // In case of network issues, allow continued usage for a grace period
      return { valid: true, plan: 'free' }; // Fallback to free plan
    }
  }

  /**
   * Maybe perform license ping based on interval
   */
  async maybePing() {
    const lastPing = await this.store.get('lastPing');
    const now = new Date();
    
    if (!lastPing || 
        (now.getTime() - new Date(lastPing).getTime()) > this.pingInterval) {
      return await this.performLicensePing();
    }
    
    return null;
  }

  /**
   * Get user ID (from auth store or generate anonymous ID)
   */
  async getUserId() {
    let userId = await this.store.get('userId');
    if (!userId) {
      userId = 'anon_' + crypto.randomUUID();
      await this.store.set('userId', userId);
    }
    return userId;
  }

  /**
   * Get auth token (placeholder - would integrate with auth system)
   */
  async getAuthToken() {
    // In a real implementation, this would get the token from the auth store
    return 'anonymous';
  }

  /**
   * Update plan (called after successful upgrade/downgrade)
   */
  async updatePlan(newPlan) {
    const usage = await this.getCurrentUsage();
    usage.plan = newPlan;
    await this.store.set('usage', usage);
    
    // Immediate ping to validate new plan
    return await this.performLicensePing();
  }

  /**
   * Get scrub history
   */
  async getScrubHistory(limit = 20) {
    const history = await this.store.get('scrubHistory') || [];
    return history.slice(-limit).reverse(); // Most recent first
  }

  /**
   * Add scrub event to history
   */
  async addScrubEvent(event) {
    const usage = await this.getCurrentUsage();
    const limits = this.getPlanLimits(usage.plan);
    
    let history = await this.store.get('scrubHistory') || [];
    
    // Add new event
    history.push({
      ...event,
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID()
    });

    // Enforce history limits based on plan
    const maxHistory = limits.history === '24h' ? 50 : 
                      limits.history === '90d' ? 1000 : 
                      10000; // enterprise
    
    if (history.length > maxHistory) {
      history = history.slice(-maxHistory);
    }

    await this.store.set('scrubHistory', history);
    return history;
  }

  /**
   * Clear old history based on plan limits
   */
  async cleanupHistory() {
    const usage = await this.getCurrentUsage();
    const limits = this.getPlanLimits(usage.plan);
    const history = await this.store.get('scrubHistory') || [];
    
    if (limits.history === '24h') {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const filtered = history.filter(event => 
        new Date(event.timestamp) > cutoff
      );
      await this.store.set('scrubHistory', filtered);
    } else if (limits.history === '90d') {
      const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const filtered = history.filter(event => 
        new Date(event.timestamp) > cutoff
      );
      await this.store.set('scrubHistory', filtered);
    }
    // Enterprise keeps everything (custom retention)
  }
}

export { QuotaTracker };