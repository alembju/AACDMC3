const mongoose = require("mongoose");


const LaboratoryScehma = new mongoose.Schema({
   LaboratoryTitle: String,
  LaboratoryDate: Date,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Laboratory', LaboratoryScehma);