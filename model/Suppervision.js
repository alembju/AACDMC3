const mongoose = require("mongoose");

const SuppervisionScehma = new mongoose.Schema(
  {
    SuppervisionTitle: String,
    EPIWeek: String,
    pdf: String,
  },
  {
    collection: "Suppervision"
  }
);

mongoose.model("Suppervision", SuppervisionScehma);