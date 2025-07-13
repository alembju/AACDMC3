const mongoose = require("mongoose");

const ImageDetailsScehma = new mongoose.Schema({
  Title: String,
  Description: String,
  filename:String,
  public_id:String,
  imgUrl:String
});

module.exports = mongoose.model('ImageDetails', ImageDetailsScehma);