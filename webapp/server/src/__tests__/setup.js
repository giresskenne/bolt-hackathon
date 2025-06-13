import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { connect, clearDatabase, closeDatabase } from '../config/database.test.js';

// Ensure we're not reusing connections between tests
beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await connect();
});

afterEach(async () => {
  await clearDatabase();
  jest.clearAllMocks();
});

afterAll(async () => {
  await closeDatabase();
});

// Increase timeout for slower operations
jest.setTimeout(30000);