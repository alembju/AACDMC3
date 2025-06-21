const mongoose = require("mongoose");

const AccreditedScehma = new mongoose.Schema(
  {
 
    AccreditedTitle: String,
    AccreditedDate: String,
    pdf: String,
  },
  {
    collection: "Accredited"
  }
);

mongoose.model("Accredited",AccreditedScehma);