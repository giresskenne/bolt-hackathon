import request from 'supertest';
import { app } from '../index.js';
import { createTestUser, cleanupTestUsers } from './helpers.js';

describe('Auth API Tests', () => {
  beforeEach(async () => {
    await cleanupTestUsers();
  });

  test('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'Password123!'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
  });
});