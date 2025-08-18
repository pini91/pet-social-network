const express = require('express')
const router = express.Router()
const commentsController = require('../controllers/comments')
const { ensureAuth } = require('../middleware/auth') // ensureGuest not used in this route

// Comment Routes
// The user has to be logged in to create a comment, so we use ensureAuth middleware.
router.post('/createComment/:id', ensureAuth, commentsController.createComment)

router.delete('/deleteComment/:id', ensureAuth, commentsController.deleteComment)

module.exports = router
