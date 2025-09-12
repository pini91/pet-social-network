const cloudinary = require('../middleware/cloudinary') // cloudinary is another bit of middleware that we are gonna have included.
const Post = require('../models/Post')
const Comment = require('../models/Comment')
const User = require('../models/User') // We are gonna use this to get the user who created the post, so we can show their name in the post.ejs template.
const Friend = require('../models/Friend') // Were are gonna use the Friend model to verify the connection between users.

module.exports = {
  getProfile: async (req, res) => {
    try {
      console.log('getProfile: Starting profile request for user:', req.user.id)
      const posts = await Post.find({ user: req.user.id }).sort({ createdAt: 'desc' }).lean()
      console.log('getProfile: Found posts:', posts.length)

      // find the profile pic
      const profilePic = posts.find(post => post.isProfilePic)

      let follows = await Friend.findOne({ user: req.user.id })
      console.log('getProfile: Friend document found:', !!follows)

      // If no friend document exists, create one or use default values
      if (!follows) {
        console.log('getProfile: Creating new Friend document for user:', req.user.id)
        follows = new Friend({
          user: req.user.id,
          FollowFriends: [],
          FollowedBy: []
        })
        await follows.save()
      }

      const followedBy = follows.FollowedBy ? follows.FollowedBy.length : 0 // This is the number of users that follow the user that is logged in.
      const following = follows.FollowFriends ? follows.FollowFriends.length : 0 // This is the number of users that the user that is logged in is following.

      // const followFriends = User.find({ user: { $all: follows.FollowFriends } })
      console.log(`FROM FOLLOW FRIENDS${follows.FollowFriends}`)

      // const followedByFriends = User.find({ user: { $all: follows.FollowedBy } })
      console.log(`FROM FOLLOWBY${follows.FollowedBy}`)

      console.log('getProfile: Rendering profile with followedBy:', followedBy, 'following:', following)
      res.render('profile.ejs', { posts, user: req.user, followedBy, following, profilePic }) // posts(because of mongoose) what we are passing its an array, back in the day they had to put .toArray().
    } catch (err) {
      console.error('getProfile error:', err)
      res.redirect('/')
    }
  },
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: 'desc' }).lean() // lean is mongoose.The lean is just helping us to format something specifically. How the objects that come back from mongoose are structure. It just helps you structure the data in a specific way. It basically says give me the plain/raw document. Take up all the wrapping and extra stuff, take all that off, and give just the object. I include this to make it way faster.Everything im getting back has 5 times less amount of stuff.
      res.render('feed.ejs', { posts }) // lean gives you the "pojo" the plain old js
    } catch (err) {
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id)// The magic comes here, because in the router API we setted whatever comes after the \/:id And now in my post collection database Im gonna grab that document by doing req.params.id --We can change the query parameter .id to whatever we want, but then we would have to change it as well in the post.js route/
      // const comments = await Comment.find({postCreator: req.params.id}).sort({ createdAt: "desc" }).lean();
      const posts = await Post.find({ user: post.user }).sort({ createdAt: 'desc' }).lean()
      // find the profile pic for the post creator
      const postCreatorProfilePic = posts.find(post => post.isProfilePic)

      // grab the user name from User model
      const userCreator = await User.findById(post.user) // This is to get the user who created the post, so we can show their name in the post.ejs template.

      // grab the userNames from the comments
      const commentsWithUsernames = await Comment.find({ postId: req.params.id }).sort({ createdAt: 'desc' }).populate('userCommentCreator', 'userName') // This is to get the user who created the comment, so we can show their name in the post.ejs template.
      // populate is a mongoose method that allows us to replace the specified path in the document with the actual document from another collection. In this case, we are replacing the userCommentCreator field with the actual User document, and we are only selecting the userName field from that User document.

      // Get unique user IDs from comments
      const commentUserIds = [...new Set(commentsWithUsernames.map(comment => comment.userCommentCreator._id))]

      // Get profile pictures for all users who made comments
      const profilePics = []
      for (const userId of commentUserIds) {
        const userPosts = await Post.find({ user: userId }).sort({ createdAt: 'desc' }).lean()
        const userProfilePic = userPosts.find(post => post.isProfilePic)
        if (userProfilePic) {
          profilePics.push({
            user: userId,
            image: userProfilePic.image
          })
        }
      }

      // console.log(post)
      // console.log(userCreator.id)
      // console.log(commentsWithUsernames)

      res.render('post.ejs', {
        post,
        user: req.user,
        comments: commentsWithUsernames,
        userCreator,
        profilePic: postCreatorProfilePic,
        profilePics // Array of profile pictures for comment creators
      }) // Here we get the post(that has a post.id the id who made this post), and we get the user: req.user(the logged in user.) so that we can compare if the person who made the post is the same thats logged in and so we can put the trash can or not.
    } catch (err) {
      console.log(err)
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path) // You dont have to know all this,you just have to read it in the cloudinaryes docs or look at some stuff that that folks were doing with cloudinary and i grabbed the pieces that I need.
      // .uploader sigurno je jedan method from cloudinary and . upload: uploads the image
      await Post.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id, // We might need this id to delete it later.
        caption: req.body.caption,
        user: req.user.id
      })
      console.log('Post has been added!')
      res.redirect('/profile')
    } catch (err) {
      console.log(err)
    }
  },
  likePost: async (req, res) => {
    console.log('YOU MADE IT TO Like')
    const user = req.user
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $push: { likes: user.id } // here we are gonna increment a specific property(likes) by 1. "$inc is a built in increment that comes with mongodb by extension mongoose"
        }
      )

      res.redirect(`/post/${req.params.id}`) // Then we are gonna redirect them back to the post that they were already on.
    } catch (err) {
      console.log(err)
    }
  },
  unLikePost: async (req, res) => {
    console.log('YOU MADE IT TO UnLike')
    const user = req.user
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $pull: { likes: user.id } // here we are gonna decrement a specific property(likes) by 1. "$pull is a built in decrement that comes with mongodb by extension mongoose"
        }
      )

      res.redirect(`/post/${req.params.id}`) // Then we are gonna redirect them back to the post that they were already on.
    } catch (err) {
      console.log(err)
    }
  },

  deletePost: async (req, res) => {
    try {
      // Find post by id
      const post = await Post.findById(req.params.id) // We put this line here to make sure that post exist.

      if (!post) {
        console.error('Post not found')
        return res.redirect('/profile')
      }

      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId)

      // Delete comments associated with the post
      await Comment.deleteMany({ postId: req.params.id })
      // This will delete all comments that are associated with the post being deleted.

      // Delete post from db
      await Post.findByIdAndDelete(req.params.id)

      console.log('Deleted Post')
      res.redirect('/profile')
    } catch (err) {
      res.redirect('/profile')
    }
  },
  createProfilePic: async (req, res) => {
    try {
      // find the profile pic
      const picture = await Post.findOne({ user: req.user, isProfilePic: true })// .sort({ createdAt: "desc" }).lean();
      // This is to make sure that we only have one profile picture at a time.
      // If the user already has a profile picture, we set it to false.
      if (picture) {
        await Post.findOneAndUpdate(
          { _id: picture.id },
          {
            $set: { isProfilePic: false } // here we are gonna set the isProfilePic property to false.
          }
        )
      }

      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path) // You dont have to know all this,you just have to read it in the cloudinaryes docs or look at some stuff that that folks were doing with cloudinary and i grabbed the pieces that I need.
      // .uploader sigurno je jedan method from cloudinary and . upload: uploads the image
      await Post.create({
        // title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id, // We might need this id to delete it later.
        // caption: req.body.caption,
        user: req.user.id,
        isProfilePic: true // This is to check if the post is a profile picture or not.
      })
      console.log('Profile picture has been added!')
      res.redirect('/profile')
    } catch (err) {
      console.log(err)
    }
  }
}
