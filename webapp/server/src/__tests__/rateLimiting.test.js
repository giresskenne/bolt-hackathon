import request from 'supertest';
import { app } from '../index.js';

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
      await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'ratelimit@example.com',
          password: 'TestPassword123!',
          plan: 'free'
        });

      // Make multiple failed login attempts
      const attempts = [];
      for (let i = 0; i < 6; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'ratelimit@example.com',
            password: 'wrongpassword'
          });
        attempts.push(response);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Check that later attempts are rate limited
      const rateLimitedAttempts = attempts.filter(res => res.status === 429);
      expect(rateLimitedAttempts.length).toBeGreaterThan(0);
    });
  });

  describe('API rate limiting', () => {
    it('should limit rapid API requests', async () => {
      // Create a test user and get token
      const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'api-test@example.com',
          password: 'TestPassword123!',
          plan: 'free'
        });

      const token = signupRes.body.token;

      // Make multiple rapid requests to health endpoint
      const requests = Array(20).fill().map(() =>
        request(app)
          .get('/api/health')
          .set('Authorization', `Bearer ${token}`)
      );

      const responses = await Promise.all(requests);

      // Some requests should be rate limited
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('License ping rate limiting', () => {
    it('should limit license pings', async () => {
      // Create a test user and get token
      const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'license-test@example.com',
          password: 'TestPassword123!',
          plan: 'free'
        });

      const token = signupRes.body.token;

      // Make first ping
      const firstPing = await request(app)
        .post('/api/license/ping')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: 'test-user',
          plan: 'free',
          scrubCountThisMonth: 0,
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        });

      expect(firstPing.status).toBe(200);

      // Make second ping immediately after
      const secondPing = await request(app)
        .post('/api/license/ping')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: 'test-user',
          plan: 'free',
          scrubCountThisMonth: 1,
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        });

      expect(secondPing.status).toBe(429);
      expect(secondPing.body).toHaveProperty('error');
    });
  });
});