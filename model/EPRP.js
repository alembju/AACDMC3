const mongoose = require("mongoose");

const EPRPScehma = new mongoose.Schema(
  {
    EPRPTitle: String,
    VRAMSource: String,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "EPRP"
  }
);

mongoose.model("EPRP", EPRPScehma);