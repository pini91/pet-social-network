// const cloudinary = require('../middleware/cloudinary') // cloudinary is another bit of middleware that we are gonna have included.
const Post = require('../models/Post')
// const Comment = require('../models/Comment') // Not used in this controller
const User = require('../models/User') // We are gonna use this to get the user who created the post, so we can show their name in the post.ejs template.
const Friend = require('../models/Friend') // Were are gonna use the Friend model to verify the connection between users.

module.exports = {
  // This is the function that will be used to get the posts of a specific user(friend).
  getFriend: async (req, res) => {
    try {
      console.log('getFriend: Starting friend profile request for user:', req.params.id)
      const friendProfile = await User.findOne({ _id: req.params.id }) // We are gonna use this to get the user who created the post, so we can show their name in the post.ejs template.

      const posts = await Post.find({ user: req.params.id }).sort({ createdAt: 'desc' }).lean()

      // grab friend profilePic
      const proPic = posts.find((post) => post.isProfilePic === true) // This will find the post that has isProfilePic set to true, which is the profile picture of the user.

      let following = await Friend.findOne({ user: req.params.id })
      console.log('getFriend: Current user Friend document found:', following)

      // If no friend document exists for current user, create one
      if (!following) {
        console.log('getFriend: Creating new Friend document for current user:', req.user.id)
        following = new Friend({
          user: req.user.id,
          FollowFriends: [],
          FollowedBy: []
        })
        await following.save()
      }

      const followedBy = following.FollowFriends.length ? following.FollowFriends.length : 0 // This is the number of users that the current user is following.
      const follows = following.FollowedBy.length ? following.FollowedBy.length : 0 // This is the number of users that follow the current user.

      // This will check if the user is following the friend or not.
      const isFollowing = following && following.FollowFriends ? following.FollowFriends.includes(req.params.id) : false // If the user is following the friend,isFollowing will be true, otherwise it will be false.

      console.log('getFriend: Rendering friend profile with followedBy:', followedBy, 'follows:', follows, 'isFollowing:', isFollowing)
      res.render('friendsProfile.ejs', { posts, friendProfile, user: req.user, isFollowing, followedBy, follows, proPic }) // Here we get the post(that has a post.id the id who made this post), and we get the user: req.user(the logged in user.) so that we can compare if the person who made the post is the same thats logged in and so we can put the trash can or not.
    } catch (err) {
      console.error('getFriend error:', err)
      res.redirect('/')
    }
  },
  followFriend: async (req, res) => {
    try {
      console.log('followFriend: User', req.user.id, 'attempting to follow', req.params.id)

      // Ensure both users have Friend documents
      await Friend.findOneAndUpdate(
        { user: req.user.id },
        {
          $push: { FollowFriends: req.params.id }
        },
        { upsert: true } // Create document if it doesn't exist
      )

      await Friend.findOneAndUpdate(
        { user: req.params.id },
        {
          $push: { FollowedBy: req.user.id }
        },
        { upsert: true } // Create document if it doesn't exist
      )

      console.log('followFriend: Successfully followed user', req.params.id)
      res.redirect(`/friends/${req.params.id}`) // Redirect to the friend's profile page after following.
    } catch (err) {
      console.error('followFriend error:', err)
      res.redirect('/')
    }
  },
  removeFriend: async (req, res) => {
    try {
      console.log('removeFriend: User', req.user.id, 'attempting to unfollow', req.params.id)

      // Remove from following lists
      await Friend.findOneAndUpdate(
        { user: req.user.id },
        {
          $pull: { FollowFriends: req.params.id }
        }
      )

      await Friend.findOneAndUpdate(
        { user: req.params.id },
        {
          $pull: { FollowedBy: req.user.id }
        }
      )

      console.log('removeFriend: Successfully unfollowed user', req.params.id)
      res.redirect(`/friends/${req.params.id}`) // Redirect to the friend's profile page after unfollowing.
    } catch (err) {
      console.log(err)
    }
  },

  searchPosts: async (req, res) => {
    try {
      const searchFriend = req.body.search
      const friends = await User.find({
        $or: [
          { userName: { $regex: searchFriend, $options: 'i' } },
          { email: { $regex: searchFriend, $options: 'i' } }
        ]
      }).sort({ createdAt: 'desc' }).lean()
      // ----------------------------------------------------
      const photos = [] // This will hold the profile pictures of the friends that are found.
      // search for each friends profile picture
      for (let i = 0; i < friends.length; i++) {
        const posts = await Post.find({ user: friends[i]._id, isProfilePic: true })
        // find the profile pic
        // const postProfile = await Post.find({ user: friends[i]._id, isProfilePic: true })
        photos.push(...posts)
      }
      // console.log(photos)

      res.render('findFriends.ejs', { friends, user: req.user, photos }) // Here we get the post(that has a post.id the id who made this post), and we get the user: req.user(the logged in user.) so that we can compare if the person who made the post is the same thats logged in and so we can put the trash can or not.
    } catch (err) {
      console.log(err)
    }
  }
}
