const express = require('express')
const router = express.Router()
const upload = require('../middleware/multer') // Molter is the middleware thats gonna handle taking that file and helping us upload it and its doing some checking on that file
const postsController = require('../controllers/posts')
const { ensureAuth } = require('../middleware/auth') // ensureGuest not used in this route

// Post Routes - simplified for now
router.get('/:id', ensureAuth, postsController.getPost) // Here we see the API is gonna be taking the :id(whatever thats after the ) as a query parameter. Basically is just a variable thats gonna be holding the id value for the post.js controller.
// ensureAuth: Is some middleware thats checking to see that we are logged in before going to the postController.
router.post('/createPost', upload.single('file'), postsController.createPost)
// upload middleware is requireing "../middleware/multer"

router.post('/likePost/:id', postsController.likePost)

router.post('/unlikePost/:id', postsController.unLikePost)

router.post('/createProfilePic', upload.single('file'), postsController.createProfilePic)

router.delete('/deletePost/:id', postsController.deletePost)

module.exports = router
