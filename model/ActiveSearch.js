const mongoose = require("mongoose");

const ActiveSearchScehma = new mongoose.Schema(
  {
    HFName: String,
    PriorityLevel: String,
  },
  {
    collection: "ActiveSearch"
  }
);

mongoose.model("ActiveSearch", ActiveSearchScehma);