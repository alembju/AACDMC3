const mongoose = require("mongoose");

const PolicyDocScehma = new mongoose.Schema(
  {
 
    PolicyDocTitle: String,
    PolicyDocDate: Date,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "PolicyDoc"
  }
);

mongoose.model("PolicyDoc",PolicyDocScehma);