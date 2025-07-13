const mongoose = require("mongoose");

const FormatsScehma = new mongoose.Schema({
  FormatsTitle: String,
  FormatsDate: Date,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Formats', FormatsScehma);