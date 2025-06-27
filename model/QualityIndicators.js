const mongoose = require("mongoose");

const  QualityIndicatorsScehma = new mongoose.Schema(
  {
 
    QualityIndicatorsTitle: String,
    QualityIndicatorsDate: Date,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "QualityIndicators"
  }
);

mongoose.model("QualityIndicators", QualityIndicatorsScehma);