import { jest } from '@jest/globals';

// Initialize mock database
const testData = {
  users: new Map(),
  subscriptions: new Map()
};

// Helper to format user data for response
const formatUserResponse = (user) => ({
  id: user.id,
  email: user.email,
  plan: user.plan || 'free',
  subscription: {
    plan: user.plan || 'free',
    status: 'trial',
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    trialEnds: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
  }
});

// Create mock Supabase client
const createMockSupabase = () => ({
  from: (table) => ({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockImplementation((field, value) => ({
        single: jest.fn().mockImplementation(async () => {
          const items = Array.from(testData[table].values());
          const item = items.find(i => i[field] === value);
          return { data: item ? formatUserResponse(item) : null, error: null };
        }),
        execute: jest.fn().mockImplementation(async () => {
          const items = Array.from(testData[table].values());
          const filtered = items.filter(i => i[field] === value);
          return { data: filtered.map(formatUserResponse), error: null };
        })
      }))
    }),
    insert: jest.fn().mockImplementation((newData) => ({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockImplementation(async () => {
          const data = Array.isArray(newData) ? newData[0] : newData;
          
          // Check for existing user with same email
          const existingUser = Array.from(testData[table].values())
            .find(u => u.email === data.email);
          
          if (existingUser) {
            return { 
              data: null, 
              error: { message: 'Email already exists', status: 400 } 
            };
          }

          const id = Math.random().toString(36).substr(2, 9);
          const item = { id, ...data };
          testData[table].set(id, item);
          return { data: formatUserResponse(item), error: null };
        })
      })
    })),
    update: jest.fn().mockImplementation((data) => ({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockImplementation(async () => {
          const existing = Array.from(testData[table].values())[0];
          if (!existing) {
            return { data: null, error: { message: 'Not found', status: 404 } };
          }
          const updated = { ...existing, ...data };
          testData[table].set(existing.id, updated);
          return { data: formatUserResponse(updated), error: null };
        })
      })
    })),
    delete: jest.fn().mockImplementation(() => ({
      eq: jest.fn().mockReturnValue({
        execute: jest.fn().mockImplementation(async () => {
          testData[table].clear();
          return { data: null, error: null };
        })
      })
    }))
  })
});

// Export test utilities
export const resetTestData = () => {
  testData.users.clear();
  testData.subscriptions.clear();
};

export const getMockSupabase = () => createMockSupabase();

// Initialize mock client globally
global.__TEST_SUPABASE_CLIENT__ = createMockSupabase();
