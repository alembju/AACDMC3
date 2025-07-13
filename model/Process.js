const mongoose = require("mongoose");


const ProcessScehma = new mongoose.Schema({
  ProcessTitle: String,
  ProcessDate: Date,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('Process', ProcessScehma);