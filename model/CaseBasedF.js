const mongoose = require("mongoose");

const CaseBasedFScehma = new mongoose.Schema({
  CaseBasedTitle: String,
  CaseBasedUDate: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('CaseBasedF', CaseBasedFScehma);