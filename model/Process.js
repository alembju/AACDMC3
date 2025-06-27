const mongoose = require("mongoose");

const ProcessScehma = new mongoose.Schema(
  {
 
    ProcessTitle: String,
    ProcessDate: Date,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "Process"
  }
);

mongoose.model("Process",ProcessScehma);