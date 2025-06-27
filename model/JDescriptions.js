const mongoose = require("mongoose");

const JDescriptionsScehma = new mongoose.Schema(
  {
 
    JDescriptionsTitle: String,
    JDescriptionsDate: Date,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "JDescriptions"
  }
);

mongoose.model("JDescriptions",JDescriptionsScehma);