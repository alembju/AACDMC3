const mongoose = require("mongoose");

const SUpdateScehma = new mongoose.Schema(
  {

    Title: String,
    SUpdateDate: String,
    pdf: String,
  },
  {
    collection: "SUpdate"
  }
);

mongoose.model("SUpdate", SUpdateScehma);