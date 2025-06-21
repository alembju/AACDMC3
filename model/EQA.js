const mongoose = require("mongoose");

const EQAScehma = new mongoose.Schema(
  {
 
    EQATitle: String,
    EQADate: Date,
    pdf: String,
  },
  {
    collection: "EQA"
  }
);

mongoose.model("EQA",EQAScehma);