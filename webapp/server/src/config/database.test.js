// Mock database for testing - no actual database needed
let mockData = new Map();

export const connect = async () => {
  console.log('Connected to mock test database');
  mockData.clear();
};

export const closeDatabase = async () => {
  console.log('Closed mock test database');
  mockData.clear();
};

export const clearDatabase = async () => {
  console.log('Cleared mock test database');
  mockData.clear();
};

// Mock database operations
export const mockDB = {
  set: (key, value) => mockData.set(key, value),
  get: (key) => mockData.get(key),
  delete: (key) => mockData.delete(key),
  clear: () => mockData.clear(),
  has: (key) => mockData.has(key),
  size: () => mockData.size
};