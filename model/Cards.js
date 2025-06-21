const mongoose = require("mongoose");

const CardsScehma = new mongoose.Schema(
  {
    FrontTitle: String,
    Frontdescription: String,
    FrontDetail: String,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "Cards"
  }
);

mongoose.model("Cards", CardsScehma);