const mongoose = require("mongoose");

const LinelistScehma = new mongoose.Schema({
  LineListTitle: String,
  LineListDate: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Linelist', LinelistScehma);