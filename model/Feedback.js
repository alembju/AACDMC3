const mongoose = require("mongoose");

const FeedbackScehma = new mongoose.Schema(
  {
 
    FeedbackTitle: String,
    FeedbackDate: Date,
    pdf: String,
  },
   {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "Feedback"
  }
);

mongoose.model("Feedback",FeedbackScehma);