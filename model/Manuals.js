const mongoose = require("mongoose");


const ManualsScehma = new mongoose.Schema({
  ManualsTitle: String,
  ManualsDate: Date,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Manuals', ManualsScehma);