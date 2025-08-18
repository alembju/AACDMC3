const mongoose = require("mongoose");

const GIFScehma = new mongoose.Schema({
  GIFTitle: String,
  GIFDescription: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('GIF', GIFScehma);