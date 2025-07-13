const mongoose = require("mongoose");

const LatestUpdateScehma = new mongoose.Schema({
  LatestUpdateTitle: String,
  LatestUpdateDate: Date,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('LatestUpdate', LatestUpdateScehma);