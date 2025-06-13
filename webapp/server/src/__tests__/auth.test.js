import request from 'supertest';
import { app } from '../index.js';
import { createTestUser, cleanupTestUsers } from './helpers.js';
import User from '../models/User.js';

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await cleanupTestUsers();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        plan: 'free'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).toHaveProperty('plan', userData.plan);

      // Verify user was created in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.email).toBe(userData.email);
      expect(user.plan).toBe(userData.plan);
    });

    it('should not create user with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      const { user } = await createTestUser();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', user.email);
    });

    it('should not login with incorrect password', async () => {
      const { user } = await createTestUser();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});
