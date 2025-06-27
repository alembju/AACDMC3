const mongoose = require("mongoose");

const LatestUpdateScehma = new mongoose.Schema(
  {
 
    LatestUpdateTitle: String,
    LatestUpdateDate: Date,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "LatestUpdate"
  }
);

mongoose.model("LatestUpdate",LatestUpdateScehma);