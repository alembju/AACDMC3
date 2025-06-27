const mongoose = require("mongoose");

const LabGuidlinesScehma = new mongoose.Schema(
  {
 
    LabGuidlinesTitle: String,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "LabGuidlines"
  }
);

mongoose.model("LabGuidlines",LabGuidlinesScehma);