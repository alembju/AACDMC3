const mongoose = require("mongoose");

const QualityIndicatorsScehma = new mongoose.Schema({
  QualityIndicatorsTitle: String,
  QualityIndicatorsDate: Date,
  filename:String,
  public_id:String,
  imgUrl:String, 
},
{
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
}
);
module.exports = mongoose.model('QualityIndicators', QualityIndicatorsScehma);