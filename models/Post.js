const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false
  },
  image: {
    type: String,
    require: true
  },
  cloudinaryId: {
    type: String,
    require: true
  },
  caption: {
    type: String,
    required: false
  },
  likes: {
    type: Array, // This is an array of user ids that liked the post.
    default: [],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, // This is gonna give us the person that made the post.
    ref: 'User'
  },
  isProfilePic: {
    type: Boolean, // This is to check if the post is a profile picture or not.
    default: false // If its a profile picture, it will be false, except if downloaded for profile picture.
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Post', PostSchema) // If you dont specify a collection name as the third argument, it will take your model name(Post) and make it plural
