const mongoose = require("mongoose");

const CardsScehma = new mongoose.Schema({
  FrontTitle: String,
  FrontDate:  String,
  Frontdescription: String,
  FrontDetail: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);

module.exports = mongoose.model('Cards', CardsScehma);