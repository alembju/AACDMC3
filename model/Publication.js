const mongoose = require("mongoose");

const PublicationScehma = new mongoose.Schema({
  PublicationTitle: String,
  PublicationDate: Date,
  PublicationAbstract: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Publication', PublicationScehma);