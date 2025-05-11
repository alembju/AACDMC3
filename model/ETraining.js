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
    collection: "ETraining"
  }
);

mongoose.model("ETraining", ETrainingScehma);