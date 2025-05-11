const mongoose = require("mongoose");

const ImageDetailsScehma= new mongoose.Schema({
  Title:String,  
  Description:String,
  })
const ImagesDescriptionMondel = mongoose.model("ImageDescription" , ImageDetailsScehma)
module.exports = ImagesDescriptionMondel
