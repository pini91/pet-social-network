const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true,
  },
  userCommentCreator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  postCreator: {
    type: mongoose.Schema.Types.ObjectId, // This is gonna give us the person that made the post.
    ref: "Post", // Here we set post, to know from which post id this comment was made.. "Post"comes from the post model.
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Comment", CommentSchema); // If you dont specify a collection name as the third argument, it will take your model name(Comment) and make it plural
