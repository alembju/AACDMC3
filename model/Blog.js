const mongoose = require("mongoose");

// const blogSchema = new mongoose.Schema({
//   title: String,
//   content: String,
//   comments: [{ text: String }]
// });

// const Blog = mongoose.model('Blog', blogSchema);
// module.exports = Blog

// const mongoose = require("mongoose");

// const blogSchema = new mongoose.Schema({
//   title: String,
//   content: String,
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "BlogUser" },
//   comments: [{ text: String }],
// });

// const Blog = mongoose.model('Blog', blogSchema);
// module.exports = Blog


// const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  comments: [commentSchema],
});

module.exports = mongoose.model("Blog", blogSchema);

