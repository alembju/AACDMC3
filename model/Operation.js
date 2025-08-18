const mongoose = require("mongoose");

const OperationScehma = new mongoose.Schema({
  OPosition: String,
  OEducation: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Operation', OperationScehma);