const mongoose = require("mongoose");

const SLIMTAScehma = new mongoose.Schema(
  {
 
    SLIMTATitle: String,
    SLIMTADate: Date,
    pdf: String,
  },
  {
    collection: "SLIMTA"
  }
);

mongoose.model("SLIMTA",SLIMTAScehma);