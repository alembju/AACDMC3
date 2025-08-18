const mongoose = require("mongoose");

const RCCEScehma = new mongoose.Schema({
  RCCETitle: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('RCCE', RCCEScehma);