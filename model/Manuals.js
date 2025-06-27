const mongoose = require("mongoose");

const ManualsScehma = new mongoose.Schema(
  {
 
    ManualsTitle: String,
    ManualsDate: Date,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "Manuals"
  }
);

mongoose.model("Manuals",ManualsScehma);