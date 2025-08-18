const mongoose = require("mongoose");

const CardBottumScehma = new mongoose.Schema({
  Bottumname: String,
  Bottumdescription: String,
  BottumDetail: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);

module.exports = mongoose.model('CardBottum', CardBottumScehma);