const mongoose = require("mongoose");


const SuppervisionScehma = new mongoose.Schema({
  SuppervisionTitle: String,
  EPIWeek: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Suppervision', SuppervisionScehma);