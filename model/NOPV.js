const mongoose = require("mongoose");



const NOPVScehma = new mongoose.Schema({
  NOPVTitle: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('NOPV', NOPVScehma);