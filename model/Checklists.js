const mongoose = require("mongoose");

const ChecklistsScehma = new mongoose.Schema(
  {
 
    ChecklistsTitle: String,
    ChecklistsDate: Date,
    pdf: String,
  },
  {
    collection: "Checklists"
  }
);

mongoose.model("Checklists",ChecklistsScehma);