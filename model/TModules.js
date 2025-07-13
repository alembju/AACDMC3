const mongoose = require("mongoose");

const TModulesScehma = new mongoose.Schema({
  TModulesTitle: String,
  TModulesDate: Date,
  TMTrainer: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('TModules', TModulesScehma);