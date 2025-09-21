const mongoose = require("mongoose");

const DailyReportScehma = new mongoose.Schema({
  DailyReportTitle: String,
  DailyReportDate: String,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('DailyReport', DailyReportScehma);