const cloudinary = require("../middleware/cloudinary"); // cloudinary is another bit of middleware that we are gonna have included.
const Post = require("../models/Post");
const Comment = require("../models/Comment");

module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("profile.ejs", { posts: posts, user: req.user }); //posts(because of mongoose) what we are passing its an array, back in the day they had to put .toArray().
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean(); //lean is mongoose.The lean is just helping us to format something specifically. How the objects that come back from mongoose are structure. It just helps you structure the data in a specific way. It basically says give me the plain/raw document. Take up all the wrapping and extra stuff, take all that off, and give just the object. I include this to make it way faster.Everything im getting back has 5 times less amount of stuff.
      res.render("feed.ejs", { posts: posts }); // lean gives you the "pojo" the plain old js
    } catch (err) {
      }
  },  
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);//The magic comes here, because in the router API we setted whatever comes after the \/:id And now in my post collection database Im gonna grab that document by doing req.params.id --We can change the query parameter .id to whatever we want, but then we would have to change it as well in the post.js route/ 
      const comments = await Comment.find({post: req.params.id}).sort({ createdAt: "desc" }).lean();
      res.render("post.ejs", { post: post, user: req.user, comments: comments }); //Here we get the post(that has a post.id the id who made this post), and we get the user: req.user(the logged in user.) so that we can compare if the person who made the post is the same thats logged in and so we can put the trash can or not.
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path); // You dont have to know all this,you just have to read it in the cloudinaryes docs or look at some stuff that that folks were doing with cloudinary and i grabbed the pieces that I need.
                          //.uploader sigurno je jedan method from cloudinary and . upload: uploads the image
      await Post.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id, // We might need this id to delete it later.
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 }, //here we are gonna increment a specific property(likes) by 1. "$inc is a built in increment that comes with mongodb by extension mongoose"
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`); //Then we are gonna redirect them back to the post that they were already on. 
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id }); //We put this line here to make sure that post exist.
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};
