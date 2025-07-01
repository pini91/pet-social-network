const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
//outer.get("/:id", ensureAuth, postsController.getPost); //Here we see the API is gonna be taking the :id(whatever thats after the ) as a query parameter. Basically is just a variable thats gonna be holding the id value for the post.js controller.
//ensureAuth: Is some middleware thats checking to see that we are logged in before going to the postController.
router.post("/createComment/:id", commentsController.createComment);
// upload middleware is requireing "../middleware/multer"

//router.put("/likePost/:id", postsController.likePost);

//router.delete("/deletePost/:id", postsController.deletePost);

module.exports = router;
