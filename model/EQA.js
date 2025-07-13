const mongoose = require("mongoose");

const EQAScehma = new mongoose.Schema({
  EQATitle: String,
  EQADate: Date,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('EQA', EQAScehma);