const mongoose = require("mongoose");

const BlogcommentSchema = new mongoose.Schema({
text: String,
user: { type: mongoose.Schema.Types.ObjectId, ref: "BlogUser" },
});

const Blogcomment = mongoose.model('Blogcomment', BlogcommentSchema);
module.exports = Blogcomment

// const commentSchema = new mongoose.Schema({
//   text: String,
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
// });