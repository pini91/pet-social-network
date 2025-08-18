module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/__test__/setup.js'],
  collectCoverageFrom: [
    '**/*.js',
    '!node_modules/**',
    '!coverage/**',
    '!jest.config.js',
    '!__test__/**'
  ],
  testMatch: ['**/__test__/**/*.js', '**/?(*.)+(spec|test).js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 10000
}
