const mongoose = require("mongoose");

const SitRepScehma = new mongoose.Schema(
  {
    SitRepTitle: String,
    SitRepDate: Date,
    SUpdate: String,
    EPIWeek: String,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "SitRep"
  }
);

mongoose.model("SitRep", SitRepScehma);
