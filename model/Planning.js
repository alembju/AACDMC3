const mongoose = require("mongoose");

const PlanningScehma = new mongoose.Schema({
  PPosition: String,
  PEducation: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Planning', PlanningScehma);