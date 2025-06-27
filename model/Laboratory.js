const mongoose = require("mongoose");

const LaboratoryScehma = new mongoose.Schema(
  {
 
    LaboratoryTitle: String,
    LaboratoryDate: Date,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "Laboratory"
  }
);

mongoose.model("Laboratory",LaboratoryScehma);