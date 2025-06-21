const mongoose = require("mongoose");

const FeedbackScehma = new mongoose.Schema(
  {
 
    FeedbackTitle: String,
    FeedbackDate: Date,
    pdf: String,
  },
  {
    collection: "Feedback"
  }
);

mongoose.model("Feedback",FeedbackScehma);