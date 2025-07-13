const mongoose = require("mongoose");

const SUpdateScehma = new mongoose.Schema({
  Title: String,
  SUpdateDate: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('SUpdate', SUpdateScehma);