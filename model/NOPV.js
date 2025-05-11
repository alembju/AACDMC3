const mongoose = require("mongoose");

const NOPVScehma = new mongoose.Schema(
  {
    NOPVTitle: String,
    pdf: String,
  },
  {
    collection: "NOPV"
  }
);

mongoose.model("NOPV", NOPVScehma);