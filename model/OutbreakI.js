const mongoose = require("mongoose");

const OutbreakIScehma = new mongoose.Schema(
  {
    InvestigationTitle: String,
    EPIWeek: String,
    ReportingDate: Date,
    pdf: String,
  },
  {
    collection: "OutbreakI"
  }
);

mongoose.model("OutbreakI", OutbreakIScehma);
