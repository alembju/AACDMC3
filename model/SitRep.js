const mongoose = require("mongoose");

const SitRepScehma = new mongoose.Schema({
  SitRepTitle: String,
  SitRepDate: Date,
  SUpdate: String,
  EPIWeek: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('SitRep', SitRepScehma);
