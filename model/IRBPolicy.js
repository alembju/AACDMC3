const mongoose = require("mongoose");

const IRBPolicyScehma = new mongoose.Schema({
  IRBPolicyTitle: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('IRBPolicy', IRBPolicyScehma);