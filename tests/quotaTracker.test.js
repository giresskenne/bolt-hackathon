/**
 * Unit tests for QuotaTracker utility
 */

import { QuotaTracker } from '../src/utils/quotaTracker.js';
import { EncryptedStore } from '../src/utils/encryptedStore.js';

// Mock EncryptedStore
jest.mock('../src/utils/encryptedStore.js');

// Mock fetch for license ping
global.fetch = jest.fn();

// Mock crypto for UUID generation
global.crypto = {
  randomUUID: jest.fn(() => 'test-uuid-' + Math.random())
};

describe('QuotaTracker', () => {
  let tracker;
  let mockStore;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create mock store instance
    mockStore = {
      get: jest.fn(),
      set: jest.fn()
    };
    
    // Mock EncryptedStore constructor
    EncryptedStore.mockImplementation(() => mockStore);
    
    tracker = new QuotaTracker();
  });

  describe('constructor', () => {
    it('should initialize with encrypted store', () => {
      expect(EncryptedStore).toHaveBeenCalledWith('quota');
      expect(tracker.store).toBe(mockStore);
      expect(tracker.pingInterval).toBe(24 * 60 * 60 * 1000); // 24 hours
    });
  });

  describe('getCurrentUsage', () => {
    it('should return default usage if none stored', async () => {
      mockStore.get.mockResolvedValue(null);
      
      const usage = await tracker.getCurrentUsage();
      
      expect(usage).toEqual({
        scrubsThisMonth: 0,
        customRules: 0,
        lastReset: expect.any(String),
        plan: 'free'
      });
    });

    it('should return stored usage', async () => {
      const storedUsage = {
        scrubsThisMonth: 50,
        customRules: 5,
        lastReset: new Date().toISOString(),
        plan: 'pro'
      };
      
      mockStore.get.mockResolvedValue(storedUsage);
      
      const usage = await tracker.getCurrentUsage();
      expect(usage).toEqual(storedUsage);
    });

    it('should reset monthly counters if month changed', async () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const storedUsage = {
        scrubsThisMonth: 100,
        customRules: 10,
        lastReset: lastMonth.toISOString(),
        plan: 'free'
      };
      
      mockStore.get.mockResolvedValue(storedUsage);
      
      const usage = await tracker.getCurrentUsage();
      
      expect(usage.scrubsThisMonth).toBe(0);
      expect(usage.customRules).toBe(10); // Should not reset
      expect(mockStore.set).toHaveBeenCalledWith('usage', expect.objectContaining({
        scrubsThisMonth: 0,
        lastReset: expect.any(String)
      }));
    });
  });

  describe('incrementUsage', () => {
    beforeEach(() => {
      tracker.getCurrentUsage = jest.fn().mockResolvedValue({
        scrubsThisMonth: 10,
        customRules: 5,
        lastReset: new Date().toISOString(),
        plan: 'free'
      });
      tracker.maybePing = jest.fn().mockResolvedValue(null);
    });

    it('should increment scrub count', async () => {
      const result = await tracker.incrementUsage('scrub', 3);
      
      expect(result.scrubsThisMonth).toBe(13);
      expect(mockStore.set).toHaveBeenCalledWith('usage', expect.objectContaining({
        scrubsThisMonth: 13
      }));
      expect(tracker.maybePing).toHaveBeenCalled();
    });

    it('should increment custom rule count', async () => {
      const result = await tracker.incrementUsage('customRule', 2);
      
      expect(result.customRules).toBe(7);
      expect(mockStore.set).toHaveBeenCalledWith('usage', expect.objectContaining({
        customRules: 7
      }));
    });

    it('should default to increment by 1', async () => {
      const result = await tracker.incrementUsage('scrub');
      
      expect(result.scrubsThisMonth).toBe(11);
    });

    it('should warn for unknown usage type', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      await tracker.incrementUsage('unknown');
      
      expect(consoleSpy).toHaveBeenCalledWith('Unknown usage type:', 'unknown');
      expect(mockStore.set).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('canPerformAction', () => {
    it('should allow scrub action within free plan limits', async () => {
      tracker.getCurrentUsage = jest.fn().mockResolvedValue({
        scrubsThisMonth: 500,
        plan: 'free'
      });
      
      const canScrub = await tracker.canPerformAction('scrub');
      expect(canScrub).toBe(true);
    });

    it('should deny scrub action when free plan limit exceeded', async () => {
      tracker.getCurrentUsage = jest.fn().mockResolvedValue({
        scrubsThisMonth: 800,
        plan: 'free'
      });
      
      const canScrub = await tracker.canPerformAction('scrub');
      expect(canScrub).toBe(false);
    });

    it('should allow unlimited scrubs for pro plan', async () => {
      tracker.getCurrentUsage = jest.fn().mockResolvedValue({
        scrubsThisMonth: 10000,
        plan: 'pro'
      });
      
      const canScrub = await tracker.canPerformAction('scrub');
      expect(canScrub).toBe(true);
    });

    it('should check custom rule limits', async () => {
      tracker.getCurrentUsage = jest.fn().mockResolvedValue({
        customRules: 20,
        plan: 'free'
      });
      
      const canAdd = await tracker.canPerformAction('addCustomRule');
      expect(canAdd).toBe(true);
      
      // At limit
      tracker.getCurrentUsage = jest.fn().mockResolvedValue({
        customRules: 25,
        plan: 'free'
      });
      
      const cannotAdd = await tracker.canPerformAction('addCustomRule');
      expect(cannotAdd).toBe(false);
    });

    it('should allow unknown actions by default', async () => {
      const canDo = await tracker.canPerformAction('unknownAction');
      expect(canDo).toBe(true);
    });
  });

  describe('getPlanLimits', () => {
    it('should return correct limits for free plan', () => {
      const limits = tracker.getPlanLimits('free');
      expect(limits).toEqual({
        scrubsPerMonth: 800,
        customRules: 25,
        patterns: 20,
        history: '24h',
        sites: ['chatgpt', 'claude', 'gemini', 'copilot']
      });
    });

    it('should return correct limits for pro plan', () => {
      const limits = tracker.getPlanLimits('pro');
      expect(limits).toEqual({
        scrubsPerMonth: -1,
        customRules: 100,
        patterns: 100,
        history: '90d',
        sites: 'allowlist'
      });
    });

    it('should return correct limits for enterprise plan', () => {
      const limits = tracker.getPlanLimits('enterprise');
      expect(limits).toEqual({
        scrubsPerMonth: -1,
        customRules: -1,
        patterns: -1,
        history: 'custom',
        sites: 'policy'
      });
    });

    it('should default to free plan for unknown plans', () => {
      const limits = tracker.getPlanLimits('unknown');
      expect(limits).toEqual(tracker.getPlanLimits('free'));
    });
  });

  describe('getUsagePercentage', () => {
    beforeEach(() => {
      tracker.getCurrentUsage = jest.fn().mockResolvedValue({
        scrubsThisMonth: 400,
        customRules: 10,
        plan: 'free'
      });
    });

    it('should calculate scrub usage percentage', async () => {
      const percentage = await tracker.getUsagePercentage('scrubs');
      expect(percentage).toBe(50); // 400/800 * 100
    });

    it('should calculate custom rules usage percentage', async () => {
      const percentage = await tracker.getUsagePercentage('customRules');
      expect(percentage).toBe(40); // 10/25 * 100
    });

    it('should return 0 for unlimited plans', async () => {
      tracker.getCurrentUsage = jest.fn().mockResolvedValue({
        scrubsThisMonth: 10000,
        plan: 'pro'
      });
      
      const percentage = await tracker.getUsagePercentage('scrubs');
      expect(percentage).toBe(0);
    });

    it('should cap percentage at 100', async () => {
      tracker.getCurrentUsage = jest.fn().mockResolvedValue({
        scrubsThisMonth: 1000,
        plan: 'free'
      });
      
      const percentage = await tracker.getUsagePercentage('scrubs');
      expect(percentage).toBe(100);
    });

    it('should return 0 for unknown types', async () => {
      const percentage = await tracker.getUsagePercentage('unknown');
      expect(percentage).toBe(0);
    });
  });

  describe('performLicensePing', () => {
    beforeEach(() => {
      tracker.getCurrentUsage = jest.fn().mockResolvedValue({
        scrubsThisMonth: 100,
        plan: 'free'
      });
      tracker.getUserId = jest.fn().mockResolvedValue('user-123');
      tracker.getAuthToken = jest.fn().mockResolvedValue('token-456');
    });

    it('should perform successful license ping', async () => {
      const mockResponse = {
        valid: true,
        plan: 'free',
        limits: { scrubsPerMonth: 800 }
      };
      
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });
      
      const result = await tracker.performLicensePing();
      
      expect(fetch).toHaveBeenCalledWith('/api/license/ping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token-456'
        },
        body: JSON.stringify({
          userId: 'user-123',
          plan: 'free',
          scrubCountThisMonth: 100,
          timestamp: expect.any(String),
          version: '1.0.0'
        })
      });
      
      expect(result).toEqual(mockResponse);
      expect(mockStore.set).toHaveBeenCalledWith('lastPing', expect.any(String));
    });

    it('should update plan if server returns different plan', async () => {
      const mockResponse = {
        valid: true,
        plan: 'pro',
        limits: { scrubsPerMonth: -1 }
      };
      
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });
      
      const result = await tracker.performLicensePing();
      
      expect(mockStore.set).toHaveBeenCalledWith('usage', expect.objectContaining({
        plan: 'pro'
      }));
    });

    it('should handle network errors gracefully', async () => {
      fetch.mockRejectedValue(new Error('Network error'));
      
      const result = await tracker.performLicensePing();
      
      expect(result).toEqual({ valid: true, plan: 'free' });
    });

    it('should handle HTTP errors gracefully', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500
      });
      
      const result = await tracker.performLicensePing();
      
      expect(result).toEqual({ valid: true, plan: 'free' });
    });
  });

  describe('maybePing', () => {
    it('should ping if no last ping recorded', async () => {
      mockStore.get.mockResolvedValue(null);
      tracker.performLicensePing = jest.fn().mockResolvedValue({ valid: true });
      
      await tracker.maybePing();
      
      expect(tracker.performLicensePing).toHaveBeenCalled();
    });

    it('should ping if last ping was more than 24 hours ago', async () => {
      const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000);
      mockStore.get.mockResolvedValue(yesterday.toISOString());
      tracker.performLicensePing = jest.fn().mockResolvedValue({ valid: true });
      
      await tracker.maybePing();
      
      expect(tracker.performLicensePing).toHaveBeenCalled();
    });

    it('should not ping if last ping was recent', async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      mockStore.get.mockResolvedValue(oneHourAgo.toISOString());
      tracker.performLicensePing = jest.fn();
      
      const result = await tracker.maybePing();
      
      expect(tracker.performLicensePing).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('getUserId', () => {
    it('should return existing user ID', async () => {
      mockStore.get.mockResolvedValue('existing-user-id');
      
      const userId = await tracker.getUserId();
      
      expect(userId).toBe('existing-user-id');
      expect(mockStore.set).not.toHaveBeenCalled();
    });

    it('should generate and store new user ID if none exists', async () => {
      mockStore.get.mockResolvedValue(null);
      crypto.randomUUID.mockReturnValue('new-uuid');
      
      const userId = await tracker.getUserId();
      
      expect(userId).toBe('anon_new-uuid');
      expect(mockStore.set).toHaveBeenCalledWith('userId', 'anon_new-uuid');
    });
  });

  describe('updatePlan', () => {
    it('should update plan and perform immediate ping', async () => {
      tracker.getCurrentUsage = jest.fn().mockResolvedValue({
        scrubsThisMonth: 100,
        plan: 'free'
      });
      tracker.performLicensePing = jest.fn().mockResolvedValue({ valid: true });
      
      const result = await tracker.updatePlan('pro');
      
      expect(mockStore.set).toHaveBeenCalledWith('usage', expect.objectContaining({
        plan: 'pro'
      }));
      expect(tracker.performLicensePing).toHaveBeenCalled();
      expect(result).toEqual({ valid: true });
    });
  });
});