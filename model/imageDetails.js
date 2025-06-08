const mongoose = require("mongoose");

const ImageDetailsScehma= new mongoose.Schema({
  Title: String,
  Description: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  pdf: String,
 
  },
  { collection: "ImageDetails" }
);
 mongoose.model("ImageDetails" , ImageDetailsScehma)