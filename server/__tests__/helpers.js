/**
 * Test helpers for rate limiting and authentication tests
 */
import request from 'supertest';
import config from './testConfig.json';

export async function makeMultipleRequests(app, endpoint, count, options = {}) {
  // If count is undefined or invalid, use a safe default
  const safeCount = typeof count === 'number' && count > 0 ? count : 1;
  
  const requests = Array(safeCount).fill().map(() =>
    request(app)
      .get(endpoint)
      .set(options.headers || {})
  );
  return Promise.all(requests);
}

export async function makeSequentialRequests(app, endpoint, count, options = {}) {
  const results = [];
  const safeCount = typeof count === 'number' && count > 0 ? count : 1;
  
  for (let i = 0; i < safeCount; i++) {
    const response = await request(app)
      .get(endpoint)
      .set(options.headers || {});
    results.push(response);
    
    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }
  }
  return results;
}

export async function createTestUser(app, userData = config.testUsers.default) {
  const response = await request(app)
    .post('/api/auth/signup')
    .send(userData);
  return response;
}

export async function loginTestUser(app, credentials = config.testUsers.default) {
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: credentials.email,
      password: credentials.password
    });
  return response;
}
