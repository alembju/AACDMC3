const mongoose = require("mongoose");

const AccreditedScehma = new mongoose.Schema(
  {
 
    AccreditedTitle: String,
    AccreditedDate: String,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "Accredited"
  }
);

mongoose.model("Accredited",AccreditedScehma);