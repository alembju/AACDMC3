const mongoose = require("mongoose");

const AccreditedScehma = new mongoose.Schema({
  AccreditedTitle: String,
  AccreditedDate: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Accredited', AccreditedScehma);