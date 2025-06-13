import { jest } from '@jest/globals';

const mockCustomers = {
  create: jest.fn().mockResolvedValue({ id: 'cus_test' })
};

const mockCheckoutSessions = {
  create: jest.fn().mockResolvedValue({ 
    id: 'cs_test',
    url: 'https://checkout.stripe.com/test'
  })
};

const mockStripe = {
  customers: mockCustomers,
  checkout: {
    sessions: mockCheckoutSessions
  }
};

// Export the mock constructor
const stripeMockConstructor = jest.fn(() => mockStripe);

export default stripeMockConstructor;
// Export individual mocks for direct testing
export { mockCustomers, mockCheckoutSessions, mockStripe };