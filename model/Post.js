
const mongoose = require("mongoose");
const PostSchema = new mongoose.Schema({
  NPosttitle: String,
  content: String,
  comments:[{text:String}],
},
{
    collection: "Post"
  }
);
const Post = mongoose.model('Post', PostSchema);


