const mongoose = require("mongoose");


const MatrialsScehma = new mongoose.Schema({
  MatrialsTitle: String,
  MatrialsDate: Date,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Matrials', MatrialsScehma);