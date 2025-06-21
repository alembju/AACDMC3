const mongoose = require("mongoose");

const ProcessScehma = new mongoose.Schema(
  {
 
    ProcessTitle: String,
    ProcessDate: Date,
    pdf: String,
  },
  {
    collection: "Process"
  }
);

mongoose.model("Process",ProcessScehma);