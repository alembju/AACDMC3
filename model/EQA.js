const mongoose = require("mongoose");

const EQAScehma = new mongoose.Schema(
  {
 
    EQATitle: String,
    EQADate: Date,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "EQA"
  }
);

mongoose.model("EQA",EQAScehma);