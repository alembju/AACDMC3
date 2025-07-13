const mongoose = require("mongoose");


const JobAidScehma = new mongoose.Schema({
  JobAidTitle: String,
  JobAidDate: Date,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('JobAid', JobAidScehma);