const mongoose = require("mongoose");

const WeeklyReportScehma = new mongoose.Schema({
  WeeklyReportTitle: String,
  WeeklyReportDate: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('WeeklyReport', WeeklyReportScehma);