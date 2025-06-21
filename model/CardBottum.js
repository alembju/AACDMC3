const mongoose = require("mongoose");

const CardsScehma = new mongoose.Schema(
  {
    Bottumname: String,
    Bottumdescription: String,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "CardBottum"
  }
);

mongoose.model("CardBottum", CardsScehma);