const cloudinary = require("../middleware/cloudinary"); // cloudinary is another bit of middleware that we are gonna have included.
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User"); //We are gonna use this to get the user who created the post, so we can show their name in the post.ejs template.
const Friend = require("../models/Friend"); //Were are gonna use the Friend model to verify the connection between users.



module.exports = {
    //This is the function that will be used to get the posts of a specific user(friend).
    getSettings: (req, res) => {
     res.render("settings.ejs", { user: req.user });
  },

};
