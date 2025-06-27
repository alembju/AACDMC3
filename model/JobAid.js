const mongoose = require("mongoose");

const JobAidScehma = new mongoose.Schema(
  {
    JobAidTitle: String,
    JobAidDate: Date,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "JobAid"
  }
);

mongoose.model("JobAid",JobAidScehma);