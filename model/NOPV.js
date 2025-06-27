const mongoose = require("mongoose");

const NOPVScehma = new mongoose.Schema(
  {
    NOPVTitle: String,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "NOPV"
  }
);

mongoose.model("NOPV", NOPVScehma);