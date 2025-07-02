const mongoose = require("mongoose");

const FriendSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  FollowFriends: {
    type: Array,
    default: [],
  },
  FollowerFriends: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
},
});

module.exports = mongoose.model("Friend", FriendSchema);

