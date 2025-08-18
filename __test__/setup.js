// Test setup file for mocking common dependencies

// Mock environment variables for testing
process.env.NODE_ENV = 'test'
process.env.DB_STRING = 'mongodb://localhost:27017/test'
process.env.SESSION_SECRET = 'test-secret'
process.env.PORT = '3000'

// Mock console.log to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}

// This file is just for setup, no tests needed
describe('Test Setup', () => {
  test('should setup test environment correctly', () => {
    expect(process.env.NODE_ENV).toBe('test')
    expect(process.env.DB_STRING).toBeDefined()
  })
})
