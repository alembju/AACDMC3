const mongoose = require("mongoose");

const FormatsScehma = new mongoose.Schema(
  {
 
    FormatsTitle: String,
    FormatsDate: Date,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "Formats"
  }
);

mongoose.model("Formats",FormatsScehma);