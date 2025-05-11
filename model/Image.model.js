const mongoose = require("mongoose");
// const { type } = require("os");
// const path = require("path");

const ImageModelScehma = new mongoose.Schema({
  path: {type :String, required:true},
  filename :{type :String, required:true}
},
  { collection: "ImageTest" }
);
 mongoose.model("ImageTest" , ImageModelScehma)
// const imageModel =mongoose.model("ImageTest", ImageModelScehma)
// module.exports={imageModel}