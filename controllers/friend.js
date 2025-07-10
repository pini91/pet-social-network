const cloudinary = require("../middleware/cloudinary"); // cloudinary is another bit of middleware that we are gonna have included.
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User"); //We are gonna use this to get the user who created the post, so we can show their name in the post.ejs template.
const Friend = require("../models/Friend"); //Were are gonna use the Friend model to verify the connection between users.

module.exports = {
    //This is the function that will be used to get the posts of a specific user(friend).
  getFriend: async (req, res) => {
    try {
        const friendProfile= await User.findOne({_id: req.params.id}); //We are gonna use this to get the user who created the post, so we can show their name in the post.ejs template.

        const posts = await Post.find({ user: req.params.id }).sort({ createdAt: "desc" }).lean();
    
        //grab friend profilePic

        const proPic= posts.find((post) => post.isProfilePic === true); //This will find the post that has isProfilePic set to true, which is the profile picture of the user.
       // console.log(proPic)
        const following = await Friend.findOne({ user: req.user.id});

        const followedBy= following.FollowFriends.length; //This is the number of users that follow the user that is logged in.
        const follows = following.FollowedBy.length; //This is the number of users that the user that is logged in is following. 
        //This will check if the user is following the friend or not.

        const isFollowing = following ? following.FollowFriends.includes(req.params.id) : false; //If the user is following the friend,isFollowing will be true, otherwise it will be false.

        res.render("friendsProfile.ejs", { posts: posts, friendProfile:friendProfile ,user: req.user, isFollowing: isFollowing, followedBy: followedBy, follows: follows, proPic:proPic}); //Here we get the post(that has a post.id the id who made this post), and we get the user: req.user(the logged in user.) so that we can compare if the person who made the post is the same thats logged in and so we can put the trash can or not.
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
          $push: { FollowedBy: req.user.id },
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

      await Friend.findOneAndUpdate(
        { user: req.params.id },
        {
          $pull: { FollowedBy: req.user.id },
        }
      );

    res.redirect(`/friends/${req.params.id}`); //Redirect to the friend's profile page after unfollowing.
    } catch (err) {
      console.log(err);
    }
  },

  searchPosts: async (req, res) => {
    try {
      const searchFriend = req.body.search;
      const friends = await User.find({
        $or: [
          { userName: { $regex: searchFriend, $options: "i" } },
          { email: { $regex: searchFriend, $options: "i" } },
        ],
      }).sort({ createdAt: "desc" }).lean();
// ----------------------------------------------------
      const photos = []; //This will hold the profile pictures of the friends that are found.
      //search for each friends profile picture
      for (let i = 0; i < friends.length; i++) {
        const posts = await Post.find({ user: friends[i]._id, isProfilePic: true })
        //find the profile pic
        // const postProfile = await Post.find({ user: friends[i]._id, isProfilePic: true })
        photos.push(...posts);
      }
      //console.log(photos)

      res.render("findFriends.ejs", { friends: friends, user: req.user, photos: photos }); //Here we get the post(that has a post.id the id who made this post), and we get the user: req.user(the logged in user.) so that we can compare if the person who made the post is the same thats logged in and so we can put the trash can or not.
    } catch (err) {
      console.log(err);
    }
  },
};
