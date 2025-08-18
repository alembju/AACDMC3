
const mongoose = require("mongoose");
const PostSchema = new mongoose.Schema({
  NPosttitle: String,
  content: String,
  // comments: [CommentSchema],
  createdAt: { type: Date, default: Date.now },
},
{
    collection: "Post"
  }
);
const Post = mongoose.model('Post', PostSchema);


