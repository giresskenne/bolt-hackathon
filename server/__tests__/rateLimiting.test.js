import request from 'supertest';
import { jest } from '@jest/globals';

// Mock Stripe before importing app
jest.mock('stripe', () => {
  return function() {
    return {
      customers: {
        create: jest.fn().mockResolvedValue({ id: 'cus_test' })
      },
      checkout: {
        sessions: {
          create: jest.fn().mockResolvedValue({ 
            id: 'cs_test',
            url: 'https://checkout.stripe.com/test'
          })
        }
      }
    };
  };
});

import app from '../index.js';
import config from './testConfig.json';
import {
  makeMultipleRequests,
  makeSequentialRequests,
  createTestUser,
  loginTestUser
} from './helpers.js';

describe('Rate Limiting', () => {
  // Clear rate limiters and test state before each test
  beforeEach(() => {
    if (global.__TEST_STATE__) {
      global.__TEST_STATE__.rateLimiters.global.clear();
      global.__TEST_STATE__.rateLimiters.auth.clear();
      global.__TEST_STATE__.rateLimiters.api.clear();
      global.__TEST_STATE__.rateLimiters.license.clear();
    }
    jest.resetModules();
  });

  describe('Global Rate Limiter', () => {
    it('should allow requests within the limit', async () => {
      // Test with a smaller number to avoid long test times
      const testCount = Math.min(50, config.globalRateLimit - 1);
      const results = await makeMultipleRequests(config.healthEndpoint, testCount);
      
      results.forEach(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status', 'ok');
      });
    });

    it('should block excessive requests', async () => {
      // Test with a number just above the limit
      const testCount = config.globalRateLimit + 1;
      const results = await makeMultipleRequests(config.healthEndpoint, testCount);

      const successfulRequests = results.filter(res => res.statusCode === 200);
      const limitedRequests = results.filter(res => res.statusCode === 429);

      expect(successfulRequests.length).toBeLessThanOrEqual(config.globalRateLimit);
      expect(limitedRequests.length).toBeGreaterThan(0);

      // Verify rate limit response format
      const limitedResponse = limitedRequests[0];
      expect(limitedResponse.body).toHaveProperty('error');
      expect(limitedResponse.body).toHaveProperty('retryAfter');
    });
  });

  describe('Auth Rate Limiter', () => {
    it('should track failed login attempts', async () => {
      const email = 'ratelimit@example.com';
      const maxAttempts = config.authRateLimit;
      const totalAttempts = maxAttempts + 2; // Test with 2 extra attempts

      // Make login attempts sequentially to ensure proper rate limit tracking
      const results = [];
      for (let i = 0; i < totalAttempts; i++) {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email,
            password: 'WrongPassword123!'
          });
        results.push(res);
        
        // Small delay between requests to ensure proper rate limit tracking
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // First maxAttempts should return 401
      results.slice(0, maxAttempts).forEach(res => {
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Invalid credentials');
      });

      // Additional attempts should be rate limited
      results.slice(maxAttempts).forEach(res => {
        expect(res.statusCode).toBe(429);
        expect(res.body).toHaveProperty('error');
        expect(res.body).toHaveProperty('nextTry');
      });
    });

    it('should implement stricter limits for suspicious IPs', async () => {
      const email = 'suspicious@example.com';
      
      // Make 10 failed attempts to trigger suspicious IP detection
      const initialAttempts = Array(10).fill().map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email,
            password: 'WrongPassword123!'
          })
      );

      await Promise.all(initialAttempts);

      // Wait 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Make 3 more attempts - should be blocked after 2
      const subsequentAttempts = Array(3).fill().map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email,
            password: 'WrongPassword123!'
          })
      );

      const results = await Promise.all(subsequentAttempts);
      expect(results[2].statusCode).toBe(429);
    });
  });

  describe('API Rate Limiter', () => {
    let authToken;

    beforeEach(async () => {
      // Create a fresh test user before each test
      const res = await request(app)
        .post('/api/auth/signup')
        .send(config.testUser);
      authToken = res.body.token;

      // Wait a bit to ensure rate limiters are reset
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should allow more requests for authenticated users', async () => {
      // Test with number between unauthenticated and authenticated limits
      const testCount = Math.floor((config.apiRateLimit * 1.5));
      
      const results = await makeMultipleRequests(app, config.endpoints.health, testCount, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      // All requests should succeed for authenticated users
      results.forEach((res, index) => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status', 'ok');
      });
    });

    it('should limit unauthenticated requests more strictly', async () => {
      // Make 150 requests (above unauthenticated limit)
      const requests = Array(150).fill().map(() =>
        request(app)
          .get('/api/health')
      );

      const results = await Promise.all(requests);
      const lastResult = results[results.length - 1];

      expect(lastResult.statusCode).toBe(429);
    });
  });

  describe('License Ping Rate Limiter', () => {
    let authToken;
    let proAuthToken;

    beforeEach(async () => {
      // Create free and pro test users
      const freeUser = await createTestUser(app, config.testUsers.default);
      const proUser = await createTestUser(app, config.testUsers.pro);
      authToken = freeUser.body.token;
      proAuthToken = proUser.body.token;
      
      // Clear any existing rate limits
      if (global.__TEST_STATE__) {
        global.__TEST_STATE__.rateLimiters.license.clear();
      }
    });

    it('should limit license pings to configured rate for free users', async () => {
      const firstPing = await request(app)
        .post('/api/license/ping')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: 'test-user',
          plan: 'free',
          scrubCountThisMonth: 0,
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        });

      expect(firstPing.statusCode).toBe(200);

      // Make second ping request immediately after
      const secondPing = await request(app)
        .post('/api/license/ping')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: 'test-user',
          plan: 'free',
          scrubCountThisMonth: 1,
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        });

      expect(secondPing.statusCode).toBe(429);
      expect(secondPing.body).toHaveProperty('error');
      expect(secondPing.body).toHaveProperty('retryAfter');
    });

    it('should allow more frequent pings for pro users', async () => {
      // Pro users should have higher rate limits
      const pings = [];
      for (let i = 0; i < 3; i++) {
        const ping = await request(app)
          .post('/api/license/ping')
          .set('Authorization', `Bearer ${proAuthToken}`)
          .send({
            userId: 'pro-user',
            plan: 'pro',
            scrubCountThisMonth: i * 100,
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          });
        pings.push(ping);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // All pings should succeed for pro users
      pings.forEach(ping => {
        expect(ping.statusCode).toBe(200);
      });
    });

    it('should reset rate limits after the window period', async () => {
      // Make initial ping
      const initialPing = await request(app)
        .post('/api/license/ping')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: 'test-user',
          plan: 'free',
          scrubCountThisMonth: 0,
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        });

      expect(initialPing.statusCode).toBe(200);

      // Wait for rate limit window to expire
      await new Promise(resolve => setTimeout(resolve, config.rateLimits.licensePing.windowMs + 100));

      // Try another ping after window expires
      const laterPing = await request(app)
        .post('/api/license/ping')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: 'test-user',
          plan: 'free',
          scrubCountThisMonth: 10,
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        });

      expect(laterPing.statusCode).toBe(200);
    });
  });

  describe('Rate Limit Headers', () => {
    it('should include rate limit headers in responses', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Accept', 'application/json');

      // Check for either x-ratelimit-* or ratelimit-* headers
      expect(response.headers).toHaveProperty(
        expect.stringMatching(/^(x-)?ratelimit-limit$/)
      );
      expect(response.headers).toHaveProperty(
        expect.stringMatching(/^(x-)?ratelimit-remaining$/)
      );
      expect(response.headers).toHaveProperty(
        expect.stringMatching(/^(x-)?ratelimit-reset$/)
      );
    });

    it('should update remaining requests in headers', async () => {
      const responses = await makeSequentialRequests(app, '/api/health', 3, {
        delay: 100
      });

      const remainingCounts = responses.map(r => 
        parseInt(r.headers['x-ratelimit-remaining'])
      );

      // Verify remaining count decrements
      expect(remainingCounts[0]).toBeGreaterThan(remainingCounts[1]);
      expect(remainingCounts[1]).toBeGreaterThan(remainingCounts[2]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent requests properly', async () => {
      const concurrentCount = 10;
      const requests = await Promise.all(
        Array(concurrentCount).fill().map(() =>
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'password123'
            })
        )
      );

      const statusCodes = requests.map(r => r.statusCode);
      const successCount = statusCodes.filter(code => code !== 429).length;

      // Should not exceed rate limit
      expect(successCount).toBeLessThanOrEqual(config.rateLimits.auth.max);
    });

    it('should handle rate limits with malformed requests', async () => {
      // Test with missing auth header
      const response = await request(app)
        .post('/api/license/ping')
        .send({});

      expect([401, 429]).toContain(response.statusCode);
    });

    it('should maintain rate limits across different endpoints', async () => {
      const authToken = (await createTestUser(app)).body.token;
      const endpoints = [
        '/api/health',
        '/api/auth/me',
        '/api/license/ping'
      ];

      // Make requests to different endpoints
      const results = [];
      for (const endpoint of endpoints) {
        const res = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${authToken}`);
        results.push(res);
      }

      // At least one request should hit rate limit
      const hitLimit = results.some(r => r.statusCode === 429);
      expect(hitLimit).toBe(true);
    });
  });
});
