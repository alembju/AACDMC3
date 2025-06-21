const mongoose = require("mongoose");

const JDescriptionsScehma = new mongoose.Schema(
  {
 
    JDescriptionsTitle: String,
    JDescriptionsDate: Date,
    pdf: String,
  },
  {
    collection: "JDescriptions"
  }
);

mongoose.model("JDescriptions",JDescriptionsScehma);