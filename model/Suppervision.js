const mongoose = require("mongoose");

const SuppervisionScehma = new mongoose.Schema(
  {
    SuppervisionTitle: String,
    EPIWeek: String,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "Suppervision"
  }
);

mongoose.model("Suppervision", SuppervisionScehma);