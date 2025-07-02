const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const postsController = require("../controllers/posts");
const friendController = require("../controllers/friend");
const { ensureAuth, ensureGuest } = require("../middleware/auth");


//Friend Routes
router.get("/:id", ensureAuth, friendController.getFriend);
router.put("/follow/:id", ensureAuth, friendController.followFriend);
//router.delete("/friend/:id/remove", ensureAuth, friendController.removeFriend);

module.exports = router;