const mongoose = require("mongoose");

const LabGuidlinesScehma = new mongoose.Schema(
  {
 
    LabGuidlinesTitle: String,
    LabGuidlinesDate: Date,
    pdf: String,
  },
  {
    collection: "LabGuidlines"
  }
);

mongoose.model("LabGuidlines",LabGuidlinesScehma);