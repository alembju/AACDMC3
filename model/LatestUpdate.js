const mongoose = require("mongoose");

const LatestUpdateScehma = new mongoose.Schema(
  {
 
    LatestUpdateTitle: String,
    LatestUpdateDate: Date,
    pdf: String,
  },
  {
    collection: "LatestUpdate"
  }
);

mongoose.model("LatestUpdate",LatestUpdateScehma);