const mongoose = require("mongoose");

const CardsScehma = new mongoose.Schema(
  {
    Bottumname: String,
    Bottumdescription: String,
    pdf: String,
  },
  {
    collection: "CardBottum"
  }
);

mongoose.model("CardBottum", CardsScehma);