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
   editName: async (req, res) => {
   //here we are going to grab the req.body.newName which is the new name that the user wants to change to.
     const  newName  = req.body.newName;
     console.log(newName)
     try {
       await User.findByIdAndUpdate(req.user.id, { userName: newName });
       res.redirect("/profile");
     } catch (err) {
       console.error(err);
       return res.status(500).send("Internal Server Error");
     }
   }
};
