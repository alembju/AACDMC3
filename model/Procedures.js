const mongoose = require("mongoose");

const ProceduresScehma = new mongoose.Schema(
  {
 
    ProceduresTitle: String,
    ProceduresDate: Date,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "Procedures"
  }
);

mongoose.model("Procedures",ProceduresScehma);