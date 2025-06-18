import request from 'supertest';
import { app } from '../index.js';
const testConfig = global.testConfig;

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Ensure database is connected before tests
    const { connectDB } = await import('../config/database.js');
    await connectDB();
  });

  beforeEach(async () => {
    // Clear test data before each test
    if (global.__TEST_SUPABASE_CLIENT__) {
      global.__TEST_SUPABASE_CLIENT__.from('users').delete().eq('id', '*').execute();
      global.__TEST_SUPABASE_CLIENT__.from('subscriptions').delete().eq('id', '*').execute();
    }
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post(testConfig.endpoints.auth.signup)
        .send(testConfig.testUsers.default);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toEqual({
        email: testConfig.testUsers.default.email,
        plan: testConfig.testUsers.default.plan,
        subscription: {
          plan: testConfig.testUsers.default.plan,
          status: 'trial',
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          trialEnds: expect.any(String)
        }
      });
      
      // Ensure password is not returned
      expect(response.body.user).not.toHaveProperty('password');
      
      // Verify can login with created user
      const loginResponse = await request(app)
        .post(testConfig.endpoints.auth.login)
        .send({
          email: testConfig.testUsers.default.email,
          password: testConfig.testUsers.default.password
        });
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('token');
    });

    it('should not create user with invalid email', async () => {
      const userData = {
        ...testConfig.testUsers.default,
        email: 'invalid-email'
      };

      const response = await request(app)
        .post(testConfig.endpoints.auth.signup)
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/email/i);
    });

    it('should reject weak passwords', async () => {
      const invalidPasswords = [
        'short',
        'nouppercase123',
        'NOLOWERCASE123',
        'NoSpecialChar1',
        'NoNumber!!!'
      ];

      for (const password of invalidPasswords) {
        const response = await request(app)
          .post(testConfig.endpoints.auth.signup)
          .send({
            ...testConfig.testUsers.default,
            password
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toMatch(/password/i);
      }
    });

    it('should not allow duplicate emails', async () => {
      // Create first user
      const firstResponse = await request(app)
        .post(testConfig.endpoints.auth.signup)
        .send(testConfig.testUsers.default);
      expect(firstResponse.status).toBe(201);

      // Try to create duplicate user
      const duplicateResponse = await request(app)
        .post(testConfig.endpoints.auth.signup)
        .send(testConfig.testUsers.default);
      expect(duplicateResponse.status).toBe(400);
      expect(duplicateResponse.body).toHaveProperty('error');
      expect(duplicateResponse.body.error).toMatch(/email.*exists/i);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await request(app)
        .post(testConfig.endpoints.auth.signup)
        .send(testConfig.testUsers.default);
    });

    it('should login existing user', async () => {
      const response = await request(app)
        .post(testConfig.endpoints.auth.login)
        .send({
          email: testConfig.testUsers.default.email,
          password: testConfig.testUsers.default.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', testConfig.testUsers.default.email);
    });

    it('should not login with incorrect password', async () => {
      const response = await request(app)
        .post(testConfig.endpoints.auth.login)
        .send({
          email: testConfig.testUsers.default.email,
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should not login non-existent user', async () => {
      const response = await request(app)
        .post(testConfig.endpoints.auth.login)
        .send({
          email: 'nonexistent@example.com',
          password: testConfig.testUsers.default.password
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;

    beforeEach(async () => {
      const response = await request(app)
        .post(testConfig.endpoints.auth.signup)
        .send(testConfig.testUsers.default);
      authToken = response.body.token;
    });

    it('should return user profile when authenticated', async () => {
      const response = await request(app)
        .get(testConfig.endpoints.auth.me)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('email', testConfig.testUsers.default.email);
      expect(response.body.user).toHaveProperty('plan', testConfig.testUsers.default.plan);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get(testConfig.endpoints.auth.me);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});