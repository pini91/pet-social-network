const Comment = require("../models/Comment");

module.exports = {
  createComment: async (req, res) => {
    try {
      await Comment.create({
        comment: req.body.comment, // because in the post.ejs we have an input form with the name of comment.
        userCommentCreator: req.user.id, // this is the id of the user who is logged in and making the comment.
        postCreator: req.params.id, 
      });
      console.log("Comment has been added!");
      res.redirect("/post/"+req.params.id);
    } catch (err) {
      console.log(err);
    }
  }
};