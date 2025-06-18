import { jest } from '@jest/globals';
import { getSupabase, connectDB } from './database.js';

// Mock Supabase client for testing
class MockSupabaseDB {
  constructor() {
    this.data = new Map();
    this.from = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(() => {
        return { data: this.data, error: null };
      }),
      execute: jest.fn().mockImplementation(() => {
        return { data: Array.from(this.data.values()), error: null };
      })
    }));
  }

  clear() {
    this.data.clear();
  }

  set(key, value) {
    this.data.set(key, value);
  }

  get(key) {
    return this.data.get(key);
  }

  delete(key) {
    return this.data.delete(key);
  }

  has(key) {
    return this.data.has(key);
  }

  get size() {
    return this.data.size;
  }
}

const mockDB = new MockDB();

export const connect = async () => {
  console.log('Connected to mock test database');
  setConnection(mockDB);
  mockDB.clear();
  return mockDB;
};

export const closeDatabase = async () => {
  console.log('Closed mock test database');
  setConnection(null);
  mockDB.clear();
};

export const clearDatabase = async () => {
  console.log('Cleared mock test database');
  mockDB.clear();
};

// Export mock database for direct access in tests if needed
export const mockData = mockDB;