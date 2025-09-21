const mongoose = require("mongoose");

const TopLedersScehma = new mongoose.Schema({
  TPosition: String,
  TEducation: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('TopLeders', TopLedersScehma);