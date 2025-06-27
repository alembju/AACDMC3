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
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "RiskCommunication"
  }
);

mongoose.model("RiskCommunication", RiskCommScehma);
