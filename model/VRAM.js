const mongoose = require("mongoose");

const VRAMScehma = new mongoose.Schema({
  VRAMTitle: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('VRAM', VRAMScehma);