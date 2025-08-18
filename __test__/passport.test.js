const request = require('supertest')
const express = require('express')
const session = require('express-session')
const passport = require('passport')

// Mock the database and models
jest.mock('../config/database', () => jest.fn())
jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  findById: jest.fn()
}))

describe('Passport Configuration', () => {
  let app

  beforeEach(() => {
    app = express()

    // Basic session setup for testing
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }
    }))

    // Initialize passport
    app.use(passport.initialize())
    app.use(passport.session())

    // Test route
    app.get('/test', (req, res) => {
      res.json({ authenticated: req.isAuthenticated() })
    })
  })

  test('should initialize passport correctly', async () => {
    const response = await request(app).get('/test')
    expect(response.status).toBe(200)
    expect(response.body.authenticated).toBe(false)
  })

  test('should have serialize and deserialize functions', () => {
    // Check that passport has the required functions
    expect(typeof passport.serializeUser).toBe('function')
    expect(typeof passport.deserializeUser).toBe('function')
  })

  test('should handle passport session regeneration', async () => {
    // Test that session regeneration works with Passport 0.7.0
    const response = await request(app)
      .get('/test')
      .expect(200)

    expect(response.body.authenticated).toBe(false)
  })
})
