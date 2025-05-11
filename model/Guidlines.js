const mongoose = require("mongoose");

const GuidlinesScehma = new mongoose.Schema(
  {
    GuidelinesTitle: String,
    pdf: String,
  },
  {
    collection: "Guidlines"
  }
);

mongoose.model("Guidlines", GuidlinesScehma);