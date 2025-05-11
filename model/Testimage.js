const mongoose = require("mongoose");

const ImageDetailsScehma = new mongoose.Schema(
  {
    image:String
  },
  {
    collection: "Testimage",
  }
);

mongoose.model("Testimage", ImageDetailsScehma);
