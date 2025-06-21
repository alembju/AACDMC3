const mongoose = require("mongoose");

const FormatsScehma = new mongoose.Schema(
  {
 
    FormatsTitle: String,
    FormatsDate: Date,
    pdf: String,
  },
  {
    collection: "Formats"
  }
);

mongoose.model("Formats",FormatsScehma);