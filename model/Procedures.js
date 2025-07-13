const mongoose = require("mongoose");


const ProceduresScehma = new mongoose.Schema({
  ProceduresTitle: String,
  ProceduresDate: Date,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Procedures', ProceduresScehma);