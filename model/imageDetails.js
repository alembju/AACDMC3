const mongoose = require("mongoose");

const ImageDetailsScehma= new mongoose.Schema({
  Title: String,
  Description: String,
  pdf: String,
  },

  { collection: "ImageDetails" }
);
 mongoose.model("ImageDetails" , ImageDetailsScehma)