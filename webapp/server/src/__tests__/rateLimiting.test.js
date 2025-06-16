import request from 'supertest';
import { app } from '../index.js';
import { jest } from '@jest/globals';

const testConfig = global.testConfig;
jest.setTimeout(60000);

describe('Rate Limiting', () => {
  beforeEach(async () => {
    // Clear rate limiters and test state
    if (global.__TEST_STATE__) {
      global.__TEST_STATE__.rateLimiters.global.clear();
      global.__TEST_STATE__.rateLimiters.auth.clear();
      global.__TEST_STATE__.rateLimiters.api.clear();
      global.__TEST_STATE__.rateLimiters.license.clear();
      global.__TEST_STATE__.users.clear();
    }
  });

  describe('Authentication rate limiting', () => {
    it('should block after too many failed login attempts', async () => {
      // Create a test user first
      const signupRes = await request(app)
        .post(testConfig.endpoints.auth.signup)
        .set('x-test-rate-limit', 'true')
        .send(testConfig.testUsers.default);

      expect(signupRes.status).toBe(201);

      // Make multiple failed login attempts
      const attempts = [];
      for (let i = 0; i < 6; i++) {
        attempts.push(
          await request(app)
            .post(testConfig.endpoints.auth.login)
            .set('x-test-rate-limit', 'true')
            .send({
              email: testConfig.testUsers.default.email,
              password: 'wrongpassword'
            })
        );
      }

      const lastAttempt = attempts[attempts.length - 1];
      expect(lastAttempt.status).toBe(429);
      expect(lastAttempt.body.error).toMatch(/too many/i);
    });
  });

  describe('API rate limiting', () => {
    it('should apply different limits for authenticated and unauthenticated users', async () => {
      const makeRequests = async (auth = false) => {
        const requests = [];
        const maxRequests = auth ? 100 : 10;

        // Create and authenticate user if needed
        let token;
        if (auth) {
          // Sign up a user
          const signupRes = await request(app)
            .post(testConfig.endpoints.auth.signup)
            .send(testConfig.testUsers.default);
          
          expect(signupRes.status).toBe(201);
          token = signupRes.body.token;
        }

        // Make requests until we hit rate limit
        for (let i = 0; i < maxRequests + 20; i++) {
          const req = request(app)
            .get(testConfig.endpoints.health)
            .set('x-test-rate-limit', 'true');
          
          if (auth && token) {
            req.set('Authorization', `Bearer ${token}`);
          }
          
          const res = await req;
          requests.push(res);
        }

        return requests;
      };

      // Test unauthenticated rate limiting
      const unauthRequests = await makeRequests(false);
      const unauthSuccessCount = unauthRequests.filter(res => res.status === 200).length;
      expect(unauthSuccessCount).toBeLessThanOrEqual(10); // Unauth limit is 10

      // Clear rate limiters
      global.__TEST_STATE__.rateLimiters.api.clear();

      // Test authenticated rate limiting
      const authRequests = await makeRequests(true);
      const authSuccessCount = authRequests.filter(res => res.status === 200).length;
      expect(authSuccessCount).toBeGreaterThan(10); // Auth limit is higher than unauth
      expect(authSuccessCount).toBeLessThanOrEqual(100); // Auth limit is 100
    });

    it('should enforce license ping rate limit', async () => {
      const requests = [];
      
      // Make requests until we hit rate limit
      for (let i = 0; i < testConfig.rateLimits.licensePing.max + 5; i++) {
        requests.push(
          await request(app)
            .post(testConfig.endpoints.license.ping)
            .set('x-test-rate-limit', 'true')
            .send({ licenseKey: 'test-key' })
        );
      }

      const rateLimitedPings = requests.filter(res => res.status === 429);
      expect(rateLimitedPings.length).toBeGreaterThan(0);
    });
  });
});