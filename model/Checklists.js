const mongoose = require("mongoose");

const ChecklistsScehma = new mongoose.Schema(
  {
 
    ChecklistsTitle: String,
    ChecklistsDate: Date,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "Checklists"
  }
);

mongoose.model("Checklists",ChecklistsScehma);