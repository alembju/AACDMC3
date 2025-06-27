const mongoose = require("mongoose");

const VRAMScehma = new mongoose.Schema(
  {
    VRAMTitle: String,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "VRAM"
  }
);

mongoose.model("VRAM", VRAMScehma);