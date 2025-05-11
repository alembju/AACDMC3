const mongoose = require("mongoose");

const VRAMScehma = new mongoose.Schema(
  {
    VRAMTitle: String,
    pdf: String,
  },
  {
    collection: "VRAM"
  }
);

mongoose.model("VRAM", VRAMScehma);