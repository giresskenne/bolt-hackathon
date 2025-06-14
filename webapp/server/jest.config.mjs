/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': ['babel-jest']
  },
  moduleFileExtensions: ['js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  testTimeout: 30000,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  automock: false,
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  moduleDirectories: ['node_modules', '<rootDir>/src/__mocks__'],
  transformIgnorePatterns: ['node_modules/(?!(mongoose|mongodb-memory-server)/)']
};

export default config;