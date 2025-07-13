const mongoose = require("mongoose");


const JDescriptionsScehma = new mongoose.Schema({
  JDescriptionsTitle: String,
  JDescriptionsDate: Date,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('JDescriptions', JDescriptionsScehma);