const mongoose = require("mongoose");

const CPDScehma = new mongoose.Schema({
  CPDTitle: String,
  CPDDate: Date,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('CPD', CPDScehma);