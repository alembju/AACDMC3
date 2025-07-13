const mongoose = require("mongoose");

const OutbreakIScehma = new mongoose.Schema({
  InvestigationTitle: String,
  EPIWeek: String,
  ReportingDate: Date,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('OutbreakI', OutbreakIScehma);
