const mongoose = require("mongoose");

const EPRPScehma = new mongoose.Schema(
  {
    EPRPTitle: String,
    VRAMSource: String,
    pdf: String,
  },
  {
    collection: "EPRP"
  }
);

mongoose.model("EPRP", EPRPScehma);