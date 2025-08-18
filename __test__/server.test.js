const request = require('supertest')
const express = require('express')

// Mock the database connection
jest.mock('../config/database', () => jest.fn())

// Mock passport to avoid initialization issues
jest.mock('passport', () => ({
  initialize: () => (req, res, next) => next(),
  session: () => (req, res, next) => next()
}))

// Mock express-session
jest.mock('express-session', () => () => (req, res, next) => next())

describe('Health Endpoint', () => {
  let app

  beforeAll(() => {
    // Import main routes which includes the health endpoint
    const mainRoutes = require('../routes/main')
    app = express()
    app.use(express.json())
    app.use('/', mainRoutes)
  })

  test('should respond with 200 status for health check', async () => {
    const response = await request(app).get('/health')
    expect(response.status).toBe(200)
    expect(response.body.status).toBe('OK')
    expect(response.body.timestamp).toBeDefined()
    expect(response.body.uptime).toBeDefined()
  })
})

describe('Environment Variables', () => {
  test('should have required environment variables in production', () => {
    if (process.env.NODE_ENV === 'production') {
      expect(process.env.DB_STRING || process.env.MONGO_URL).toBeDefined()
      expect(process.env.PORT).toBeDefined()
      expect(process.env.SESSION_SECRET).toBeDefined()
    }
    // For test environment, we don't require env vars
    expect(true).toBe(true)
  })
})
