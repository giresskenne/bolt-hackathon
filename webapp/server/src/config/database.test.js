import { setConnection } from './database.shared.js';

// Mock database for testing - no actual database needed
class MockDB {
  constructor() {
    this.data = new Map();
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