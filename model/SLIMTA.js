const mongoose = require("mongoose");


const SLIMTAScehma = new mongoose.Schema({
  SLIMTATitle: String,
  SLIMTADate: Date,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('SLIMTA', SLIMTAScehma);