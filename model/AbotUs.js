const mongoose = require("mongoose");

const AbotUsScehma = new mongoose.Schema({
  Position: String,
  Education: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('AbotUs', AbotUsScehma);