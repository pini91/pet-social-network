const cloudinary = require("../middleware/cloudinary"); // cloudinary is another bit of middleware that we are gonna have included.
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User"); //We are gonna use this to get the user who created the post, so we can show their name in the post.ejs template.
const Friend = require("../models/Friend"); //Were are gonna use the Friend model to verify the connection between users.

module.exports = {
    //This is the function that will be used to get the posts of a specific user(friend).
  getFriend: async (req, res) => {
    try {

        const friendProfile= await User.findById(req.params.id); //We are gonna use this to get the user who created the post, so we can show their name in the post.ejs template.
        
        const posts = await Post.find({ user: req.params.id }).sort({ createdAt: "desc" }).lean();

        const following = await Friend.findOne({ user: req.user.id});
    
        //This will check if the user is following the friend or not.
        const isFollowing = following ? following.FollowFriends.includes(req.params.id) : false; //If the user is following the friend,isFollowing will be true, otherwise it will be false.

        res.render("friendsProfile.ejs", { posts: posts, friendProfile:friendProfile ,user: req.user, isFollowing: isFollowing }); 
        } catch (err) {
        console.log(err);
        }
  },
  followFriend: async (req, res) => {
    try {
        //Here will push the id of the user that is being followed into the FollowFriends array of the user who is following.
        await Friend.findOneAndUpdate(
        { user: req.user.id },
        {
          $push: { FollowFriends: req.params.id },
        }
      );
      //Here will push the id of the user who is followed.
      await Friend.findOneAndUpdate(
        { user: req.params.id },
        {
          $push: { FollowerFriends: req.user.id },
        }
      );
 
      
    res.redirect(`/friends/${req.params.id}`); //Redirect to the friend's profile page after following.
    } catch (err) {
      console.log(err);
    }
  },
  removeFriend: async (req, res) => {
    try {
      //Here we want to remove the id of the user that is being unfollowed from the FollowFriends array of the user who is unfollowing.
      await Friend.findOneAndUpdate(
        { user: req.user.id },
        {
          $pull: { FollowFriends: req.params.id },
        }
      );
      
    res.redirect(`/friends/${req.params.id}`); //Redirect to the friend's profile page after unfollowing.
    } catch (err) {
      console.log(err);
    }
  },
};
