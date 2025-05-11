const mongoose = require("mongoose");

const CardsScehma = new mongoose.Schema(
  {
    FrontTitle: String,
    Frontdescription: String,
    pdf: String,
  },
  {
    collection: "Cards"
  }
);

mongoose.model("Cards", CardsScehma);