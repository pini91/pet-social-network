const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    require: true,
  },
  cloudinaryId: {
    type: String,
    require: true,
  },
  caption: {
    type: String,
    required: true,
  },
  likes: {
    type: Array, // This is an array of user ids that liked the post.
    required: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, // This is gonna give us the person that made the post.
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", PostSchema); // If you dont specify a collection name as the third argument, it will take your model name(Post) and make it plural
