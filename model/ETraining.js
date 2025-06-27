const mongoose = require("mongoose");

const ETrainingScehma = new mongoose.Schema(
  {
    ETrainingTitle: String,
    ETrainingDate: String,
    ETrainer: String,
    EPlace: String,
    pdf: String,
  },
  {
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt' fields
},
  {
    collection: "ETraining"
  }
);

mongoose.model("ETraining", ETrainingScehma);