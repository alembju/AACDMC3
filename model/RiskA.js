const mongoose = require("mongoose");

const RiskAScehma = new mongoose.Schema(
  {
    RiskTitle: String,
    RARegion: String,
    SubCity: String,
    RAKebele: String,
    RAWoreda: String,
    pdf: String,
  },
  {
    collection: "RiskA"
  }
);

mongoose.model("RiskA", RiskAScehma);