const mongoose = require("mongoose");

const ManualsScehma = new mongoose.Schema(
  {
 
    ManualsTitle: String,
    ManualsDate: Date,
    pdf: String,
  },
  {
    collection: "Manuals"
  }
);

mongoose.model("Manuals",ManualsScehma);