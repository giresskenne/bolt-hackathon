/**
 * QuotaTracker - Chrome Extension version using chrome.storage
 * Client-side quota management and license ping utility
 */

// Import EncryptedStore (will be available in extension context)
// const { EncryptedStore } = self;

class QuotaTracker {
  constructor() {
    this.store = new self.EncryptedStore('quota');
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
   * Get custom rules
   */
  async getCustomRules() {
    return await this.store.get('customRules') || [];
  }

  /**
   * Add custom rule
   */
  async addCustomRule(rule) {
    const rules = await this.getCustomRules();
    const newRule = {
      ...rule,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    
    rules.push(newRule);
    await this.store.set('customRules', rules);
    await this.incrementUsage('customRule', 1);
    
    return newRule;
  }

  /**
   * Update custom rule
   */
  async updateCustomRule(id, updates) {
    const rules = await this.getCustomRules();
    const index = rules.findIndex(rule => rule.id === id);
    
    if (index !== -1) {
      rules[index] = { ...rules[index], ...updates };
      await this.store.set('customRules', rules);
      return rules[index];
    }
    
    return null;
  }

  /**
   * Delete custom rule
   */
  async deleteCustomRule(id) {
    const rules = await this.getCustomRules();
    const filteredRules = rules.filter(rule => rule.id !== id);
    
    if (filteredRules.length !== rules.length) {
      await this.store.set('customRules', filteredRules);
      await this.incrementUsage('customRule', -1);
      return true;
    }
    
    return false;
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

  /**
   * Update plan (called after successful upgrade/downgrade)
   */
  async updatePlan(newPlan) {
    const usage = await this.getCurrentUsage();
    usage.plan = newPlan;
    await this.store.set('usage', usage);
    
    return usage;
  }

  /**
   * Export all data
   */
  async exportData() {
    const usage = await this.getCurrentUsage();
    const customRules = await this.getCustomRules();
    const scrubHistory = await this.getScrubHistory(1000);
    
    return {
      usage,
      customRules,
      scrubHistory,
      exportDate: new Date().toISOString()
    };
  }

  /**
   * Clear all data
   */
  async clearAllData() {
    await this.store.clear();
  }
}

// Export for use in extension
if (typeof self !== 'undefined') {
  self.QuotaTracker = QuotaTracker;
}