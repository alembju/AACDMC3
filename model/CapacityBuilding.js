const mongoose = require("mongoose");

const capacityBScehma = new mongoose.Schema(
  {
    TrainingTitle: String,
    TrainingDate: String,
    TCertification: String,
    pdf: String,
  },
  {
    collection: "CapacityBuilding"
  }
);

mongoose.model("CapacityBuilding", capacityBScehma);
