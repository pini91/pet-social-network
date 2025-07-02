const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Comment Routes
//The user has to be logged in to create a comment, so we use ensureAuth middleware.
router.post("/createComment/:id", ensureAuth, commentsController.createComment);


module.exports = router;
