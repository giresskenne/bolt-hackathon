const request = require('supertest');
const app = require('../index.js');
const config = require('./testConfig.json');

// Test helpers
async function createTestUser(userData = config.testUsers.default) {
  const res = await request(app)
    .post(config.endpoints.auth.signup)
    .send(userData);
  return res;
}

async function loginTestUser(credentials = config.testUsers.default) {
  const res = await request(app)
    .post(config.endpoints.auth.login)
    .send({
      email: credentials.email,
      password: credentials.password
    });
  return res;
}

// Clear between tests
beforeEach(async () => {
  await new Promise(resolve => setTimeout(resolve, config.delays.betweenTests));
});

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/signup', () => {
    it('should register a new user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
          plan: 'free'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
      expect(res.body.user).toHaveProperty('plan', 'free');
    });

    it('should reject weak passwords', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          plan: 'free'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body).toHaveProperty('fields.password');
    });

    it('should reject invalid email formats', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'TestPassword123!',
          plan: 'free'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body).toHaveProperty('fields.email');
    });

    it('should prevent duplicate email registration', async () => {
      // First registration
      await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'duplicate@example.com',
          password: 'TestPassword123!',
          plan: 'free'
        });

      // Duplicate registration attempt
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'duplicate@example.com',
          password: 'TestPassword123!',
          plan: 'free'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      // Create a test user
      await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'login-test@example.com',
          password: 'TestPassword123!',
          plan: 'free'
        });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'TestPassword123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'WrongPassword123!'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should handle rate limiting', async () => {
      // Make 6 failed login attempts (rate limit is 5)
      const attempts = Array(6).fill().map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'login-test@example.com',
            password: 'WrongPassword123!'
          })
      );

      const results = await Promise.all(attempts);
      const lastAttempt = results[results.length - 1];

      expect(lastAttempt.statusCode).toBe(429);
      expect(lastAttempt.body).toHaveProperty('error');
      expect(lastAttempt.body).toHaveProperty('nextTry');
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;

    beforeAll(async () => {
      // Create and login a test user
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'me-test@example.com',
          password: 'TestPassword123!',
          plan: 'free'
        });
      authToken = res.body.token;
    });

    it('should return user data with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', 'me-test@example.com');
    });

    it('should reject requests without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Access token required');
    });

    it('should reject invalid tokens', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error', 'Invalid token');
    });
  });
});
