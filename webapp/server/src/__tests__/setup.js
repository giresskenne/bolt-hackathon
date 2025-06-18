import { jest } from '@jest/globals';

// Initialize mock database for tests
const testData = {
  users: new Map(),
  subscriptions: new Map()
};

// Helper to format user data
const formatUserData = (user) => {
  const formattedUser = {
    id: user.id,
    email: user.email,
    plan: user.plan || 'free',
    subscription: {
      plan: user.plan || 'free',
      status: 'trial',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      trialEnds: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days trial
    }
  };
  if (user.password) {
    formattedUser.password = user.password;
  }
  return formattedUser;
};

// Mock Supabase client with in-memory storage
global.__TEST_SUPABASE_CLIENT__ = {
  from: (table) => ({
    select: jest.fn(() => ({
      eq: jest.fn((field, value) => ({
        single: jest.fn(async () => {
          // Find the first matching record
          const found = Array.from(testData[table].values()).find(record => record[field] === value);
          return { data: found ? formatUserData(found) : null, error: null };
        }),
        execute: jest.fn(async () => {
          const data = Array.from(testData[table].values());
          return { data: data.map(formatUserData), error: null };
        })
      }))
    })),
    insert: jest.fn((data) => ({
      select: jest.fn(() => ({
        single: jest.fn(async () => {
          // Check for existing user with same email
          const existingUser = Array.from(testData[table].values()).find(u => u.email === data.email);
          if (existingUser) {
            return { data: null, error: new Error('User already exists') };
          }

          const id = Math.random().toString(36).substr(2, 9);
          const user = { ...data, id };
          testData[table].set(id, user);
          return { data: formatUserData(user), error: null };
        })
      }))
    })),
    update: jest.fn((data) => ({
      eq: jest.fn(() => ({
        single: jest.fn(async () => {
          const existing = Array.from(testData[table].values())[0];
          if (!existing) return { data: null, error: new Error('Not found') };
          const updated = { ...existing, ...data };
          testData[table].set(existing.id, updated);
          return { data: updated, error: null };
        })
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => ({
        execute: jest.fn(async () => {
          testData[table].clear();
          return { data: null, error: null };
        })
      }))
    }))
  })
};

// Test configuration
const testConfig = {
  rateLimits: {
    global: { windowMs: 900000, max: 1000 },
    auth: { windowMs: 900000, max: 5 },
    api: { windowMs: 60000, max: 100, authenticatedMax: 300 },
    licensePing: { windowMs: 60000, max: 1 }
  },
  endpoints: {
    health: '/api/health',
    auth: {
      signup: '/api/auth/signup',
      login: '/api/auth/login',
      me: '/api/auth/me'
    },
    license: {
      ping: '/api/license/ping'
    }
  },
  testUsers: {
    default: {
      email: 'test@example.com',
      password: 'Test123@!',
      plan: 'free'
    },
    pro: {
      email: 'pro@example.com',
      password: 'TestPassword123!',
      plan: 'pro'
    }
  },
  delays: {
    rateLimit: 100,
    betweenTests: 500,
    loginAttempt: 50
  }
};

globalThis.testConfig = testConfig;

// Mock external modules
jest.unstable_mockModule('../models/User.js', () => ({
  default: class User {
    constructor(data) {
      Object.assign(this, {
        _id: Math.random().toString(36).substr(2, 9),
        email: '',
        password: '',
        plan: 'free',
        createdAt: new Date(),
        ...data
      });
    }

    static async findOne(query) {
      if (global.__TEST_STATE__) {
        const user = Array.from(global.__TEST_STATE__.users.values())
          .find(u => u.email === query.email);
        return user ? new User(user) : null;
      }
      return null;
    }

    static async findById(id) {
      if (global.__TEST_STATE__) {
        const user = Array.from(global.__TEST_STATE__.users.values())
          .find(u => u._id === id);
        return user ? new User(user) : null;
      }
      return null;
    }

    static async create(data) {
      const user = new User(data);
      if (global.__TEST_STATE__) {
        const existing = await this.findOne({ email: data.email });
        if (existing) {
          const error = new Error('Email already exists');
          error.status = 400;
          throw error;
        }
        global.__TEST_STATE__.users.set(user._id, user);
      }
      return user;
    }

    async save() {
      return this;
    }

    async comparePassword(candidatePassword) {
      return candidatePassword === this.password;
    }

    toJSON() {
      const { password, ...userWithoutPassword } = this;
      return userWithoutPassword;
    }
  }
}));

jest.unstable_mockModule('../models/Subscription.js', () => ({
  default: class Subscription {
    constructor(data) {
      Object.assign(this, {
        userId: '',
        plan: 'free',
        status: 'active',
        stripeSubscriptionId: null,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ...data
      });
    }

    static async findOne(query) {
      return null;
    }

    static async create(data) {
      return new Subscription(data);
    }

    async save() {
      return this;
    }
  }
}));

jest.unstable_mockModule('stripe', () => ({
  default: function() {
    return {
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
    };
  }
}));

// Test state management
globalThis.__TEST_STATE__ = {
  users: new Map(),
  tokens: new Map(),
  rateLimiters: {
    global: new Map(),
    auth: new Map(),
    api: new Map(),
    license: new Map()
  }
};

// Reset global state before each test
beforeEach(() => {
  jest.setTimeout(testConfig.delays.betweenTests);
  
  // Clear test state before each test
  globalThis.__TEST_STATE__.users.clear();
  globalThis.__TEST_STATE__.tokens.clear();
  Object.values(globalThis.__TEST_STATE__.rateLimiters).forEach(limiter => limiter.clear());
});

afterAll(() => {
  // Clean up after all tests
  delete globalThis.__TEST_STATE__;
  delete globalThis.testConfig;
});