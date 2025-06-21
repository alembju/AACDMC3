const mongoose = require("mongoose");

const PolicyDocScehma = new mongoose.Schema(
  {
 
    PolicyDocTitle: String,
    PolicyDocDate: Date,
    pdf: String,
  },
  {
    collection: "PolicyDoc"
  }
);

mongoose.model("PolicyDoc",PolicyDocScehma);