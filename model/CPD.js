const mongoose = require("mongoose");

const CPDScehma = new mongoose.Schema(
  {
 
    CPDTitle: String,
    CPDDate: Date,
    pdf: String,
  },
  {
    collection: "CPD"
  }
);

mongoose.model("CPD",CPDScehma);