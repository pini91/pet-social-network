const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth')
const homeController = require('../controllers/home')
const postsController = require('../controllers/posts')
const friendController = require('../controllers/friend')
const settingsController = require('../controllers/settings')
const resetController = require('../middleware/resetController')
const { ensureAuth } = require('../middleware/auth') // ensureGuest not used in this route

// Health check endpoint for Railway and monitoring
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Handle service worker requests (browsers sometimes auto-request this)
router.get('/service-worker.js', (req, res) => {
  res.status(404).send('// No service worker available')
})

router.get('/sw.js', (req, res) => {
  res.status(404).send('// No service worker available')
})

// Main Routes - simplified for now
router.get('/', homeController.getIndex)
router.get('/profile', ensureAuth, postsController.getProfile)
router.get('/feed', ensureAuth, postsController.getFeed)
router.get('/login', authController.getLogin)
router.post('/login', authController.postLogin)
router.get('/logout', authController.logout)
router.get('/signup', authController.getSignup)
router.post('/signup', authController.postSignup)

// Settings Route
router.get('/settings', ensureAuth, settingsController.getSettings)
router.put('/settings/editName', ensureAuth, settingsController.editName) // Edit name route
router.delete('/settings/deleteAccount', ensureAuth, settingsController.deleteAccount) // Delete account route

// Search route
router.post('/search', ensureAuth, friendController.searchPosts)

// Reset Password Routes
router.get('/forgot-password', resetController.getForgotPassword) // (serve form)
router.post('/forgot-password', resetController.forgotPassword)
router.get('/reset-password/:token', resetController.getResetPassword) // (serve reset form)
router.post('/reset-password/:token', resetController.postResetPassword)
router.get('/changePassword', ensureAuth, resetController.changePassword) // Change password route
router.post('/currentPassword', ensureAuth, resetController.currentPassword) // Old password route
router.get('/newPassword', ensureAuth, resetController.renderNewPassword)
router.post('/new-password', ensureAuth, resetController.newPassword) // New password route

module.exports = router
