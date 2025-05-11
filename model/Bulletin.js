const mongoose = require("mongoose");

const BulletinScehma = new mongoose.Schema(
  {
    EPIWeek: String,
    Title: String,
    BullitenDate: String,
    pdf: String,
  },
  {
    collection: "Bulletin"
  }
);

mongoose.model("Bulletin", BulletinScehma);