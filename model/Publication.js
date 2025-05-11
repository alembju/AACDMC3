const mongoose = require("mongoose");

const PublicationScehma = new mongoose.Schema(
  {
    PublicationTitle: String,
    PublicationAbstract: String,
    pdf: String,
  },
  {
    collection: "Publication"
  }
);

mongoose.model("Publication", PublicationScehma);