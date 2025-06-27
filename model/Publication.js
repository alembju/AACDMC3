const mongoose = require("mongoose");

const PublicationScehma = new mongoose.Schema(
  {
    PublicationTitle: String,
    PublicationAbstract: String,
    pdf: String,
  },
  {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "Publication"
  }
);

mongoose.model("Publication", PublicationScehma);