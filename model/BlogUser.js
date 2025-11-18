const mongoose = require("mongoose");

const BlogUserSchema = new mongoose.Schema({
 name: String,
  email: String,
  password: String,
});

const BlogUser = mongoose.model('BlogUser', BlogUserSchema);
module.exports = BlogUser