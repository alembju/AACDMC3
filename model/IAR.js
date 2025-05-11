const mongoose = require("mongoose");

const ActiveSearchScehma = new mongoose.Schema(
  {
    IARTitle: String,
    Abstract: String,
    pdf: String,
  },
  {
    collection: "IAR"
  }
);

mongoose.model("IAR", ActiveSearchScehma);