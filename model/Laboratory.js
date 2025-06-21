const mongoose = require("mongoose");

const LaboratoryScehma = new mongoose.Schema(
  {
 
    LaboratoryTitle: String,
    LaboratoryDate: Date,
    pdf: String,
  },
  {
    collection: "Laboratory"
  }
);

mongoose.model("Laboratory",LaboratoryScehma);