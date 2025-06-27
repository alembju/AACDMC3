const mongoose = require("mongoose");

const OutbreakIScehma = new mongoose.Schema(
  {
    InvestigationTitle: String,
    EPIWeek: String,
    ReportingDate: Date,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "OutbreakI"
  }
);

mongoose.model("OutbreakI", OutbreakIScehma);
