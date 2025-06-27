const mongoose = require("mongoose");

const CPDScehma = new mongoose.Schema(
  {
 
    CPDTitle: String,
    CPDDate: Date,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "CPD"
  }
);

mongoose.model("CPD",CPDScehma);