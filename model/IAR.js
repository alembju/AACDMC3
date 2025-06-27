const mongoose = require("mongoose");

const ActiveSearchScehma = new mongoose.Schema(
  {
    IARTitle: String,
    Abstract: String,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "IAR"
  }
);

mongoose.model("IAR", ActiveSearchScehma);