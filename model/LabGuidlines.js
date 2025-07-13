const mongoose = require("mongoose");

const LabGuidlinesScehma = new mongoose.Schema({
  LabGuidlinesTitle: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('LabGuidlines', LabGuidlinesScehma);