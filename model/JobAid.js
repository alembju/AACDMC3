const mongoose = require("mongoose");

const JobAidScehma = new mongoose.Schema(
  {
    JobAidTitle: String,
    JobAidDate: Date,
    pdf: String,
  },
  {
    collection: "JobAid"
  }
);

mongoose.model("JobAid",JobAidScehma);