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
    collection: "SitRep"
  }
);

mongoose.model("SitRep", SitRepScehma);
