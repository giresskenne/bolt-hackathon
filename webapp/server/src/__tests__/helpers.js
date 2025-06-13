import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../index.js';
import User from '../models/User.js';
import { JWT_SECRET } from '../config/constants.js';

/**
 * Create a test user and return auth token
 */
export const createTestUser = async (userData = {}) => {
  const defaultUser = {
    email: 'test@example.com',
    password: 'password123',
    plan: 'free'
  };

  const user = await User.create({ ...defaultUser, ...userData });
  const token = jwt.sign(
    { id: user._id, email: user.email, plan: user.plan },
    JWT_SECRET
  );

  return { user, token };
};

/**
 * Clean up test users
 */
export const cleanupTestUsers = async () => {
  await User.deleteMany({});
};

/**
 * Make an authenticated request
 */
export const authedRequest = (token) => {
  return request(app).set('Authorization', `Bearer ${token}`);
};

/**
 * Helper to wait for a specified time
 */
export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
