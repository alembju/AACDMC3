const mongoose = require("mongoose");

const PolicyDocScehma = new mongoose.Schema({
  PolicyDocTitle: String,
  PolicyDocDate: Date,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('PolicyDoc', PolicyDocScehma);