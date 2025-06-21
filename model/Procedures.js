const mongoose = require("mongoose");

const ProceduresScehma = new mongoose.Schema(
  {
 
    ProceduresTitle: String,
    ProceduresDate: Date,
    pdf: String,
  },
  {
    collection: "Procedures"
  }
);

mongoose.model("Procedures",ProceduresScehma);