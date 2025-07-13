const mongoose = require("mongoose");

const RegulationsScehma = new mongoose.Schema({
  RulesTitle: String,
  RulesADate: Date,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Regulations', RegulationsScehma);