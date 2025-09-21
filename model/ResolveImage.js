const mongoose = require("mongoose");


const ResolveImageScehma = new mongoose.Schema({
  ResolveImageTitle: String,
  ResolveImageDescription: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('ResolveImage', ResolveImageScehma);