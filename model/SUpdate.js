const mongoose = require("mongoose");

const SUpdateScehma = new mongoose.Schema(
  {

    Title: String,
    SUpdateDate: String,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "SUpdate"
  }
);

mongoose.model("SUpdate", SUpdateScehma);