const mongoose = require("mongoose");

const RiskCommScehma = new mongoose.Schema(
  {
    RTitle: String,
    Defination: String,
    Transmition: String,
    Prevation: String,
    pdf: String,
  },
  {
    collection: "RiskCommunication"
  }
);

mongoose.model("RiskCommunication", RiskCommScehma);
