import request from 'supertest';
import { app } from '../index.js';
import { createTestUser, cleanupTestUsers, wait } from './helpers.js';

describe('Rate Limiting', () => {
  beforeEach(async () => {
    await cleanupTestUsers();
  });

  describe('Authentication rate limiting', () => {
    it('should block after too many failed login attempts', async () => {
      const { user } = await createTestUser();
      
      // Make multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: user.email,
            password: 'wrongpassword'
          });

        if (i < 4) {
          expect(response.status).toBe(401);
        } else {
          expect(response.status).toBe(429);
          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toContain('Too many requests');
        }
      }

      // Wait for rate limit to reset
      await wait(1000);

      // Should be able to try again
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      expect(response.status).toBe(200);
    });
  });

  describe('API rate limiting', () => {
    it('should limit rapid API requests', async () => {
      const { token } = await createTestUser();

      const makeRequest = () => 
        request(app)
          .get('/api/usage/stats')
          .set('Authorization', `Bearer ${token}`);

      // Make multiple rapid requests
      const requests = Array(10).fill().map(() => makeRequest());
      const responses = await Promise.all(requests);

      // Some requests should be rate limited
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);

      // Wait for rate limit to reset
      await wait(1000);

      // Should be able to make request again
      const response = await makeRequest();
      expect(response.status).not.toBe(429);
    });
  });
});
