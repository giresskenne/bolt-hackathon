/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  transform: {},  // No transform needed for ES modules
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  testTimeout: 30000,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js']
};

export default config;