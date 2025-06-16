import { jest } from '@jest/globals';

const mockStripe = function(key) {
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
};

export default mockStripe;