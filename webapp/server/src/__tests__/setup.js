import { jest } from '@jest/globals';

// Mock Stripe module
jest.mock('stripe', () => {
  return () => ({
    customers: {
      create: jest.fn(async (data) => ({ 
        id: 'cus_test_123',
        ...data 
      }))
    },
    checkout: {
      sessions: {
        create: jest.fn(async (data) => ({
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/test',
          ...data
        }))
      }
    },
    billingPortal: {
      sessions: {
        create: jest.fn(async (data) => ({
          id: 'bps_test_123',
          url: 'https://billing.stripe.com/test',
          ...data
        }))
      }
    },
    webhooks: {
      constructEvent: jest.fn((payload, signature, secret) => ({
        type: 'test.event',
        data: { object: JSON.parse(payload) }
      }))
    }
  });
});

// Test configuration
beforeEach(() => {
  jest.setTimeout(30000);
  
  // Reset test state
  global.__TEST_STATE__ = {
    users: new Map(),
    subscriptions: new Map(),
    licensePings: new Map(),
    rateLimiters: {
      global: new Map(),
      auth: new Map(),
      api: new Map(),
      license: new Map()
    }
  };

  // Reset all mocks
  jest.clearAllMocks();
});

// Clean up after tests
afterAll(async () => {
  // Clean up any open connections or timers
  await new Promise(resolve => setTimeout(resolve, 500));
});