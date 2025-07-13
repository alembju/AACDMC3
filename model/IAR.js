const mongoose = require("mongoose");



const ActiveSearchScehma = new mongoose.Schema({
  IARTitle: String,
  Abstract: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('IAR', ActiveSearchScehma);