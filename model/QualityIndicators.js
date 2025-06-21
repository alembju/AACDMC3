const mongoose = require("mongoose");

const  QualityIndicatorsScehma = new mongoose.Schema(
  {
 
    QualityIndicatorsTitle: String,
    QualityIndicatorsDate: Date,
    pdf: String,
  },
  {
    collection: "QualityIndicators"
  }
);

mongoose.model("QualityIndicators", QualityIndicatorsScehma);