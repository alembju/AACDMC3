const mongoose = require("mongoose");

const SLIMTAScehma = new mongoose.Schema(
  {
 
    SLIMTATitle: String,
    SLIMTADate: Date,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "SLIMTA"
  }
);

mongoose.model("SLIMTA",SLIMTAScehma);