// console.log('[jest.setup] loaded as', typeof exports); // should print 'object'
// server/jest.setup.js
import crypto from 'crypto';
import dotenv from 'dotenv';
import { jest } from '@jest/globals';
import { resetInMemoryState } from './index.js';
import { clearRateLimiters } from './rateLimit.js';

dotenv.config({ path: '.env.test' });

// ────────────────────────────────────────────────────────────────
//  STATeless test hooks (no external DB)
// ────────────────────────────────────────────────────────────────

beforeEach(() => {
  resetInMemoryState();
  clearRateLimiters();
  jest.clearAllMocks();
  jest.setTimeout(30_000);
});

afterAll(async () => {
  // ensure timers etc. settle
  await new Promise((r) => setTimeout(r, 500));
});


// Mock crypto for tests
global.crypto = {
  getRandomValues: function(buffer) {
    return crypto.randomFillSync(buffer);
  },
  subtle: {
    importKey: jest.fn(),
    deriveKey: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn()
  }
};

// server/jest.setup.js
// --------------------------------------------
jest.mock('stripe', () => {
  // This is a normal function produced by jest.fn(),
  // so `new StripeMock()` is allowed.
  const StripeMock = jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn(async (data) => ({ id: 'cus_test_123', ...data }))
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
      constructEvent: jest.fn((payload) => ({
        type: 'test.event',
        data: { object: JSON.parse(payload) }
      }))
    }
  }));

  // ESM-style default export for `import Stripe from 'stripe'`
  return { __esModule: true, default: StripeMock };
});
// --------------------------------------------
